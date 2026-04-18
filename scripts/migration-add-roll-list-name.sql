-- Store the teacher-verified name on each roll_list row.
--
-- The roll-lists.json the teacher uploaded already has
--   { enrollment_no: "A85456325201", name: "Xusanova Laylo" }
-- but the upload script only persisted enrollment_no. With this column
-- the teacher can see "who is A85456325201" in /admin/people BEFORE the
-- student even registers, and the registration flow can surface the
-- teacher-provided name as the primary identity (the current
-- `{last3}_{firstname}` display name was useful for chat avatars but
-- useless for the roster view).
--
-- Safe to run multiple times (IF NOT EXISTS).
-- Safe to deploy code BEFORE running this migration: /api/batches/admin
-- upserts the `name` field only when present and ignores a
-- "column does not exist" error (graceful degrade).
--
-- After running this migration, re-run:
--     node scripts/upload-rolls.mjs
-- which will UPSERT every existing row with its name from roll-lists.json.

ALTER TABLE roll_list ADD COLUMN IF NOT EXISTS name TEXT;

-- Quick verify:
--   SELECT enrollment_no, section, name FROM roll_list
--   WHERE batch_id = '2025-2026'
--   ORDER BY section, enrollment_no
--   LIMIT 10;
