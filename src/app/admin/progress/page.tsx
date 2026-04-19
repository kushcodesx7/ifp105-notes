"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminAuthGate, { useAdminAuth } from "@/components/admin/AdminAuthGate";
import { useAdminFetch } from "@/lib/useAdminFetch";

interface TopicProgress {
  moduleNumber: number;
  topicId: number;
  completed: boolean;
  mcqScore: number | null;
  mcqTotal: number | null;
  challengeAttempted: boolean;
  updatedAt: string;
}

interface ModuleStats {
  done: number;
  total: number;
  pct: number;
}

interface StudentData {
  name: string;
  email: string;
  enrollmentNo: string;
  batchId: string;
  section: string;
  completedCount: number;
  totalTopics: number;
  completionPct: number;
  moduleStats: Record<number, ModuleStats>;
  avgMcqScore: number | null;
  lastActive: string | null;
  topics: Record<string, TopicProgress>;
}

type SortKey = "name" | "progress" | "lastActive" | "mcq" | "section";

const MODULES = [
  { id: 1, title: "Hardware", accent: "#6366F1", total: 11 },
  { id: 2, title: "Office", accent: "#10B981", total: 9 },
  { id: 3, title: "Social", accent: "#3B82F6", total: 7 },
  { id: 4, title: "HTML", accent: "#06B6D4", total: 11 },
  { id: 5, title: "Tech", accent: "#8B5CF6", total: 10 },
];

// Supabase sometimes stores timestamps without 'Z' suffix — append it for UTC parsing
function parseUTC(dateStr: string): number {
  const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(dateStr);
  return new Date(hasTimezone ? dateStr : dateStr + "Z").getTime();
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = parseUTC(dateStr);
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return "Just now";
  if (minutes < 1) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

function barColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 50) return "#f59e0b";
  if (pct > 0) return "#6366F1";
  return "#1e1e28";
}

export default function AdminProgressPage() {
  // Shared Google-only auth gate. `password` is a legacy no-op field —
  // the shared-password admin path was removed (see adminWrite / requireAdmin).
  const { idToken, ready } = useAdminAuth();

  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortKey>("progress");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterScore, setFilterScore] = useState<string>("all");

  // Debounce search input so we don't re-filter on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: progressData, error: fetchError, isLoading: fetchLoading, mutate: refreshProgress } =
    useAdminFetch<{ students: StudentData[] }>(
      "/api/progress/admin",
      { idToken },
      { enabled: ready, refreshInterval: 20_000 }
    );
  // Memoize so dependent useMemos get a stable reference
  const students = useMemo(() => progressData?.students ?? [], [progressData]);
  const initialLoaded = !!progressData || (!fetchLoading && !!fetchError);

  // Force re-render every 30s so timeAgo updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Unique batch IDs for filter
  const batchIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.batchId) set.add(s.batchId);
    }
    return Array.from(set).sort();
  }, [students]);

  // Unique sections for filter (natural-sort so "Section 10" > "Section 2")
  const sections = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.section) set.add(s.section);
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [students]);

  // Sorted + filtered
  const displayed = useMemo(() => {
    let list = [...students];
    if (filterBatch) list = list.filter((s) => s.batchId === filterBatch);
    if (filterSection) list = list.filter((s) => s.section === filterSection);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q)
      );
    }
    if (filterScore !== "all") {
      list = list.filter((s) => {
        if (s.avgMcqScore === null) return filterScore === "unattempted";
        if (filterScore === "low") return s.avgMcqScore < 60;
        if (filterScore === "mid") return s.avgMcqScore >= 60 && s.avgMcqScore < 80;
        if (filterScore === "high") return s.avgMcqScore >= 80;
        return true;
      });
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "section") {
        // Natural-sort by section, then by name within the section
        const bySection = (a.section || "").localeCompare(b.section || "", undefined, { numeric: true });
        return bySection !== 0 ? bySection : a.name.localeCompare(b.name);
      }
      if (sortBy === "progress") return b.completionPct - a.completionPct;
      if (sortBy === "mcq") {
        const aScore = a.avgMcqScore ?? -1;
        const bScore = b.avgMcqScore ?? -1;
        return bScore - aScore;
      }
      if (sortBy === "lastActive") {
        const aTime = a.lastActive ? parseUTC(a.lastActive) : 0;
        const bTime = b.lastActive ? parseUTC(b.lastActive) : 0;
        return bTime - aTime;
      }
      return 0;
    });
    return list;
  }, [students, filterBatch, filterSection, debouncedSearch, filterScore, sortBy]);

  // CSV Export
  function downloadCSV() {
    const headers = [
      "Name",
      "Email",
      "Enrollment No",
      "Batch",
      "Section",
      "M1 Hardware %",
      "M2 Office %",
      "M3 Social %",
      "M4 HTML %",
      "M5 Tech %",
      "Overall %",
      "Topics Done",
      "Avg MCQ %",
      "Last Active",
    ];
    const rows = displayed.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.enrollmentNo,
      s.batchId,
      s.section || "-",
      s.moduleStats[1]?.pct ?? 0,
      s.moduleStats[2]?.pct ?? 0,
      s.moduleStats[3]?.pct ?? 0,
      s.moduleStats[4]?.pct ?? 0,
      s.moduleStats[5]?.pct ?? 0,
      s.completionPct,
      `${s.completedCount}/${s.totalTopics}`,
      s.avgMcqScore !== null ? s.avgMcqScore : "-",
      s.lastActive ? new Date(parseUTC(s.lastActive)).toISOString() : "Never",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ifp105-progress-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Overall stats
  const overallStats = useMemo(() => {
    if (students.length === 0) return null;
    const active = students.filter((s) => {
      if (!s.lastActive) return false;
      // eslint-disable-next-line react-hooks/purity
      const daysSince = (Date.now() - parseUTC(s.lastActive)) / (1000 * 60 * 60 * 24);
      return daysSince < 7;
    }).length;
    const avgCompletion =
      students.reduce((sum, s) => sum + s.completionPct, 0) / students.length;
    const withMcq = students.filter((s) => s.avgMcqScore !== null);
    const avgMcq =
      withMcq.length > 0
        ? withMcq.reduce((sum, s) => sum + (s.avgMcqScore ?? 0), 0) / withMcq.length
        : 0;
    return {
      total: students.length,
      activeThisWeek: active,
      avgCompletion: Math.round(avgCompletion),
      avgMcq: Math.round(avgMcq),
    };
  }, [students]);

  // Google sign-in gate (password path removed).
  if (!ready) return <AdminAuthGate />;

  return (
    <main className="min-h-screen">
      <Navbar showBack title="All Students" />

      <div className="pt-8 pb-16 px-6 max-w-7xl mx-auto">
        {/* Header + actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link
              href="/admin"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 mb-2"
            >
              ← Admin Home
            </Link>
            <h1 className="text-2xl font-bold">Student Progress</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-green-400" title="Auto-refreshing every 20 seconds">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
            <button
              onClick={downloadCSV}
              disabled={displayed.length === 0}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              📥 Download CSV
            </button>
            <button
              onClick={() => refreshProgress()}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ↻ Refresh
            </button>
            {/* Sign-out is handled by the Navbar account menu. */}
          </div>
        </div>

        {/* Overall stats cards */}
        {overallStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Students</div>
              <div className="text-2xl font-bold text-white">{overallStats.total}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Active This Week</div>
              <div className="text-2xl font-bold text-green-400">{overallStats.activeThisWeek}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Avg Completion</div>
              <div className="text-2xl font-bold text-amber-400">{overallStats.avgCompletion}%</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Avg MCQ Score</div>
              <div className="text-2xl font-bold text-violet-400">{overallStats.avgMcq}%</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 w-48"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/20"
            >
              <option value="progress">Progress</option>
              <option value="name">Name</option>
              <option value="section">Section</option>
              <option value="lastActive">Last Active</option>
              <option value="mcq">MCQ Score</option>
            </select>
          </div>
          {sections.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Section:</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/20"
              >
                <option value="">All</option>
                {sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
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
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">MCQ:</label>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/20"
            >
              <option value="all">All</option>
              <option value="high">High (80%+)</option>
              <option value="mid">Mid (60-80%)</option>
              <option value="low">Low (&lt;60%)</option>
              <option value="unattempted">No MCQ</option>
            </select>
          </div>
          <span className="text-xs text-zinc-600 ml-auto">
            Showing {displayed.length} of {students.length} student{students.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        {!initialLoaded ? (
          // Skeleton rows while first fetch is in flight
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 animate-pulse"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3 space-y-2">
                    <div className="h-3 w-32 rounded bg-white/[0.06]" />
                    <div className="h-2 w-40 rounded bg-white/[0.04]" />
                    <div className="h-2 w-24 rounded bg-white/[0.04]" />
                  </div>
                  <div className="md:col-span-6 grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="h-1.5 rounded-full bg-white/[0.04]" />
                    ))}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-3 justify-end">
                    <div className="h-6 w-12 rounded bg-white/[0.06]" />
                    <div className="h-6 w-10 rounded bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-zinc-500">
              {students.length === 0 ? "No student progress data yet." : "No students match the filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((student) => {
              const isExpanded = expandedEmail === student.email;

              return (
                <div key={student.email}>
                  <motion.button
                    onClick={() => setExpandedEmail(isExpanded ? null : student.email)}
                    className="w-full text-left rounded-xl p-4 transition-all hover:bg-white/[0.03]"
                    style={{
                      background: isExpanded ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                      border: `1px solid ${isExpanded ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)"}`,
                    }}
                    whileHover={{ x: 2 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Name + email */}
                      <div className="md:col-span-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold truncate">{student.name}</p>
                          {student.section && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 shrink-0">
                              {student.section}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-600 truncate">{student.email}</p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {student.enrollmentNo || "-"} · {student.batchId || "-"}
                        </p>
                      </div>

                      {/* 5-module progress bars */}
                      <div className="md:col-span-6 grid grid-cols-5 gap-1.5">
                        {MODULES.map((m) => {
                          const stats = student.moduleStats[m.id];
                          const pct = stats?.pct ?? 0;
                          const done = stats?.done ?? 0;
                          return (
                            <div key={m.id} className="text-center">
                              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-1">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background: pct > 0 ? m.accent : "transparent",
                                  }}
                                />
                              </div>
                              <div className="text-[9px] font-bold text-zinc-500">
                                M{m.id}
                              </div>
                              <div className="text-[10px] font-bold" style={{ color: pct > 0 ? m.accent : "#3f3f46" }}>
                                {done}/{m.total}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Overall + MCQ + time */}
                      <div className="md:col-span-3 flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <div
                            className="text-lg font-bold"
                            style={{ color: barColor(student.completionPct) }}
                          >
                            {student.completionPct}%
                          </div>
                          <div className="text-[9px] text-zinc-500">Overall</div>
                        </div>
                        {student.avgMcqScore !== null && (
                          <div className="text-right">
                            <div
                              className={`text-sm font-bold ${
                                student.avgMcqScore >= 80
                                  ? "text-green-400"
                                  : student.avgMcqScore >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {student.avgMcqScore}%
                            </div>
                            <div className="text-[9px] text-zinc-500">MCQ</div>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-[11px] text-zinc-500">{timeAgo(student.lastActive)}</div>
                        </div>
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
                          {/* Module tabs */}
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {MODULES.map((m) => (
                              <button
                                key={m.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedModule(m.id);
                                }}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                                  expandedModule === m.id
                                    ? "text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                                style={{
                                  background:
                                    expandedModule === m.id ? m.accent : "rgba(255,255,255,0.04)",
                                }}
                              >
                                M{m.id} · {m.title}
                              </button>
                            ))}
                          </div>

                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Per-topic detail (Module {expandedModule})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {Array.from(
                              { length: MODULES.find((m) => m.id === expandedModule)?.total ?? 0 },
                              (_, i) => i + 1
                            ).map((topicId) => {
                              const key = `${expandedModule}-${topicId}`;
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
                                      done ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)"
                                    }`,
                                  }}
                                >
                                  <span
                                    className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0"
                                    style={{
                                      background: done ? "#22c55e" : "#1e1e28",
                                      color: done ? "white" : "#71717a",
                                    }}
                                  >
                                    {done ? "✓" : topicId}
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
                                    <span className="text-[10px] text-amber-400">★</span>
                                  )}
                                </div>
                              );
                            })}
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
