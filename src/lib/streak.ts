// Study-streak counter (v2 — localStorage only).
//
// Relationship to `src/lib/gamification.ts`:
// There is ALREADY a streak mechanic in gamification.ts that stores a
// bare integer at `ifp105_streak` and uses UTC for the "what day is it"
// check. That's problematic for our students in Tashkent (UTC+5) —
// rolling over at 7pm local time breaks streaks visibly. This module
// is the next-gen version:
//
//   - course-scoped key (`ifp105_ict_streak`) so adding Python next
//     semester doesn't collide
//   - combined `{ lastActiveDate, streakDays }` blob instead of two
//     separate keys
//   - local-timezone date via toLocaleDateString('en-CA') — Tashkent
//     students stop losing streaks at 7pm
//   - cap at 365 to prevent silly overflows on long accounts
//   - hardened try/catch for private-mode browsers
//
// Server-side streak computation is a follow-up — see the note the
// teacher left in the feature spec. Once that lands, this file becomes
// a read-through cache.

const STREAK_KEY = "ifp105_ict_streak";
const MAX_STREAK = 365;

interface StreakState {
  lastActiveDate: string; // "YYYY-MM-DD" in the student's local TZ
  streakDays: number;
}

/** Local-timezone YYYY-MM-DD. Never UTC — Tashkent is UTC+5 and a UTC
 *  date rollover at 7pm local visibly broke streaks (users reported it
 *  on the Telegram group in March). */
function todayLocal(): string {
  // 'en-CA' happens to format as YYYY-MM-DD by locale default, which
  // avoids hand-rolling getFullYear / getMonth / getDate pads.
  return new Date().toLocaleDateString("en-CA");
}

/** Yesterday in local time, expressed as YYYY-MM-DD. */
function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA");
}

function readState(): StreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    if (
      typeof parsed?.lastActiveDate === "string" &&
      typeof parsed?.streakDays === "number" &&
      parsed.streakDays >= 0
    ) {
      return {
        lastActiveDate: parsed.lastActiveDate,
        streakDays: parsed.streakDays,
      };
    }
  } catch {
    // Private-mode Safari throws on localStorage access; silently
    // fall through to "no streak recorded".
  }
  return null;
}

function writeState(state: StreakState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(state));
  } catch {
    // Same rationale as readState — ignore.
  }
}

/**
 * Current streak, in days. Returns 0 if no streak recorded OR the last
 * active date is older than yesterday (i.e. the student skipped a day
 * and the streak is broken).
 *
 * SSR-safe: returns 0 on the server.
 */
export function getStreak(): number {
  const state = readState();
  if (!state) return 0;

  const today = todayLocal();
  const yesterday = yesterdayLocal();

  if (state.lastActiveDate === today || state.lastActiveDate === yesterday) {
    return state.streakDays;
  }
  // Gap of 2+ days → streak is broken. Leave the stored value alone so
  // bumpStreak() can decide whether to reset it on the next activity.
  return 0;
}

/**
 * Register study activity for today. Bumps the streak if this is the
 * first activity today:
 *
 *   same-day      → no-op
 *   yesterday→today → streakDays + 1
 *   otherwise     → streakDays = 1 (fresh start)
 *
 * SSR-safe: no-op on the server.
 */
export function bumpStreak(): void {
  if (typeof window === "undefined") return;
  const today = todayLocal();
  const yesterday = yesterdayLocal();
  const state = readState();

  if (!state) {
    writeState({ lastActiveDate: today, streakDays: 1 });
    return;
  }

  if (state.lastActiveDate === today) return; // already counted today

  const nextCount =
    state.lastActiveDate === yesterday ? state.streakDays + 1 : 1;
  writeState({
    lastActiveDate: today,
    streakDays: Math.min(nextCount, MAX_STREAK),
  });
}

/** Clear the streak. Handy for tests and for a future "reset my
 *  account" button — not wired to any UI today. SSR-safe. */
export function clearStreak(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STREAK_KEY);
  } catch {}
}
