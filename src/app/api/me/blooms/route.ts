import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/verify-google-token";
import { BLOOM_ORDER, type BloomLevel } from "@/lib/blooms";
import { aggregateBloomStats, type BloomAggregateRow } from "@/lib/bloom-stats";

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

  // Aggregate per level + calibration across all topic rows for this
  // student. The loop + "meaningful levels for weakest-level" logic
  // used to live inline here AND in /api/admin/people/route.ts (same
  // pattern, same thresholds). Extracted to aggregateBloomStats so a
  // future tweak to the aggregation rule (say, raising the
  // meaningful-sample threshold from 3 to 5) changes both endpoints
  // in lockstep.
  const aggregated = aggregateBloomStats((data || []) as BloomAggregateRow[]);
  const { levels, calibration, topicsContributing, weakestLevel } = aggregated;
  const { rated, confidentWrong, humbleRight } = calibration;

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
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
