import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// POST /api/admin/students/unlink
// Body: { email }
//
// Detaches the student's account. Deletes their row from `students` so
// the email is no longer linked to a batch/section/roll. Progress
// (student_progress) + sessions stay intact under the old email; if the
// student re-registers with the same email + same roll they'll be
// auto-reattached (and their history is still there).
//
// Use case: a student registered with the wrong Gmail (friend's) and
// needs to re-register with their own. Unlink clears the mis-registration
// so they can claim the roll again.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json();
  const email = (body.email as string | undefined)?.toLowerCase().trim();

  if (!email) {
    return Response.json({ error: "email required" }, { status: 400 });
  }

  const { data: student } = await supabase
    .from("students")
    .select("name, batch_id, section, enrollment_no")
    .eq("email", email)
    .maybeSingle();

  if (!student) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const { error } = await supabase.from("students").delete().eq("email", email);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "unlink",
    subjectEmail: email,
    subjectBatchId: student.batch_id ?? null,
    subjectSection: student.section ?? null,
    details: {
      name: student.name,
      enrollmentNo: student.enrollment_no,
    },
  });

  return Response.json({ ok: true });
}
