import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { MODULE_TOTALS, TOTAL_TOPICS } from "@/lib/course-registry";
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

  const students = (studentsRes.data || []).map((s) => {
    const email = s.email || "";
    const topicRows = progressByEmail.get(email) || [];

    // Per-module breakdown
    const moduleStats: ModuleStat[] = [1, 2, 3, 4, 5].map((mn) => {
      const inMod = topicRows.filter((t) => t.module_number === mn);
      const done = inMod.filter((t) => t.completed).length;
      const total = MODULE_TOTALS[mn] || 0;
      const mcqRows = inMod.filter(
        (t) => t.mcq_score !== null && t.mcq_total !== null && t.mcq_total > 0
      );
      const avgMcqPct =
        mcqRows.length > 0
          ? Math.round(
              (mcqRows.reduce(
                (sum, t) =>
                  sum + ((t.mcq_score || 0) / (t.mcq_total || 1)) * 100,
                0
              ) /
                mcqRows.length) *
                1
            )
          : null;
      return {
        moduleNumber: mn,
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
        avgMcqPct,
      };
    });

    const completedCount = topicRows.filter((t) => t.completed).length;
    const completionPct = Math.round((completedCount / TOTAL_TOPICS) * 100);

    // Overall MCQ avg
    const mcqRows = topicRows.filter(
      (t) => t.mcq_score !== null && t.mcq_total !== null && t.mcq_total > 0
    );
    const avgMcq =
      mcqRows.length > 0
        ? Math.round(
            mcqRows.reduce(
              (sum, t) =>
                sum + ((t.mcq_score || 0) / (t.mcq_total || 1)) * 100,
              0
            ) / mcqRows.length
          )
        : null;

    // Aggregate bloom stats (sum correct/total across topics)
    const bloomAgg: Record<string, { correct: number; total: number }> = {};
    const confAgg = { rated: 0, confidentWrong: 0, humbleRight: 0 };
    for (const t of topicRows) {
      if (t.bloom_stats) {
        for (const [lvl, entry] of Object.entries(t.bloom_stats)) {
          if (!entry) continue;
          if (!bloomAgg[lvl]) bloomAgg[lvl] = { correct: 0, total: 0 };
          bloomAgg[lvl].correct += entry.correct || 0;
          bloomAgg[lvl].total += entry.total || 0;
        }
      }
      if (t.confidence_stats) {
        confAgg.rated += t.confidence_stats.rated || 0;
        confAgg.confidentWrong += t.confidence_stats.confidentWrong || 0;
        confAgg.humbleRight += t.confidence_stats.humbleRight || 0;
      }
    }

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
