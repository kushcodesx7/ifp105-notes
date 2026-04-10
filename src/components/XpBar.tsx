"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStats, updateStreak } from "@/lib/gamification";

export default function XpBar() {
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const [streakToast, setStreakToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const streak = updateStreak();
    const s = getStats();
    setStats(s);

    if (streak.isNew && streak.count > 1) {
      setStreakToast(`🔥 ${streak.count}-day streak!`);
      setTimeout(() => setStreakToast(null), 3000);
    }
  }, []);

  if (!stats) return null;

  return (
    <>
      {/* Floating XP pill — minimized by default */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        onClick={() => setExpanded(!expanded)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform"
        style={{
          background: "rgba(9,9,15,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Always show level + XP */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          {stats.level}
        </div>
        <span className="text-[11px] font-bold text-indigo-400">
          {stats.xp} XP
        </span>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div
                className="w-px h-4 shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                {stats.title}
              </span>
              <div
                className="w-px h-4 shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <span className="text-[11px] font-bold text-orange-400 whitespace-nowrap">
                🔥 {stats.streak}
              </span>
              <div
                className="w-px h-4 shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <span className="text-[11px] font-bold text-zinc-400 whitespace-nowrap">
                🏅 {stats.badges}/{stats.totalBadges}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Streak toast */}
      <AnimatePresence>
        {streakToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
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
