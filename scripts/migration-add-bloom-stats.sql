-- Migration: Per-topic Bloom's Taxonomy + confidence calibration tracking
-- Run this in the Supabase SQL editor (or psql) BEFORE deploying the
-- Phase 3 code that writes these columns. The code gracefully degrades
-- (retries the upsert without the new fields) if the columns don't exist,
-- but you'll get no radar-chart data until the migration runs.
--
-- What this adds:
--   bloom_stats JSONB        — per-topic { remember: {c,t}, understand: {c,t}, ... }
--                              c = correct count, t = total questions at that level
--                              Only Bloom's levels present in the topic are included.
--   confidence_stats JSONB   — per-topic { rated: N, confidentWrong: X, humbleRight: Y }
--                              Used for the "Confidence calibration" insight.
--
-- Both columns are NULLable so existing rows stay valid and legacy clients
-- that don't send them continue to work.

ALTER TABLE IF EXISTS student_progress
  ADD COLUMN IF NOT EXISTS bloom_stats JSONB,
  ADD COLUMN IF NOT EXISTS confidence_stats JSONB;

-- Helpful index for the aggregation query used by /api/me/blooms.
-- Filters by student_email AND bloom_stats IS NOT NULL; partial index keeps
-- it tiny because most rows (pre-migration) will have NULL bloom_stats.
CREATE INDEX IF NOT EXISTS idx_student_progress_blooms
  ON student_progress (student_email)
  WHERE bloom_stats IS NOT NULL;

-- Verify:
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'student_progress'
--     AND column_name IN ('bloom_stats', 'confidence_stats');
