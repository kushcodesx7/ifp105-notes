import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/students/reset-all-progress
//
// Reset student progress — optionally scoped to a single module.
// Built with undo: the deleted rows are serialised into the
// admin_actions.details payload before the delete runs, so a
// subsequent POST to /api/admin/students/restore-progress with the
// action id puts them back.
//
// Body:
//   { confirm: "RESET ALL PROGRESS", moduleNumber?: number | null }
//   - confirm: MUST equal the exact phrase (server-side guard against
//     accidental fetches).
//   - moduleNumber: omit or null = wipe every module. 1..5 = wipe
//     only that module's rows for every student.
//
// What gets wiped (when in scope):
//   - student_progress rows — every completion, MCQ score, Bloom's
//     stats, confidence stats, challenge flag
//
// What is PRESERVED (always):
//   - students (identity, photo, bio, skills, linkedin)
//   - roll_list, enrollments, batches (roster)
//   - student_sessions (live-now widget stays sensible)
//   - admin_actions (audit trail; this call appends a row)
//
// Returns: { ok, deletedRows, epoch, actionId, scope }
//   - actionId: id of the admin_actions row that stores the snapshot.
//     Pass this to /api/admin/students/restore-progress to undo.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "RESET ALL PROGRESS") {
    return Response.json(
      {
        error:
          "This endpoint wipes student progress. Send body {confirm:'RESET ALL PROGRESS', moduleNumber?, topicId?} to proceed.",
      },
      { status: 400 }
    );
  }

  // Optional module scope. Null / undefined = wipe all modules.
  const rawMod = body.moduleNumber;
  const moduleNumber =
    typeof rawMod === "number" && Number.isFinite(rawMod) && rawMod > 0
      ? Math.floor(rawMod)
      : null;

  // Optional topic scope. Only applied when a moduleNumber is also
  // given — a bare topicId is ambiguous across modules, so we reject
  // that shape rather than guess.
  const rawTopic = body.topicId;
  const topicIdRaw =
    typeof rawTopic === "number" && Number.isFinite(rawTopic) && rawTopic > 0
      ? Math.floor(rawTopic)
      : null;
  if (topicIdRaw != null && moduleNumber == null) {
    return Response.json(
      {
        error:
          "topicId requires moduleNumber to be set (topics aren't unique across modules).",
      },
      { status: 400 }
    );
  }
  const topicId = topicIdRaw;

  // Build the scoped select/delete query. `.neq("student_email", "")`
  // matches every real row; adding `.eq("module_number", ...)` narrows
  // to a single module; adding `.eq("topic_id", ...)` narrows further
  // to one specific topic within that module.
  const scopedSelect = (() => {
    let q = supabase
      .from("student_progress")
      .select(
        "student_email, course_id, module_number, topic_id, completed, mcq_score, mcq_total, challenge_attempted, bloom_stats, confidence_stats, updated_at"
      )
      .neq("student_email", "");
    if (moduleNumber != null) q = q.eq("module_number", moduleNumber);
    if (topicId != null) q = q.eq("topic_id", topicId);
    return q;
  })();

  // Snapshot BEFORE delete. We keep the rows inside the audit-log row
  // so restore can replay them without a new table. If the snapshot
  // pull fails we abort — we won't delete data we can't restore.
  const { data: snapshot, error: snapErr } = await scopedSelect;
  if (snapErr) {
    return Response.json({ error: snapErr.message }, { status: 500 });
  }
  const snapshotRows = snapshot ?? [];
  const deletedRows = snapshotRows.length;

  // Perform the delete. Same scope as the snapshot query so we can't
  // accidentally delete more than we backed up.
  const deleteQuery = (() => {
    let q = supabase.from("student_progress").delete().neq("student_email", "");
    if (moduleNumber != null) q = q.eq("module_number", moduleNumber);
    if (topicId != null) q = q.eq("topic_id", topicId);
    return q;
  })();
  const { error: delErr } = await deleteQuery;
  if (delErr) {
    return Response.json({ error: delErr.message }, { status: 500 });
  }

  // Reset epoch: this admin_actions row doubles as a "last reset"
  // marker. /api/progress GET reads the MAX created_at for
  // action='reset_progress_all' and sends it to every client — any
  // client whose locally-cached epoch is older wipes its localStorage
  // BEFORE the silent-fail recovery runs, preventing students from
  // silently re-uploading their pre-wipe progress after a reset.
  //
  // We always use 'reset_progress_all' as the action name, even for
  // per-module resets, because the client-side epoch check is a
  // "something was reset" signal — it's safe to overly-wipe
  // localStorage since the server truth takes over immediately.
  const nowIso = new Date().toISOString();
  const scope =
    topicId != null
      ? `module_${moduleNumber}_topic_${topicId}`
      : moduleNumber != null
        ? `module_${moduleNumber}`
        : "all_modules";
  const reason =
    topicId != null
      ? `module-${moduleNumber}-topic-${topicId} reset`
      : moduleNumber != null
        ? `module-${moduleNumber} reset`
        : "all-modules reset";

  const actionId = await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "reset_progress_all",
    subjectEmail: null,
    details: {
      deletedRows,
      epoch: nowIso,
      scope,
      moduleNumber,
      topicId,
      reason,
      // Snapshot for restore. Each entry is the student_progress row
      // verbatim; restore endpoint upserts them back using the natural
      // key (student_email, course_id, module_number, topic_id).
      snapshot: snapshotRows,
      restored: false,
    },
  });

  return Response.json({
    ok: true,
    deletedRows,
    epoch: nowIso,
    actionId,
    scope,
  });
}
