"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { getBadges, getStats, type Badge } from "@/lib/gamification";

const badgeDetails: Record<string, { gradient: string; glow: string; requirement: string }> = {
  first_topic: { gradient: "from-blue-500 to-cyan-400", glow: "rgba(59,130,246,0.3)", requirement: "Complete your very first topic in any module" },
  perfect_quiz: { gradient: "from-amber-400 to-yellow-300", glow: "rgba(251,191,36,0.3)", requirement: "Score a perfect 10/10 on any quiz" },
  module_done: { gradient: "from-emerald-500 to-green-400", glow: "rgba(16,185,129,0.3)", requirement: "Complete every topic in a single module" },
  streak_3: { gradient: "from-orange-500 to-red-400", glow: "rgba(249,115,22,0.3)", requirement: "Study 3 days in a row" },
  streak_7: { gradient: "from-violet-500 to-purple-400", glow: "rgba(139,92,246,0.3)", requirement: "Study 7 days in a row" },
  html_coder: { gradient: "from-cyan-500 to-teal-400", glow: "rgba(6,182,212,0.3)", requirement: "Use the HTML editor in Module 4" },
  halfway: { gradient: "from-pink-500 to-rose-400", glow: "rgba(236,72,153,0.3)", requirement: "Complete 25 topics across all modules" },
  all_done: { gradient: "from-indigo-500 to-violet-500", glow: "rgba(99,102,241,0.4)", requirement: "Complete all 47 topics — the ultimate achievement!" },
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);

  useEffect(() => {
    setBadges(getBadges());
    setStats(getStats());
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <main id="main-content" className="relative min-h-screen">
      <Navbar showBack title="Badges" />

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden" style={{ background: '#08080F' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[100px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[250px] h-[250px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6 py-14 max-w-2xl mx-auto"
        >
          <div className="text-5xl mb-4">🏅</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Your <span className="gradient-text">Badges</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Earn badges by completing topics, acing quizzes, and building study streaks. Collect them all!
          </p>

          {/* Progress ring */}
          <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke="url(#badge-gradient)" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(earnedCount / 8) * 150.8} 150.8`}
                />
                <defs>
                  <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {earnedCount}/{8}
              </div>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-zinc-200">{earnedCount} of 8 earned</div>
              <div className="text-xs text-zinc-500">
                {earnedCount === 8 ? "You're an ICT Champion! 👑" :
                 earnedCount >= 5 ? "Almost there — keep going!" :
                 earnedCount >= 1 ? "Great start! Keep earning." :
                 "Start studying to earn your first badge!"}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Badges grid */}
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((badge, i) => {
            const details = badgeDetails[badge.id] || { gradient: "from-zinc-500 to-zinc-600", glow: "rgba(100,100,100,0.2)", requirement: "" };

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`relative rounded-2xl p-5 transition-all duration-300 ${
                  badge.earned
                    ? "card-glass hover:scale-[1.02]"
                    : "opacity-40"
                }`}
                style={{
                  background: badge.earned ? '#151518' : '#0d0d10',
                  border: `1px solid ${badge.earned ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                  boxShadow: badge.earned ? `0 8px 32px ${details.glow}` : 'none',
                }}
              >
                {/* Badge icon */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      badge.earned ? `bg-gradient-to-br ${details.gradient}` : 'bg-zinc-800/50'
                    }`}
                    style={{
                      boxShadow: badge.earned ? `0 4px 16px ${details.glow}` : 'none',
                    }}
                  >
                    {badge.earned ? badge.icon : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold mb-0.5 ${badge.earned ? 'text-zinc-200' : 'text-zinc-600'}`}>
                      {badge.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${badge.earned ? 'text-zinc-400' : 'text-zinc-700'}`}>
                      {badge.description}
                    </p>
                    <p className={`text-[10px] mt-2 ${badge.earned ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {badge.earned ? '✅ Earned!' : details.requirement}
                    </p>
                  </div>
                </div>

                {/* Earned glow effect */}
                {badge.earned && (
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl pointer-events-none"
                    style={{ background: details.glow }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Stats summary */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-6 px-6 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-400">{stats.xp}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Total XP</div>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="text-center">
                <div className="text-xl font-bold text-amber-400">Lv.{stats.level}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{stats.title}</div>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">{stats.streak}🔥</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Streak</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
