-- Soft-delete (trash bin) for topics and questions.
--
-- Before this migration, the admin DELETE endpoints hard-dropped rows.
-- After: they set `deleted_at = now()` and the row disappears from the
-- normal list views. A new /admin/tools/trash page surfaces deleted
-- items with Restore (deleted_at → NULL) or Delete Permanently (actual
-- DB delete) buttons. Gives teachers a safety net for accidental
-- clicks without complicating the normal happy path.
--
-- Scope (layer 1): topics + questions only. Flashcards and content
-- blocks live inside JSONB columns on topics and would need per-array
-- trash tracking (layer 2, separate migration).
--
-- Safe to re-run (IF NOT EXISTS on columns + indexes).

ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Partial indexes for the "filter out deleted" list queries — make the
-- common `WHERE deleted_at IS NULL` path as fast as the pre-migration
-- query. Partial because most rows are NOT deleted, so an unfiltered
-- index on deleted_at would be mostly wasted pages.
CREATE INDEX IF NOT EXISTS idx_topics_live_by_module
  ON topics(module_id, order_index) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_questions_live_by_topic
  ON questions(topic_id, order_index) WHERE deleted_at IS NULL;

-- Reverse index for the Trash view — cheaply fetch only deleted rows
-- ordered by when they were trashed (most recent first).
CREATE INDEX IF NOT EXISTS idx_topics_deleted_desc
  ON topics(deleted_at DESC) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_deleted_desc
  ON questions(deleted_at DESC) WHERE deleted_at IS NOT NULL;
