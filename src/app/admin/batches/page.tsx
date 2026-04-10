"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

interface Student {
  enrollmentNo: string;
  name: string;
  email: string;
  linkedinUrl: string;
  addedAt: string;
}

interface Batch {
  id: string;
  name: string;
  accent: string;
  rollList: string[];
  students: Student[];
}

interface ProfileStats {
  total: number;
  working: number;
  studying: number;
  freelancing: number;
  looking: number;
}

const ACCENT_OPTIONS = [
  { label: "Indigo", value: "#6366F1" },
  { label: "Emerald", value: "#10B981" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Violet", value: "#8B5CF6" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Amber", value: "#F59E0B" },
];

export default function AdminBatchesPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileStats, setProfileStats] = useState<Record<string, ProfileStats>>({});

  // New batch form
  const [newBatchId, setNewBatchId] = useState("");
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchAccent, setNewBatchAccent] = useState("#6366F1");

  // Roll numbers
  const [rollInput, setRollInput] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const headers = {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };

  async function login() {
    setAuthError("");
    setLoading(true);
    const res = await fetch("/api/batches/admin", { headers: { "x-admin-password": password } });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", password);
      fetchData();
    } else {
      setAuthError("Wrong password.");
    }
    setLoading(false);
  }

  async function fetchData() {
    const pw = password || sessionStorage.getItem("admin_pw") || "";
    const res = await fetch("/api/batches/admin", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) {
      const data = await res.json();
      setBatches(data.batches);
      // Fetch profile stats for each batch
      const stats: Record<string, ProfileStats> = {};
      await Promise.all(
        data.batches.map(async (b: Batch) => {
          try {
            const pRes = await fetch(`/api/profiles?batchId=${b.id}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              const profiles = pData.profiles || [];
              stats[b.id] = {
                total: profiles.length,
                working: profiles.filter((p: { status: string }) => p.status === "working").length,
                studying: profiles.filter((p: { status: string }) => p.status === "studying").length,
                freelancing: profiles.filter((p: { status: string }) => p.status === "freelancing").length,
                looking: profiles.filter((p: { status: string }) => p.status === "looking").length,
              };
            }
          } catch { /* ignore */ }
        })
      );
      setProfileStats(stats);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
      fetch("/api/batches/admin", {
        headers: { "x-admin-password": saved },
      })
        .then((r) => {
          if (r.ok) return r.json();
          throw new Error();
        })
        .then(async (d) => {
          setBatches(d.batches);
          const stats: Record<string, ProfileStats> = {};
          await Promise.all(
            d.batches.map(async (b: Batch) => {
              try {
                const pRes = await fetch(`/api/profiles?batchId=${b.id}`);
                if (pRes.ok) {
                  const pData = await pRes.json();
                  const profiles = pData.profiles || [];
                  stats[b.id] = {
                    total: profiles.length,
                    working: profiles.filter((p: { status: string }) => p.status === "working").length,
                    studying: profiles.filter((p: { status: string }) => p.status === "studying").length,
                    freelancing: profiles.filter((p: { status: string }) => p.status === "freelancing").length,
                    looking: profiles.filter((p: { status: string }) => p.status === "looking").length,
                  };
                }
              } catch { /* ignore */ }
            })
          );
          setProfileStats(stats);
        })
        .catch(() => {
          sessionStorage.removeItem("admin_pw");
          setAuthenticated(false);
        });
    }
  }, []);

  async function addBatch() {
    if (!newBatchId || !newBatchName) return;
    await fetch("/api/batches/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "add-batch",
        id: newBatchId,
        name: newBatchName,
        accent: newBatchAccent,
      }),
    });
    setNewBatchId("");
    setNewBatchName("");
    fetchData();
  }

  async function addRolls() {
    if (!selectedBatch || !rollInput.trim()) return;
    const rolls = rollInput
      .split(/[\n,;]+/)
      .map((r) => r.trim())
      .filter(Boolean);
    await fetch("/api/batches/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "add-rolls", batchId: selectedBatch, rolls }),
    });
    setRollInput("");
    fetchData();
  }

  async function deleteStudent(batchId: string, enrollmentNo: string) {
    if (!confirm(`Remove ${enrollmentNo}?`)) return;
    await fetch("/api/batches/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "delete-student", batchId, enrollmentNo }),
    });
    fetchData();
  }

  async function deleteBatch(batchId: string) {
    if (!confirm(`Delete batch "${batchId}" and all its data?`)) return;
    await fetch("/api/batches/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "delete-batch", batchId }),
    });
    fetchData();
  }

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
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
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

  // Admin dashboard
  return (
    <main className="min-h-screen">
      <Navbar showBack title="Admin — Batches" />

      <div className="pt-20 pb-16 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Manage Batches</h1>
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

        {/* Add Batch */}
        <section className="mb-10 p-6 rounded-2xl card-glass">
          <h2 className="text-sm font-semibold mb-4 text-zinc-300">
            Add New Batch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={newBatchId}
              onChange={(e) => setNewBatchId(e.target.value)}
              placeholder="ID (e.g. 2025-2026)"
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
            <input
              type="text"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              placeholder="Display name"
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
            <select
              value={newBatchAccent}
              onChange={(e) => setNewBatchAccent(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/20"
            >
              {ACCENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addBatch}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
          >
            Create Batch
          </button>
        </section>

        {/* Add Roll Numbers */}
        <section className="mb-10 p-6 rounded-2xl card-glass">
          <h2 className="text-sm font-semibold mb-4 text-zinc-300">
            Add Roll Numbers
          </h2>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/20 mb-3"
          >
            <option value="">Select batch...</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <textarea
            value={rollInput}
            onChange={(e) => setRollInput(e.target.value)}
            placeholder="Paste roll numbers (one per line, or comma-separated)"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none mb-3"
          />
          <button
            onClick={addRolls}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            Add Roll Numbers
          </button>
        </section>

        {/* Existing Batches */}
        {batches.map((batch) => (
          <section
            key={batch.id}
            className="mb-6 p-6 rounded-2xl card-glass"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">{batch.name}</h2>
                <p className="text-xs text-zinc-500">
                  {batch.rollList.length} rolls · {batch.students.length}{" "}
                  registered
                  {profileStats[batch.id] && profileStats[batch.id].total > 0 && (
                    <> · {profileStats[batch.id].total} profiles</>
                  )}
                </p>
                {profileStats[batch.id] && profileStats[batch.id].total > 0 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {profileStats[batch.id].working > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {profileStats[batch.id].working} working
                      </span>
                    )}
                    {profileStats[batch.id].studying > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {profileStats[batch.id].studying} studying
                      </span>
                    )}
                    {profileStats[batch.id].freelancing > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {profileStats[batch.id].freelancing} freelancing
                      </span>
                    )}
                    {profileStats[batch.id].looking > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {profileStats[batch.id].looking} looking
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteBatch(batch.id)}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
              >
                Delete Batch
              </button>
            </div>

            {/* Roll list preview */}
            {batch.rollList.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-2">
                  Roll Numbers ({batch.rollList.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {batch.rollList.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Student list */}
            {batch.students.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 mb-2">
                  Registered Students:
                </p>
                {batch.students.map((s) => (
                  <div
                    key={s.enrollmentNo}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-zinc-500">
                        {s.enrollmentNo} · {s.email}
                      </p>
                      <a
                        href={s.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0A66C2] hover:underline"
                      >
                        {s.linkedinUrl}
                      </a>
                    </div>
                    <button
                      onClick={() =>
                        deleteStudent(batch.id, s.enrollmentNo)
                      }
                      className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-3 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
