import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/students/reset-progress
// Body: { email, moduleNumber?: number | null }
//
// Deletes student_progress rows for ONE student, optionally scoped to a
// single module.
//   - No moduleNumber (or null): wipe every module (original behaviour).
//   - moduleNumber = 1..5: wipe ONLY that module's rows.
//
// Leaves the students row, student_sessions, and their profile
// untouched — only quiz/topic progress is wiped.
//
// Returns a "before summary" so the UI can show exactly what was wiped:
//   { deletedRows, deletedTopics, deletedQuizzes, moduleNumber }
//
// Audit log records actor, target email, module scope, and before-counts
// for traceability / revert.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json();
  const email = (body.email as string | undefined)?.toLowerCase().trim();

  if (!email) {
    return Response.json({ error: "email required" }, { status: 400 });
  }

  // Optional scope. Null / undefined / non-positive number means wipe
  // every module. 1..5 narrows to that module.
  const rawMod = body.moduleNumber;
  const moduleNumber =
    typeof rawMod === "number" && Number.isFinite(rawMod) && rawMod > 0
      ? Math.floor(rawMod)
      : null;

  // Load current rows (scoped) so we can report exactly what we
  // deleted AND have a snapshot to cite in the audit row.
  const beforeQuery = (() => {
    let q = supabase
      .from("student_progress")
      .select("topic_id, module_number, completed, mcq_score, mcq_total")
      .eq("student_email", email);
    if (moduleNumber != null) q = q.eq("module_number", moduleNumber);
    return q;
  })();
  const { data: before } = await beforeQuery;

  const deletedTopics = (before || []).filter((r) => r.completed).length;
  const deletedQuizzes = (before || []).filter(
    (r) => r.mcq_score !== null && r.mcq_total !== null
  ).length;
  const totalRows = before?.length || 0;

  // Scoped delete — same filter shape as the select above, so we never
  // delete more than we reported.
  const deleteQuery = (() => {
    let q = supabase.from("student_progress").delete().eq("student_email", email);
    if (moduleNumber != null) q = q.eq("module_number", moduleNumber);
    return q;
  })();
  const { error } = await deleteQuery;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Load student meta for audit context
  const { data: student } = await supabase
    .from("students")
    .select("name, batch_id, section, enrollment_no")
    .eq("email", email)
    .maybeSingle();

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "reset_progress",
    subjectEmail: email,
    subjectBatchId: student?.batch_id ?? null,
    subjectSection: student?.section ?? null,
    details: {
      name: student?.name ?? null,
      enrollmentNo: student?.enrollment_no ?? null,
      deletedRows: totalRows,
      deletedTopics,
      deletedQuizzes,
      // New: record the module scope so the audit log can
      // distinguish "reset everything" from "reset just Module 3".
      moduleNumber,
      scope: moduleNumber != null ? `module_${moduleNumber}` : "all_modules",
    },
  });

  return Response.json({
    ok: true,
    deletedRows: totalRows,
    deletedTopics,
    deletedQuizzes,
    moduleNumber,
  });
}
