import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";
import { BLOOM_ORDER, type BloomLevel } from "@/lib/blooms";

// GET /api/me/blooms
//
// Returns the caller's Bloom's Taxonomy profile aggregated across every
// completed quiz. Powers the "Your thinking profile" radar on the home page
// AND the weak-area recommendations below it.
//
// Response shape:
//   {
//     levels: [
//       { level: "remember", correct: 12, total: 14, pct: 86 },
//       { level: "understand", correct: 8, total: 10, pct: 80 },
//       ... (canonical ladder order; missing levels emitted with 0/0)
//     ],
//     calibration: { rated: 42, confidentWrong: 6, humbleRight: 3 },
//     topicsContributing: 8,
//     weakestLevel: "analyze" | null    // lowest pct with >= 3 attempts
//   }
//
// No caching — the data is per-student and cheap to aggregate.

interface BloomStatEntry {
  correct: number;
  total: number;
}

interface ProgressRow {
  bloom_stats: Partial<Record<BloomLevel, BloomStatEntry>> | null;
  confidence_stats: {
    rated?: number;
    confidentWrong?: number;
    humbleRight?: number;
  } | null;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const email = auth.user.email;

  // Pull only the JSONB columns we need. If the migration hasn't run,
  // Supabase will error on the missing column — catch and return an empty
  // profile so the UI can show a helpful empty state.
  const { data, error } = await supabase
    .from("student_progress")
    .select("bloom_stats, confidence_stats")
    .eq("student_email", email);

  if (error) {
    // Specifically handle the "column does not exist" case — the migration
    // hasn't run yet — so the frontend still gets a well-formed response.
    if (/bloom_stats|confidence_stats/i.test(error.message)) {
      return Response.json(
        {
          levels: BLOOM_ORDER.map((level) => ({ level, correct: 0, total: 0, pct: 0 })),
          calibration: { rated: 0, confidentWrong: 0, humbleRight: 0 },
          topicsContributing: 0,
          weakestLevel: null,
          migrationPending: true,
        },
        { status: 200 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Aggregate per level across all topic rows for this student.
  const agg: Record<BloomLevel, BloomStatEntry> = {
    remember: { correct: 0, total: 0 },
    understand: { correct: 0, total: 0 },
    apply: { correct: 0, total: 0 },
    analyze: { correct: 0, total: 0 },
    evaluate: { correct: 0, total: 0 },
    create: { correct: 0, total: 0 },
  };
  let rated = 0;
  let confidentWrong = 0;
  let humbleRight = 0;
  let topicsContributing = 0;

  for (const row of (data || []) as ProgressRow[]) {
    if (row.bloom_stats) {
      // Only count this row toward topicsContributing if it has at
      // least one level with a non-zero total. An empty {} (possible
      // from a partial write or a quiz whose questions lacked bloom
      // tags) was previously triggering a "radar exists but is
      // 0/0 everywhere" state — looks broken, not helpful.
      let rowContributed = false;
      for (const level of BLOOM_ORDER) {
        const entry = row.bloom_stats[level];
        if (!entry) continue;
        if ((entry.total || 0) > 0) rowContributed = true;
        agg[level].correct += entry.correct || 0;
        agg[level].total += entry.total || 0;
      }
      if (rowContributed) topicsContributing++;
    }
    if (row.confidence_stats) {
      rated += row.confidence_stats.rated || 0;
      confidentWrong += row.confidence_stats.confidentWrong || 0;
      humbleRight += row.confidence_stats.humbleRight || 0;
    }
  }

  const levels = BLOOM_ORDER.map((level) => {
    const { correct, total } = agg[level];
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { level, correct, total, pct };
  });

  // Weakest level = lowest pct among levels with meaningful sample size (>=3
  // attempted). Prevents "0/0 create" from being flagged as the weak spot
  // when the student simply hasn't hit Create questions yet.
  const meaningful = levels.filter((l) => l.total >= 3);
  const weakestLevel =
    meaningful.length > 0
      ? meaningful.reduce((a, b) => (a.pct <= b.pct ? a : b)).level
      : null;

  return Response.json(
    {
      levels,
      calibration: { rated, confidentWrong, humbleRight },
      topicsContributing,
      weakestLevel,
      migrationPending: false,
    },
    {
      headers: {
        // Keep this short: after a student answers a quiz question,
        // the home page SWR poll (60s) or focus-refetch may land
        // inside this window. A browser-cached "empty" response would
        // delay the radar appearing. Upstream /api/progress calls
        // revalidatePath("/api/me/blooms") which clears the Next.js
        // route cache — but the BROWSER cache needs a short TTL too.
        "Cache-Control": "private, max-age=5",
      },
    }
  );
}
