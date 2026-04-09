"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStats, updateStreak, getBadges, type Badge } from "@/lib/gamification";

export default function XpBar() {
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const [streakToast, setStreakToast] = useState<string | null>(null);

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
      {/* Floating XP bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl"
        style={{ background: 'rgba(9,9,15,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Level */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white' }}>
            {stats.level}
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-300">{stats.title}</div>
            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
              />
            </div>
          </div>
        </div>

        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* XP */}
        <div className="text-[11px] font-bold text-indigo-400">{stats.xp} XP</div>

        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Streak */}
        <div className="text-[11px] font-bold">
          <span className="text-orange-400">🔥 {stats.streak}</span>
        </div>

        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Badges */}
        <div className="text-[11px] font-bold text-zinc-400">
          🏅 {stats.badges}/{stats.totalBadges}
        </div>
      </motion.div>

      {/* Streak toast */}
      <AnimatePresence>
        {streakToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: 'white', boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}
          >
            {streakToast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
