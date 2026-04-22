"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStreak } from "@/lib/streak";

// Small pill-shaped chip that shows the student's consecutive-day study
// streak. Renders "🔥 N-day streak" when streakDays > 0, or a subtle
// "Start your streak today" prompt when 0 — lets first-day students
// understand the widget without us having to explain it in copy.
//
// Reads from localStorage via getStreak() — no side-effects. The
// bumpStreak() call lives on module mount + addDone in ModulePage /
// useStudentProgress, so opening the home page never increments the
// counter. This component is safe to place anywhere in the tree.
//
// Refreshes on `focus` + `visibilitychange` so a student who completes
// a topic in one tab sees the pill update in another tab without a
// hard refresh.

export default function StreakPill() {
  // null = "not yet hydrated from localStorage" — we avoid a hydration
  // flash by rendering nothing on the server and on the first client
  // frame, then showing the pill after the mount-effect reads LS.
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const load = () => setStreak(getStreak());
    load();
    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  if (streak === null) return null;

  const label =
    streak > 0 ? `${streak}-day streak` : "Start your streak today";

  // Active streak gets the warm orange accent (matches the flame icon).
  // Zero-streak gets a muted zinc pill so it reads as a gentle prompt,
  // not a live counter.
  const activeStyle: React.CSSProperties = {
    background: "rgba(249,115,22,0.12)",
    color: "#FB923C",
    border: "1px solid rgba(249,115,22,0.25)",
  };
  const dormantStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    color: "#a1a1aa",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <motion.div
      // Matches the rest of the site's "chip pops in" pattern. Spring
      // settles quickly so it doesn't distract on the home page.
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={streak > 0 ? activeStyle : dormantStyle}
      aria-label={streak > 0 ? `${streak} day study streak` : "No active streak"}
      title={
        streak > 0
          ? `You've studied ${streak} day${streak === 1 ? "" : "s"} in a row — keep it alive by completing a topic today!`
          : "Open any module or complete a topic today to start your streak."
      }
    >
      <span aria-hidden="true">🔥</span>
      {label}
    </motion.div>
  );
}
