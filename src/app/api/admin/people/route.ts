import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { MODULE_TOTALS } from "@/lib/course-registry";
import { moduleWeightedPct } from "@/lib/modules";
import { requireAdmin } from "@/lib/verify-google-token";
import { isHiddenSection } from "@/lib/hidden-sections";
import type { BloomLevel } from "@/lib/blooms";

// GET /api/admin/people
// Powers the /admin/people page. Returns every registered student with
// everything the table and profile drawer need — in ONE call — so filtering,
// sorting, and drawer-open are all client-side and instant.
//
// Shape:
//   students[]: {
//     email, name, enrollmentNo, section, batchId, photoUrl, linkedinUrl,
//     bio, skills[], addedAt, lastActive, daysSinceActive,
//     completionPct, completedCount, moduleStats[], avgMcq,
//     bloomStats{}, confidenceStats{}
//   }
//   rollList[]: all roll entries so the drawer can show "claimed/unclaimed"
//
// Hidden sections are included here (admin-only endpoint) so the teacher
// can see and manage test accounts too.

interface TopicProgressRow {
  student_email: string | null;
  module_number: number;
  topic_id: number;
  completed: boolean;
  mcq_score: number | null;
  mcq_total: number | null;
  challenge_attempted: boolean;
  updated_at: string | null;
  bloom_stats: Partial<Record<BloomLevel, { correct: number; total: number }>> | null;
  confidence_stats: {
    rated?: number;
    confidentWrong?: number;
    humbleRight?: number;
  } | null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const [studentsRes, rollsRes, sessionsRes, progressRes] = await Promise.all([
    supabase
      .from("students")
      .select(
        "email, name, enrollment_no, section, batch_id, photo_url, linkedin_url, bio, skills, added_at"
      ),
    // Try to include name. Column may not exist yet → handled below.
    supabase.from("roll_list").select("batch_id, section, enrollment_no, name"),
    supabase.from("student_sessions").select("student_email, last_active_at"),
    // Pull per-topic progress so we can build module breakdowns + aggregate
    // Bloom's stats by summing the JSONB columns across topics per student.
    supabase
      .from("student_progress")
      .select(
        "student_email, module_number, topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at, bloom_stats, confidence_stats"
      ),
  ]);

  // Graceful: if bloom_stats column missing (migration pending), retry without.
  let progressRows = (progressRes.data || []) as TopicProgressRow[];
  if (
    progressRes.error &&
    /bloom_stats|confidence_stats/i.test(progressRes.error.message)
  ) {
    const fallback = await supabase
      .from("student_progress")
      .select(
        "student_email, module_number, topic_id, completed, mcq_score, mcq_total, challenge_attempted, updated_at"
      );
    progressRows = (fallback.data || []).map((r) => ({
      ...(r as Omit<TopicProgressRow, "bloom_stats" | "confidence_stats">),
      bloom_stats: null,
      confidence_stats: null,
    }));
  }

  // Graceful: if roll_list.name column is missing the first select errors,
  // fall back to the old column set so the page still loads while the
  // migration is pending.
  let rollRows = rollsRes.data as
    | { batch_id: string; section: string; enrollment_no: string; name: string | null }[]
    | null;
  if (rollsRes.error && /name|PGRST204/i.test(rollsRes.error.message)) {
    const fb = await supabase
      .from("roll_list")
      .select("batch_id, section, enrollment_no");
    rollRows = (fb.data || []).map((r) => ({
      ...(r as { batch_id: string; section: string; enrollment_no: string }),
      name: null,
    }));
  }

  // Index roll_list by (batch_id, section, roll) for O(1) lookup when we
  // decorate each student row with their teacher-verified name.
  const rollNameByKey = new Map<string, string>();
  for (const r of rollRows || []) {
    if (!r.name) continue;
    const key = `${r.batch_id}__${r.section}__${r.enrollment_no}`;
    rollNameByKey.set(key, r.name);
  }

  // Build maps
  const lastActiveMap: Record<string, string> = {};
  for (const s of sessionsRes.data || []) {
    if (s.student_email && s.last_active_at) {
      lastActiveMap[s.student_email] = s.last_active_at;
    }
  }

  const progressByEmail = new Map<string, TopicProgressRow[]>();
  for (const row of progressRows) {
    if (!row.student_email) continue;
    const arr = progressByEmail.get(row.student_email);
    if (arr) arr.push(row);
    else progressByEmail.set(row.student_email, [row]);
  }

  const now = Date.now();

  interface ModuleStat {
    moduleNumber: number;
    done: number;
    total: number;
    pct: number;
    avgMcqPct: number | null;
  }

  // Perf (Apr 2026): collapsed 8× Array.filter passes per student into a
  // SINGLE pass that accumulates every derived stat at once.
  //
  // Before:  for each of 221 students, we filtered topicRows 5× (once per
  //          module) + 1× for completedCount + 1× for avgMcq + 1× again
  //          for mcqRows inside each module. ≈ 8 × N scans per student,
  //          so with ~50 topics/student ≈ 220×400 = 88k iterations.
  //
  // After:   one pass through topicRows per student. Module buckets,
  //          completed count, MCQ aggregates, bloom stats, confidence,
  //          and 14-day activity all populated in lock-step.
  //          ≈ 220×50 = 11k iterations. ~8× fewer passes, same O(n·m)
  //          but with a tight inner loop and no intermediate arrays.
  const FOURTEEN_DAYS_MS = 14 * 86_400_000;
  const cutoffTs = now - FOURTEEN_DAYS_MS;

  const students = (studentsRes.data || []).map((s) => {
    const email = s.email || "";
    const topicRows = progressByEmail.get(email) || [];

    // Per-module accumulators (indexed by module number 1..5).
    const modDone: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const modMcqPctSum: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const modMcqCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    let completedCount = 0;
    let mcqPctSumAll = 0;
    let mcqCountAll = 0;

    const bloomAgg: Record<string, { correct: number; total: number }> = {};
    const confAgg = { rated: 0, confidentWrong: 0, humbleRight: 0 };
    const dayCounts: Record<string, number> = {};

    for (const t of topicRows) {
      const mn = t.module_number;

      // Completed counters (overall + per-module) + 14-day activity.
      if (t.completed) {
        completedCount += 1;
        if (mn in modDone) modDone[mn] += 1;
        if (t.updated_at) {
          const ts = new Date(t.updated_at).getTime();
          if (ts >= cutoffTs) {
            const day = new Date(ts).toISOString().slice(0, 10);
            dayCounts[day] = (dayCounts[day] || 0) + 1;
          }
        }
      }

      // MCQ aggregates (overall + per-module).
      if (
        t.mcq_score !== null &&
        t.mcq_total !== null &&
        (t.mcq_total || 0) > 0
      ) {
        const pct = ((t.mcq_score || 0) / (t.mcq_total || 1)) * 100;
        mcqPctSumAll += pct;
        mcqCountAll += 1;
        if (mn in modMcqPctSum) {
          modMcqPctSum[mn] += pct;
          modMcqCount[mn] += 1;
        }
      }

      // Bloom + confidence aggregates.
      if (t.bloom_stats) {
        for (const [lvl, entry] of Object.entries(t.bloom_stats)) {
          if (!entry) continue;
          let slot = bloomAgg[lvl];
          if (!slot) {
            slot = { correct: 0, total: 0 };
            bloomAgg[lvl] = slot;
          }
          slot.correct += entry.correct || 0;
          slot.total += entry.total || 0;
        }
      }
      if (t.confidence_stats) {
        confAgg.rated += t.confidence_stats.rated || 0;
        confAgg.confidentWrong += t.confidence_stats.confidentWrong || 0;
        confAgg.humbleRight += t.confidence_stats.humbleRight || 0;
      }
    }

    const moduleStats: ModuleStat[] = [1, 2, 3, 4, 5].map((mn) => {
      const total = MODULE_TOTALS[mn] || 0;
      const done = modDone[mn];
      const mcqCount = modMcqCount[mn];
      return {
        moduleNumber: mn,
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
        avgMcqPct:
          mcqCount > 0 ? Math.round(modMcqPctSum[mn] / mcqCount) : null,
      };
    });

    // Module-weighted pct (each module = 20% of overall) — matches
    // /api/connect and /api/connect/glimpse so a student's % is the
    // same on every surface the teacher looks at.
    const completionPct = moduleWeightedPct(modDone);
    const avgMcq =
      mcqCountAll > 0 ? Math.round(mcqPctSumAll / mcqCountAll) : null;

    const recentActivity = Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const lastActive = lastActiveMap[email] || null;
    const daysSinceActive = lastActive
      ? Math.floor((now - new Date(lastActive).getTime()) / 86400000)
      : null;

    const rollKey = `${s.batch_id || ""}__${s.section || "Section 1"}__${
      s.enrollment_no || ""
    }`;
    const rollListName = rollNameByKey.get(rollKey) || null;

    return {
      email,
      // `name` is the student's chosen display name ("248_oysha").
      // `rollListName` is the teacher-verified roll-list name
      // ("Oysha Abdullayeva"). The UI shows rollListName as the primary
      // identity and falls back to `name` when the teacher hasn't
      // provided one for that roll yet.
      name: s.name || "(no name)",
      rollListName,
      enrollmentNo: s.enrollment_no || "",
      section: s.section || "Section 1",
      batchId: s.batch_id || "",
      photoUrl: s.photo_url || null,
      linkedinUrl: s.linkedin_url || null,
      bio: s.bio || null,
      skills: (s as { skills?: string[] }).skills || [],
      addedAt: s.added_at || null,
      lastActive,
      daysSinceActive,
      completionPct,
      completedCount,
      moduleStats,
      avgMcq,
      bloomStats: bloomAgg,
      confidenceStats: confAgg,
      recentActivity,
      hidden: isHiddenSection(s.section),
    };
  });

  // NOTE (perf audit Apr 2026): used to also ship the full roll_list here
  // (~1300 entries × 80 bytes ≈ 100KB) but nothing on the client side
  // consumed it — the drawer reads rollListName directly off each student
  // object. Dropping it cuts the response by roughly 40% on a full class.
  return Response.json(
    {
      students,
    },
    {
      headers: {
        // Response is per-admin + mutable; short private cache + SWR
        // absorbs focus/visibilitychange double-fetches without
        // hammering the DB. Bumped from 15s to 30s fresh because the
        // client already refetches on tab focus.
        "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
      },
    }
  );
}
