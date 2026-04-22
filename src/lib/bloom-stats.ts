// Bloom's-taxonomy + confidence-calibration aggregation helpers —
// SINGLE source of truth for "sum student_progress.bloom_stats and
// confidence_stats across rows into one profile."
//
// Before this module: /api/me/blooms and /api/admin/people each
// re-implemented the same loop ("for each row, for each level, add
// correct + total; sum rated / confidentWrong / humbleRight from
// confidence_stats"). Easy for one to drift from the other and leave
// a student's home profile disagreeing with the admin drawer for the
// same student. Both routes now call these helpers.
//
// The McqQuiz component has its own, different aggregation that runs
// per-quiz-session (from shuffled question objects, not from DB
// bloom_stats blobs). That one intentionally stays separate — it's a
// different input shape.

import { BLOOM_ORDER, type BloomLevel } from "@/lib/blooms";

export interface BloomStatEntry {
  correct: number;
  total: number;
}

export interface ConfidenceStatEntry {
  rated?: number | null;
  confidentWrong?: number | null;
  humbleRight?: number | null;
}

export interface BloomAggregateRow {
  /** May be null/undefined (legacy rows, migration pending, or a topic
   *  that was completed without the quiz). Loop skips gracefully. */
  bloom_stats?: Partial<Record<BloomLevel, BloomStatEntry>> | null;
  confidence_stats?: ConfidenceStatEntry | null;
}

export interface AggregatedBlooms {
  /** Per-level totals, keyed by the BloomLevel. Every level is present
   *  (zero-initialised) so callers don't have to null-check. */
  perLevel: Record<BloomLevel, BloomStatEntry>;
  /** Levels as an array in the canonical BLOOM_ORDER, with pct. Shape
   *  matches what the /api/me/blooms response has been returning. */
  levels: {
    level: BloomLevel;
    correct: number;
    total: number;
    pct: number;
  }[];
  /** Confidence calibration summed across rows. */
  calibration: {
    rated: number;
    confidentWrong: number;
    humbleRight: number;
  };
  /** How many rows contributed a non-null bloom_stats payload — proxy
   *  for "how many quizzes the student actually finished." Used by
   *  HomeBloomsProfile to decide whether to show the radar at all. */
  topicsContributing: number;
  /** Lowest-pct level with enough signal (≥3 attempted) to trust.
   *  Null when the student hasn't hit 3 of any level yet. */
  weakestLevel: BloomLevel | null;
}

/** Fresh zero-initialised per-level scaffold. Factored so callers
 *  that need an empty aggregate (migration-pending fallback) can
 *  produce one without repeating the six zeroed entries. */
export function emptyBloomAggregate(): Record<BloomLevel, BloomStatEntry> {
  return {
    remember: { correct: 0, total: 0 },
    understand: { correct: 0, total: 0 },
    apply: { correct: 0, total: 0 },
    analyze: { correct: 0, total: 0 },
    evaluate: { correct: 0, total: 0 },
    create: { correct: 0, total: 0 },
  };
}

/**
 * Aggregate Bloom's + calibration stats across a list of
 * student_progress rows. Returns a fully-populated {@link
 * AggregatedBlooms}. Safe on empty input — returns all zeros.
 */
export function aggregateBloomStats(
  rows: BloomAggregateRow[]
): AggregatedBlooms {
  const perLevel = emptyBloomAggregate();
  let rated = 0;
  let confidentWrong = 0;
  let humbleRight = 0;
  let topicsContributing = 0;

  for (const row of rows) {
    if (row.bloom_stats) {
      topicsContributing++;
      for (const level of BLOOM_ORDER) {
        const entry = row.bloom_stats[level];
        if (!entry) continue;
        perLevel[level].correct += entry.correct || 0;
        perLevel[level].total += entry.total || 0;
      }
    }
    if (row.confidence_stats) {
      rated += row.confidence_stats.rated || 0;
      confidentWrong += row.confidence_stats.confidentWrong || 0;
      humbleRight += row.confidence_stats.humbleRight || 0;
    }
  }

  const levels = BLOOM_ORDER.map((level) => {
    const { correct, total } = perLevel[level];
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { level, correct, total, pct };
  });

  // "Meaningful" = at least 3 attempted. Prevents "0/0 create" from
  // being flagged as the weak spot for a student who simply hasn't
  // hit any Create questions yet. Same threshold the two API routes
  // were using before the extraction.
  const meaningful = levels.filter((l) => l.total >= 3);
  const weakestLevel =
    meaningful.length > 0
      ? meaningful.reduce((a, b) => (a.pct <= b.pct ? a : b)).level
      : null;

  return {
    perLevel,
    levels,
    calibration: { rated, confidentWrong, humbleRight },
    topicsContributing,
    weakestLevel,
  };
}
