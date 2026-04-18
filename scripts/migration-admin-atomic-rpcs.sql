-- Atomic RPCs for admin mutations that today are multi-statement and
-- therefore non-transactional via supabase-js. The audit flagged two:
--
--   1. email-change — admins may want to repoint a student row to a
--      new email (e.g. they registered with a typo). Today the Next
--      handler does students.update → student_progress.update →
--      student_sessions.update sequentially. Failure in step 2 or 3
--      leaves students.email pointing at the new value while the
--      other two tables still point at the old — the student can no
--      longer log in AND their progress is unreachable.
--
--   2. delete-section — same shape: roll_list.delete + students.update
--      done sequentially.
--
-- Wrapping each as a plpgsql function gives us Postgres transaction
-- semantics for free: the whole unit succeeds or nothing changes.
--
-- SECURITY DEFINER + the service-role key means these functions run
-- with full privileges. The ONLY callers are the Next API routes,
-- which have already passed requireAdmin(). Do NOT grant EXECUTE to
-- anon or authenticated roles.
--
-- Safe to run multiple times — IF NOT EXISTS / CREATE OR REPLACE.

-- ─── email-change ─────────────────────────────────────────────────
-- Repoints a student_row + all their dependent rows (progress,
-- sessions, profile) from one email to another, atomically.
-- Returns the number of rows touched per table for the caller to log.
CREATE OR REPLACE FUNCTION admin_change_student_email(
  p_old_email TEXT,
  p_new_email TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_students_updated INT := 0;
  v_progress_updated INT := 0;
  v_sessions_updated INT := 0;
  v_profiles_updated INT := 0;
BEGIN
  -- Reject if the new email is already taken (defence in depth; the
  -- API checks this first but the DB should be authoritative).
  IF EXISTS (SELECT 1 FROM students WHERE email = p_new_email) THEN
    RAISE EXCEPTION 'Another student is already registered with %', p_new_email
      USING ERRCODE = 'unique_violation';
  END IF;

  -- Students row — the authoritative identity.
  UPDATE students SET email = p_new_email WHERE email = p_old_email;
  GET DIAGNOSTICS v_students_updated = ROW_COUNT;

  IF v_students_updated = 0 THEN
    RAISE EXCEPTION 'No student found with email %', p_old_email
      USING ERRCODE = 'no_data_found';
  END IF;

  -- Child tables keyed by student_email.
  UPDATE student_progress SET student_email = p_new_email
    WHERE student_email = p_old_email;
  GET DIAGNOSTICS v_progress_updated = ROW_COUNT;

  UPDATE student_sessions SET student_email = p_new_email
    WHERE student_email = p_old_email;
  GET DIAGNOSTICS v_sessions_updated = ROW_COUNT;

  -- student_profiles may not exist for every student (table itself is
  -- optional — older deployments may lack it). Skip errors.
  BEGIN
    UPDATE student_profiles SET student_email = p_new_email
      WHERE student_email = p_old_email;
    GET DIAGNOSTICS v_profiles_updated = ROW_COUNT;
  EXCEPTION WHEN undefined_table THEN
    v_profiles_updated := 0;
  END;

  RETURN json_build_object(
    'students_updated', v_students_updated,
    'progress_updated', v_progress_updated,
    'sessions_updated', v_sessions_updated,
    'profiles_updated', v_profiles_updated
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_change_student_email(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;


-- ─── delete-section ──────────────────────────────────────────────
-- Removes every roll_list row in a section AND detaches every
-- student from that section in one transaction. Students stay in
-- the students table (their progress is preserved) but their
-- section is cleared so the admin can reassign them.
CREATE OR REPLACE FUNCTION admin_delete_section(
  p_batch_id TEXT,
  p_section TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rolls_removed INT := 0;
  v_students_detached INT := 0;
BEGIN
  DELETE FROM roll_list
    WHERE batch_id = p_batch_id AND section = p_section;
  GET DIAGNOSTICS v_rolls_removed = ROW_COUNT;

  UPDATE students SET section = NULL
    WHERE batch_id = p_batch_id AND section = p_section;
  GET DIAGNOSTICS v_students_detached = ROW_COUNT;

  RETURN json_build_object(
    'rolls_removed', v_rolls_removed,
    'students_detached', v_students_detached
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_delete_section(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;


-- Verify:
--   SELECT proname, prosecdef FROM pg_proc
--    WHERE proname IN ('admin_change_student_email','admin_delete_section');
-- prosecdef should be 't' for both (SECURITY DEFINER).
