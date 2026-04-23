-- Module 3 content overhaul (Apr 23 2026):
--   · Remove Facebook Marketing (topic 6) and X/Twitter Marketing (topic 7)
--   · Leave room for the new LinkedIn topic at position 6
--
-- This migration is SOFT-DELETE only — it sets `deleted_at = now()` on the
-- old topics + their questions so the teacher can recover via
-- /admin/tools/trash if anything was removed by mistake. Hard purges
-- happen later via the trash page's "Delete permanently" flow.
--
-- After this runs, the DB reflects what the TS fallback in
-- src/data/module3-topics.ts already describes (topics 1–5 live, topic
-- 6 = LinkedIn via the next part of this migration).
--
-- IDEMPOTENT: re-running sets deleted_at to the LATER of (current, now)
-- which is a no-op if the rows are already soft-deleted.

-- ─── Part 1: soft-delete old topics 6 + 7 and their questions ──────
--
-- Scoped to the "ict" course + Module 3 so this script can't
-- accidentally touch another course's topic numbering.

WITH m3 AS (
  SELECT m.id AS module_id
  FROM modules m
  JOIN courses c ON c.id = m.course_id
  WHERE c.slug = 'ict' AND m.number = 3
),
old_topics AS (
  SELECT t.id
  FROM topics t
  JOIN m3 ON t.module_id = m3.module_id
  WHERE t.number IN (6, 7)
    AND t.deleted_at IS NULL
)
UPDATE topics
SET deleted_at = now()
WHERE id IN (SELECT id FROM old_topics);

WITH m3 AS (
  SELECT m.id AS module_id
  FROM modules m
  JOIN courses c ON c.id = m.course_id
  WHERE c.slug = 'ict' AND m.number = 3
),
old_topics AS (
  SELECT t.id
  FROM topics t
  JOIN m3 ON t.module_id = m3.module_id
  WHERE t.number IN (6, 7)
)
UPDATE questions
SET deleted_at = now()
WHERE topic_id IN (SELECT id FROM old_topics)
  AND deleted_at IS NULL;

-- ─── Part 2: verify counts match the new TS fallback ────────────────
--
-- After the two UPDATEs above, Module 3 should have 5 LIVE topics
-- (numbers 1–5) in the DB. The new LinkedIn topic at number 6 is added
-- by the admin through /admin/courses/ict/modules/3 (inline editor)
-- — NOT via SQL — because the content is 400+ lines of JSONB blocks
-- and the CMS handles image uploads + block ordering correctly.
--
-- Run this SELECT to confirm the removal worked:
--
--   SELECT t.number, t.title, t.deleted_at IS NOT NULL AS trashed
--   FROM topics t
--   JOIN modules m ON m.id = t.module_id
--   JOIN courses c ON c.id = m.course_id
--   WHERE c.slug = 'ict' AND m.number = 3
--   ORDER BY t.number;
--
-- Expected output:
--   1 · Introduction to Social Media         · trashed=false
--   2 · Types of Social Media Platforms      · trashed=false
--   3 · Social Media Management Tools        · trashed=false
--   4 · Social Media Measurement & Reporting · trashed=false
--   5 · Social Advertising                   · trashed=false
--   6 · Facebook Marketing                   · trashed=TRUE
--   7 · X (formerly Twitter) Marketing       · trashed=TRUE
--
-- Then: open /admin/courses/ict/modules/3 in the browser, click
-- "Add topic", and paste the LinkedIn content from
-- src/data/module3-topics.ts (topic 6) into the block editor.
-- Number will auto-assign as 6 (next after the 5 live topics).
--
-- If the LinkedIn topic ever needs to be replaced, the fallback
-- TS content is authoritative — copy from there.

-- ─── Rollback (if needed): un-trash topics 6+7 ──────────────────────
--
--   UPDATE topics
--   SET deleted_at = NULL
--   WHERE id IN (
--     SELECT t.id FROM topics t
--     JOIN modules m ON m.id = t.module_id
--     JOIN courses c ON c.id = m.course_id
--     WHERE c.slug = 'ict' AND m.number = 3 AND t.number IN (6, 7)
--   );
--
--   UPDATE questions
--   SET deleted_at = NULL
--   WHERE topic_id IN (
--     SELECT t.id FROM topics t
--     JOIN modules m ON m.id = t.module_id
--     JOIN courses c ON c.id = m.course_id
--     WHERE c.slug = 'ict' AND m.number = 3 AND t.number IN (6, 7)
--   );
