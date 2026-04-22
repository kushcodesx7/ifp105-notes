-- Migration: get_module_bundle RPC
-- Purpose: collapse the module-page cold-path DB cost from 2 round-trips
--          (module lookup → topics-with-embedded-questions) down to 1
--          Postgres function call. Saves ~100-200ms of internet latency
--          per module page render on 4G Tashkent connections.
--
-- Safe to apply: additive. Creates a new function; does NOT modify any
-- existing tables, indexes, or policies. If the client doesn't know
-- about the RPC yet (old deploy), nothing breaks — the old 2-query
-- path still works. If the RPC exists but the new client isn't
-- deployed yet, it's just an unused function.
--
-- Safe to re-run: CREATE OR REPLACE. Idempotent.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS get_module_bundle(text, int);
-- (The fallback two-query path in src/lib/module-loader.ts keeps
-- working even without this function.)

-- ── Function definition ────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_module_bundle(
  p_course_slug text,
  p_module_number int
) RETURNS TABLE (
  topic_id uuid,
  topic_number int,
  topic_title text,
  topic_time_min int,
  topic_hook text,
  topic_content_json jsonb,
  topic_order_index int,
  questions jsonb
)
LANGUAGE sql
STABLE  -- deterministic given inputs; safe to cache at the planner
PARALLEL SAFE  -- no side-effects, fine to run on a parallel worker
AS $$
  SELECT
    t.id AS topic_id,
    t.number AS topic_number,
    t.title AS topic_title,
    t.time_min AS topic_time_min,
    t.hook AS topic_hook,
    t.content_json AS topic_content_json,
    t.order_index AS topic_order_index,
    -- Embed the live questions for this topic as a JSONB array,
    -- ordered the same way the client expects (order_index, then
    -- question number). Soft-deleted questions are filtered out so
    -- students never see trashed content via the RPC path.
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'number',       q.number,
            'question',     q.question,
            'options_json', q.options_json,
            'correct_index', q.correct_index,
            'bloom',        q.bloom,
            'explanation',  q.explanation,
            'order_index',  q.order_index
          )
          ORDER BY q.order_index NULLS LAST, q.number
        )
        FROM questions q
        WHERE q.topic_id = t.id
          AND q.deleted_at IS NULL
      ),
      '[]'::jsonb
    ) AS questions
  FROM topics t
  INNER JOIN modules m ON m.id = t.module_id
  INNER JOIN courses c ON c.id = m.course_id
  WHERE c.slug = p_course_slug
    AND m.number = p_module_number
    AND t.deleted_at IS NULL
  ORDER BY t.order_index ASC NULLS LAST, t.number ASC;
$$;

-- ── Grants ─────────────────────────────────────────────────────
-- `anon` = public page views (the student-facing module pages hit
-- this without an auth token). `authenticated` covers signed-in
-- students. `service_role` is the server-side key used by the API
-- routes. Granting all three lets the function be called from any
-- legitimate path.

GRANT EXECUTE ON FUNCTION get_module_bundle(text, int) TO anon;
GRANT EXECUTE ON FUNCTION get_module_bundle(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_module_bundle(text, int) TO service_role;

-- ── Verification (run after applying) ──────────────────────────
-- SELECT topic_number, topic_title, jsonb_array_length(questions) AS q_count
-- FROM get_module_bundle('ict', 1)
-- ORDER BY topic_order_index;
--
-- Should return 11 rows (Module 1 has 11 topics), each with 10 questions.
