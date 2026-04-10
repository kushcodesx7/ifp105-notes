// Bookmark system — localStorage-based

const LS_KEY = "ifp105_bookmarks";

export interface Bookmark {
  moduleNumber: number;
  topicId: number;
  topicTitle: string;
}

export function getBookmarks(): Bookmark[] {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved) as Bookmark[];
  } catch {}
  return [];
}

export function addBookmark(moduleNumber: number, topicId: number, topicTitle: string): void {
  const bookmarks = getBookmarks();
  if (bookmarks.some((b) => b.moduleNumber === moduleNumber && b.topicId === topicId)) return;
  bookmarks.push({ moduleNumber, topicId, topicTitle });
  localStorage.setItem(LS_KEY, JSON.stringify(bookmarks));
}

export function removeBookmark(moduleNumber: number, topicId: number): void {
  const bookmarks = getBookmarks().filter(
    (b) => !(b.moduleNumber === moduleNumber && b.topicId === topicId)
  );
  localStorage.setItem(LS_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(moduleNumber: number, topicId: number): boolean {
  return getBookmarks().some((b) => b.moduleNumber === moduleNumber && b.topicId === topicId);
}
