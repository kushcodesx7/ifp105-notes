import "server-only";
import { supabase } from "@/lib/supabase";
import type { ContentBlock } from "@/types/content";

// Storage cleanup helpers — used by the course/module/topic delete
// endpoints to remove orphaned images from the `course-content`
// Supabase Storage bucket when the rows referencing them cascade away.
//
// Without this, every deleted topic leaves its uploaded images behind
// forever. A semester of edits on the free tier (1 GB) adds up.
// With this, deletion is symmetric: DB row gone → bucket object gone.
//
// All helpers fail soft: an error deleting one storage path logs but
// doesn't throw, because we never want a storage-side glitch to block
// the DB delete the admin asked for.

const BUCKET = "course-content";

// Parse a Supabase public URL back into the storage key.
//
// Example:
//   https://<project>.supabase.co/storage/v1/object/public/course-content/python/m1/t3/abc.png
//   → "python/m1/t3/abc.png"
//
// Returns null for URLs that don't match the expected shape — e.g.
// third-party images, data URIs, or /images/* assets shipped in the
// repo (like /images/m1/why-computers.webp).
function urlToStoragePath(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith(".supabase.co")) return null;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx < 0) return null;
    const path = u.pathname.slice(idx + marker.length);
    return path || null;
  } catch {
    return null;
  }
}

/**
 * Walks a ContentBlock[] and returns the set of storage paths for any
 * `image` blocks that reference the course-content bucket. Non-bucket
 * URLs (repo-bundled assets, external diagrams) are ignored.
 */
export function extractBucketPaths(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return [];
  const out: string[] = [];
  for (const b of blocks as ContentBlock[]) {
    if (!b || typeof b !== "object") continue;
    if (b.type === "image" && b.src) {
      const p = urlToStoragePath(b.src);
      if (p) out.push(p);
    }
  }
  return out;
}

/**
 * Delete a batch of storage paths from the course-content bucket. Any
 * failure is logged as a warning — the caller's main flow never fails
 * on storage cleanup. Returns the count of paths Supabase attempted to
 * delete (best-effort), not a strict success count.
 */
export async function deleteBucketPaths(paths: string[]): Promise<number> {
  if (paths.length === 0) return 0;
  try {
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) {
      console.warn(
        `[storage-cleanup] removing ${paths.length} objects from ${BUCKET} failed:`,
        error.message
      );
      return 0;
    }
    return paths.length;
  } catch (e) {
    console.warn("[storage-cleanup] remove threw:", e);
    return 0;
  }
}

/**
 * Convenience: pull every topic's content_json under a single course/
 * module/topic filter from Supabase, flatten to storage paths, delete.
 * The three helpers below are used by the course/module/topic DELETE
 * endpoints respectively. Each runs BEFORE the DB row delete so the
 * cascade doesn't orphan the images.
 */

export async function cleanupTopicImages(topicId: string): Promise<number> {
  const { data } = await supabase
    .from("topics")
    .select("content_json")
    .eq("id", topicId)
    .maybeSingle();
  if (!data) return 0;
  const paths = extractBucketPaths(data.content_json);
  return deleteBucketPaths(paths);
}

export async function cleanupModuleImages(moduleId: string): Promise<number> {
  const { data } = await supabase
    .from("topics")
    .select("content_json")
    .eq("module_id", moduleId);
  if (!data) return 0;
  const paths: string[] = [];
  for (const row of data) paths.push(...extractBucketPaths(row.content_json));
  return deleteBucketPaths(paths);
}

export async function cleanupCourseImages(courseId: string): Promise<number> {
  // Two-hop: course → modules → topics. Could be a single JOIN but
  // Supabase's JS client doesn't express that cleanly; two round-trips
  // are cheap (a course has tens of modules + hundreds of topics, not
  // millions).
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  if (!modules || modules.length === 0) return 0;
  const moduleIds = (modules as { id: string }[]).map((m) => m.id);

  const { data: topics } = await supabase
    .from("topics")
    .select("content_json")
    .in("module_id", moduleIds);
  if (!topics) return 0;

  const paths: string[] = [];
  for (const row of topics) paths.push(...extractBucketPaths(row.content_json));
  return deleteBucketPaths(paths);
}
