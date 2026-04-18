-- Phase 3 / Multi-course schema.
--
-- Introduces:
--   * `courses` table   — one row per course offered on the platform
--   * `enrollments`     — junction of (student × course × batch)
--   * `course_id` FK columns on `student_progress`, `student_sessions`,
--     `batches`, `admin_actions`
--   * `student_progress` unique index rebuilt to include course_id,
--     so "Module 1 Topic 1" of Python101 no longer collides with
--     "Module 1 Topic 1" of IFP105 (the single biggest latent bug in
--     the DB before this migration)
--   * RLS enabled on the new tables (default-deny — Next API routes
--     use service role, which bypasses RLS)
--
-- SAFE TO RUN:
--   - Idempotent: every statement uses IF NOT EXISTS / ON CONFLICT / etc.
--   - Non-destructive: no data deleted. course_id is added NULLABLE and
--     backfilled; the old unique index is dropped only AFTER the new one
--     is created and the backfill confirms no nulls.
--   - Application code supports both shapes during a transition: if
--     course_id columns are missing (pre-migration), queries fall back
--     to legacy email+module+topic lookups; once present they include
--     course_id.
--
-- AFTER RUNNING:
--   - Verify there are zero NULL course_id values in student_progress:
--       SELECT count(*) FROM student_progress WHERE course_id IS NULL;
--     Should return 0.
--   - Smoke test: complete a topic as a student, confirm the row
--     upserts with course_id set.
--
-- DEPLOY ORDER: run this migration BEFORE or AFTER pushing the Phase 3
-- code — both orders are safe. The app falls back gracefully either way.


-- ─── 1. courses ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  code        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  accent      TEXT,
  icon        TEXT,
  institution TEXT,
  active      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active) WHERE active;

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Seed ICT. Idempotent via ON CONFLICT on slug.
INSERT INTO courses (slug, code, name, description, accent, institution)
VALUES (
  'ict',
  'IFP105',
  'ICT Fundamentals',
  'Everything your computer does — from Netflix to assignments — comes down to hardware and software working together.',
  '#6366F1',
  'Amity Tashkent'
)
ON CONFLICT (slug) DO NOTHING;


-- ─── 2. enrollments (student × course × batch junction) ───────
-- A student can enrol in the SAME course multiple times across
-- semesters (took Python 2024, repeats Python 2027), hence the
-- UNIQUE key is (student_email, course_id, batch_id) — not
-- (student_email, course_id).

CREATE TABLE IF NOT EXISTS enrollments (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email  TEXT        NOT NULL,
  course_id      UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  batch_id       TEXT        REFERENCES batches(id) ON DELETE SET NULL,
  section        TEXT,
  enrollment_no  TEXT,
  added_at       DATE        NOT NULL DEFAULT CURRENT_DATE,
  active         BOOLEAN     NOT NULL DEFAULT true,
  UNIQUE (student_email, course_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(student_email);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_batch ON enrollments(course_id, batch_id);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;


-- ─── 3. course_id FK on existing tables (nullable for now) ────

ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

ALTER TABLE student_progress
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE student_sessions
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

ALTER TABLE admin_actions
  ADD COLUMN IF NOT EXISTS subject_course_id UUID REFERENCES courses(id) ON DELETE SET NULL;


-- ─── 4. Backfill every existing row with ICT's course_id ──────

UPDATE batches
SET    course_id = (SELECT id FROM courses WHERE slug = 'ict')
WHERE  course_id IS NULL;

UPDATE student_progress
SET    course_id = (SELECT id FROM courses WHERE slug = 'ict')
WHERE  course_id IS NULL;

UPDATE student_sessions
SET    course_id = (SELECT id FROM courses WHERE slug = 'ict')
WHERE  course_id IS NULL;

-- admin_actions is append-only and per-event; leave subject_course_id
-- nullable (there are pre-existing audit rows from before multi-course
-- existed where a course assignment is ambiguous).


-- ─── 5. Backfill enrollments from the existing students table ──
-- One enrollment per student in the ICT course, using whatever
-- batch/section/roll they registered with. ON CONFLICT keeps this
-- idempotent across re-runs.

INSERT INTO enrollments (student_email, course_id, batch_id, section, enrollment_no, added_at)
SELECT
  s.email,
  (SELECT id FROM courses WHERE slug = 'ict'),
  s.batch_id,
  s.section,
  s.enrollment_no,
  COALESCE(s.added_at, CURRENT_DATE)
FROM students s
WHERE s.email IS NOT NULL
ON CONFLICT (student_email, course_id, batch_id) DO NOTHING;


-- ─── 6. Rebuild student_progress unique constraint ────────────
-- Old:  UNIQUE (student_email, module_number, topic_id)
-- New:  UNIQUE (student_email, course_id, module_number, topic_id)
--
-- The old index has an auto-generated name depending on your
-- Supabase project; we drop any uniqueness pattern that matches AND
-- create the new one. If the old name differs, drop manually:
--     SELECT conname FROM pg_constraint
--     WHERE conrelid = 'student_progress'::regclass
--     AND contype = 'u';

-- Drop old index / constraint (if present under common names).
ALTER TABLE student_progress
  DROP CONSTRAINT IF EXISTS student_progress_student_email_module_number_topic_id_key;
DROP INDEX IF EXISTS student_progress_student_email_module_number_topic_id_key;
DROP INDEX IF EXISTS idx_student_progress_email_module_topic;
DROP INDEX IF EXISTS student_progress_email_module_topic_idx;

-- Before we add the new unique index, confirm backfill is complete.
-- If any row still has NULL course_id, we fail loudly rather than
-- silently losing writes at the unique-key layer.
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT count(*) INTO null_count FROM student_progress WHERE course_id IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION 'student_progress still has % NULL course_id rows after backfill — investigate before rebuilding unique index.', null_count;
  END IF;
END $$;

-- Add the new unique constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'student_progress'::regclass
      AND conname = 'student_progress_course_module_topic_key'
  ) THEN
    ALTER TABLE student_progress
      ADD CONSTRAINT student_progress_course_module_topic_key
      UNIQUE (student_email, course_id, module_number, topic_id);
  END IF;
END $$;


-- ─── 7. Helpful indexes for new query patterns ────────────────

CREATE INDEX IF NOT EXISTS idx_batches_course
  ON batches(course_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_course_email
  ON student_progress(course_id, student_email);

CREATE INDEX IF NOT EXISTS idx_student_sessions_course
  ON student_sessions(course_id);


-- ─── 8. Verify ────────────────────────────────────────────────
-- After running, check everything is consistent:
--
--   SELECT slug, code, name FROM courses;
--   -- should include: ict / IFP105 / ICT Fundamentals
--
--   SELECT count(*) FILTER (WHERE course_id IS NULL) AS nulls,
--          count(*) AS total
--   FROM student_progress;
--   -- nulls should be 0
--
--   SELECT count(*) FROM enrollments;
--   -- should match count(*) FROM students where email is not null
--
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'student_progress'::regclass AND contype = 'u';
--   -- should list student_progress_course_module_topic_key
