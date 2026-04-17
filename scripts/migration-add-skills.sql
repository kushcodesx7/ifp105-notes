-- IFS Connect Phase 2: add skills array to students
-- Run this in Supabase SQL editor before deploying.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Optional: make sure bio has a sane default
ALTER TABLE students
  ALTER COLUMN bio DROP NOT NULL;

-- Index for skill search (GIN works well with arrays)
CREATE INDEX IF NOT EXISTS idx_students_skills ON students USING GIN (skills);
