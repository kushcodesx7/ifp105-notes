import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";

// POST /api/session/ping
//
// Stamps the caller's `student_sessions.last_active_at = now()` so the
// admin "last active" column reflects the student actually opening a
// page, not just completing a topic. Without this, a student who
// opens module pages but never marks anything done shows up as
// "Never" in /admin/people — making it look like they haven't
// engaged with the platform at all.
//
// Called from the module page on mount when the student has a fresh
// Google ID token (token-restored-from-localStorage sessions are NOT
// pinged because they would 401 here — see ModulePage.tsx).
//
// Idempotent: an upsert keyed on student_email. The existing
// /api/progress POST does the same upsert as a side-effect, this
// route just decouples it so passive pageviews count too.

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const email = auth.user.email;
  const name = auth.user.name || "Student";

  // Read the existing session row (if any) so we don't accidentally
  // overwrite enrollment_no / course_id with placeholders. Empty row
  // means it's the first interaction — fine to insert with N/A.
  const { data: existing } = await supabase
    .from("student_sessions")
    .select("enrollment_no, course_id")
    .eq("student_email", email)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    student_email: email,
    student_name: name,
    enrollment_no: (existing as { enrollment_no?: string } | null)?.enrollment_no || "N/A",
    last_active_at: new Date().toISOString(),
  };
  const existingCourseId = (existing as { course_id?: string } | null)?.course_id;
  if (existingCourseId) payload.course_id = existingCourseId;

  const { error } = await supabase
    .from("student_sessions")
    .upsert(payload, { onConflict: "student_email" });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
