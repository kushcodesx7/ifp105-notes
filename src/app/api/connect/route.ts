import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { isHiddenSection } from "@/lib/hidden-sections";
import { TOTAL_TOPICS } from "@/lib/modules";
import { verifyGoogleIdToken } from "@/lib/verify-google-token";
import { isAdminEmail } from "@/lib/admins";

// GET /api/connect — list of all registered students for IFS Connect
// Optional query params:
//   batchId — filter by batch
//   section — filter by section
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  const section = searchParams.get("section");

  // Hidden sections (e.g. "Test Section") are filtered out for the public
  // feed so students never see test accounts. But the teacher (or any user
  // who actually belongs to a hidden section) needs to see those profiles to
  // test features against their own account. We include hidden sections when:
  //   - caller is an admin, OR
  //   - caller's own section is hidden
  // Response becomes private-cached in those cases so a student's request
  // can't hit a cached response that contains test profiles.
  const idToken = req.headers.get("x-id-token");
  const caller = idToken ? await verifyGoogleIdToken(idToken) : null;
  let callerOwnSectionIsHidden = false;
  if (caller) {
    const { data: self } = await supabase
      .from("students")
      .select("section")
      .eq("email", caller.email)
      .maybeSingle();
    const selfSection = (self as { section?: string | null } | null)?.section;
    if (selfSection && isHiddenSection(selfSection)) callerOwnSectionIsHidden = true;
  }
  const includeHidden =
    !!caller && (isAdminEmail(caller.email) || callerOwnSectionIsHidden);

  const studentQuery = supabase
    .from("students")
    .select(
      "enrollment_no, name, email, batch_id, section, linkedin_url, photo_url, bio, skills, added_at"
    )
    .order("added_at", { ascending: false });
  if (batchId) studentQuery.eq("batch_id", batchId);
  if (section) studentQuery.eq("section", section);

  const rollQuery = supabase
    .from("roll_list")
    .select("batch_id, section", { count: "exact" });
  if (batchId) rollQuery.eq("batch_id", batchId);
  if (section) rollQuery.eq("section", section);

  // Pull completion data so each card can show a progress bar.
  // Only the minimum columns we need to compute a percentage.
  const progressQuery = supabase
    .from("student_progress")
    .select("student_email, completed");

  // All three queries in parallel (borrowed from the admin perf work)
  const [studentsRes, rollRes, progressRes] = await Promise.all([
    studentQuery,
    rollQuery,
    progressQuery,
  ]);

  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  // Aggregate per-email completion count
  const doneByEmail: Record<string, number> = {};
  for (const row of progressRes.data || []) {
    if (!row.student_email || !row.completed) continue;
    doneByEmail[row.student_email] = (doneByEmail[row.student_email] || 0) + 1;
  }

  // Filter out test/hidden sections before mapping — unless the caller is
  // an admin or belongs to a hidden section themselves.
  const visibleStudentRows = (studentsRes.data || []).filter(
    (s) => includeHidden || !isHiddenSection(s.section)
  );

  // Map to public shape (email never leaves the server side).
  // Progress is always public — no opt-out.
  const students = visibleStudentRows.map((s) => {
    const done = s.email ? doneByEmail[s.email] || 0 : 0;
    const completionPct = Math.min(100, Math.round((done / TOTAL_TOPICS) * 100));
    return {
      enrollmentNo: s.enrollment_no,
      name: s.name,
      batchId: s.batch_id,
      section: s.section,
      linkedinUrl: s.linkedin_url,
      photoUrl: s.photo_url,
      bio: s.bio,
      skills: (s as { skills?: string[] }).skills || [],
      addedAt: s.added_at,
      lastThree: (s.enrollment_no || "").slice(-3),
      completionPct,
    };
  });

  const perSectionTotals: Record<string, number> = {};
  let visibleRollCount = 0;
  for (const r of rollRes.data || []) {
    const sec = (r as { section?: string }).section || "";
    if (!sec) continue;
    if (!includeHidden && isHiddenSection(sec)) continue;
    perSectionTotals[sec] = (perSectionTotals[sec] || 0) + 1;
    visibleRollCount += 1;
  }

  return Response.json(
    {
      students,
      totalRolls: visibleRollCount,
      perSectionTotals,
    },
    {
      headers: {
        // Response contains personalized data (hidden sections) when a
        // privileged caller is signed in → private cache so a student's
        // request can't be served the admin's cached response.
        "Cache-Control": includeHidden
          ? "private, max-age=30"
          : "public, max-age=120, stale-while-revalidate=600",
      },
    }
  );
}
