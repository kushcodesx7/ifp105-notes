-- IFS Connect progress-flywheel: privacy toggle for per-student learning progress.
-- Default FALSE = progress is visible to classmates (at/above 20% threshold).
-- Students can opt out via the edit modal ("Hide my progress from classmates").

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS hide_progress BOOLEAN DEFAULT FALSE;
