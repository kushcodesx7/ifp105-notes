-- Module 3 question-bank trim (Apr 25 2026)
--
-- Module 3 was rewritten to be simpler for self-study (PR #161).
-- The new TS source has exactly 5 MCQs per topic. The DB still
-- carries the old 10 (for topics 1-5) and 8 (for topic 6) — leftovers
-- from the previous bigger bank.
--
-- This script soft-deletes every Module 3 question whose `number > 5`
-- so the live student bank shrinks to 5 per topic, matching the new
-- TS file. Soft-delete (deleted_at = now()) so any of the removed
-- questions can be restored from /admin/tools/trash within the usual
-- recovery window.
--
-- AFTER running this:
--   1. Live student-facing bank: 30 questions across 6 topics ✓
--   2. The remaining live questions (1-5 per topic) still have the
--      OLD text from before the M3 rewrite. To push the NEW question
--      text + new lesson content, click Re-seed Module 3 on
--      /admin/courses/ict (or use the per-topic diff page).
--
-- IDEMPOTENT: re-running this just re-stamps deleted_at on already-
-- deleted rows. No data loss.

-- ─── 1. Soft-delete ───
UPDATE questions
SET deleted_at = NOW()
WHERE number > 5
  AND deleted_at IS NULL
  AND topic_id IN (
    SELECT t.id
    FROM topics t
    JOIN modules m ON m.id = t.module_id
    JOIN courses c ON c.id = m.course_id
    WHERE c.slug = 'ict' AND m.number = 3
  );

-- ─── 2. Verify (run this SELECT after the UPDATE) ───
-- Expected output: every topic shows 5 live questions (or fewer
-- for topics that originally had fewer).
SELECT
  t.number   AS topic,
  t.title    AS title,
  COUNT(*)   AS live_questions
FROM questions q
JOIN topics t  ON q.topic_id   = t.id
JOIN modules m ON m.id         = t.module_id
JOIN courses c ON c.id         = m.course_id
WHERE c.slug = 'ict'
  AND m.number = 3
  AND q.deleted_at IS NULL
GROUP BY t.number, t.title
ORDER BY t.number;

-- ─── 3. (Optional) Hard-purge trashed questions ─────────────────
-- Run only after confirming you don't want any of the removed
-- questions back. Permanent.
--
-- DELETE FROM questions
-- WHERE deleted_at IS NOT NULL
--   AND number > 5
--   AND topic_id IN (
--     SELECT t.id FROM topics t
--     JOIN modules m ON m.id = t.module_id
--     JOIN courses c ON c.id = m.course_id
--     WHERE c.slug = 'ict' AND m.number = 3
--   );

-- ─── 4. Rollback (un-trash) ─────────────────────────────────────
-- If you change your mind WITHIN the recovery window:
--
-- UPDATE questions
-- SET deleted_at = NULL
-- WHERE number > 5
--   AND deleted_at IS NOT NULL
--   AND topic_id IN (
--     SELECT t.id FROM topics t
--     JOIN modules m ON m.id = t.module_id
--     JOIN courses c ON c.id = m.course_id
--     WHERE c.slug = 'ict' AND m.number = 3
--   );
