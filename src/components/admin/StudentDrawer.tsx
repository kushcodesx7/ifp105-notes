"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BloomsRadar from "@/components/BloomsRadar";
import { BLOOM_META, BLOOM_ORDER, type BloomLevel } from "@/lib/blooms";

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
  name: string;
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
  hidden?: boolean;
}

interface Props {
  student: AdminStudent | null;
  onClose: () => void;
}

type Tab = "overview" | "progress" | "thinking" | "connect";

// Slide-in drawer. On desktop (sm+) sits as a right panel; on mobile it
// takes the full screen. Keyboard: Esc closes.
export default function StudentDrawer({ student, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  // Reset to overview when a new student opens
  useEffect(() => {
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
            aria-label={`Student details for ${student.name}`}
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
              {tab === "overview" && <OverviewTab student={student} />}
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
        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
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

// ─── Overview tab ──────────────────────────────────────────────────

function OverviewTab({ student }: { student: AdminStudent }) {
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
        value={`${student.completedCount} / 48`}
      />

      <div
        className="mt-4 rounded-xl p-3 text-[11px] text-zinc-500"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        Admin actions (change section · reset progress · unlink email) ship
        in Phase 2. For now this is a read-only view.
      </div>
    </div>
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
