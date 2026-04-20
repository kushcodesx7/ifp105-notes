import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { isHiddenSection } from "@/lib/hidden-sections";
import { TOTAL_TOPICS } from "@/lib/course-registry";
import { moduleWeightedPct } from "@/lib/modules";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/connect/glimpse
// Tiny endpoint for the home-page IFS Connect teaser.
// Designed to be FAST — returns aggregate counts + 5 recent joiners + 3 top
// learners this week. Completion % for the 3 top learners is computed in a
// narrow follow-up query filtered to those 3 emails (not "pull every row").

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  // Rate limit — home-page teaser, hit once per visit. 60/min is
  // generous enough for multiple tabs + refresh bursts.
  const rl = await rateLimit({
    bucket: "public:connect-glimpse",
    id: ipFromRequest(req),
    limit: 60,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 60);

  const now = Date.now();
  const weekAgo = new Date(now - WEEK_MS).toISOString();
  const twoWeeksAgo = new Date(now - TWO_WEEKS_MS).toISOString();

  // ── All fat queries in parallel ──
  const [studentsRes, rollRes, recentProgressRes] = await Promise.all([
    // Minimal columns for the public teaser. No email, no bio (the glimpse doesn't
    // show bio on the 3 cards).
    supabase
      .from("students")
      .select(
        "email, enrollment_no, name, batch_id, section, photo_url, skills, added_at"
      ),
    // Include name + batch_id + enrollment_no to decorate students with
    // the teacher-verified name. Falls back gracefully if the migration
    // is pending.
    supabase.from("roll_list").select("batch_id, section, enrollment_no, name"),
    // Only the last 7 days, and only the 3 columns we aggregate
    supabase
      .from("student_progress")
      .select("student_email, completed")
      .gte("updated_at", weekAgo),
  ]);

  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  // Graceful: if roll_list.name column missing, refetch without.
  let rollRows = rollRes.data as
    | { batch_id: string; section: string; enrollment_no: string; name: string | null }[]
    | null;
  if (rollRes.error && /name|PGRST204/i.test(rollRes.error.message)) {
    const fb = await supabase
      .from("roll_list")
      .select("batch_id, section, enrollment_no");
    rollRows = (fb.data || []).map((r) => ({
      ...(r as { batch_id: string; section: string; enrollment_no: string }),
      name: null,
    }));
  }

  // Lookup (batch, section, roll) → teacher name
  const rollNameByKey = new Map<string, string>();
  for (const r of rollRows || []) {
    if (!r.name) continue;
    const key = `${r.batch_id}__${r.section}__${r.enrollment_no}`;
    rollNameByKey.set(key, r.name);
  }
  const preferName = (s: {
    batch_id?: string | null;
    section?: string | null;
    enrollment_no?: string | null;
    name?: string | null;
  }) =>
    rollNameByKey.get(
      `${s.batch_id || ""}__${s.section || ""}__${s.enrollment_no || ""}`
    ) ||
    s.name ||
    "";

  // Exclude hidden sections (e.g. Test Section) from every public number
  const allStudents = (studentsRes.data || []).filter(
    (s) => !isHiddenSection(s.section)
  );

  // Count weekly completions per email
  const weeklyDone: Record<string, number> = {};
  for (const row of recentProgressRes.data || []) {
    if (!row.student_email || !row.completed) continue;
    weeklyDone[row.student_email] = (weeklyDone[row.student_email] || 0) + 1;
  }

  // Rank + take top 3 BEFORE fetching all-time progress so we only query
  // all-time data for those 3 emails.
  const rankedTop = allStudents
    .filter((s) => s.email && (weeklyDone[s.email] || 0) > 0)
    .sort((a, b) => {
      const aDone = a.email ? weeklyDone[a.email] || 0 : 0;
      const bDone = b.email ? weeklyDone[b.email] || 0 : 0;
      return bDone - aDone;
    })
    .slice(0, 3);

  // All-time completion only for those up-to-3 emails — narrow query.
  // Grouped BY module so we can compute the module-weighted percentage
  // (each of the 5 modules counts 20% toward overall). Old version
  // just counted flat completions and divided by 48 total topics,
  // which meant finishing Module 1's 11 topics = 23%, not 20% —
  // teacher specifically asked for the even-weighted model.
  const topEmails = rankedTop
    .map((s) => s.email)
    .filter((e): e is string => !!e);
  const allTimeByModule: Record<string, Record<number, number>> = {};
  if (topEmails.length > 0) {
    const { data: allTimeRows } = await supabase
      .from("student_progress")
      .select("student_email, module_number, completed")
      .in("student_email", topEmails)
      .eq("completed", true);
    for (const row of allTimeRows || []) {
      if (!row.student_email || typeof row.module_number !== "number") continue;
      const byMod =
        allTimeByModule[row.student_email] ??
        (allTimeByModule[row.student_email] = {});
      byMod[row.module_number] = (byMod[row.module_number] || 0) + 1;
    }
  }

  const topLearners = rankedTop.map((s) => {
    const byMod = s.email ? allTimeByModule[s.email] || {} : {};
    return {
      enrollmentNo: s.enrollment_no,
      name: preferName(s),
      section: s.section,
      photoUrl: s.photo_url,
      skills: (s as { skills?: string[] }).skills || [],
      lastThree: (s.enrollment_no || "").slice(-3),
      // 5 modules × 20% = 100%. Module 1 complete → 20 exactly.
      completionPct: Math.min(100, moduleWeightedPct(byMod)),
      topicsThisWeek: s.email ? weeklyDone[s.email] || 0 : 0,
    };
  });

  // Recent joiners (last 14 days), no email exposed
  const recentJoiners = allStudents
    .filter((s) => s.added_at && s.added_at >= twoWeeksAgo)
    .sort((a, b) => (b.added_at || "").localeCompare(a.added_at || ""))
    .slice(0, 5)
    .map((s) => ({
      enrollmentNo: s.enrollment_no,
      name: preferName(s),
      section: s.section,
      photoUrl: s.photo_url,
      lastThree: (s.enrollment_no || "").slice(-3),
    }));

  // Section leader + registered counts (hidden sections excluded)
  const perSectionRolls: Record<string, number> = {};
  let visibleRollCount = 0;
  for (const r of rollRows || []) {
    const sec = r.section || "";
    if (!sec || isHiddenSection(sec)) continue;
    perSectionRolls[sec] = (perSectionRolls[sec] || 0) + 1;
    visibleRollCount += 1;
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
      totalRolls: visibleRollCount,
      recentJoiners,
      topLearnersThisWeek: topLearners,
      sectionLeader,
    },
    {
      headers: {
        // 5-minute browser cache + 30 min stale-while-revalidate. Public stats.
        "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
      },
    }
  );
}
