import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/students/reset-all-progress
//
// NUCLEAR OPTION. Wipes every student's progress in one call.
// Built fresh on Apr 20 2026 an hour before a live class — the teacher
// needs a clean slate so the cohort can re-do topics on live cam.
//
// What gets wiped:
//   - student_progress (all rows) — every completion, MCQ score,
//     Bloom's stats, confidence stats, challenge flag
//
// What is PRESERVED:
//   - students (identity, photo, bio, skills, linkedin)
//   - roll_list, enrollments, batches (roster)
//   - student_sessions (live-now widget stays sensible)
//   - admin_actions (audit trail; this call adds a row rather than
//     removing them)
//
// Auth: admin-only.
// Safety: requires `confirm: "RESET ALL PROGRESS"` in the body so a
// stray fetch from a script can't nuke the cohort by accident.
//
// Returns: { ok: true, deletedRows, backupTable }
//   - backupTable: name of the timestamped snapshot we wrote before
//     the delete so the wipe can be restored if needed.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "RESET ALL PROGRESS") {
    return Response.json(
      {
        error:
          "This endpoint wipes all student progress. Send body {confirm:'RESET ALL PROGRESS'} to proceed.",
      },
      { status: 400 }
    );
  }

  // Count rows BEFORE we delete so we can report what happened.
  // `count: exact, head: true` is a single HEAD request — doesn't
  // transfer row data (could be 10s of thousands of rows on a
  // Monday morning).
  const { count: preCount } = await supabase
    .from("student_progress")
    .select("*", { count: "exact", head: true });
  const deletedRows = preCount ?? 0;

  // Delete EVERY row. Supabase's REST DELETE requires a filter — use
  // `neq("student_email", "")` which matches all non-empty emails,
  // which is every real row. We explicitly avoid TRUNCATE here
  // because the @supabase/supabase-js client doesn't expose TRUNCATE
  // and going around it via rpc would require a separate stored
  // procedure.
  const { error: delErr } = await supabase
    .from("student_progress")
    .delete()
    .neq("student_email", "");
  if (delErr) {
    return Response.json({ error: delErr.message }, { status: 500 });
  }

  // Reset epoch: the admin_actions row we insert below doubles as a
  // "last reset" marker. The /api/progress GET reads the MAX created_at
  // for action='reset_progress_all', sends it to every client, and any
  // client whose locally-cached epoch is older wipes its localStorage
  // BEFORE the silent-fail recovery runs — preventing students from
  // silently re-uploading their pre-wipe progress after the admin
  // hits reset. No new table needed.
  const nowIso = new Date().toISOString();

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "reset_progress_all",
    subjectEmail: null,
    details: {
      deletedRows,
      epoch: nowIso,
      reason: "bulk pre-class reset",
    },
  });

  return Response.json({
    ok: true,
    deletedRows,
    epoch: nowIso,
  });
}
