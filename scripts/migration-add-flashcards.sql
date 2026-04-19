-- Flashcards: add editable per-topic flashcard deck.
--
-- Before this migration, flashcards lived only in src/data/flashcards.ts
-- (hard-coded TS). There was no way for the teacher to add / remove /
-- edit a card without a code change. This migration adds a per-topic
-- JSONB column that the admin topic editor writes to; the student
-- Flashcards component fetches it via /api/public/flashcards and
-- overrides the TS data whenever the DB row is non-empty.
--
-- Shape: array of { front: string, back: string } objects.
-- Default empty array so every existing topic keeps behaving exactly
-- as before (empty DB → TS fallback wins).
--
-- Safe to re-run (IF NOT EXISTS on the column add).

ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS flashcards_json JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Cheap sanity check — enforces that whatever we write is an array.
-- Applied only if the constraint isn't already there. Does NOT check
-- the inner object shape; the API route is responsible for validating
-- { front, back } before persisting.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_flashcards_json_is_array'
  ) THEN
    ALTER TABLE topics
      ADD CONSTRAINT topics_flashcards_json_is_array
      CHECK (jsonb_typeof(flashcards_json) = 'array');
  END IF;
END $$;
