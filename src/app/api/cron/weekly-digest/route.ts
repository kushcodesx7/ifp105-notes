import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { isHiddenSection } from "@/lib/hidden-sections";
import { TOTAL_TOPICS } from "@/lib/modules";

// GET /api/cron/weekly-digest
// Generates a weekly teacher digest. Protected by a shared secret — only
// Vercel Cron (configured in vercel.json) or the teacher hitting it manually
// with the secret can call it.
//
// Returns a plain-JSON summary of class state. v1 just returns JSON — you
// can open it in the browser each Monday. v2 can email it via Resend/etc.

const CRON_SECRET = process.env.CRON_SECRET;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron includes a Bearer header; teachers can also pass ?secret=
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const secretParam = req.nextUrl.searchParams.get("secret");

  if (!CRON_SECRET) {
    return Response.json({ error: "Cron secret not configured" }, { status: 500 });
  }
  if (bearerToken !== CRON_SECRET && secretParam !== CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgoIso = new Date(Date.now() - WEEK_MS).toISOString();

  const [studentsRes, allProgressRes, weeklyProgressRes, sessionsRes] =
    await Promise.all([
      supabase.from("students").select("email, name, section, added_at"),
      supabase
        .from("student_progress")
        .select("student_email, completed"),
      supabase
        .from("student_progress")
        .select("student_email, completed")
        .gte("updated_at", weekAgoIso),
      supabase
        .from("student_sessions")
        .select("student_email, last_active_at"),
    ]);

  // Filter out hidden sections (Test Section etc)
  const students = (studentsRes.data || []).filter(
    (s) => !isHiddenSection(s.section)
  );
  const validEmails = new Set(students.map((s) => s.email));

  // Per-email completion counts
  const allDone: Record<string, number> = {};
  for (const row of allProgressRes.data || []) {
    if (!row.student_email || !validEmails.has(row.student_email)) continue;
    if (!row.completed) continue;
    allDone[row.student_email] = (allDone[row.student_email] || 0) + 1;
  }

  const weeklyDone: Record<string, number> = {};
  for (const row of weeklyProgressRes.data || []) {
    if (!row.student_email || !validEmails.has(row.student_email)) continue;
    if (!row.completed) continue;
    weeklyDone[row.student_email] = (weeklyDone[row.student_email] || 0) + 1;
  }

  // Last active per email
  const lastActive: Record<string, string> = {};
  for (const s of sessionsRes.data || []) {
    if (!s.student_email || !validEmails.has(s.student_email)) continue;
    lastActive[s.student_email] = s.last_active_at;
  }

  // Per-section breakdown
  interface SectionStats {
    section: string;
    registered: number;
    avgCompletion: number;
    activeThisWeek: number;
    notStarted: number;
  }
  const bySection: Record<string, SectionStats> = {};
  for (const s of students) {
    const sec = s.section || "Unassigned";
    if (!bySection[sec]) {
      bySection[sec] = { section: sec, registered: 0, avgCompletion: 0, activeThisWeek: 0, notStarted: 0 };
    }
    const stats = bySection[sec];
    stats.registered += 1;
    const done = allDone[s.email!] || 0;
    stats.avgCompletion += done;
    if (done === 0) stats.notStarted += 1;
    const active = lastActive[s.email!];
    if (active && active >= weekAgoIso) stats.activeThisWeek += 1;
  }

  const sections = Object.values(bySection).map((s) => ({
    ...s,
    avgCompletion: s.registered
      ? Math.round((s.avgCompletion / s.registered / TOTAL_TOPICS) * 100)
      : 0,
  }));
  sections.sort((a, b) => b.avgCompletion - a.avgCompletion);

  // Top 5 learners of the week
  const topLearners = students
    .filter((s) => s.email && (weeklyDone[s.email] || 0) > 0)
    .map((s) => ({
      name: s.name,
      section: s.section,
      topicsThisWeek: s.email ? weeklyDone[s.email] : 0,
    }))
    .sort((a, b) => (b.topicsThisWeek || 0) - (a.topicsThisWeek || 0))
    .slice(0, 5);

  // Stalled: registered but 0 completions and last_active > 7 days or null
  const stalled = students
    .filter((s) => {
      if (!s.email) return false;
      if ((allDone[s.email] || 0) > 0) return false;
      const la = lastActive[s.email];
      if (!la) return true;
      return la < weekAgoIso;
    })
    .map((s) => ({ name: s.name, section: s.section, joinedAt: s.added_at }))
    .slice(0, 20);

  return Response.json({
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    summary: {
      totalRegistered: students.length,
      activeThisWeek: Object.keys(lastActive).filter(
        (e) => lastActive[e] >= weekAgoIso
      ).length,
      weeklyTopicsCompleted: Object.values(weeklyDone).reduce(
        (a, b) => a + b,
        0
      ),
    },
    sections,
    topLearners,
    stalled: {
      count: stalled.length,
      sample: stalled,
    },
  });
}
