"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface QuickStats {
  totalStudents: number;
  activeThisWeek: number;
  avgCompletion: number;
  avgMcq: number;
}

export default function AdminHomePage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<QuickStats | null>(null);

  async function login() {
    setAuthError("");
    setLoading(true);
    const res = await fetch("/api/progress/admin", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
      const data = await res.json();
      calcStats(data.students || []);
    } else {
      setAuthError("Wrong password.");
    }
    setLoading(false);
  }

  function calcStats(students: { lastActive: string | null; completionPct: number; avgMcqScore: number | null }[]) {
    if (students.length === 0) {
      setStats({ totalStudents: 0, activeThisWeek: 0, avgCompletion: 0, avgMcq: 0 });
      return;
    }
    const active = students.filter((s) => {
      if (!s.lastActive) return false;
      const daysSince = (Date.now() - new Date(s.lastActive).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 7;
    }).length;
    const avgCompletion =
      students.reduce((sum, s) => sum + s.completionPct, 0) / students.length;
    const withMcq = students.filter((s) => s.avgMcqScore !== null);
    const avgMcq =
      withMcq.length > 0
        ? withMcq.reduce((sum, s) => sum + (s.avgMcqScore ?? 0), 0) / withMcq.length
        : 0;
    setStats({
      totalStudents: students.length,
      activeThisWeek: active,
      avgCompletion: Math.round(avgCompletion),
      avgMcq: Math.round(avgMcq),
    });
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
      fetch("/api/progress/admin", { headers: { "x-admin-password": saved } })
        .then((res) => {
          if (!res.ok) throw new Error("auth failed");
          return res.json();
        })
        .then((data) => calcStats(data.students || []))
        .catch(() => {
          sessionStorage.removeItem("admin_pw");
          setAuthenticated(false);
        });
    }
  }, []);

  if (!authenticated) {
    return (
      <main className="min-h-screen">
        <Navbar showBack title="Admin" />
        <div className="flex items-center justify-center pt-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-sm text-zinc-500">IFP105 Teacher Portal</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 mb-3"
            />
            {authError && <p className="text-sm text-red-400 mb-3">{authError}</p>}
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Checking..." : "Login"}
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  const cards = [
    {
      href: "/admin/progress",
      icon: "📊",
      title: "Student Progress",
      desc: "View every student's progress across all 5 modules. Filter, sort, search, export to CSV.",
      accent: "from-indigo-500 to-violet-500",
    },
    {
      href: "/admin/batches",
      icon: "🎓",
      title: "Batches & Enrollments",
      desc: "Manage student batches, enrollment lists, and roll call. Add/remove students and batches.",
      accent: "from-cyan-500 to-teal-500",
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar showBack title="Admin" />
      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm text-zinc-400">
            Teacher portal for IFP105 — Information & Communication Technology
          </p>
          <div className="inline-flex items-center gap-2 mt-3">
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_pw");
                setAuthenticated(false);
                setPassword("");
              }}
              className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Quick stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
          >
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Total Students
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
            </div>
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.15)",
              }}
            >
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Active This Week
              </div>
              <div className="text-3xl font-bold text-green-400">{stats.activeThisWeek}</div>
            </div>
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Avg Completion
              </div>
              <div className="text-3xl font-bold text-amber-400">{stats.avgCompletion}%</div>
            </div>
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Avg MCQ Score
              </div>
              <div className="text-3xl font-bold text-violet-400">{stats.avgMcq}%</div>
            </div>
          </motion.div>
        )}

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link href={card.href}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="group relative p-6 rounded-2xl overflow-hidden cursor-pointer card-glass"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.accent} opacity-60 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    Open
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <path
                        d="M4 10h12m0 0l-4-4m4 4l-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 text-center border-t border-white/[0.04]">
          <p className="text-[10px] text-zinc-600">
            Admin dashboard · Data synced from Supabase in real-time
          </p>
        </div>
      </div>
    </main>
  );
}
