import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { MODULE_TOTALS, TOTAL_TOPICS } from "@/lib/modules";
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
    supabase.from("roll_list").select("batch_id, section, enrollment_no"),
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

    return {
      email,
      name: s.name || "(no name)",
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

  // Full roll list for drawer (to surface claim status)
  const rollList = (rollsRes.data || []).map((r) => ({
    batchId: (r as { batch_id?: string }).batch_id || "",
    section: (r as { section?: string }).section || "Section 1",
    enrollmentNo: (r as { enrollment_no?: string }).enrollment_no || "",
  }));

  return Response.json(
    {
      students,
      rollList,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
      },
    }
  );
}
