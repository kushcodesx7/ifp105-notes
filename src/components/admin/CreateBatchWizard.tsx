"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/admin/Toast";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

// 4-step wizard for creating a new batch. Opens as a modal overlay.
//
//   Step 1 — Basics      : id + display name
//   Step 2 — Sections    : count + names + expected sizes
//   Step 3 — Roll numbers: per-section input (4 modes: range, paste, CSV, manual)
//   Step 4 — Review      : summary, confirm → POST create-batch-full
//
// All state lives locally; nothing is persisted until the final confirm.
// Cancellable from any step.

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface SectionDraft {
  name: string;
  expected: number; // teacher's expected headcount (hint only)
  rolls: string[];
  // Per-section input state so switching tabs doesn't lose in-progress entries
  inputMode: "range" | "paste" | "csv" | "manual";
  rangeStart: string;
  rangeEnd: string;
  pasteBuffer: string;
}

const DEFAULT_SECTION_COUNT = 6;

function blankSection(name: string, expected = 0): SectionDraft {
  return {
    name,
    expected,
    rolls: [],
    inputMode: "paste",
    rangeStart: "",
    rangeEnd: "",
    pasteBuffer: "",
  };
}

export default function CreateBatchWizard({ open, onClose, onCreated }: Props) {
  const { user, getIdToken } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [batchId, setBatchId] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}-${y + 1}`;
  });
  const [batchName, setBatchName] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}–${y + 1} Batch`;
  });
  const [accent, setAccent] = useState("#6366F1");

  // Step 2 state
  const [sectionCount, setSectionCount] = useState(DEFAULT_SECTION_COUNT);
  const [sections, setSections] = useState<SectionDraft[]>(() =>
    Array.from({ length: DEFAULT_SECTION_COUNT }, (_, i) =>
      blankSection(`Section ${i + 1}`)
    )
  );

  // Step 3 state — which section's input is currently focused
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  // When section count changes, rebuild the sections array preserving any
  // in-progress entries up to the new count.
  function changeSectionCount(n: number) {
    const clamped = Math.max(1, Math.min(20, n));
    setSectionCount(clamped);
    setSections((prev) => {
      const next = [...prev];
      while (next.length < clamped) {
        next.push(blankSection(`Section ${next.length + 1}`));
      }
      if (next.length > clamped) next.length = clamped;
      return next;
    });
  }

  function updateSection(i: number, patch: Partial<SectionDraft>) {
    setSections((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  // ─── Roll number input helpers ────────────────────────────────
  function applyRange(i: number) {
    const s = sections[i];
    const start = parseInt(s.rangeStart, 10);
    const end = parseInt(s.rangeEnd, 10);
    if (isNaN(start) || isNaN(end) || start > end) {
      toast({
        kind: "error",
        message: "Enter a valid start/end (start ≤ end).",
      });
      return;
    }
    if (end - start > 500) {
      toast({ kind: "error", message: "Range too large (max 500)." });
      return;
    }
    const rolls: string[] = [];
    for (let n = start; n <= end; n++) rolls.push(String(n));
    updateSection(i, {
      rolls: dedupe([...sections[i].rolls, ...rolls]),
      rangeStart: "",
      rangeEnd: "",
    });
  }

  function applyPaste(i: number) {
    const s = sections[i];
    const rolls = parseRolls(s.pasteBuffer);
    if (rolls.length === 0) {
      toast({ kind: "error", message: "Nothing to parse from that paste." });
      return;
    }
    updateSection(i, {
      rolls: dedupe([...sections[i].rolls, ...rolls]),
      pasteBuffer: "",
    });
  }

  async function applyCsv(i: number, file: File) {
    const text = await file.text();
    const rolls = parseRolls(text);
    if (rolls.length === 0) {
      toast({ kind: "error", message: "Empty or unparseable CSV." });
      return;
    }
    updateSection(i, {
      rolls: dedupe([...sections[i].rolls, ...rolls]),
    });
    toast({ kind: "success", message: `${rolls.length} rolls imported.` });
  }

  function addOneRoll(i: number, roll: string) {
    if (!roll.trim()) return;
    updateSection(i, {
      rolls: dedupe([...sections[i].rolls, roll.trim().toUpperCase()]),
    });
  }

  function removeRoll(i: number, roll: string) {
    updateSection(i, {
      rolls: sections[i].rolls.filter((r) => r !== roll),
    });
  }

  // ─── Validation per step ──────────────────────────────────────
  const step1Valid = batchId.trim().length > 0 && batchName.trim().length > 0;
  const step2Valid = sections.every((s) => s.name.trim().length > 0);
  const totalRolls = sections.reduce((sum, s) => sum + s.rolls.length, 0);
  const step3Valid = totalRolls > 0;

  // ─── Submit (create-batch-full) ───────────────────────────────
  async function submit() {
    setSubmitting(true);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getIdToken();
    if (token && isAdmin) {
      headers["x-id-token"] = token;
    } else {
      const pw = sessionStorage.getItem("admin_pw");
      if (pw) headers["x-admin-password"] = pw;
    }
    try {
      const res = await fetch("/api/batches/admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "create-batch-full",
          id: batchId.trim(),
          name: batchName.trim(),
          accent,
          sections: sections.map((s) => ({
            name: s.name.trim(),
            rolls: s.rolls,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
      toast({
        kind: "success",
        message: `Created ${batchName} with ${sectionCount} sections and ${data.totalRolls ?? totalRolls} rolls.`,
      });
      onCreated?.();
      resetAndClose();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setStep(1);
    onClose();
  }

  // Esc closes, but only when not in the middle of submitting the
  // create-batch RPC — we don't want the admin to accidentally abandon
  // a half-finished save via a stray keypress.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) resetAndClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-6"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) resetAndClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F0F1A, #0A0A12)",
              border: "1px solid rgba(99,102,241,0.25)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              maxHeight: "calc(100vh - 3rem)",
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* ── Header + step indicator ──────────────────── */}
            <div
              className="shrink-0 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Create new batch</h2>
                <button
                  onClick={() => !submitting && resetAndClose()}
                  aria-label="Close"
                  className="text-zinc-500 hover:text-zinc-200 -mr-1 p-1 transition-colors disabled:opacity-40"
                  disabled={submitting}
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
              <StepIndicator currentStep={step} />
            </div>

            {/* ── Body ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {step === 1 && (
                <Step1
                  batchId={batchId}
                  setBatchId={setBatchId}
                  batchName={batchName}
                  setBatchName={setBatchName}
                  accent={accent}
                  setAccent={setAccent}
                />
              )}
              {step === 2 && (
                <Step2
                  sectionCount={sectionCount}
                  onCountChange={changeSectionCount}
                  sections={sections}
                  updateSection={updateSection}
                />
              )}
              {step === 3 && (
                <Step3
                  sections={sections}
                  activeIdx={activeSectionIdx}
                  setActiveIdx={setActiveSectionIdx}
                  updateSection={updateSection}
                  applyRange={applyRange}
                  applyPaste={applyPaste}
                  applyCsv={applyCsv}
                  addOneRoll={addOneRoll}
                  removeRoll={removeRoll}
                />
              )}
              {step === 4 && (
                <Step4
                  batchId={batchId}
                  batchName={batchName}
                  accent={accent}
                  sections={sections}
                  totalRolls={totalRolls}
                />
              )}
            </div>

            {/* ── Footer navigation ────────────────────────── */}
            <div
              className="shrink-0 px-5 py-3 flex items-center justify-between gap-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={() => !submitting && resetAndClose()}
                disabled={submitting}
                className="text-[12px] font-semibold text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    onClick={() => !submitting && setStep(step - 1)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold text-zinc-300 transition-all disabled:opacity-40"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    ← Back
                  </button>
                )}
                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && !step1Valid) ||
                      (step === 2 && !step2Valid) ||
                      (step === 3 && !step3Valid)
                    }
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={submitting || totalRolls === 0}
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-40 flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                    }}
                  >
                    {submitting && (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    ✓ Create batch
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Steps ────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Sections" },
    { n: 3, label: "Rolls" },
    { n: 4, label: "Review" },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((s, i) => {
        const active = s.n === currentStep;
        const done = s.n < currentStep;
        return (
          <div key={s.n} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-all"
              style={{
                background: active
                  ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                  : done
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(255,255,255,0.04)",
                color: active ? "white" : done ? "#4ade80" : "#a1a1aa",
                border: `1px solid ${active ? "transparent" : done ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span
                className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: active
                    ? "rgba(255,255,255,0.25)"
                    : done
                      ? "rgba(34,197,94,0.25)"
                      : "rgba(255,255,255,0.08)",
                }}
              >
                {done ? "✓" : s.n}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <span className="text-zinc-700 text-xs">·</span>}
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  batchId,
  setBatchId,
  batchName,
  setBatchName,
  accent,
  setAccent,
}: {
  batchId: string;
  setBatchId: (s: string) => void;
  batchName: string;
  setBatchName: (s: string) => void;
  accent: string;
  setAccent: (s: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
          Batch ID
        </label>
        <input
          type="text"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          placeholder="2026-2027"
          className="w-full px-3 py-2 rounded-lg text-[13px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
        />
        <p className="text-[10px] text-zinc-600 mt-1">
          Used in URLs and the API. Lowercase letters, numbers, dashes.
        </p>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
          Display name
        </label>
        <input
          type="text"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="2026–2027 Batch"
          className="w-full px-3 py-2 rounded-lg text-[13px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
          Accent colour
        </label>
        <div className="flex gap-2 flex-wrap">
          {["#6366F1", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"].map(
            (c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className="w-8 h-8 rounded-full transition-all active:scale-90"
                style={{
                  background: c,
                  outline: accent === c ? "2px solid white" : "none",
                  outlineOffset: 2,
                }}
                aria-label={`Accent ${c}`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Step2({
  sectionCount,
  onCountChange,
  sections,
  updateSection,
}: {
  sectionCount: number;
  onCountChange: (n: number) => void;
  sections: SectionDraft[];
  updateSection: (i: number, patch: Partial<SectionDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
          How many sections?
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCountChange(sectionCount - 1)}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] transition-colors"
          >
            −
          </button>
          <div className="text-xl font-bold tabular-nums w-10 text-center">
            {sectionCount}
          </div>
          <button
            onClick={() => onCountChange(sectionCount + 1)}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] transition-colors"
          >
            +
          </button>
          <p className="text-[10px] text-zinc-600 ml-3">
            Can rename individually below
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 flex-wrap rounded-lg p-2.5"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span className="text-[11px] font-semibold text-zinc-500 w-6 shrink-0">
              #{i + 1}
            </span>
            <input
              type="text"
              value={s.name}
              onChange={(e) => updateSection(i, { name: e.target.value })}
              className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
              placeholder={`Section ${i + 1}`}
            />
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] text-zinc-600">expect</label>
              <input
                type="number"
                min={0}
                value={s.expected || ""}
                onChange={(e) =>
                  updateSection(i, { expected: parseInt(e.target.value, 10) || 0 })
                }
                className="w-16 px-2 py-1.5 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
                placeholder="0"
              />
              <span className="text-[10px] text-zinc-600">students</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3({
  sections,
  activeIdx,
  setActiveIdx,
  updateSection,
  applyRange,
  applyPaste,
  applyCsv,
  addOneRoll,
  removeRoll,
}: {
  sections: SectionDraft[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  updateSection: (i: number, patch: Partial<SectionDraft>) => void;
  applyRange: (i: number) => void;
  applyPaste: (i: number) => void;
  applyCsv: (i: number, file: File) => void;
  addOneRoll: (i: number, roll: string) => void;
  removeRoll: (i: number, roll: string) => void;
}) {
  const s = sections[activeIdx];
  const [manualInput, setManualInput] = useState("");

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div
        className="flex gap-1 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {sections.map((sec, i) => {
          const active = i === activeIdx;
          const expectedHint = sec.expected > 0 ? ` · ${sec.rolls.length}/${sec.expected}` : "";
          return (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
              style={{
                background: active
                  ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {sec.name || `Section ${i + 1}`}
              {sec.rolls.length > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {sec.rolls.length}{expectedHint}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Input mode picker */}
      <div className="flex gap-1 flex-wrap">
        {(["range", "paste", "csv", "manual"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => updateSection(activeIdx, { inputMode: mode })}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
              s.inputMode === mode
                ? "text-white bg-white/[0.08]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            style={{
              border: `1px solid ${
                s.inputMode === mode ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"
              }`,
            }}
          >
            {
              {
                range: "Range",
                paste: "Paste",
                csv: "CSV file",
                manual: "One at a time",
              }[mode]
            }
          </button>
        ))}
      </div>

      {/* Mode-specific input */}
      {s.inputMode === "range" && (
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Start
            </label>
            <input
              type="text"
              value={s.rangeStart}
              onChange={(e) =>
                updateSection(activeIdx, { rangeStart: e.target.value })
              }
              placeholder="101"
              className="w-32 px-3 py-2 rounded-lg text-[13px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              End
            </label>
            <input
              type="text"
              value={s.rangeEnd}
              onChange={(e) =>
                updateSection(activeIdx, { rangeEnd: e.target.value })
              }
              placeholder="137"
              className="w-32 px-3 py-2 rounded-lg text-[13px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            onClick={() => applyRange(activeIdx)}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Add range
          </button>
        </div>
      )}

      {s.inputMode === "paste" && (
        <div>
          <textarea
            value={s.pasteBuffer}
            onChange={(e) =>
              updateSection(activeIdx, { pasteBuffer: e.target.value })
            }
            placeholder="Paste roll numbers — one per line, or separated by commas, tabs, or spaces. Duplicates and empty lines are ignored."
            className="w-full h-40 px-3 py-2 rounded-lg text-[12px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50 font-mono"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => applyPaste(activeIdx)}
              className="px-3 py-2 rounded-lg text-[12px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              Add pasted rolls
            </button>
          </div>
        </div>
      )}

      {s.inputMode === "csv" && (
        <div>
          <label
            className="block text-center rounded-xl p-6 cursor-pointer transition-all hover:bg-white/[0.04]"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.15)",
            }}
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="text-[13px] font-semibold text-zinc-300">
              Upload a CSV
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              One roll number per line. Headers optional — we skip non-numeric
              junk.
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) applyCsv(activeIdx, f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      {s.inputMode === "manual" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addOneRoll(activeIdx, manualInput);
                setManualInput("");
              }
            }}
            placeholder="Type a roll number, Enter to add"
            className="flex-1 px-3 py-2 rounded-lg text-[13px] text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={() => {
              addOneRoll(activeIdx, manualInput);
              setManualInput("");
            }}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Add
          </button>
        </div>
      )}

      {/* Roll list preview */}
      <div
        className="rounded-xl p-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-semibold text-zinc-400">
            {s.rolls.length} rolls in {s.name || `Section ${activeIdx + 1}`}
          </div>
          {s.rolls.length > 0 && (
            <button
              onClick={() => updateSection(activeIdx, { rolls: [] })}
              className="text-[10px] text-red-400 hover:text-red-300"
            >
              Clear all
            </button>
          )}
        </div>
        {s.rolls.length === 0 ? (
          <p className="text-[11px] text-zinc-600 italic">
            No rolls yet. Use the input above to add some.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
            {s.rolls.map((roll) => (
              <span
                key={roll}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {roll}
                <button
                  onClick={() => removeRoll(activeIdx, roll)}
                  className="text-zinc-600 hover:text-red-400 ml-0.5"
                  aria-label={`Remove ${roll}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Step4({
  batchId,
  batchName,
  accent,
  sections,
  totalRolls,
}: {
  batchId: string;
  batchName: string;
  accent: string;
  sections: SectionDraft[];
  totalRolls: number;
}) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${accent}30`,
        }}
      >
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
          About to create
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: accent }}
          />
          <div className="text-lg font-bold">{batchName}</div>
          <div className="text-[11px] text-zinc-500">({batchId})</div>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          {sections.length} sections · {totalRolls} total rolls
        </div>
      </div>

      <div className="space-y-1.5">
        {sections.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-zinc-200">
                {s.name}
              </div>
              <div className="text-[10px] text-zinc-500">
                {s.rolls.length} rolls
                {s.expected > 0 && ` (expected ${s.expected})`}
              </div>
            </div>
            {s.rolls.length === 0 && (
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                Empty
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-3 text-[11px] text-zinc-400 leading-relaxed"
        style={{
          background: "rgba(99,102,241,0.05)",
          border: "1px solid rgba(99,102,241,0.18)",
        }}
      >
        Clicking <strong>Create batch</strong> will create the batch in one shot —
        all sections and rolls go live together. Students matching a roll
        number can then register into their section.
      </div>
    </div>
  );
}

// ─── Utils ─────────────────────────────────────────────────────────

function dedupe(arr: string[]): string[] {
  const s = new Set<string>();
  for (const x of arr) {
    const up = x.toUpperCase().trim();
    if (up) s.add(up);
  }
  return Array.from(s);
}

/**
 * Parses a blob of pasted/CSV text into a list of roll numbers.
 * Splits on any combination of newline / comma / tab / semicolon / whitespace.
 * Uppercases and drops empties.
 */
function parseRolls(text: string): string[] {
  return text
    .split(/[\n,;\t ]+/)
    .map((r) => r.trim().toUpperCase())
    .filter((r) => r.length > 0);
}
