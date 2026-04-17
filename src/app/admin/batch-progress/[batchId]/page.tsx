"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

interface ModuleStats {
  done: number;
  total: number;
  pct: number;
}

interface StudentInBatch {
  enrollmentNo: string;
  registered: boolean;
  name: string | null;
  email: string | null;
  linkedinUrl: string | null;
  completionPct: number;
  completedCount: number;
  moduleStats: Record<number, ModuleStats>;
  avgMcqScore: number | null;
  lastActive: string | null;
}

interface BatchInfo {
  id: string;
  name: string;
  accent: string | null;
  totalRolls: number;
  registered: number;
  notRegistered: number;
}

const MODULES = [
  { id: 1, title: "Hardware", accent: "#6366F1", total: 11 },
  { id: 2, title: "Office", accent: "#10B981", total: 9 },
  { id: 3, title: "Social", accent: "#3B82F6", total: 7 },
  { id: 4, title: "HTML", accent: "#06B6D4", total: 11 },
  { id: 5, title: "Tech", accent: "#8B5CF6", total: 10 },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function barColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 50) return "#f59e0b";
  if (pct > 0) return "#6366F1";
  return "#1e1e28";
}

type FilterMode = "all" | "registered" | "pending";
type SortKey = "enrollment" | "progress" | "name" | "lastActive";

export default function BatchProgressDetailPage() {
  const params = useParams();
  const batchId = decodeURIComponent(params.batchId as string);

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [students, setStudents] = useState<StudentInBatch[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortBy, setSortBy] = useState<SortKey>("progress");
  const [searchQuery, setSearchQuery] = useState("");

  async function login() {
    setAuthError("");
    setLoading(true);
    const res = await fetch(`/api/progress/batches?batchId=${encodeURIComponent(batchId)}`, {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
      const data = await res.json();
      setBatch(data.batch);
      setStudents(data.students || []);
    } else {
      setAuthError("Wrong password.");
    }
    setLoading(false);
  }

  async function fetchData(pw: string) {
    const res = await fetch(`/api/progress/batches?batchId=${encodeURIComponent(batchId)}`, {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) {
      const data = await res.json();
      setBatch(data.batch);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  const displayed = useMemo(() => {
    let list = [...students];
    if (filterMode === "registered") list = list.filter((s) => s.registered);
    if (filterMode === "pending") list = list.filter((s) => !s.registered);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.enrollmentNo.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "enrollment") return a.enrollmentNo.localeCompare(b.enrollmentNo);
      if (sortBy === "name")
        return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "progress") return b.completionPct - a.completionPct;
      if (sortBy === "lastActive") {
        const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });
    return list;
  }, [students, filterMode, searchQuery, sortBy]);

  function downloadCSV() {
    const headers = [
      "Enrollment No",
      "Status",
      "Name",
      "Email",
      "LinkedIn",
      "M1 %",
      "M2 %",
      "M3 %",
      "M4 %",
      "M5 %",
      "Overall %",
      "Topics Done",
      "Avg MCQ %",
      "Last Active",
    ];
    const rows = displayed.map((s) => [
      s.enrollmentNo,
      s.registered ? "Registered" : "Pending",
      s.name || "",
      s.email || "",
      s.linkedinUrl || "",
      s.moduleStats[1]?.pct ?? 0,
      s.moduleStats[2]?.pct ?? 0,
      s.moduleStats[3]?.pct ?? 0,
      s.moduleStats[4]?.pct ?? 0,
      s.moduleStats[5]?.pct ?? 0,
      s.completionPct,
      `${s.completedCount}/48`,
      s.avgMcqScore !== null ? s.avgMcqScore : "-",
      s.lastActive ? new Date(s.lastActive).toISOString() : "Never",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-${batchId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <Navbar showBack title={`Batch ${batchId}`} />
      <div className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/admin/batch-progress"
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 mb-3"
        >
          ← All Batches
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              {batch?.name || batchId}
            </h1>
            {batch && (
              <p className="text-sm text-zinc-400 mt-1">
                {batch.registered} of {batch.totalRolls} students registered · {batch.notRegistered} pending
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSV}
              disabled={displayed.length === 0}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              📥 Download CSV
            </button>
            <button
              onClick={() => fetchData(password)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(["all", "registered", "pending"] as FilterMode[]).map((mode) => {
            const count =
              mode === "all"
                ? students.length
                : mode === "registered"
                ? students.filter((s) => s.registered).length
                : students.filter((s) => !s.registered).length;
            return (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  filterMode === mode
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={{
                  background:
                    filterMode === mode ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    filterMode === mode ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                {mode} ({count})
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search name / enrollment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 w-48"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/20"
            >
              <option value="progress">Sort: Progress</option>
              <option value="enrollment">Sort: Enrollment</option>
              <option value="name">Sort: Name</option>
              <option value="lastActive">Sort: Last Active</option>
            </select>
          </div>
        </div>

        {/* Student list */}
        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-zinc-500">No students match the filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((s, i) => (
              <motion.div
                key={s.enrollmentNo}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl p-4"
                style={{
                  background: s.registered
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(245,158,11,0.04)",
                  border: `1px solid ${
                    s.registered
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(245,158,11,0.15)"
                  }`,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Enrollment + name */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        #{s.enrollmentNo}
                      </span>
                      {!s.registered && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                          PENDING
                        </span>
                      )}
                    </div>
                    {s.registered ? (
                      <>
                        <p className="text-sm font-semibold truncate">{s.name}</p>
                        <p className="text-[10px] text-zinc-600 truncate">{s.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">Not registered yet</p>
                    )}
                  </div>

                  {/* 5 module bars */}
                  <div className="md:col-span-6 grid grid-cols-5 gap-1.5">
                    {MODULES.map((m) => {
                      const stats = s.moduleStats[m.id];
                      const pct = stats?.pct ?? 0;
                      const done = stats?.done ?? 0;
                      return (
                        <div key={m.id} className="text-center">
                          <div
                            className="h-1.5 rounded-full overflow-hidden mb-1"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
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
                          <div
                            className="text-[10px] font-bold"
                            style={{ color: pct > 0 ? m.accent : "#3f3f46" }}
                          >
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
                        style={{ color: barColor(s.completionPct) }}
                      >
                        {s.completionPct}%
                      </div>
                      <div className="text-[9px] text-zinc-500">Overall</div>
                    </div>
                    {s.avgMcqScore !== null && (
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold ${
                            s.avgMcqScore >= 80
                              ? "text-green-400"
                              : s.avgMcqScore >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {s.avgMcqScore}%
                        </div>
                        <div className="text-[9px] text-zinc-500">MCQ</div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-[11px] text-zinc-500">{timeAgo(s.lastActive)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
