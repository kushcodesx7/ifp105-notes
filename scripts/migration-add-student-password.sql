-- Quick-login: enrollment number + password.
--
-- Why: students sometimes log into a fresh lab computer without their
-- Google session cookie cached. Going through the full Google OAuth
-- flow on a slow machine in a 50-minute lab eats 2-3 minutes of class
-- time per student. This adds an alternative login path:
--
--   "I'm <enrollment>, my password is <password>" → instant session.
--
-- Students opt in by setting a password from /profile/edit AFTER
-- their first Google sign-in (so we know which Google identity to
-- bind to which enrollment number). Existing students who never set
-- a password keep using Google as before — nothing breaks.
--
-- Schema:
--   password_hash    bcrypt hash (cost 10). Nullable until the student
--                    sets one. We never store the raw password.
--   password_set_at  ISO timestamp of last set/change. Lets the
--                    teacher see which students have opted in (admin
--                    /people page can show a small badge later).
--
-- Safe to re-run.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ;

-- Lookup index — login-with-password queries by enrollment_no.
-- Already a UNIQUE constraint on (batch_id, enrollment_no) but the
-- login flow doesn't know which batch yet, so the lookup is just by
-- enrollment_no across all batches. A non-unique index is enough.
CREATE INDEX IF NOT EXISTS idx_students_enrollment_no
  ON students(enrollment_no)
  WHERE password_hash IS NOT NULL;
