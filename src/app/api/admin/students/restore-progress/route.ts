import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/students/restore-progress
//
// Un-does a bulk progress reset. Every call to the reset endpoint
// snapshots the deleted student_progress rows into admin_actions.details
// before deletion; this endpoint reads that snapshot and upserts the
// rows back.
//
// Body: { actionId: number }
//
// Behaviour:
//   - Fetches the admin_actions row by id.
//   - Rejects if the row isn't a `reset_progress_all` action (can't
//     restore from, e.g., a section-rename).
//   - Rejects if the row has already been restored (idempotency).
//   - Rejects if the snapshot is missing or empty.
//   - Upserts every snapshot row back into student_progress using
//     the natural key (student_email, course_id, module_number,
//     topic_id) — so if a student has answered NEW questions post-
//     reset, their newer rows are preserved and only the pre-reset
//     rows come back for topics they hadn't touched since.
//   - Marks the source action as `restored: true` so the restore
//     button disappears from the UI.
//   - Writes a fresh admin_actions row of its own so the audit
//     trail shows both sides of the round-trip.
//
// Auth: admin-only.
// Returns: { ok: true, restoredRows, fromActionId }
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => ({}));
  const actionId =
    typeof body.actionId === "number" && Number.isFinite(body.actionId)
      ? Math.floor(body.actionId)
      : null;
  if (actionId == null) {
    return Response.json(
      { error: "actionId (number) required" },
      { status: 400 }
    );
  }

  // Fetch the source action row. We need the details JSONB to
  // recover the snapshot rows.
  const { data: action, error: fetchErr } = await supabase
    .from("admin_actions")
    .select("id, action, details")
    .eq("id", actionId)
    .maybeSingle();
  if (fetchErr) {
    return Response.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!action) {
    return Response.json(
      { error: `admin_actions row ${actionId} not found` },
      { status: 404 }
    );
  }
  if (action.action !== "reset_progress_all") {
    return Response.json(
      {
        error: `action ${actionId} is ${action.action}, not a progress reset`,
      },
      { status: 400 }
    );
  }

  const details = (action.details ?? {}) as {
    snapshot?: unknown;
    restored?: boolean;
    deletedRows?: number;
    moduleNumber?: number | null;
  };

  if (details.restored) {
    return Response.json(
      { error: `action ${actionId} has already been restored` },
      { status: 409 }
    );
  }

  const snapshot = Array.isArray(details.snapshot) ? details.snapshot : [];
  if (snapshot.length === 0) {
    return Response.json(
      { error: `action ${actionId} has no snapshot to restore` },
      { status: 400 }
    );
  }

  // Upsert rows back. Natural key is (student_email, course_id,
  // module_number, topic_id). We accept that a student who did NEW
  // work on the same topic after the reset will have that newer row
  // overwritten by the snapshot — that's the intended "undo" semantic.
  // If course_id is null on any snapshot row (pre-multi-course
  // migration), fall back to the legacy (student_email, module_number,
  // topic_id) conflict key.
  type SnapshotRow = {
    student_email: string;
    course_id: string | null;
    module_number: number;
    topic_id: number;
    completed: boolean;
    mcq_score: number | null;
    mcq_total: number | null;
    challenge_attempted: boolean;
    bloom_stats: unknown;
    confidence_stats: unknown;
    updated_at: string;
  };

  const rows = snapshot as SnapshotRow[];
  const anyWithCourseId = rows.some((r) => r.course_id);
  const onConflict = anyWithCourseId
    ? "student_email,course_id,module_number,topic_id"
    : "student_email,module_number,topic_id";

  // Supabase has a limit on payload size, so chunk the upsert for
  // really big restores (e.g. all 200 students × 48 topics ≈ 10k rows).
  const CHUNK = 500;
  let restored = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error: upErr } = await supabase
      .from("student_progress")
      .upsert(chunk, { onConflict });
    if (upErr) {
      // If the course_id column doesn't exist yet (pre-migration DB),
      // strip it from the payload and retry once without.
      if (/course_id.*does not exist|PGRST204|PGRST102/i.test(upErr.message)) {
        const trimmed = chunk.map(
          ({ course_id: _c, ...rest }) => rest // eslint-disable-line @typescript-eslint/no-unused-vars
        );
        const { error: retryErr } = await supabase
          .from("student_progress")
          .upsert(trimmed, {
            onConflict: "student_email,module_number,topic_id",
          });
        if (retryErr) {
          return Response.json(
            {
              error: `restore failed at row ${i}: ${retryErr.message}`,
              restored,
            },
            { status: 500 }
          );
        }
      } else {
        return Response.json(
          { error: `restore failed at row ${i}: ${upErr.message}`, restored },
          { status: 500 }
        );
      }
    }
    restored += chunk.length;
  }

  // Mark the source action as restored so the Undo button goes away.
  // We mutate the same details JSONB so the snapshot is preserved —
  // useful if the admin later needs the exact before/after.
  await supabase
    .from("admin_actions")
    .update({
      details: { ...details, restored: true, restoredAt: new Date().toISOString() },
    })
    .eq("id", actionId);

  // Record the round-trip as its own admin action. We use a DEDICATED
  // `restore_progress_all` kind (distinct from `reset_progress_all`)
  // specifically so the client-side reset-epoch query on /api/progress
  // — which reads MAX(created_at) WHERE action='reset_progress_all' —
  // doesn't treat a restore as a fresh reset. If it did, every student
  // would wipe their localStorage the instant you restored, which is
  // the exact opposite of what "restore" means.
  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "restore_progress_all",
    subjectEmail: null,
    details: {
      restoredFromActionId: actionId,
      restoredRows: restored,
      moduleNumber: details.moduleNumber ?? null,
    },
  });

  return Response.json({
    ok: true,
    restoredRows: restored,
    fromActionId: actionId,
  });
}
