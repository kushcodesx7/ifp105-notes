import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";
import { MODULE_TOTALS, TOTAL_TOPICS } from "@/lib/modules";

// GET /api/me/compare
// Returns the caller's per-module completion counts + the section median
// for each module. "You: 5/11 · Section median: 3/11" — the hook.
// Auth: requires a verified Google ID token (x-id-token). Only returns the
// caller's own stats, never exposes another student's data.

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const email = auth.user.email;

  // Which section is the caller in?
  const { data: studentRow } = await supabase
    .from("students")
    .select("section")
    .eq("email", email)
    .maybeSingle();
  const section = studentRow?.section || null;

  // If the caller isn't registered yet, still give them "your progress"
  // but skip the comparison.
  const [ownProgressRes, sectionStudentsRes] = await Promise.all([
    supabase
      .from("student_progress")
      .select("module_number, completed")
      .eq("student_email", email)
      .eq("completed", true),
    section
      ? supabase
          .from("students")
          .select("email")
          .eq("section", section)
      : Promise.resolve({ data: [] as { email: string }[] }),
  ]);

  const sectionEmails = (sectionStudentsRes.data || [])
    .map((s) => s.email)
    .filter(Boolean);

  // Pull all progress rows for this section at once
  const sectionProgressRes =
    sectionEmails.length > 0
      ? await supabase
          .from("student_progress")
          .select("student_email, module_number, completed")
          .in("student_email", sectionEmails)
          .eq("completed", true)
      : { data: [] };

  // Caller's own stats
  const ownDoneByModule: Record<number, number> = {};
  for (const row of ownProgressRes.data || []) {
    ownDoneByModule[row.module_number] =
      (ownDoneByModule[row.module_number] || 0) + 1;
  }
  const ownTotalDone = Object.values(ownDoneByModule).reduce((a, b) => a + b, 0);

  // Section: completions per email per module
  type PerEmail = Record<number, number>;
  const sectionByEmail: Record<string, PerEmail> = {};
  for (const row of sectionProgressRes.data || []) {
    const e = row.student_email;
    if (!e) continue;
    if (!sectionByEmail[e]) sectionByEmail[e] = {};
    sectionByEmail[e][row.module_number] =
      (sectionByEmail[e][row.module_number] || 0) + 1;
  }

  // Median per module across the section (includes zero for students with no activity)
  function median(nums: number[]): number {
    if (nums.length === 0) return 0;
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  const sectionSize = sectionEmails.length;
  const modules = Object.keys(MODULE_TOTALS)
    .map(Number)
    .map((id) => {
      const total = MODULE_TOTALS[id];
      const youDone = ownDoneByModule[id] || 0;
      // Build array: one entry per section student (0 for students with no progress)
      const perStudent = sectionEmails.map((e) => sectionByEmail[e]?.[id] || 0);
      const medianDone = median(perStudent);
      // Rank: where does the caller fall in the sorted section list?
      // "Top 20%" style badge, only if there are ≥5 peers (small samples lie).
      const sortedDesc = [...perStudent].sort((a, b) => b - a);
      const yourRank = sortedDesc.findIndex((v) => v <= youDone) + 1;
      const percentile =
        sectionSize >= 5 && youDone > 0
          ? Math.round(((sectionSize - yourRank + 1) / sectionSize) * 100)
          : null;
      return {
        id,
        total,
        youDone,
        youPct: total > 0 ? Math.round((youDone / total) * 100) : 0,
        medianDone,
        medianPct: total > 0 ? Math.round((medianDone / total) * 100) : 0,
        percentile, // null if < 5 peers — avoid misleading "Top 100%!"
      };
    });

  // Overall
  const sectionTotals = sectionEmails.map((e) =>
    Object.values(sectionByEmail[e] || {}).reduce((a, b) => a + b, 0)
  );
  const medianOverall = median(sectionTotals);

  return Response.json(
    {
      section,
      sectionSize,
      you: {
        totalDone: ownTotalDone,
        totalTopics: TOTAL_TOPICS,
        pct: Math.round((ownTotalDone / TOTAL_TOPICS) * 100),
      },
      sectionMedian: {
        done: medianOverall,
        pct: Math.round((medianOverall / TOTAL_TOPICS) * 100),
      },
      modules,
    },
    {
      headers: {
        // Private (per-user) so no shared CDN caching.
        "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
      },
    }
  );
}
