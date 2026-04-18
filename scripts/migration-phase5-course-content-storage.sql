-- Phase 5 / Block editor — Supabase Storage bucket for topic content.
--
-- Adds a public-read, admin-write bucket named `course-content` where
-- the block editor uploads images inserted into topic bodies. The URLs
-- written into `topics.content_json[*].src` point at this bucket.
--
-- SAFE TO RUN:
--   - Idempotent: bucket creation is ON CONFLICT DO NOTHING; policies
--     use CREATE POLICY guarded by DROP POLICY IF EXISTS.
--   - Non-destructive: nothing existing is touched.
--
-- DEPLOY ORDER: run any time after Phase 4. The block editor's upload
-- API returns a clear "bucket missing" error until this has been run.


-- ─── 1. Bucket ───────────────────────────────────────────────
-- Public read so student browsers can load images without auth. Private
-- write (the upload API uses the service-role key which bypasses RLS).
--
-- `file_size_limit` caps per-file uploads at 5 MB — plenty for diagrams
-- and screenshots, small enough that a runaway upload can't blow out
-- Supabase's free-tier storage. `allowed_mime_types` restricts to
-- images so someone can't smuggle an executable through the editor.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-content',
  'course-content',
  true,
  5242880,  -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ─── 2. Policies ─────────────────────────────────────────────
-- Public READ: anyone can fetch image bytes. This is the default for
-- public buckets but we spell it out so auditors can see the intent.
--
-- There is NO client-side write policy — uploads go through our own
-- admin API which uses the Supabase service-role key (bypasses RLS).
-- That keeps the upload path single-entry: admin auth check → size/type
-- validation → bucket write. Cleaner than trying to express "only
-- admin" in RLS against an arbitrary auth scheme.

DROP POLICY IF EXISTS "Public read course-content" ON storage.objects;
CREATE POLICY "Public read course-content"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'course-content');


-- ─── 3. Verify ───────────────────────────────────────────────
-- After running:
--   SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'course-content';
--   -- one row, public = true, file_size_limit = 5242880
--
--   SELECT policyname FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects'
--     AND policyname = 'Public read course-content';
--   -- one row
