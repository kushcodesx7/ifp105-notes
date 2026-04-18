// Centralised localStorage / sessionStorage key builder.
//
// Why: the codebase has ~20 call sites constructing keys like
// `ifp105_m${N}_progress` inline. That's fine when there's one course,
// but the moment we add Python next semester those keys collide in
// the same browser (a student's Python "Module 1 done" overwrites
// their ICT progress).
//
// Phase 1 (now): every helper returns the EXACT string that used to
// be hand-written, so nothing breaks. Call sites migrate to these
// helpers during Phase 2 refactoring.
//
// Phase 2+: the slug parameter becomes meaningful — `progressKey("ict", 1)`
// returns `"ict_m1_progress"`, `progressKey("python", 1)` returns
// `"python_m1_progress"`. We'll add a one-time migration that renames
// any lingering `ifp105_*` keys to `ict_*`.
//
// Convention:
//   - "global" keys (auth session, salt, streak) are not namespaced
//     to a course — they're per-user-per-browser.
//   - "course-scoped" keys include the course slug so two courses
//     don't overwrite each other.
//   - We still return `ifp105_*` today for all course-scoped keys
//     because the slug for the current course IS `ifp105` at the DB
//     and storage layer, even though the registry/display shows it
//     as `ict` + "IFP105". This preserves every existing student's
//     in-progress work.

// The literal prefix used for every course-scoped key TODAY. When we
// migrate to per-course slugs, we'll flip this constant and add a
// one-shot migration that reads old-prefix keys into new-prefix ones.
const LEGACY_PREFIX = "ifp105";

// ── Course-scoped keys ───────────────────────────────────────────
// Accept a `courseSlug` arg so call sites can start passing it now.
// In Phase 1 we ignore the arg and always return the legacy prefix.

/** Module progress: which topics are completed. Stored as JSON array of topic ids. */
export function progressKey(_courseSlug: string, moduleNumber: number): string {
  return `${LEGACY_PREFIX}_m${moduleNumber}_progress`;
}

/** Active topic tab within a module (restored on refresh). */
export function activeTabKey(
  _courseSlug: string,
  moduleNumber: number
): string {
  return `${LEGACY_PREFIX}_m${moduleNumber}_active_tab`;
}

/** Per-topic quiz state blob (answers + confidences + score + seed). */
export function quizStateKey(
  _courseSlug: string,
  moduleNumber: number,
  topicId: number
): string {
  return `${LEGACY_PREFIX}_m${moduleNumber}_quiz_t${topicId}`;
}

/** Bookmarks — array of (module, topic) pairs the student starred. */
export function bookmarksKey(_courseSlug: string): string {
  return `${LEGACY_PREFIX}_bookmarks`;
}

// ── Global keys (not course-specific) ───────────────────────────

/** Persisted auth session user object. Token is NEVER persisted. */
export const AUTH_USER_KEY = `${LEGACY_PREFIX}_user`;

/** Anonymous per-browser salt for MCQ shuffle. One per device. */
export const ANON_SALT_KEY = `${LEGACY_PREFIX}_anon_salt`;

/** Gamification: streak counter (global across courses). */
export const STREAK_COUNT_KEY = `${LEGACY_PREFIX}_streak`;
export const STREAK_DATE_KEY = `${LEGACY_PREFIX}_streak_date`;

/** Admin-only, session-scoped password for the legacy fallback auth. */
export const ADMIN_PASSWORD_KEY = "admin_pw";
