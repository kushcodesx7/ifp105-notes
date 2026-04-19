-- Live class digest — add current_path tracking to student_sessions.
--
-- Powers the "where is everyone right now" view on /admin: instead of
-- just showing a count of active students, the admin sees the
-- distribution of which topic / page each one is on. Lets the teacher
-- spot patterns in real time ("everyone's stuck on Topic 5") without
-- having to ask.
--
-- Backward compat: column is nullable. The /api/session/ping route
-- writes it on every ping; older clients (no current_path in payload)
-- just leave the field null. Admin views render "—" for nulls.
--
-- Safe to re-run.

ALTER TABLE student_sessions
  ADD COLUMN IF NOT EXISTS current_path TEXT;

-- Partial index for the live-now-by-path query. Only rows with a
-- current_path matter for the digest; nulls would just bloat the index.
CREATE INDEX IF NOT EXISTS idx_student_sessions_active_path
  ON student_sessions(last_active_at DESC, current_path)
  WHERE current_path IS NOT NULL;
