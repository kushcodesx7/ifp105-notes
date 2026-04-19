"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStreak } from "@/lib/gamification";

// Tiny pill that shows the student's consecutive-day study streak.
//
// Streak state lives in localStorage (STREAK_COUNT_KEY / STREAK_DATE_KEY)
// and is bumped by `updateStreak()` inside ModulePage.markDone. This
// component is purely a read — no side-effects, no date math — so it
// can sit anywhere in the tree without accidentally re-incrementing
// the counter.
//
// Renders nothing when the streak is 0 (first visit / streak lapsed)
// so the layout stays clean for new students. Small flame icon lights
// up as soon as the student marks their first topic done today.

export default function StudyStreak() {
  const [count, setCount] = useState<number | null>(null);

  // Load streak on mount + refresh when the tab regains focus. Without
  // the focus hook, a student who finishes a topic in one tab wouldn't
  // see the streak update in another tab until a full refresh.
  useEffect(() => {
    const load = () => {
      const s = getStreak();
      setCount(s.count);
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  return (
    <AnimatePresence>
      {count !== null && count > 0 && (
        <motion.span
          key={count}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{
            background: "rgba(249,115,22,0.12)",
            color: "#FB923C",
            border: "1px solid rgba(249,115,22,0.25)",
          }}
          title={`${count}-day study streak — keep it alive by completing a topic today!`}
          aria-label={`${count} day study streak`}
        >
          <span aria-hidden="true">🔥</span>
          {count}-day
        </motion.span>
      )}
    </AnimatePresence>
  );
}
