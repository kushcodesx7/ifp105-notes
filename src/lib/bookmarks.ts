// Bookmark system — localStorage-based.
//
// Phase 2: every function accepts an optional `courseSlug` so the
// caller can scope bookmarks per course. Today the underlying key
// still resolves to `ifp105_bookmarks` (single global list) to avoid
// migrating existing students' saved topics. A future phase will flip
// the helper to return `<slug>_bookmarks` and run a one-shot migration
// that partitions the legacy blob.
//
// In the meantime, accepting the slug in every signature means all
// call sites can start passing it now and the component refactor
// doesn't have to wait on the migration.

import { CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import { bookmarksKey } from "@/lib/storage-keys";

export interface Bookmark {
  // courseSlug retained alongside moduleNumber + topicId so we can
  // correctly identify a bookmark across courses even while the
  // underlying storage key is still global. After the namespace
  // migration this field becomes redundant with the key itself.
  courseSlug?: string;
  moduleNumber: number;
  topicId: number;
  topicTitle: string;
}

function keyFor(slug?: string): string {
  return bookmarksKey(slug ?? CURRENT_COURSE_SLUG);
}

export function getBookmarks(courseSlug?: string): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(keyFor(courseSlug));
    if (saved) return JSON.parse(saved) as Bookmark[];
  } catch {}
  return [];
}

export function addBookmark(
  moduleNumber: number,
  topicId: number,
  topicTitle: string,
  courseSlug?: string
): void {
  if (typeof window === "undefined") return;
  const slug = courseSlug ?? CURRENT_COURSE_SLUG;
  const bookmarks = getBookmarks(slug);
  if (
    bookmarks.some(
      (b) => b.moduleNumber === moduleNumber && b.topicId === topicId
    )
  )
    return;
  bookmarks.push({ courseSlug: slug, moduleNumber, topicId, topicTitle });
  localStorage.setItem(keyFor(slug), JSON.stringify(bookmarks));
}

export function removeBookmark(
  moduleNumber: number,
  topicId: number,
  courseSlug?: string
): void {
  if (typeof window === "undefined") return;
  const slug = courseSlug ?? CURRENT_COURSE_SLUG;
  const bookmarks = getBookmarks(slug).filter(
    (b) => !(b.moduleNumber === moduleNumber && b.topicId === topicId)
  );
  localStorage.setItem(keyFor(slug), JSON.stringify(bookmarks));
}

export function isBookmarked(
  moduleNumber: number,
  topicId: number,
  courseSlug?: string
): boolean {
  return getBookmarks(courseSlug).some(
    (b) => b.moduleNumber === moduleNumber && b.topicId === topicId
  );
}
