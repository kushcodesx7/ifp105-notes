-- Row-Level Security for IFS Connect tables.
-- Run this ONCE in the Supabase SQL editor.
--
-- Strategy: deny everything by default. Our Next.js API routes use the
-- service-role key (bypasses RLS entirely on the server), so they keep
-- working. Any accidental client-side SDK access from the browser,
-- however, hits RLS and gets nothing — defense in depth.

-- Enable RLS on every user-touching table
ALTER TABLE IF EXISTS students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roll_list         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS batches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_profiles  ENABLE ROW LEVEL SECURITY;

-- With RLS on but no policies, nothing is visible to the anon key.
-- The service-role key used server-side bypasses RLS, so the app
-- keeps working. If you ever add an anon-key path on the client,
-- you'll need explicit policies. Until then, this is fine.

-- If you want to double-check RLS is active, run:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
-- rowsecurity should be 't' for every row above.
