"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import AdminAuthGate, { useAdminAuth } from "@/components/admin/AdminAuthGate";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CreateBatchWizard from "@/components/admin/CreateBatchWizard";
import { useToast } from "@/components/admin/Toast";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { compareSections } from "@/lib/sections";
import { prettyName } from "@/lib/names";

// ─── Types ──────────────────────────────────────────────────────

interface Roll {
  enrollmentNo: string;
  section: string;
  /** Teacher-verified name from roll_list.name (null if teacher
   *  uploaded the list as roll-only, before the names column was
   *  populated). UI falls back to the enrollment number when absent. */
  name: string | null;
}
interface RegisteredStudent {
  enrollmentNo: string;
  name: string;
  email: string;
  section: string;
  linkedinUrl: string | null;
  addedAt: string;
}
interface AdminBatch {
  id: string;
  name: string;
  accent: string | null;
  createdAt: string;
  rolls: Roll[];
  students: RegisteredStudent[];
}

interface RosterResponse {
  batches: AdminBatch[];
}

// ─── Page ───────────────────────────────────────────────────────

export default function RosterPage() {
  // Shared Google-only auth gate (password path removed).
  const { idToken, ready } = useAdminAuth();
  const { toast } = useToast();

  const { data, isLoading, mutate } =
    useAdminFetch<RosterResponse>("/api/batches/admin", { idToken }, {
      enabled: ready,
      refreshInterval: 60_000,
    });

  // Memoize so useEffect/useMemo below get a stable reference when data is unchanged.
  const batches = useMemo(() => data?.batches ?? [], [data]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Auto-select first batch when data lands
  useEffect(() => {
    if (!activeBatchId && batches.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveBatchId(batches[0].id);
    }
  }, [batches, activeBatchId]);

  const activeBatch = useMemo(
    () => batches.find((b) => b.id === activeBatchId) || null,
    [batches, activeBatchId]
  );

  function authHeaders(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }

  async function callAction(body: Record<string, unknown>): Promise<unknown> {
    const res = await fetch("/api/batches/admin", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
    return data;
  }

  // ─── Auth gate ──────────────────────────────────────────────
  if (!ready) return <AdminAuthGate />;

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Roster", href: "/admin/roster" },
            ...(activeBatch ? [{ label: activeBatch.name }] : []),
          ]}
        />

        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Roster</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Batches · sections · roll numbers
            </p>
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            ➕ Create new batch
          </button>
        </div>

        {isLoading && !data ? (
          <div className="grid md:grid-cols-[220px_1fr] gap-4">
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : batches.length === 0 ? (
          <EmptyState onCreate={() => setWizardOpen(true)} />
        ) : (
          <div className="grid md:grid-cols-[220px_1fr] gap-4">
            {/* ─── Batch picker ────────────────────────────────────
                 Desktop: 220px sticky sidebar with full-width buttons.
                 Mobile: horizontal-scroll pill row so the detail
                 panel starts visible (previously you had to scroll
                 past the whole batch list every time you tapped one). */}
            <aside className="md:sticky md:top-28 md:self-start">
              {/* Mobile pill row */}
              <div className="md:hidden -mx-2 px-2 overflow-x-auto no-scrollbar">
                <div className="inline-flex gap-2 pb-1">
                  {batches.map((b) => {
                    const active = b.id === activeBatchId;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveBatchId(b.id)}
                        className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-[0.97] ${
                          active
                            ? "bg-white/[0.08]"
                            : "bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                        style={{
                          border: `1px solid ${
                            active
                              ? "rgba(99,102,241,0.35)"
                              : "rgba(255,255,255,0.05)"
                          }`,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: b.accent || "#6366F1" }}
                        />
                        <span className="text-[12px] font-semibold text-zinc-200 whitespace-nowrap">
                          {b.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                          {b.students.length}/{b.rolls.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Desktop sidebar */}
              <div
                className="hidden md:block rounded-2xl p-1.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {batches.map((b) => {
                  const active = b.id === activeBatchId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setActiveBatchId(b.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${
                        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: b.accent || "#6366F1" }}
                        />
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-zinc-200 truncate">
                            {b.name}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {b.rolls.length} rolls · {b.students.length} registered
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Batch detail */}
            <section>
              {activeBatch ? (
                <BatchDetail
                  batch={activeBatch}
                  onMutated={() => mutate()}
                  onAction={callAction}
                  toast={toast}
                />
              ) : (
                <div className="text-[12px] text-zinc-400">
                  Pick a batch from the sidebar.
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Wizard */}
      <CreateBatchWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={() => {
          mutate();
          // Select the newly created batch (it'll be first in createdAt desc)
          setTimeout(() => {
            // mutate() triggers refetch; we'll let the effect auto-select
          }, 200);
        }}
      />
    </main>
  );
}

// ─── Empty state ────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      <div className="text-5xl mb-3">🎓</div>
      <h2 className="text-lg font-bold mb-1">No batches yet</h2>
      <p className="text-[12px] text-zinc-400 mb-4">
        Create your first batch to start enrolling students.
      </p>
      <button
        onClick={onCreate}
        className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
        }}
      >
        ➕ Create new batch
      </button>
    </div>
  );
}

// ─── Batch detail ───────────────────────────────────────────────

function BatchDetail({
  batch,
  onMutated,
  onAction,
  toast,
}: {
  batch: AdminBatch;
  onMutated: () => void;
  onAction: (body: Record<string, unknown>) => Promise<unknown>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  // Group rolls by section; compute per-section registered count.
  // Rolls carry the teacher-verified name now (roll_list.name), so
  // the chip can render "Zokirova Dilnura" instead of a bare
  // enrollment number. We keep the full Roll object in the grouping
  // instead of `string[]` so SectionCard has access to `.name`.
  const sectionMap = useMemo(() => {
    const rollsBy: Record<string, Roll[]> = {};
    for (const r of batch.rolls) {
      if (!rollsBy[r.section]) rollsBy[r.section] = [];
      rollsBy[r.section].push(r);
    }
    const studentsBy: Record<string, RegisteredStudent[]> = {};
    for (const s of batch.students) {
      if (!studentsBy[s.section]) studentsBy[s.section] = [];
      studentsBy[s.section].push(s);
    }
    const allSections = new Set<string>([
      ...Object.keys(rollsBy),
      ...Object.keys(studentsBy),
    ]);
    return Array.from(allSections)
      .sort(compareSections)
      .map((section) => ({
        section,
        rolls: rollsBy[section] || [],
        students: studentsBy[section] || [],
      }));
  }, [batch]);

  return (
    <div className="space-y-3">
      {sectionMap.map(({ section, rolls, students }) => (
        <SectionCard
          key={section}
          batch={batch}
          section={section}
          rolls={rolls}
          students={students}
          onMutated={onMutated}
          onAction={onAction}
          toast={toast}
        />
      ))}
    </div>
  );
}

// ─── Section card ───────────────────────────────────────────────

function SectionCard({
  batch,
  section,
  rolls,
  students,
  onMutated,
  onAction,
  toast,
}: {
  batch: AdminBatch;
  section: string;
  rolls: Roll[];
  students: RegisteredStudent[];
  onMutated: () => void;
  onAction: (body: Record<string, unknown>) => Promise<unknown>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [expanded, setExpanded] = useState(false);
  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState(section);
  const [addOpen, setAddOpen] = useState(false);
  const [addBuffer, setAddBuffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    null | "rename" | "delete-section" | "remove-roll"
  >(null);
  const [rollToRemove, setRollToRemove] = useState<string | null>(null);

  // Index registered students BY enrollment_no so each chip can
  // resolve its student record in O(1) — used to pick the best name
  // (registered display name > teacher roll-list name > enrollment).
  const registeredByRoll = useMemo(() => {
    const m = new Map<string, RegisteredStudent>();
    for (const s of students) m.set(s.enrollmentNo, s);
    return m;
  }, [students]);
  const registeredRolls = new Set(students.map((s) => s.enrollmentNo));
  const pending = rolls.filter((r) => !registeredRolls.has(r.enrollmentNo));
  const pct = rolls.length > 0 ? Math.round((students.length / rolls.length) * 100) : 0;

  async function doRename() {
    setLoading(true);
    try {
      await onAction({
        action: "rename-section",
        batchId: batch.id,
        oldName: section,
        newName: newName.trim(),
      });
      toast({ kind: "success", message: `Renamed: ${section} → ${newName}` });
      setConfirmAction(null);
      setRenameMode(false);
      onMutated();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function doDeleteSection() {
    setLoading(true);
    try {
      const data = (await onAction({
        action: "delete-section",
        batchId: batch.id,
        section,
      })) as { removedRolls: number; detachedStudents: number };
      toast({
        kind: "success",
        message: `Deleted ${section} · removed ${data.removedRolls} rolls, detached ${data.detachedStudents} students`,
      });
      setConfirmAction(null);
      onMutated();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function doAddRolls() {
    const parsed = addBuffer
      .split(/[\n,;\t ]+/)
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean);
    if (parsed.length === 0) {
      toast({ kind: "error", message: "Nothing to parse." });
      return;
    }
    setLoading(true);
    try {
      const data = (await onAction({
        action: "add-rolls",
        batchId: batch.id,
        section,
        rolls: parsed,
      })) as { count: number };
      toast({ kind: "success", message: `Added ${data.count} rolls to ${section}` });
      setAddBuffer("");
      setAddOpen(false);
      onMutated();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function doRemoveRoll() {
    if (!rollToRemove) return;
    setLoading(true);
    try {
      await onAction({
        action: "delete-roll",
        batchId: batch.id,
        section,
        enrollmentNo: rollToRemove,
      });
      toast({ kind: "success", message: `Removed ${rollToRemove}` });
      setConfirmAction(null);
      setRollToRemove(null);
      onMutated();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 min-w-0 flex-1 text-left"
          >
            <span
              className={`text-zinc-500 transition-transform text-xs ${
                expanded ? "rotate-90" : ""
              }`}
            >
              ▸
            </span>
            {renameMode ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0 px-2 py-1 rounded-md text-[13px] font-semibold text-white bg-white/[0.06] border border-indigo-500/50 focus:outline-none"
                autoFocus
              />
            ) : (
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-zinc-200 truncate">
                  {section}
                </div>
                <div className="text-[10px] text-zinc-500">
                  {students.length}/{rolls.length} registered
                  {pending.length > 0 && ` · ${pending.length} pending`}
                </div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full"
              style={{
                background:
                  pct >= 80
                    ? "rgba(34,197,94,0.12)"
                    : pct >= 40
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(239,68,68,0.12)",
                color:
                  pct >= 80 ? "#4ade80" : pct >= 40 ? "#fbbf24" : "#f87171",
              }}
            >
              {pct}%
            </div>
            {renameMode ? (
              <>
                <button
                  onClick={() => setConfirmAction("rename")}
                  disabled={loading || !newName.trim() || newName.trim() === section}
                  className="text-[11px] font-semibold text-emerald-300 px-2 py-1 rounded-md disabled:opacity-40"
                  style={{ background: "rgba(34,197,94,0.08)" }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setRenameMode(false);
                    setNewName(section);
                  }}
                  className="text-[11px] font-semibold text-zinc-500 px-2 py-1"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAddOpen(!addOpen)}
                  className="text-[11px] font-semibold text-indigo-300 px-2 py-1 rounded-md"
                  style={{ background: "rgba(99,102,241,0.08)" }}
                >
                  + Add
                </button>
                <button
                  onClick={() => setRenameMode(true)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setConfirmAction("delete-section")}
                  className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
                  aria-label="Delete section"
                >
                  🗑
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-1"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full"
            style={{
              background:
                pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444",
            }}
          />
        </div>

        {/* Add-rolls panel */}
        <AnimatePresence>
          {addOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              style={{ background: "rgba(0,0,0,0.15)" }}
            >
              <div className="px-4 py-3 space-y-2">
                <textarea
                  value={addBuffer}
                  onChange={(e) => setAddBuffer(e.target.value)}
                  placeholder="Paste or type roll numbers — one per line, or comma/space/tab separated."
                  className="w-full h-24 px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setAddOpen(false);
                      setAddBuffer("");
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] text-zinc-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={doAddRolls}
                    disabled={loading || !addBuffer.trim()}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    }}
                  >
                    {loading ? "Adding…" : "Add rolls"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded roll list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="px-4 py-3">
                {rolls.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic">
                    No rolls in this section yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {rolls
                      .slice()
                      .sort((a, b) =>
                        a.enrollmentNo.localeCompare(b.enrollmentNo, undefined, {
                          numeric: true,
                        })
                      )
                      .map((roll) => {
                        const rollNo = roll.enrollmentNo;
                        const claimed = registeredRolls.has(rollNo);
                        // Pick the best human name available:
                        //   1. Registered student's chosen display name
                        //      (prettyName strips "453_" roll prefix).
                        //   2. Teacher-verified roll_list.name.
                        //   3. Fall back to the enrollment number.
                        // Teacher asked for names so they can call out
                        // students during class; the enrollment number
                        // still appears on hover + below the name so
                        // the roll reference isn't lost.
                        const registered = registeredByRoll.get(rollNo);
                        const displayName = registered
                          ? prettyName(registered.name)
                          : roll.name || "";
                        const hasName = displayName.trim().length > 0;
                        const label = hasName ? displayName : rollNo;
                        return (
                          <span
                            key={rollNo}
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${hasName ? "" : "font-mono"}`}
                            style={{
                              background: claimed
                                ? "rgba(34,197,94,0.06)"
                                : "rgba(255,255,255,0.03)",
                              border: `1px solid ${
                                claimed
                                  ? "rgba(34,197,94,0.2)"
                                  : "rgba(255,255,255,0.06)"
                              }`,
                              color: claimed ? "#86efac" : "#a1a1aa",
                            }}
                            // Tooltip always shows both bits of info,
                            // so an admin hovering can confirm the
                            // enrollment match when two students share
                            // a first name.
                            title={`${
                              claimed ? "Registered" : "Unclaimed"
                            } — ${rollNo}${hasName ? "" : ""}`}
                          >
                            <span aria-hidden="true">
                              {claimed ? "✓" : "○"}
                            </span>{" "}
                            <span className="truncate max-w-[140px]">
                              {label}
                            </span>
                            {hasName && (
                              <span className="text-[9px] opacity-60 font-mono">
                                {rollNo.slice(-4)}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setRollToRemove(rollNo);
                                setConfirmAction("remove-roll");
                              }}
                              className="text-zinc-600 hover:text-red-400 ml-0.5"
                              aria-label={`Remove ${rollNo}`}
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAction === "rename"}
        title="Rename section?"
        description="Every roll and every registered student in this section will move to the new name."
        diff={[{ label: "Section", from: section, to: newName.trim() }]}
        confirmLabel="Rename"
        kind="primary"
        loading={loading}
        onCancel={() => setConfirmAction(null)}
        onConfirm={doRename}
      />
      <ConfirmDialog
        open={confirmAction === "delete-section"}
        title={`Delete ${section}?`}
        description={`This removes every roll in this section (${rolls.length} rolls) and detaches every registered student (${students.length} students) from it. Students stay in the DB but their section becomes blank until you re-assign them.`}
        kind="danger"
        confirmLabel="Delete section"
        warning="Cannot be undone."
        loading={loading}
        onCancel={() => setConfirmAction(null)}
        onConfirm={doDeleteSection}
      />
      <ConfirmDialog
        open={confirmAction === "remove-roll"}
        title={`Remove roll ${rollToRemove}?`}
        description={
          rollToRemove && registeredRolls.has(rollToRemove)
            ? "This roll belongs to a registered student. Their account stays but the roll will no longer be in the roll list."
            : "The roll is unclaimed and will be removed from the section's roll list."
        }
        kind="danger"
        confirmLabel="Remove roll"
        loading={loading}
        onCancel={() => {
          setConfirmAction(null);
          setRollToRemove(null);
        }}
        onConfirm={doRemoveRoll}
      />
    </>
  );
}
