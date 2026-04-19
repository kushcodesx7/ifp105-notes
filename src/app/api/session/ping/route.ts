import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

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

  // Rate limit: module mount + tab-focus can fire this every few
  // seconds; the legitimate pattern is ~1 per minute per student. Cap
  // at 30/min to leave headroom for flaky reconnects without letting
  // a buggy client (or attacker with a valid token) DoS the table.
  const rl = await rateLimit({
    bucket: "session:ping",
    id: email,
    limit: 30,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 30);

  // Optional `currentPath` in body — feeds the live class digest on
  // /admin so the teacher can see WHERE everyone is, not just THAT
  // they're active. Whitelist to in-app paths so we never store
  // arbitrary user input from a third-party referrer.
  const body = (await req.json().catch(() => ({}))) as {
    currentPath?: unknown;
  };
  let currentPath: string | null = null;
  if (typeof body.currentPath === "string") {
    const p = body.currentPath.trim();
    // Only accept relative app paths starting with /, max 200 chars.
    if (p.startsWith("/") && p.length <= 200) currentPath = p;
  }

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
  if (currentPath) payload.current_path = currentPath;

  let { error } = await supabase
    .from("student_sessions")
    .upsert(payload, { onConflict: "student_email" });

  // Graceful degradation: if the current_path column doesn't exist
  // yet (pre-migration), retry without it. The session ping is
  // best-effort; the admin live-now widget falls back to the
  // count-only view until the SQL migration runs.
  if (
    error &&
    /column.*current_path.*does not exist|PGRST204|PGRST102/i.test(
      error.message
    )
  ) {
    delete payload.current_path;
    ({ error } = await supabase
      .from("student_sessions")
      .upsert(payload, { onConflict: "student_email" }));
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
