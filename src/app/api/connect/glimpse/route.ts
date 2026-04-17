import { supabase } from "@/lib/supabase";

// GET /api/connect/glimpse
// Tiny endpoint for the home-page IFS Connect teaser. Returns:
//   - totalRegistered, totalRolls
//   - recentJoiners: last 5 students in the 14-day window (for avatar strip)
//   - topLearnersThisWeek: 3 students ranked by topic completion in the last 7 days
//                          (fresh rotation — not all-time winners)
//   - sectionLeader: section with the highest registered % (friendly competition)
//
// Respects hide_progress: opted-out students are never in topLearners,
// and their progress is never included in the response.

const TOTAL_TOPICS = 48;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  const weekAgo = new Date(now - WEEK_MS).toISOString();
  const twoWeeksAgo = new Date(now - TWO_WEEKS_MS).toISOString();

  // Run everything in parallel
  const [studentsRes, rollRes, recentProgressRes] = await Promise.all([
    supabase
      .from("students")
      .select(
        "email, enrollment_no, name, batch_id, section, linkedin_url, photo_url, bio, skills, hide_progress, added_at"
      ),
    supabase
      .from("roll_list")
      .select("section", { count: "exact" }),
    // Only progress rows from the last 7 days — for "top learners THIS WEEK"
    supabase
      .from("student_progress")
      .select("student_email, completed, updated_at")
      .gte("updated_at", weekAgo),
  ]);

  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  const allStudents = studentsRes.data || [];

  // Count completions per email in the last 7 days
  const weeklyDone: Record<string, number> = {};
  for (const row of recentProgressRes.data || []) {
    if (!row.student_email || !row.completed) continue;
    weeklyDone[row.student_email] = (weeklyDone[row.student_email] || 0) + 1;
  }

  // Also pull all-time completion so we can show a % on the top-learners cards
  const { data: allTimeProgressRows } = await supabase
    .from("student_progress")
    .select("student_email, completed");

  const allTimeDone: Record<string, number> = {};
  for (const row of allTimeProgressRows || []) {
    if (!row.student_email || !row.completed) continue;
    allTimeDone[row.student_email] = (allTimeDone[row.student_email] || 0) + 1;
  }

  // ── Top learners this week ──
  // Eligible: students who haven't opted out of public progress AND
  // have completed at least 1 topic this week.
  const topLearners = allStudents
    .filter(
      (s) =>
        !(s as { hide_progress?: boolean }).hide_progress &&
        s.email &&
        (weeklyDone[s.email] || 0) > 0
    )
    .sort((a, b) => {
      const aDone = a.email ? weeklyDone[a.email] || 0 : 0;
      const bDone = b.email ? weeklyDone[b.email] || 0 : 0;
      return bDone - aDone;
    })
    .slice(0, 3)
    .map((s) => {
      const allTime = s.email ? allTimeDone[s.email] || 0 : 0;
      return {
        enrollmentNo: s.enrollment_no,
        name: s.name,
        section: s.section,
        photoUrl: s.photo_url,
        bio: s.bio,
        skills: (s as { skills?: string[] }).skills || [],
        lastThree: (s.enrollment_no || "").slice(-3),
        completionPct: Math.min(100, Math.round((allTime / TOTAL_TOPICS) * 100)),
        topicsThisWeek: s.email ? weeklyDone[s.email] || 0 : 0,
      };
    });

  // ── Recent joiners (last 14 days) — for the avatar strip ──
  const recentJoiners = allStudents
    .filter((s) => s.added_at && s.added_at >= twoWeeksAgo)
    .sort((a, b) => (b.added_at || "").localeCompare(a.added_at || ""))
    .slice(0, 5)
    .map((s) => ({
      enrollmentNo: s.enrollment_no,
      name: s.name,
      section: s.section,
      photoUrl: s.photo_url,
      lastThree: (s.enrollment_no || "").slice(-3),
    }));

  // ── Section leader (highest % registered) ──
  const perSectionRolls: Record<string, number> = {};
  for (const r of rollRes.data || []) {
    const sec = (r as { section?: string }).section || "";
    if (sec) perSectionRolls[sec] = (perSectionRolls[sec] || 0) + 1;
  }
  const perSectionRegistered: Record<string, number> = {};
  for (const s of allStudents) {
    if (s.section) {
      perSectionRegistered[s.section] = (perSectionRegistered[s.section] || 0) + 1;
    }
  }
  let sectionLeader: { section: string; pct: number; registered: number; total: number } | null =
    null;
  for (const [sec, total] of Object.entries(perSectionRolls)) {
    if (total === 0) continue;
    const registered = perSectionRegistered[sec] || 0;
    const pct = Math.round((registered / total) * 100);
    if (!sectionLeader || pct > sectionLeader.pct) {
      sectionLeader = { section: sec, pct, registered, total };
    }
  }

  return Response.json(
    {
      totalRegistered: allStudents.length,
      totalRolls: rollRes.count ?? 0,
      recentJoiners,
      topLearnersThisWeek: topLearners,
      sectionLeader,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
