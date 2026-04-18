-- Phase 4 / Admin course editor — content tables.
--
-- Adds the DB tables that the editor writes to: modules, topics,
-- questions. Before this migration, module/topic/question data for
-- ICT lived ONLY in TypeScript files (src/data/module{1..5}-*.ts).
-- After this migration, NEW courses (Python, Data Science, etc.)
-- have their content in the DB; ICT continues to read from TS files
-- per the hybrid strategy the teacher chose.
--
-- Safe to run multiple times (every statement is IF NOT EXISTS /
-- CREATE OR REPLACE). Additive — nothing existing is changed.
--
-- DEPLOY ORDER: run any time after Phase 3 migration is applied
-- (depends on `courses` table existing). Phase 4 code is safe to
-- deploy before running this migration — the admin editor UI
-- gracefully shows an "apply migration" hint if tables are missing.


-- ─── 1. modules ──────────────────────────────────────────────
-- One row per module within a course. UNIQUE(course_id, number)
-- guarantees no two modules in the same course share a number.

CREATE TABLE IF NOT EXISTS modules (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  number       INT         NOT NULL,
  title        TEXT        NOT NULL,
  full_title   TEXT,
  subtitle     TEXT,
  description  TEXT,
  accent       TEXT,
  order_index  INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, number)
);

CREATE INDEX IF NOT EXISTS idx_modules_course_order
  ON modules(course_id, order_index);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;


-- ─── 2. topics ───────────────────────────────────────────────
-- One row per topic within a module. `content_json` stores the
-- topic-body ContentBlock[] (same shape as src/types/content.ts).
-- For Phase 4 this starts empty ([]); Phase 5 adds the rich block
-- editor that populates it.

CREATE TABLE IF NOT EXISTS topics (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  number        INT         NOT NULL,
  title         TEXT        NOT NULL,
  time_min      INT,
  hook          TEXT,
  content_json  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  order_index   INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module_id, number)
);

CREATE INDEX IF NOT EXISTS idx_topics_module_order
  ON topics(module_id, order_index);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;


-- ─── 3. questions (MCQs) ─────────────────────────────────────
-- The editor's main authoring surface. Each question is tied to
-- exactly one topic. `options_json` stores a JSON array of strings
-- (the option texts). `correct_index` is 0-based into that array.

CREATE TABLE IF NOT EXISTS questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id       UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  number         INT         NOT NULL,
  question       TEXT        NOT NULL,
  options_json   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  correct_index  INT         NOT NULL DEFAULT 0,
  bloom          TEXT,
  explanation    TEXT,
  difficulty     TEXT,
  order_index    INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topic_id, number)
);

CREATE INDEX IF NOT EXISTS idx_questions_topic_order
  ON questions(topic_id, order_index);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;


-- ─── 4. updated_at auto-touch (optional but nice) ────────────
-- Keep `updated_at` fresh on every UPDATE via a single trigger
-- function shared across the three tables. No-op if function
-- already exists.

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS modules_touch_updated_at ON modules;
CREATE TRIGGER modules_touch_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS topics_touch_updated_at ON topics;
CREATE TRIGGER topics_touch_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS questions_touch_updated_at ON questions;
CREATE TRIGGER questions_touch_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- ─── 5. Verify ───────────────────────────────────────────────
-- After running, check the three tables exist:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('modules', 'topics', 'questions');
-- Should return 3 rows.
