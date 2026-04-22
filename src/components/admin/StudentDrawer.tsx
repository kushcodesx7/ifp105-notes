"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BloomsRadar from "@/components/BloomsRadar";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { BLOOM_META, BLOOM_ORDER, type BloomLevel } from "@/lib/blooms";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";
import { compareSections } from "@/lib/sections";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { TOTAL_TOPICS } from "@/lib/course-registry";
import { MODULE_IDS } from "@/lib/course-stats";

// ─── Types ──────────────────────────────────────────────────────────

interface ModuleStat {
  moduleNumber: number;
  done: number;
  total: number;
  pct: number;
  avgMcqPct: number | null;
}

export interface AdminStudent {
  email: string;
  // Student's chosen display name, e.g. "248_oysha". Used for the chip
  // in the navbar / Connect; shown as a secondary line in admin tables.
  name: string;
  // Teacher-verified name from the roll_list upload, e.g. "Oysha Abdullayeva".
  // Primary identity surfaced in the admin People table and drawer. May be
  // null for accounts registered before the teacher uploaded names.
  rollListName: string | null;
  enrollmentNo: string;
  section: string;
  batchId: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  skills: string[];
  addedAt: string | null;
  lastActive: string | null;
  daysSinceActive: number | null;
  completionPct: number;
  completedCount: number;
  moduleStats: ModuleStat[];
  avgMcq: number | null;
  bloomStats: Record<string, { correct: number; total: number }>;
  confidenceStats: { rated: number; confidentWrong: number; humbleRight: number };
  /** Per-day completion counts, last 14 days (server-side), only days
   *  with activity. Powers the sparkline timeline in this drawer. */
  recentActivity?: { day: string; count: number }[];
  hidden?: boolean;
}

interface Props {
  student: AdminStudent | null;
  onClose: () => void;
  // All known sections (for the change-section picker). Optional — if
  // omitted the section dropdown falls back to free-text input.
  sections?: string[];
  // Called after any mutation so parent can refetch the student list.
  onMutated?: () => void;
}

type Tab = "overview" | "progress" | "thinking" | "connect";

// Slide-in drawer. On desktop (sm+) sits as a right panel; on mobile it
// takes the full screen. Keyboard: Esc closes.
export default function StudentDrawer({
  student,
  onClose,
  sections,
  onMutated,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  // Reset to overview when a new student opens. Whitelisted — using
  // an effect to sync local tab state to the controlled `student.email`
  // prop is the canonical pattern. The alternative (key={student?.email}
  // on the drawer) would replay the slide-in animation every time the
  // teacher clicks a different student.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (student) setTab("overview");
  }, [student?.email]);

  // Esc to close
  useEffect(() => {
    if (!student) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [student, onClose]);

  // Tab focus trap while drawer is open. Typed as HTMLElement (not
  // HTMLDivElement) because the drawer is a <motion.aside>.
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, !!student);

  return (
    <AnimatePresence>
      {student && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100]"
            style={{ backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.aside
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[520px] z-[101] flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0F0F1A, #0A0A12)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Student details for ${student.rollListName || student.name}`}
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-3">
                <Avatar student={student} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white truncate">{student.name}</h2>
                    {student.hidden && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {student.section} · #{student.enrollmentNo}
                  </div>
                  <a
                    href={`mailto:${student.email}`}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 truncate block"
                  >
                    {student.email}
                  </a>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 text-zinc-500 hover:text-zinc-200 transition-colors -mr-1 -mt-1 p-1"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M5 5l8 8M13 5l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Tab strip */}
              <div
                className="mt-4 flex gap-1 -mx-2 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {(["overview", "progress", "thinking", "connect"] as Tab[]).map((t) => {
                  const active = tab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
                        active
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      }`}
                    >
                      {tabLabel(t)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {tab === "overview" && (
                <OverviewTab
                  student={student}
                  sections={sections}
                  onMutated={onMutated}
                  onClose={onClose}
                />
              )}
              {tab === "progress" && <ProgressTab student={student} />}
              {tab === "thinking" && <ThinkingTab student={student} />}
              {tab === "connect" && <ConnectTab student={student} />}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function tabLabel(t: Tab): string {
  return (
    {
      overview: "Overview",
      progress: "Progress",
      thinking: "Thinking",
      connect: "Connect",
    } as const
  )[t];
}

// ─── Avatar ────────────────────────────────────────────────────────

function Avatar({ student, size }: { student: AdminStudent; size: number }) {
  const initials = student.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        fontSize: size * 0.35,
        fontWeight: 700,
      }}
    >
      {student.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={student.photoUrl}
          alt={student.name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Overview tab (with Phase 2a actions) ──────────────────────────

type ActionKind =
  | null
  | "change-section"
  | "change-roll"
  | "change-email"
  | "change-name"
  | "reset-progress"
  | "reset-module"
  | "unlink";

function OverviewTab({
  student,
  sections,
  onMutated,
  onClose,
}: {
  student: AdminStudent;
  sections?: string[];
  onMutated?: () => void;
  onClose: () => void;
}) {
  const { user, getIdToken } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const { toast } = useToast();

  // Which mutation is being prepared (form is filled) or in flight
  const [pendingAction, setPendingAction] = useState<ActionKind>(null);
  const [loading, setLoading] = useState(false);

  // Form inputs for each action
  const [newSection, setNewSection] = useState(student.section);
  const [newRoll, setNewRoll] = useState(student.enrollmentNo);
  const [newEmail, setNewEmail] = useState(student.email);
  const [newRollListName, setNewRollListName] = useState(
    student.rollListName || ""
  );
  // Per-module reset selector (default to Module 1). Admin picks which
  // single module to wipe for this one student. The "Reset all quiz
  // progress" row above still wipes every module in one shot.
  const [resetModuleNumber, setResetModuleNumber] = useState<number>(1);

  // Reset form state when student changes
  useEffect(() => {
    setPendingAction(null);
    setNewSection(student.section);
    setNewRoll(student.enrollmentNo);
    setNewEmail(student.email);
    setNewRollListName(student.rollListName || "");
  }, [
    student.email,
    student.section,
    student.enrollmentNo,
    student.rollListName,
  ]);

  // Auth headers: prefer ID token (attributed in audit log), fall back to
  // Google ID token only (password admin path was removed).
  function authHeaders(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = getIdToken();
    if (token && isAdmin) h["x-id-token"] = token;
    return h;
  }

  async function callApi(path: string, body: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Failed (${res.status})`);
      }
      return data;
    } finally {
      setLoading(false);
    }
  }

  // ─── Confirm handlers (invoked from the ConfirmDialog) ───────
  async function confirmChangeSection() {
    try {
      await callApi("/api/admin/students/update", {
        email: student.email,
        section: newSection,
      });
      toast({ kind: "success", message: `Section: ${student.section} → ${newSection}` });
      setPendingAction(null);
      onMutated?.();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  async function confirmChangeRoll() {
    try {
      await callApi("/api/admin/students/update", {
        email: student.email,
        enrollmentNo: newRoll,
      });
      toast({ kind: "success", message: `Roll: ${student.enrollmentNo} → ${newRoll}` });
      setPendingAction(null);
      onMutated?.();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  async function confirmChangeEmail() {
    try {
      await callApi("/api/admin/students/update", {
        email: student.email,
        newEmail,
      });
      toast({ kind: "success", message: `Email changed to ${newEmail}` });
      setPendingAction(null);
      onMutated?.();
      onClose(); // email change invalidates the current drawer's identity
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  async function confirmChangeName() {
    const trimmed = newRollListName.trim();
    try {
      await callApi("/api/admin/students/update", {
        email: student.email,
        rollListName: trimmed,
      });
      toast({
        kind: "success",
        message: `Name: ${student.rollListName || "—"} → ${trimmed || "—"}`,
      });
      setPendingAction(null);
      onMutated?.();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  async function confirmResetProgress() {
    try {
      const data = await callApi("/api/admin/students/reset-progress", {
        email: student.email,
      });
      toast({
        kind: "success",
        message: `Reset · deleted ${data.deletedRows} rows (${data.deletedTopics} topics, ${data.deletedQuizzes} quizzes).`,
      });
      setPendingAction(null);
      onMutated?.();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  /**
   * Scoped variant of confirmResetProgress — wipes only the currently
   * selected module's rows for this student. Powered by the same
   * endpoint; `moduleNumber` narrows the scope server-side. Lets a
   * teacher say "redo Module 3 only" without forcing a redo of
   * everything else the student already finished.
   */
  async function confirmResetModule() {
    try {
      const data = await callApi("/api/admin/students/reset-progress", {
        email: student.email,
        moduleNumber: resetModuleNumber,
      });
      toast({
        kind: "success",
        message: `Module ${resetModuleNumber} reset · deleted ${data.deletedRows} rows (${data.deletedTopics} topics, ${data.deletedQuizzes} quizzes).`,
      });
      setPendingAction(null);
      onMutated?.();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  async function confirmUnlink() {
    try {
      await callApi("/api/admin/students/unlink", {
        email: student.email,
      });
      toast({ kind: "success", message: `${student.name} unlinked. Progress preserved.` });
      setPendingAction(null);
      onMutated?.();
      onClose();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  // Sort known sections for the picker (fall back to commonly-seen if absent)
  const sectionOptions = useMemo(() => {
    const set = new Set<string>([student.section, ...(sections || [])]);
    return Array.from(set).sort(compareSections);
  }, [sections, student.section]);

  return (
    <div className="space-y-4">
      <StatGrid>
        <Stat label="Completion" value={`${student.completionPct}%`} color="#F59E0B" />
        <Stat
          label="Avg MCQ"
          value={student.avgMcq !== null ? `${student.avgMcq}%` : "—"}
          color="#A78BFA"
        />
        <Stat
          label="Last active"
          value={
            student.daysSinceActive === null
              ? "Never"
              : student.daysSinceActive === 0
              ? "Today"
              : `${student.daysSinceActive}d ago`
          }
          color="#34D399"
        />
        <Stat
          label="Registered"
          value={student.addedAt ? fmtDate(student.addedAt) : "—"}
          color="#818CF8"
        />
      </StatGrid>

      <Field label="Batch" value={student.batchId || "—"} />
      <Field label="Section" value={student.section} />
      <Field label="Roll number" value={student.enrollmentNo} />
      <Field
        label="Quiz topics completed"
        // TOTAL_TOPICS lives in @/lib/modules (re-exported via
        // course-registry) so this survives module topic-count
        // changes. Was hardcoded "/ 48" — drifted the moment
        // any module gained/lost a topic.
        value={`${student.completedCount} / ${TOTAL_TOPICS}`}
      />

      {/* ── Section change ──────────────────────────────────────── */}
      <ActionBlock
        title="Change section"
        description={`Move ${student.name} to a different section of the same batch.`}
      >
        <select
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
        >
          {sectionOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ActionButton
          disabled={newSection === student.section}
          onClick={() => setPendingAction("change-section")}
        >
          Change
        </ActionButton>
      </ActionBlock>

      {/* ── Roll change ─────────────────────────────────────────── */}
      <ActionBlock
        title="Change roll number"
        description={`Update the enrollment number for ${student.name}.`}
      >
        <input
          type="text"
          value={newRoll}
          onChange={(e) => setNewRoll(e.target.value.toUpperCase())}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
          placeholder="e.g. A85456325267"
        />
        <ActionButton
          disabled={!newRoll || newRoll === student.enrollmentNo}
          onClick={() => setPendingAction("change-roll")}
        >
          Change
        </ActionButton>
      </ActionBlock>

      {/* ── Name change (writes to roll_list.name) ─────────────── */}
      <ActionBlock
        title="Change display name"
        description={
          student.rollListName
            ? `The teacher-verified name shown everywhere in admin. Edit if "${student.rollListName}" is wrong.`
            : "No roll-list name on file for this roll. Set one so the roster shows their real name."
        }
      >
        <input
          type="text"
          value={newRollListName}
          onChange={(e) => setNewRollListName(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
          placeholder="e.g. Oysha Abdullayeva"
        />
        <ActionButton
          disabled={
            newRollListName.trim() === (student.rollListName || "").trim()
          }
          onClick={() => setPendingAction("change-name")}
        >
          Save
        </ActionButton>
      </ActionBlock>

      {/* ── Email change ────────────────────────────────────────── */}
      <ActionBlock
        title="Change email"
        description="Repoint the student's account to a different email. Progress and sessions carry over."
      >
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
          placeholder="student@gmail.com"
        />
        <ActionButton
          disabled={!newEmail || newEmail === student.email}
          onClick={() => setPendingAction("change-email")}
        >
          Change
        </ActionButton>
      </ActionBlock>

      {/* ── Reset + unlink (danger zone) ────────────────────────── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <div className="text-[10px] font-bold text-red-300 uppercase tracking-widest">
          Danger zone
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-zinc-200">
              Reset all quiz progress
            </div>
            <div className="text-[11px] text-zinc-500">
              Delete every completed topic and quiz score. Profile stays.
            </div>
          </div>
          <button
            onClick={() => setPendingAction("reset-progress")}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-300 transition-all active:scale-95 shrink-0"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            Reset all
          </button>
        </div>

        {/* Per-module reset — narrower than "Reset all", lets a
             teacher reset just one module for one student (e.g.
             "redo Module 3"). Uses the same endpoint with an
             optional moduleNumber in the body. */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-zinc-200">
              Reset one module
            </div>
            <div className="text-[11px] text-zinc-500">
              Wipes just the selected module for this student. Other
              modules stay.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={resetModuleNumber}
              onChange={(e) =>
                setResetModuleNumber(parseInt(e.target.value, 10))
              }
              className="text-[11px] font-semibold px-2 py-1.5 rounded-lg text-zinc-200 focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {MODULE_IDS.map((n) => (
                <option key={n} value={n}>
                  Module {n}
                </option>
              ))}
            </select>
            <button
              onClick={() => setPendingAction("reset-module")}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-300 transition-all active:scale-95"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-zinc-200">
              Unlink account
            </div>
            <div className="text-[11px] text-zinc-500">
              Remove their registration. Email is free for a new account to
              claim the same roll. Progress is preserved.
            </div>
          </div>
          <button
            onClick={() => setPendingAction("unlink")}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-300 transition-all active:scale-95 shrink-0"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            Unlink
          </button>
        </div>
      </div>

      {/* ── Confirmation dialogs ────────────────────────────────── */}
      <ConfirmDialog
        open={pendingAction === "change-section"}
        title="Change section?"
        description={`Move ${student.name} between sections of ${student.batchId}.`}
        diff={[{ label: "Section", from: student.section, to: newSection }]}
        confirmLabel="Change section"
        kind="primary"
        loading={loading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmChangeSection}
      />
      <ConfirmDialog
        open={pendingAction === "change-roll"}
        title="Change roll number?"
        diff={[
          { label: "Roll number", from: student.enrollmentNo, to: newRoll },
        ]}
        confirmLabel="Change roll"
        kind="primary"
        loading={loading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmChangeRoll}
      />
      <ConfirmDialog
        open={pendingAction === "change-name"}
        title="Change display name?"
        description="Updates the teacher-verified name on this student's roll-list entry. Their own chosen display name (shown in Connect) is not affected."
        diff={[
          {
            label: "Name",
            from: student.rollListName || "—",
            to: newRollListName.trim() || "—",
          },
        ]}
        confirmLabel="Save name"
        kind="primary"
        loading={loading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmChangeName}
      />
      <ConfirmDialog
        open={pendingAction === "change-email"}
        title="Change email?"
        description="Their progress and sessions will move to the new email. If the new email already has an account, the change will be rejected."
        diff={[{ label: "Email", from: student.email, to: newEmail }]}
        confirmLabel="Change email"
        kind="primary"
        loading={loading}
        warning="The drawer will close afterwards — reopen the student with their new email."
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmChangeEmail}
      />
      <ConfirmDialog
        open={pendingAction === "reset-progress"}
        title={`Reset ${student.name}'s quiz progress?`}
        description={`Deletes ${student.completedCount} completed topics plus all quiz scores. The student keeps their profile, section, and roll number.`}
        kind="danger"
        confirmLabel="Reset progress"
        warning="Cannot be undone — student will need to redo every quiz."
        loading={loading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmResetProgress}
      />
      <ConfirmDialog
        open={pendingAction === "reset-module"}
        title={`Reset Module ${resetModuleNumber} for ${student.name}?`}
        description={`Deletes only Module ${resetModuleNumber}'s completed topics and quiz scores for this student. Other modules stay exactly as they are.`}
        kind="danger"
        confirmLabel={`Reset Module ${resetModuleNumber}`}
        warning="Cannot be undone — student will need to redo this module."
        loading={loading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmResetModule}
      />
      <ConfirmDialog
        open={pendingAction === "unlink"}
        title={`Unlink ${student.name}'s account?`}
        description="Their registration (batch · section · roll · email) will be removed. Quiz progress stays in the database under their old email so it can re-attach if they re-register."
        kind="danger"
        confirmLabel="Unlink"
        warning="The drawer will close. The roll number will appear as 'pending' until someone re-registers with it."
        loading={loading}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmUnlink}
      />
    </div>
  );
}

// Small layout primitives used inside OverviewTab
function ActionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-2">
        <div className="text-[12px] font-semibold text-zinc-200">{title}</div>
        {description && (
          <div className="text-[11px] text-zinc-500 mt-0.5">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.04)"
          : "linear-gradient(135deg, #6366F1, #8B5CF6)",
        boxShadow: disabled ? "none" : "0 2px 8px rgba(99,102,241,0.25)",
      }}
    >
      {children}
    </button>
  );
}

// ─── Progress tab ──────────────────────────────────────────────────

function ProgressTab({ student }: { student: AdminStudent }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Overall
          </span>
          <span className="text-[11px] font-bold text-zinc-300">
            {student.completionPct}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${student.completionPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
      </div>

      {/* 14-day activity timeline. Each cell = one day, height
           proportional to completions. Blank cell = no activity that
           day. Lets the teacher spot patterns at a glance: \"Maria
           does 6 topics every Sunday night\" or \"Ali hasn't touched it
           in a week\". */}
      {student.recentActivity && student.recentActivity.length > 0 && (
        <div className="pt-2">
          <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2">
            Last 14 days
          </div>
          <ActivitySparkline activity={student.recentActivity} />
        </div>
      )}

      <div className="space-y-2 pt-2">
        {student.moduleStats.map((m) => (
          <div key={m.moduleNumber}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-zinc-400">Module {m.moduleNumber}</span>
              <span className="text-zinc-500 tabular-nums">
                {m.done}/{m.total}
                {m.avgMcqPct !== null && (
                  <span className="text-zinc-600 ml-2">
                    MCQ {m.avgMcqPct}%
                  </span>
                )}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ duration: 0.5, delay: 0.1 * m.moduleNumber }}
                className="h-full rounded-full"
                style={{
                  background:
                    m.pct >= 80
                      ? "#22c55e"
                      : m.pct >= 40
                      ? "#f59e0b"
                      : m.pct > 0
                      ? "#ef4444"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Thinking tab (Bloom's) ────────────────────────────────────────

function ThinkingTab({ student }: { student: AdminStudent }) {
  const radarLevels = useMemo(() => {
    return BLOOM_ORDER.map((lvl: BloomLevel) => {
      const entry = student.bloomStats[lvl];
      const correct = entry?.correct || 0;
      const total = entry?.total || 0;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { level: lvl, correct, total, pct };
    });
  }, [student.bloomStats]);

  const hasData = radarLevels.some((l) => l.total > 0);

  if (!hasData) {
    return (
      <div
        className="rounded-xl p-6 text-center text-[12px] text-zinc-500"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.08)",
        }}
      >
        No quiz data yet. This student hasn&apos;t completed any Bloom&apos;s-tagged
        quizzes.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-w-[340px] mx-auto">
        <BloomsRadar levels={radarLevels} />
      </div>

      <div className="space-y-2 pt-2">
        {radarLevels.map((l) => {
          const meta = BLOOM_META[l.level];
          return (
            <div key={l.level} className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0"
                style={{
                  background: meta.bgTint,
                  borderColor: meta.borderTint,
                  color: meta.color,
                  minWidth: 110,
                }}
              >
                <span aria-hidden="true">{meta.icon}</span>
                {meta.label}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${l.pct}%`,
                    background: meta.color,
                  }}
                />
              </div>
              <span className="text-[11px] text-zinc-400 tabular-nums shrink-0 w-12 text-right">
                {l.correct}/{l.total}
              </span>
            </div>
          );
        })}
      </div>

      {student.confidenceStats.rated > 0 && (
        <div
          className="mt-4 rounded-xl p-3"
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.18)",
          }}
        >
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2">
            Confidence calibration
          </div>
          <div className="space-y-1 text-[12px] text-zinc-300">
            <div>
              Rated{" "}
              <span className="font-bold text-white">
                {student.confidenceStats.rated}
              </span>{" "}
              questions
            </div>
            {student.confidenceStats.confidentWrong > 0 && (
              <div className="text-amber-300">
                ⚠ {student.confidenceStats.confidentWrong} confident but wrong
              </div>
            )}
            {student.confidenceStats.humbleRight > 0 && (
              <div className="text-emerald-300">
                ✓ {student.confidenceStats.humbleRight} humble but right
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Connect tab ───────────────────────────────────────────────────

function ConnectTab({ student }: { student: AdminStudent }) {
  const rows: { label: string; value: React.ReactNode; good: boolean }[] = [
    {
      label: "Photo",
      value: student.photoUrl ? "Google avatar" : "No photo",
      good: !!student.photoUrl,
    },
    {
      label: "Bio",
      value: student.bio ? (
        <span className="italic">&ldquo;{student.bio}&rdquo;</span>
      ) : (
        "Not set"
      ),
      good: !!(student.bio && student.bio.trim()),
    },
    {
      label: "LinkedIn",
      value: student.linkedinUrl ? (
        <a
          href={student.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline truncate"
        >
          {student.linkedinUrl}
        </a>
      ) : (
        "Not added"
      ),
      good: !!student.linkedinUrl,
    },
    {
      label: "Interests",
      value:
        student.skills.length > 0 ? (
          <span>{student.skills.join(" · ")}</span>
        ) : (
          "None selected"
        ),
      good: student.skills.length > 0,
    },
  ];

  const complete = rows.filter((r) => r.good).length;

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl p-3 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Profile completeness
          </div>
          <div className="text-[13px] text-zinc-300 mt-0.5">
            {complete} of {rows.length} fields filled
          </div>
        </div>
        <div
          className="text-xl font-bold"
          style={{
            color:
              complete === rows.length
                ? "#22c55e"
                : complete >= 2
                ? "#f59e0b"
                : "#ef4444",
          }}
        >
          {Math.round((complete / rows.length) * 100)}%
        </div>
      </div>

      {rows.map((r) => (
        <div
          key={r.label}
          className="rounded-xl p-3 min-w-0"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${
              r.good ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"
            }`,
          }}
        >
          <div className="flex items-start gap-2 min-w-0">
            <span
              className="shrink-0 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold mt-0.5"
              style={{
                background: r.good ? "#22c55e" : "rgba(255,255,255,0.08)",
                color: r.good ? "white" : "#71717a",
              }}
            >
              {r.good ? "✓" : "○"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                {r.label}
              </div>
              <div className="text-[13px] text-zinc-300 break-words">
                {r.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 min-w-0">
      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-24 shrink-0">
        {label}
      </span>
      <span className="text-[13px] text-zinc-300 flex-1 min-w-0 break-words">
        {value}
      </span>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 14-day completion sparkline. Renders one cell per day in the
// window, with cell height = clamp(count, 0..max) and color intensity
// = same. Blank cells (no activity) get a low-opacity placeholder so
// the rhythm is still visible.
function ActivitySparkline({
  activity,
}: {
  activity: { day: string; count: number }[];
}) {
  // Build a 14-day strip ending today, fill from the activity map.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const map = new Map(activity.map((a) => [a.day, a.count] as const));
  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    days.push({ day: key, count: map.get(key) || 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="flex items-end gap-1 h-12">
      {days.map((d) => {
        const heightPct = d.count > 0 ? Math.max(15, (d.count / max) * 100) : 6;
        const isToday = d.day === days[days.length - 1].day;
        return (
          <div
            key={d.day}
            className="flex-1 rounded-sm transition-colors"
            style={{
              height: `${heightPct}%`,
              minHeight: 4,
              background:
                d.count > 0
                  ? "linear-gradient(180deg, #818CF8, #6366F1)"
                  : "rgba(255,255,255,0.04)",
              border: isToday
                ? "1px solid rgba(99,102,241,0.5)"
                : "none",
            }}
            title={`${d.day} — ${d.count} topic${d.count === 1 ? "" : "s"}`}
            aria-label={`${d.day}: ${d.count} topics completed`}
          />
        );
      })}
    </div>
  );
}
