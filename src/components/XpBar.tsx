"use client";

// Streak pill — small floating counter shown while a student studies.
//
// Phase 1 rewrite: XP + level + badges were removed from the
// gamification system, so this component now shows ONLY the streak.
// The module page still imports this file as `XpBar`; keeping the
// filename for minimal diff, but a future phase will rename it to
// StreakBadge or drop the pill entirely if the teacher wants.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateStreak } from "@/lib/gamification";

export default function XpBar() {
  // Streak state is read from localStorage on mount via an effect
  // rather than lazy useState so SSR and the first client render
  // produce identical output (null). Reading localStorage in lazy
  // useState would diverge — server returns 0, client returns the
  // real count — and React's hydration check flags that as a
  // recoverable mismatch. Two-pass mount keeps the tree quiet.
  const [streakCount, setStreakCount] = useState(0);
  const [streakToast, setStreakToast] = useState<string | null>(null);

  useEffect(() => {
    const { count, isNew } = updateStreak();
    // Whitelisted setStates — these run exactly once on mount to
    // hydrate from localStorage (an external system). Doing this in
    // lazy useState would diverge between SSR (window undefined → 0)
    // and client first render (real count from storage), tripping a
    // hydration mismatch. The effect path runs after hydration, so
    // it's the right place — even though set-state-in-effect normally
    // warns against this pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreakCount(count);
    if (isNew && count > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreakToast(`🔥 ${count}-day streak!`);
    }
  }, []);

  // Auto-dismiss the celebratory toast after 3s. Effect now has zero
  // setState in its body — only schedules + cleans up a timer.
  useEffect(() => {
    if (!streakToast) return;
    const t = setTimeout(() => setStreakToast(null), 3000);
    return () => clearTimeout(t);
  }, [streakToast]);

  // Hide entirely until we know we have a streak to show
  if (streakCount <= 0) return null;

  return (
    <>
      {/* Floating streak pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        data-tour="xp-bar"
        aria-label={`Current streak: ${streakCount} day${streakCount === 1 ? "" : "s"}`}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl max-sm:bottom-20 max-sm:right-3 max-sm:scale-90"
        style={{
          background: "rgba(9,9,15,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <span className="text-[11px] font-bold text-orange-400 whitespace-nowrap">
          🔥 {streakCount}-day streak
        </span>
      </motion.div>

      {/* Streak-bump toast */}
      <AnimatePresence>
        {streakToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-20 right-5 z-50 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #F97316)",
              color: "white",
              boxShadow: "0 8px 30px rgba(245,158,11,0.3)",
            }}
          >
            {streakToast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
