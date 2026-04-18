-- Migration: admin_actions audit trail
-- Records every destructive / sensitive admin action so the teacher can see
-- what was changed, when, and by whom — and revert if needed.
--
-- Run this in the Supabase SQL editor BEFORE deploying Phase 2a code that
-- writes to this table. The code gracefully degrades (logs the action
-- server-side only) if the table doesn't exist, so the fix itself still
-- works; only the audit trail is missing until the migration runs.
--
-- Columns:
--   id           — monotonic timestamp-based id, no extension required
--   actor_email  — who performed the action (admin email from verified token
--                  or "password-admin" if legacy password was used)
--   action       — machine-readable kind: change_section, change_roll,
--                  change_email, reset_progress, unlink, create_batch,
--                  add_rolls, remove_rolls, rename_section, delete_section
--   subject_email — student affected (null for batch-level actions)
--   subject_batch_id / subject_section — additional context
--   details      — JSONB with before/after, counts, any other context
--   created_at   — when it happened
--
-- Indexed on actor + created_at for "what did I do today?" queries, and
-- on subject_email for "what happened to this student?".

CREATE TABLE IF NOT EXISTS admin_actions (
  id             BIGSERIAL PRIMARY KEY,
  actor_email    TEXT NOT NULL,
  action         TEXT NOT NULL,
  subject_email  TEXT,
  subject_batch_id TEXT,
  subject_section TEXT,
  details        JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_actor_time
  ON admin_actions (actor_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_actions_subject
  ON admin_actions (subject_email, created_at DESC)
  WHERE subject_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_actions_time
  ON admin_actions (created_at DESC);

-- Verify:
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'admin_actions' ORDER BY ordinal_position;
