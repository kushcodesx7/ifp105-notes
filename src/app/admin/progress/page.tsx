"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

interface TopicProgress {
  moduleNumber: number;
  topicId: number;
  completed: boolean;
  mcqScore: number | null;
  mcqTotal: number | null;
  challengeAttempted: boolean;
  updatedAt: string;
}

interface StudentData {
  name: string;
  email: string;
  enrollmentNo: string;
  batchId: string;
  completedCount: number;
  totalTopics: number;
  completionPct: number;
  avgMcqScore: number | null;
  lastActive: string | null;
  topics: Record<string, TopicProgress>;
}

type SortKey = "name" | "progress" | "lastActive";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminProgressPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [filterBatch, setFilterBatch] = useState("");

  const headers = {
    "x-admin-password": password,
  };

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
      setStudents(data.students || []);
    } else {
      setAuthError("Wrong password.");
    }
    setLoading(false);
  }

  async function fetchData(pw: string) {
    const res = await fetch("/api/progress/admin", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) {
      const data = await res.json();
      setStudents(data.students || []);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
      fetchData(saved).catch(() => {
        sessionStorage.removeItem("admin_pw");
        setAuthenticated(false);
      });
    }
  }, []);

  // Unique batch IDs for filter
  const batchIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.batchId) set.add(s.batchId);
    }
    return Array.from(set).sort();
  }, [students]);

  // Sorted + filtered
  const displayed = useMemo(() => {
    let list = [...students];
    if (filterBatch) {
      list = list.filter((s) => s.batchId === filterBatch);
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "progress") return b.completionPct - a.completionPct;
      if (sortBy === "lastActive") {
        const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });
    return list;
  }, [students, filterBatch, sortBy]);

  // Login screen
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
            <h1 className="text-2xl font-bold mb-6 text-center">
              Admin Login
            </h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 mb-3"
            />
            {authError && (
              <p className="text-sm text-red-400 mb-3">{authError}</p>
            )}
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
      <Navbar showBack title="Admin -- Student Progress" />

      <div className="pt-20 pb-16 px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Student Progress</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(password)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_pw");
                setAuthenticated(false);
                setPassword("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/20"
            >
              <option value="name">Name</option>
              <option value="progress">Progress</option>
              <option value="lastActive">Last Active</option>
            </select>
          </div>
          {batchIds.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Batch:</label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/20"
              >
                <option value="">All</option>
                {batchIds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}
          <span className="text-xs text-zinc-600 ml-auto">
            {displayed.length} student{displayed.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">&#128202;</div>
            <p className="text-zinc-500">No student progress data yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <div className="col-span-3">Student</div>
              <div className="col-span-2">Enrollment</div>
              <div className="col-span-1">Batch</div>
              <div className="col-span-3">Progress</div>
              <div className="col-span-1">MCQ Avg</div>
              <div className="col-span-2">Last Active</div>
            </div>

            {displayed.map((student) => {
              const isExpanded = expandedEmail === student.email;
              // Module 4 has 11 topics
              const m4Topics = Object.values(student.topics).filter(
                (t) => t.moduleNumber === 4
              );
              const m4Done = m4Topics.filter((t) => t.completed).length;
              const m4Pct = (m4Done / 11) * 100;

              return (
                <div key={student.email}>
                  <motion.button
                    onClick={() =>
                      setExpandedEmail(isExpanded ? null : student.email)
                    }
                    className="w-full text-left rounded-xl p-4 transition-all hover:bg-white/[0.03]"
                    style={{
                      background: isExpanded
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.01)",
                      border: `1px solid ${
                        isExpanded
                          ? "rgba(99,102,241,0.2)"
                          : "rgba(255,255,255,0.04)"
                      }`,
                    }}
                    whileHover={{ x: 2 }}
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {timeAgo(student.lastActive)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500">
                          {student.enrollmentNo}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {student.batchId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${m4Pct}%`,
                              background:
                                m4Pct === 100
                                  ? "#22c55e"
                                  : "linear-gradient(90deg, #6366F1, #8B5CF6)",
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {m4Done}/11
                        </span>
                        {student.avgMcqScore !== null && (
                          <span
                            className={`text-[10px] font-bold ${
                              student.avgMcqScore >= 80
                                ? "text-green-400"
                                : student.avgMcqScore >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {student.avgMcqScore}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-3">
                        <p className="text-sm font-semibold truncate">
                          {student.name}
                        </p>
                        <p className="text-[10px] text-zinc-600 truncate">
                          {student.email}
                        </p>
                      </div>
                      <div className="col-span-2 text-xs text-zinc-400">
                        {student.enrollmentNo || "-"}
                      </div>
                      <div className="col-span-1 text-xs text-zinc-500">
                        {student.batchId || "-"}
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${m4Pct}%`,
                              background:
                                m4Pct === 100
                                  ? "#22c55e"
                                  : "linear-gradient(90deg, #6366F1, #8B5CF6)",
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 w-8">
                          {m4Done}/11
                        </span>
                      </div>
                      <div className="col-span-1">
                        {student.avgMcqScore !== null ? (
                          <span
                            className={`text-xs font-bold ${
                              student.avgMcqScore >= 80
                                ? "text-green-400"
                                : student.avgMcqScore >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {student.avgMcqScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">-</span>
                        )}
                      </div>
                      <div className="col-span-2 text-xs text-zinc-500">
                        {timeAgo(student.lastActive)}
                      </div>
                    </div>
                  </motion.button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 mb-1 ml-4 border-l-2 border-indigo-500/20">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                            Per-topic detail (Module 4)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Array.from({ length: 11 }, (_, i) => i + 1).map(
                              (topicId) => {
                                const key = `4-${topicId}`;
                                const tp = student.topics[key];
                                const done = tp?.completed;
                                const mcq =
                                  tp?.mcqScore !== null &&
                                  tp?.mcqScore !== undefined &&
                                  tp?.mcqTotal
                                    ? `${tp.mcqScore}/${tp.mcqTotal}`
                                    : null;

                                return (
                                  <div
                                    key={topicId}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                    style={{
                                      background: done
                                        ? "rgba(34,197,94,0.06)"
                                        : "rgba(255,255,255,0.02)",
                                      border: `1px solid ${
                                        done
                                          ? "rgba(34,197,94,0.15)"
                                          : "rgba(255,255,255,0.04)"
                                      }`,
                                    }}
                                  >
                                    <span
                                      className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0"
                                      style={{
                                        background: done
                                          ? "#22c55e"
                                          : "#1e1e28",
                                        color: done ? "white" : "#71717a",
                                      }}
                                    >
                                      {done ? "\u2713" : topicId}
                                    </span>
                                    <span className="text-xs text-zinc-400 flex-1">
                                      Topic {topicId}
                                    </span>
                                    {mcq && (
                                      <span className="text-[10px] font-mono text-indigo-400">
                                        {mcq}
                                      </span>
                                    )}
                                    {tp?.challengeAttempted && (
                                      <span className="text-[10px] text-amber-400">
                                        &#9733;
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
