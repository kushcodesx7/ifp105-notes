"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

interface QuickStats {
  totalStudents: number;
  activeThisWeek: number;
  avgCompletion: number;
  avgMcq: number;
}

export default function AdminHomePage() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Signed-in admin? We'll use their Google ID token — no password needed.
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;

  // Restore password session on mount (for the legacy password path)
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  // Admins with a valid ID token are auto-authenticated (no password prompt)
  useEffect(() => {
    if (isAdmin && idToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthenticated(true);
    }
  }, [isAdmin, idToken]);

  // SWR shares this cache with any other admin page calling /api/admin/summary.
  // Prefer the ID token if we have one, fall back to the password.
  const credential = idToken ? { idToken } : password;
  const { data: stats, error } = useAdminFetch<QuickStats>(
    "/api/admin/summary",
    credential,
    { enabled: authenticated, refreshInterval: 60_000 }
  );

  // If we get a 401 on session-restore, clear the password session
  useEffect(() => {
    if (error && "status" in error && (error as { status?: number }).status === 401) {
      // Only wipe password — don't touch the user's Google session
      if (!isAdmin) {
        sessionStorage.removeItem("admin_pw");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthenticated(false);
      }
    }
  }, [error, isAdmin]);

  async function login() {
    setAuthError("");
    setLoading(true);
    const res = await fetch("/api/admin/summary", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
    } else {
      setAuthError("Wrong password.");
    }
    setLoading(false);
  }

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
      href: "/admin/batch-progress",
      icon: "🎯",
      title: "Batch Progress",
      desc: "Drill into each batch. See who's registered, who's pending, and how each batch is performing.",
      accent: "from-amber-500 to-orange-500",
    },
    {
      href: "/admin/progress",
      icon: "📊",
      title: "All Students",
      desc: "Flat list of every student across all batches. Filter, sort, search, export to CSV.",
      accent: "from-indigo-500 to-violet-500",
    },
    {
      href: "/admin/batches",
      icon: "🎓",
      title: "Batches & Enrollments",
      desc: "Manage batches, upload roll lists, add/remove students. Setup and admin.",
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

        {/* Quick stats — show skeleton loaders while summary loads */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
        >
          {[
            { label: "Total Students", value: stats?.totalStudents, bg: "rgba(99,102,241,0.06)", br: "rgba(99,102,241,0.15)", color: "text-white" },
            { label: "Active This Week", value: stats?.activeThisWeek, bg: "rgba(34,197,94,0.06)", br: "rgba(34,197,94,0.15)", color: "text-green-400" },
            { label: "Avg Completion", value: stats ? `${stats.avgCompletion}%` : undefined, bg: "rgba(245,158,11,0.06)", br: "rgba(245,158,11,0.15)", color: "text-amber-400" },
            { label: "Avg MCQ Score", value: stats ? `${stats.avgMcq}%` : undefined, bg: "rgba(139,92,246,0.06)", br: "rgba(139,92,246,0.15)", color: "text-violet-400" },
          ].map((card) => (
            <div
              key={card.label}
              className="p-5 rounded-xl"
              style={{ background: card.bg, border: `1px solid ${card.br}` }}
            >
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                {card.label}
              </div>
              {card.value !== undefined ? (
                <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
              ) : (
                <div className="h-9 w-16 rounded-md bg-white/[0.06] animate-pulse" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
