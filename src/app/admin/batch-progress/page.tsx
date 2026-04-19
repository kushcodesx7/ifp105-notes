"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

interface SectionBreakdown {
  name: string;
  totalRolls: number;
  registered: number;
  pending: number;
}

interface BatchSummary {
  id: string;
  name: string;
  accent: string | null;
  totalRolls: number;
  registered: number;
  notRegistered: number;
  activeThisWeek: number;
  avgCompletion: number;
  avgMcq: number;
  sections?: SectionBreakdown[];
}

interface OrphanStudent {
  name: string;
  email: string;
  lastActive: string | null;
}

export default function BatchProgressListPage() {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);
  const idToken = isAdmin ? getIdToken() : null;

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Restore password session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  // Signed-in admin → auto-authenticate
  useEffect(() => {
    if (isAdmin && idToken) {
      setAuthenticated(true);
    }
  }, [isAdmin, idToken]);

  const credential = idToken ? { idToken } : password;
  const { data: batchData, error: fetchError, mutate: refreshData, isLoading: fetchLoading } =
    useAdminFetch<{
      batches: BatchSummary[];
      orphanStudents: number;
      orphanStudentList?: OrphanStudent[];
    }>(
      "/api/progress/batches",
      credential,
      { enabled: authenticated, refreshInterval: 30_000 }
    );
  const batches = batchData?.batches ?? [];
  const orphanCount = batchData?.orphanStudents ?? 0;
  const orphanList = batchData?.orphanStudentList ?? [];
  const [showOrphans, setShowOrphans] = useState(false);
  const initialLoaded = !!batchData || (!fetchLoading && !!fetchError);

  // Clear password session on auth failure (leave Google session alone)
  useEffect(() => {
    if (fetchError && "status" in fetchError && (fetchError as { status?: number }).status === 401) {
      if (!isAdmin) {
        sessionStorage.removeItem("admin_pw");
          setAuthenticated(false);
      }
    }
  }, [fetchError, isAdmin]);

  async function login() {
    setAuthError("");
    setLoading(true);
    const res = await fetch("/api/progress/batches", {
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
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
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

  return (
    <main className="min-h-screen">
      <Navbar showBack title="Batch Progress" />
      <div className="pt-8 pb-16 px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link
              href="/admin"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 mb-2"
            >
              ← Admin Home
            </Link>
            <h1 className="text-2xl font-bold">Batch Progress</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Click any batch to see its students.
            </p>
          </div>
          <button
            onClick={() => refreshData()}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {!initialLoaded ? (
          // Skeleton while first fetch is in flight
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="h-5 w-40 rounded bg-white/[0.06] mb-3" />
                <div className="h-3 w-24 rounded bg-white/[0.04] mb-5" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-8 rounded bg-white/[0.04]" />
                  <div className="h-8 rounded bg-white/[0.04]" />
                  <div className="h-8 rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎓</div>
            <p className="text-zinc-500">
              No batches yet. Create one in{" "}
              <Link href="/admin/roster" className="text-indigo-400 hover:text-indigo-300">
                Roster
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/admin/batch-progress/${encodeURIComponent(batch.id)}`}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="relative p-6 rounded-2xl overflow-hidden cursor-pointer group card-glass"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ background: batch.accent || "#6366F1" }}
                    />
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                      style={{ background: batch.accent || "#6366F1" }}
                    />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                            Batch
                          </p>
                          <h2 className="text-xl font-bold">{batch.name}</h2>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-3xl font-bold"
                            style={{ color: batch.accent || "#6366F1" }}
                          >
                            {batch.avgCompletion}%
                          </div>
                          <div className="text-[10px] text-zinc-500">Avg Completion</div>
                        </div>
                      </div>

                      {/* Student counts */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div
                          className="px-3 py-2 rounded-lg text-center"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div className="text-lg font-bold">{batch.totalRolls}</div>
                          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">
                            Roll List
                          </div>
                        </div>
                        <div
                          className="px-3 py-2 rounded-lg text-center"
                          style={{
                            background: "rgba(34,197,94,0.06)",
                            border: "1px solid rgba(34,197,94,0.15)",
                          }}
                        >
                          <div className="text-lg font-bold text-green-400">{batch.registered}</div>
                          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">
                            Registered
                          </div>
                        </div>
                        <div
                          className="px-3 py-2 rounded-lg text-center"
                          style={{
                            background: "rgba(239,68,68,0.06)",
                            border: "1px solid rgba(239,68,68,0.15)",
                          }}
                        >
                          <div className="text-lg font-bold text-red-400">{batch.notRegistered}</div>
                          <div className="text-[9px] text-zinc-500 uppercase tracking-wider">
                            Pending
                          </div>
                        </div>
                      </div>

                      {/* Per-section breakdown — shows which sections have
                            which completion rate at a glance. Only renders
                            when the API returns sections (newer endpoint). */}
                      {batch.sections && batch.sections.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Sections
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {batch.sections.map((sec) => {
                              const pct =
                                sec.totalRolls > 0
                                  ? Math.round((sec.registered / sec.totalRolls) * 100)
                                  : 0;
                              return (
                                <div
                                  key={sec.name}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                                  style={{
                                    background: "rgba(255,255,255,0.025)",
                                    border: "1px solid rgba(255,255,255,0.04)",
                                  }}
                                >
                                  <span className="text-[11px] font-semibold text-zinc-300 shrink-0">
                                    {sec.name.replace(/^Section /, "S")}
                                  </span>
                                  <div
                                    className="flex-1 h-1 rounded-full overflow-hidden"
                                    style={{ background: "rgba(255,255,255,0.06)" }}
                                  >
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${pct}%`,
                                        background:
                                          pct >= 80
                                            ? "#22c55e"
                                            : pct >= 40
                                              ? "#f59e0b"
                                              : "#ef4444",
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-semibold text-zinc-400 tabular-nums shrink-0">
                                    {sec.registered}/{sec.totalRolls}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Activity bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Active this week</span>
                          <span className="font-bold text-white">
                            {batch.activeThisWeek} / {batch.registered || 0}
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${
                                batch.registered > 0
                                  ? (batch.activeThisWeek / batch.registered) * 100
                                  : 0
                              }%`,
                              background: "#22c55e",
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 text-xs">
                        <span className="text-zinc-500">
                          Avg MCQ:{" "}
                          <span
                            className={
                              batch.avgMcq >= 80
                                ? "text-green-400 font-bold"
                                : batch.avgMcq >= 60
                                ? "text-yellow-400 font-bold"
                                : "text-red-400 font-bold"
                            }
                          >
                            {batch.avgMcq}%
                          </span>
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1 group-hover:text-zinc-300 transition-colors">
                          View students
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
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {orphanCount > 0 && (
          <div
            className="mt-6 rounded-xl overflow-hidden"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <button
              onClick={() => setShowOrphans((v) => !v)}
              className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="text-sm text-amber-400">
                ⚠️ <strong>{orphanCount}</strong> student
                {orphanCount !== 1 ? "s" : ""} signed in but haven&apos;t
                completed registration. They&apos;re saving progress but{" "}
                aren&apos;t linked to any section.{" "}
                {orphanList.length > 0 && (
                  <span className="text-amber-300 underline">
                    {showOrphans ? "Hide names" : "Show names & emails"}
                  </span>
                )}
              </div>
              {orphanList.length > 0 && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`shrink-0 mt-1 transition-transform text-amber-400 ${
                    showOrphans ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {showOrphans && orphanList.length > 0 && (
              <div
                className="px-4 pb-4 space-y-1.5 max-h-80 overflow-y-auto"
                style={{ borderTop: "1px solid rgba(245,158,11,0.1)" }}
              >
                <div className="pt-3 text-[10px] text-amber-400/60 mb-1 uppercase tracking-wider font-semibold">
                  Message these students to finish registration
                </div>
                {orphanList.map((s) => {
                  // Coarse "X days ago" display — recomputed per render
                  // is fine because the value only flips at midnight UTC
                  // and this list typically has < 10 entries. Compiler
                  // purity rule flags Date.now() inline; suppressed
                  // because the cosmetic label isn't worth introducing
                  // tick state for a list this small.
                  const daysAgo = s.lastActive
                    ? Math.floor(
                        // eslint-disable-next-line react-hooks/purity
                        (Date.now() - new Date(s.lastActive).getTime()) /
                          86400000
                      )
                    : null;
                  return (
                    <div
                      key={s.email}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-zinc-200 truncate">
                          {s.name || "(no name)"}
                        </div>
                        <a
                          href={`mailto:${s.email}`}
                          className="text-[11px] text-zinc-400 hover:text-indigo-300 truncate block"
                        >
                          {s.email}
                        </a>
                      </div>
                      <div className="text-[10px] text-zinc-500 shrink-0 tabular-nums">
                        {daysAgo === null
                          ? "—"
                          : daysAgo === 0
                            ? "today"
                            : `${daysAgo}d ago`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
