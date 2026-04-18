import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { TOTAL_TOPICS } from "@/lib/course-registry";
import { requireAdmin } from "@/lib/verify-google-token";
import { isHiddenSection } from "@/lib/hidden-sections";
import { compareSections } from "@/lib/sections";

// GET /api/admin/summary
// Powers the new /admin Home page. Returns in ONE roundtrip:
//   - kpis: registered / activeThisWeek / avgCompletion / avgMcq (+ totals)
//   - needsAttention[]: students at risk (low progress + stale activity)
//   - topPerformers[]: top 5 by blended progress+mcq score
//   - sectionHealth[]: per-section rolls / registered / registered%
//   - pendingRegistration[]: signed-in but unregistered (for follow-up)
//
// All hidden sections (e.g. "Test Section") are excluded from every count
// and every surfaced list so the teacher sees real class data.
//
// Auth: admin Google ID token OR legacy admin password.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const now = Date.now();
  const weekAgoIso = new Date(now - WEEK_MS).toISOString();

  // Previously fetched student_sessions TWICE — once filtered to the
  // week window and once unfiltered for stale-detection. Fetch ALL
  // sessions once and derive both views in-memory; saves one round-trip
  // and ~50KB of internal-network payload per request. At 218 students
  // × a few sessions per student, the full table is tiny.
  const [studentsRes, rollsRes, allSessionsRes, progressRes] =
    await Promise.all([
      supabase
        .from("students")
        .select("email, name, section, batch_id, added_at"),
      supabase.from("roll_list").select("batch_id, section"),
      supabase.from("student_sessions").select("student_email, last_active_at"),
      supabase
        .from("student_progress")
        .select("student_email, completed, mcq_score, mcq_total"),
    ]);

  type Student = {
    email: string | null;
    name: string | null;
    section: string | null;
    batch_id: string | null;
    added_at: string | null;
  };

  // ─── Build registered set (visible sections only) ───────────────
  const registeredStudents = ((studentsRes.data || []) as Student[]).filter(
    (s) => s.email && !isHiddenSection(s.section)
  );
  const registeredEmails = new Set(
    registeredStudents.map((s) => s.email!) as string[]
  );
  const totalStudents = registeredEmails.size;

  // ─── Roll list totals + per-section counts ──────────────────────
  const rollsBySection: Record<string, number> = {};
  let totalRolls = 0;
  for (const r of rollsRes.data || []) {
    const section = (r as { section?: string | null }).section || "Section 1";
    if (isHiddenSection(section)) continue;
    rollsBySection[section] = (rollsBySection[section] || 0) + 1;
    totalRolls += 1;
  }

  // Active-this-week + last-active map come from a SINGLE session pass.
  // Sessions in the last 7 days → intersect with registered = this
  // week's active count. Every session → populates lastActiveMap.
  const activeSet = new Set<string>();
  const lastActiveMap: Record<string, string> = {};
  for (const s of allSessionsRes.data || []) {
    if (!s.student_email) continue;
    if (s.last_active_at) lastActiveMap[s.student_email] = s.last_active_at;
    if (
      s.last_active_at &&
      s.last_active_at >= weekAgoIso &&
      registeredEmails.has(s.student_email)
    ) {
      activeSet.add(s.student_email);
    }
  }
  const activeThisWeek = activeSet.size;

  // ─── Progress aggregation per registered student ────────────────
  type Agg = {
    completed: number;
    mcqSum: number;
    mcqCount: number;
  };
  const byStudent = new Map<string, Agg>();
  for (const row of progressRes.data || []) {
    if (!row.student_email || !registeredEmails.has(row.student_email)) continue;
    let agg = byStudent.get(row.student_email);
    if (!agg) {
      agg = { completed: 0, mcqSum: 0, mcqCount: 0 };
      byStudent.set(row.student_email, agg);
    }
    if (row.completed) agg.completed += 1;
    if (
      row.mcq_score !== null &&
      row.mcq_total !== null &&
      row.mcq_total > 0
    ) {
      agg.mcqSum += (row.mcq_score / row.mcq_total) * 100;
      agg.mcqCount += 1;
    }
  }

  let completionSum = 0;
  let mcqSumAll = 0;
  let mcqStudentCount = 0;
  for (const agg of byStudent.values()) {
    completionSum += (agg.completed / TOTAL_TOPICS) * 100;
    if (agg.mcqCount > 0) {
      mcqSumAll += agg.mcqSum / agg.mcqCount;
      mcqStudentCount += 1;
    }
  }
  const denom = byStudent.size || 1;
  const avgCompletion = Math.round(completionSum / denom);
  const avgMcq =
    mcqStudentCount > 0 ? Math.round(mcqSumAll / mcqStudentCount) : 0;

  // ─── Student-level derived scores ───────────────────────────────
  type StudentScore = {
    email: string;
    name: string;
    section: string;
    completionPct: number;
    avgMcq: number | null;
    lastActive: string | null;
    daysSinceActive: number | null;
  };

  const studentScores: StudentScore[] = registeredStudents.map((s) => {
    const email = s.email!;
    const agg = byStudent.get(email);
    const completionPct = agg
      ? Math.round((agg.completed / TOTAL_TOPICS) * 100)
      : 0;
    const avg =
      agg && agg.mcqCount > 0 ? Math.round(agg.mcqSum / agg.mcqCount) : null;
    const lastActive = lastActiveMap[email] || null;
    const daysSinceActive = lastActive
      ? Math.floor((now - new Date(lastActive).getTime()) / 86400000)
      : null;
    return {
      email,
      name: s.name || "(no name)",
      section: s.section || "Section 1",
      completionPct,
      avgMcq: avg,
      lastActive,
      daysSinceActive,
    };
  });

  // ─── Needs attention: 0% progress OR 14+ days inactive ──────────
  const needsAttention = studentScores
    .filter((s) => {
      if (s.completionPct === 0) return true;
      if (s.daysSinceActive !== null && s.daysSinceActive >= 14) return true;
      return false;
    })
    .sort((a, b) => {
      // Worst offenders first: lowest completion, then longest inactivity
      if (a.completionPct !== b.completionPct)
        return a.completionPct - b.completionPct;
      return (b.daysSinceActive ?? 0) - (a.daysSinceActive ?? 0);
    })
    .slice(0, 10);

  // ─── Top performers: blend completion + mcq, need some progress ─
  const topPerformers = studentScores
    .filter((s) => s.completionPct > 0 && s.avgMcq !== null)
    .map((s) => ({
      ...s,
      blended: s.completionPct * 0.6 + (s.avgMcq ?? 0) * 0.4,
    }))
    .sort((a, b) => b.blended - a.blended)
    .slice(0, 5);

  // ─── Section health: rolls vs registered per section ────────────
  const registeredBySection: Record<string, number> = {};
  for (const s of registeredStudents) {
    const section = s.section || "Section 1";
    if (isHiddenSection(section)) continue;
    registeredBySection[section] = (registeredBySection[section] || 0) + 1;
  }
  const sectionNames = new Set<string>([
    ...Object.keys(rollsBySection),
    ...Object.keys(registeredBySection),
  ]);
  const sectionHealth = Array.from(sectionNames)
    .sort(compareSections)
    .map((name) => {
      const rolls = rollsBySection[name] || 0;
      const registered = registeredBySection[name] || 0;
      const pct = rolls > 0 ? Math.round((registered / rolls) * 100) : 0;
      return { name, rolls, registered, pct };
    });

  // ─── Pending registration: signed-in without a students row ─────
  const pendingEmails: Set<string> = new Set();
  for (const s of allSessionsRes.data || []) {
    if (s.student_email && !registeredEmails.has(s.student_email)) {
      pendingEmails.add(s.student_email);
    }
  }
  const pendingRegistration = Array.from(pendingEmails).map((email) => ({
    email,
    lastActive: lastActiveMap[email] || null,
  }));

  return Response.json(
    {
      kpis: {
        totalStudents,
        totalRolls,
        activeThisWeek,
        avgCompletion,
        avgMcq,
        pendingRegistration: pendingRegistration.length,
      },
      needsAttention,
      topPerformers,
      sectionHealth,
      pendingRegistration: pendingRegistration.slice(0, 100),
    },
    {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
      },
    }
  );
}
