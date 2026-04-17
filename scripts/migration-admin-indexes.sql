-- Admin performance indexes
-- Run in Supabase SQL editor. All are CREATE INDEX IF NOT EXISTS so
-- it's safe to re-run. Small tables (≤ a few thousand rows) benefit
-- most from batch_id / student_email lookups.

-- student_progress is the heaviest admin query. Speed up the two main
-- access patterns: "all rows for an email" and "all rows for a batch".
CREATE INDEX IF NOT EXISTS idx_student_progress_email
  ON student_progress (student_email);
CREATE INDEX IF NOT EXISTS idx_student_progress_batch
  ON student_progress (batch_id);

-- /admin/summary uses last_active_at >= ? — this one matters.
CREATE INDEX IF NOT EXISTS idx_sessions_last_active
  ON student_sessions (last_active_at);

-- Batch drilldown filters students by batch_id.
CREATE INDEX IF NOT EXISTS idx_students_batch
  ON students (batch_id);

-- roll_list lookup by batch.
CREATE INDEX IF NOT EXISTS idx_roll_list_batch
  ON roll_list (batch_id);
