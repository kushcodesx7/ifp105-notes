// Streak counter — the ONLY gamification mechanic.
//
// Phase 1 (2026-04-18): XP + badges were dropped per product decision.
// Streak stays because "days studied in a row" is a useful learning
// signal, not a hollow-dopamine number. XP was abstract ("100 points
// for … what?") and badges required per-course configuration we don't
// want to build.
//
// Legacy `ifp105_xp`, `ifp105_badges` keys in students' browsers are
// left alone — no migration. They'll sit unread until cleaned by the
// `storage-keys` namespace migration in a future phase.
//
// Streak is GLOBAL across courses (a student studying Python + ICT in
// the same week gets one streak, not two).

import { STREAK_COUNT_KEY, STREAK_DATE_KEY } from "@/lib/storage-keys";

/** Current streak state for the user in this browser. */
export function getStreak(): { count: number; lastDate: string | null } {
  if (typeof window === "undefined") return { count: 0, lastDate: null };
  const count = parseInt(
    localStorage.getItem(STREAK_COUNT_KEY) || "0",
    10
  );
  const lastDate = localStorage.getItem(STREAK_DATE_KEY);
  return { count, lastDate };
}

/**
 * Bump the streak if today is a new day since the last update. Returns
 * the new streak count and whether it changed. Handles the three cases:
 *   - same day         → no change
 *   - consecutive day  → count + 1
 *   - gap > 1 day      → count resets to 1
 */
export function updateStreak(): { count: number; isNew: boolean } {
  if (typeof window === "undefined") return { count: 0, isNew: false };
  const today = new Date().toISOString().split("T")[0];
  const { count, lastDate } = getStreak();

  if (lastDate === today) return { count, isNew: false };

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newCount = lastDate === yesterday ? count + 1 : 1;

  localStorage.setItem(STREAK_COUNT_KEY, String(newCount));
  localStorage.setItem(STREAK_DATE_KEY, today);

  return { count: newCount, isNew: true };
}

