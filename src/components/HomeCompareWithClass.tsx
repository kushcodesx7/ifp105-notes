"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { MODULES } from "@/lib/modules";

interface ModuleCompare {
  id: number;
  total: number;
  youDone: number;
  youPct: number;
  medianDone: number;
  medianPct: number;
  percentile: number | null;
}

interface Compare {
  section: string | null;
  sectionSize: number;
  you: { totalDone: number; totalTopics: number; pct: number };
  sectionMedian: { done: number; pct: number };
  modules: ModuleCompare[];
}

/**
 * Home page widget: "You are at X% · Section median Y%".
 * Only shows for signed-in students. Silently hides for everyone else
 * (admins, logged-out visitors, users with no section assigned, or those
 * in a section with <5 peers — small samples lie).
 */
export default function HomeCompareWithClass() {
  const { isLoggedIn, user, getIdToken } = useAuth();
  const [data, setData] = useState<Compare | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user?.enrollmentNo) return;
    const token = getIdToken();
    if (!token) return; // Need a fresh sign-in session
    let alive = true;
    fetch("/api/me/compare", {
      headers: { "x-id-token": token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isLoggedIn, user?.enrollmentNo, getIdToken]);

  // Bail early — widget is pure bonus. Don't show broken states.
  if (!data || !data.section || data.sectionSize < 5) return null;

  const ahead = data.you.pct > data.sectionMedian.pct;
  const same = data.you.pct === data.sectionMedian.pct;

  const headline = ahead
    ? "You're ahead of your section 🔥"
    : same
    ? "You're right at your section's pace"
    : "Your section is a step ahead — catch up!";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 mb-10"
    >
      <div
        className="max-w-5xl mx-auto rounded-2xl p-5 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.03))",
          border: "1px solid rgba(16,185,129,0.15)",
        }}
      >
        <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {headline}
            </h2>
            <p className="text-xs text-zinc-400">
              Based on {data.sectionSize} classmates in {data.section}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              You
            </div>
            <div className="text-2xl font-bold" style={{ color: "#10B981" }}>
              {data.you.pct}%
              <span className="text-xs text-zinc-500 font-normal ml-1.5">
                vs. {data.sectionMedian.pct}% median
              </span>
            </div>
          </div>
        </div>

        {/* Dual progress bars — you vs. median */}
        <div className="mb-4 relative">
          {/* Median line */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(data.sectionMedian.pct, 1)}%`,
                background: "rgba(255,255,255,0.15)",
              }}
            />
          </div>
          {/* Your marker */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${Math.min(data.you.pct, 100)}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 w-1 h-2 -ml-0.5"
            style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}
          />
        </div>

        {/* Per-module mini breakdown */}
        <div className="grid grid-cols-5 gap-2">
          {data.modules.map((m) => {
            const meta = MODULES.find((x) => x.id === m.id);
            if (!meta) return null;
            const youAhead = m.youPct >= m.medianPct;
            return (
              <div
                key={m.id}
                className="text-center p-2 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${youAhead ? meta.accent + "30" : "rgba(255,255,255,0.04)"}`,
                }}
              >
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                  M{m.id}
                </div>
                <div className="text-xs font-bold" style={{ color: meta.accent }}>
                  {m.youDone}/{m.total}
                </div>
                <div className="text-[9px] text-zinc-600">
                  median {m.medianDone}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
