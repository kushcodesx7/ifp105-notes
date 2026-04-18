import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/students/reset-progress
// Body: { email }
//
// Deletes every student_progress row for the student (all modules, all
// topics). Leaves the students row, student_sessions, and their profile
// untouched — only quiz/topic progress is wiped.
//
// Returns a "before summary" so the UI can show exactly what was wiped:
//   { deletedTopics, deletedQuizzes }
//
// Audit log records actor, target email, and before-counts for revert.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json();
  const email = (body.email as string | undefined)?.toLowerCase().trim();

  if (!email) {
    return Response.json({ error: "email required" }, { status: 400 });
  }

  // Load current rows so we can report what was deleted
  const { data: before } = await supabase
    .from("student_progress")
    .select("topic_id, completed, mcq_score, mcq_total")
    .eq("student_email", email);

  const deletedTopics = (before || []).filter((r) => r.completed).length;
  const deletedQuizzes = (before || []).filter(
    (r) => r.mcq_score !== null && r.mcq_total !== null
  ).length;
  const totalRows = before?.length || 0;

  const { error } = await supabase
    .from("student_progress")
    .delete()
    .eq("student_email", email);

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
    },
  });

  return Response.json({
    ok: true,
    deletedRows: totalRows,
    deletedTopics,
    deletedQuizzes,
  });
}
