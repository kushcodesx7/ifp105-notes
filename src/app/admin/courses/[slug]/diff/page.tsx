"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, { useAdminAuth } from "@/components/admin/AdminAuthGate";
import TopicRenderer from "@/components/module/TopicRenderer";
import { MODULES } from "@/lib/modules";
import type { ContentBlock } from "@/types/content";

// /admin/courses/[slug]/diff
//
// Per-topic re-seed preview. Teacher picks Module → Topic, sees the
// current DB version side-by-side with the canonical TS version,
// and chooses what to apply via two granular controls:
//   1. "Apply content"  ✓/✗  — overwrite topic content_json from TS
//   2. Per-question checkboxes — pick which questions to upsert
//
// Both sides render with the SAME TopicRenderer the students see, so
// the preview is byte-for-byte what students will get if "Apply" is
// clicked. Solves the M5 problem (teacher-deleted questions getting
// resurrected by a bulk re-seed) by letting the teacher exclude the
// questions they want to keep deleted.

interface DbSide {
  title: string;
  time_min: number | null;
  hook: string | null;
  content: ContentBlock[];
  trashed: boolean;
}
interface TsSide {
  number: number;
  title: string;
  time: string;
  hook: string;
  content: ContentBlock[];
}
type QStatus = "unchanged" | "edited" | "ts-only" | "db-only" | "trashed";
interface QuestionDiff {
  number: number;
  status: QStatus;
  db: {
    question: string;
    options_json: string[];
    correct_index: number;
    bloom: string | null;
    explanation: string | null;
    deleted_at: string | null;
  } | null;
  ts: {
    question: string;
    options: string[];
    correct_index: number;
    bloom: string | null;
    explanation: string;
  } | null;
}
interface DiffResponse {
  course: { slug: string };
  module: { number: number; title: string | null };
  topic: { number: number };
  db: DbSide | null;
  ts: TsSide | null;
  topicStatus: QStatus;
  questions: QuestionDiff[];
}

interface TopicSummary {
  topicNumber: number;
  title: string;
  topicStatus: QStatus;
  questionsTotal: number;
  questionsDiverged: number;
  hasDivergence: boolean;
}

const STATUS_META: Record<
  QStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  unchanged: { label: "Unchanged", color: "#A1A1AA", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  edited: { label: "Edited in TS", color: "#FBBF24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)" },
  "ts-only": { label: "Only in TS (would create)", color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.30)" },
  "db-only": { label: "Only in DB (untouched)", color: "#60A5FA", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.30)" },
  trashed: { label: "Trashed in DB (would resurrect)", color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)" },
};

export default function DiffPage() {
  const { idToken, ready } = useAdminAuth();
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = rawSlug || "ict";

  const [moduleNumber, setModuleNumber] = useState<number>(1);
  const [topicNumber, setTopicNumber] = useState<number | null>(null);
  const [data, setData] = useState<DiffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-module topic divergence summary — drives the filtered topic
  // picker so the admin only sees buttons for topics that actually
  // need attention, not all 11.
  const [summary, setSummary] = useState<TopicSummary[] | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Apply controls
  const [applyContent, setApplyContent] = useState(true);
  const [applyQs, setApplyQs] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  const moduleMeta = MODULES.find((m) => m.id === moduleNumber);
  void moduleMeta; // reserved for future use (e.g., showing module accent in heading)

  const fetchHeaders = useMemo(() => {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (idToken) h["x-id-token"] = idToken;
    return h;
  }, [idToken]);

  // Fetch per-module SUMMARY whenever module/token changes. Drives the
  // filtered topic picker (we only render buttons for topics that
  // actually differ — no point clicking through 11 unchanged ones).
  useEffect(() => {
    if (!ready || !idToken) return;
    let alive = true;
    (async () => {
      setSummaryLoading(true);
      try {
        const res = await fetch(
          `/api/admin/courses/${slug}/diff/summary?module=${moduleNumber}`,
          { headers: fetchHeaders, cache: "no-store" }
        );
        const json = await res.json();
        if (!alive) return;
        if (res.ok) {
          const topics = (json.topics ?? []) as TopicSummary[];
          setSummary(topics);
          // Auto-select the first DIVERGED topic so the page lands on
          // something useful immediately. If everything is in sync,
          // leave topicNumber null and the page renders the empty
          // state instead of forcing a no-op diff fetch.
          const firstDiverged = topics.find((t) => t.hasDivergence);
          setTopicNumber(firstDiverged ? firstDiverged.topicNumber : null);
        }
      } catch {
        /* surface via main error state */
      } finally {
        if (alive) setSummaryLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, moduleNumber, idToken, ready, fetchHeaders]);

  // Fetch diff whenever topic/token changes
  useEffect(() => {
    if (!ready || !idToken) return;
    if (topicNumber == null) {
      setData(null);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      setApplyResult(null);
      try {
        const res = await fetch(
          `/api/admin/courses/${slug}/diff?module=${moduleNumber}&topic=${topicNumber}`,
          { headers: fetchHeaders, cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) {
          if (alive) setError(json.error || `Failed (${res.status})`);
        } else if (alive) {
          setData(json as DiffResponse);
          // Default selection: tick all questions that DIFFER from TS
          // (edited / ts-only / trashed) — the teacher's likely target.
          // Untick "unchanged" (no-op) and "db-only" (not in TS).
          const next = new Set<number>();
          for (const q of (json as DiffResponse).questions) {
            if (q.status === "edited" || q.status === "ts-only" || q.status === "trashed") {
              next.add(q.number);
            }
          }
          setApplyQs(next);
          // Default content checkbox: ON if topic differs, OFF otherwise
          setApplyContent(
            (json as DiffResponse).topicStatus === "edited" ||
              (json as DiffResponse).topicStatus === "ts-only" ||
              (json as DiffResponse).topicStatus === "trashed"
          );
        }
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, moduleNumber, topicNumber, idToken, ready, fetchHeaders]);

  function toggleQ(n: number) {
    setApplyQs((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  async function applyDiff() {
    if (!applyContent && applyQs.size === 0) {
      setError("Pick at least one thing to apply (content or a question).");
      return;
    }
    setApplying(true);
    setError(null);
    setApplyResult(null);
    try {
      const res = await fetch(`/api/admin/courses/${slug}/diff/apply`, {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({
          module: moduleNumber,
          topic: topicNumber,
          applyContent,
          applyQuestionNumbers: Array.from(applyQs).sort((a, z) => a - z),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Failed (${res.status})`);
      } else {
        setApplyResult(
          `Applied. Content: ${json.appliedContent ? "yes" : "no"} · Questions updated: ${json.questionsApplied}${json.warnings?.length ? ` · ${json.warnings.length} warning(s)` : ""}.`
        );
        // Refetch so the diff now shows everything as "unchanged"
        setTimeout(() => {
          setLoading(true);
          fetch(
            `/api/admin/courses/${slug}/diff?module=${moduleNumber}&topic=${topicNumber}`,
            { headers: fetchHeaders, cache: "no-store" }
          )
            .then((r) => r.json())
            .then((d) => setData(d as DiffResponse))
            .finally(() => setLoading(false));
        }, 400);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setApplying(false);
    }
  }

  if (!ready) return <AdminAuthGate />;

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Courses", href: "/admin/courses" },
            { label: slug.toUpperCase(), href: `/admin/courses/${slug}` },
            { label: "Diff & apply" },
          ]}
        />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Per-topic diff &amp; apply</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Side-by-side preview of the live DB version vs the canonical TS source. Pick exactly what to apply — topic content and/or specific questions.
          </p>
        </div>

        {/* ── Module picker ── */}
        <div className="mb-4 flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-1">Module</label>
            <select
              value={moduleNumber}
              onChange={(e) => {
                setModuleNumber(parseInt(e.target.value, 10));
                setTopicNumber(null); // summary effect will pick first diverged
              }}
              className="px-3 py-2 rounded-lg text-sm text-white bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-indigo-500/50"
            >
              {MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  Module {m.id} — {m.fullTitle ?? m.title}
                </option>
              ))}
            </select>
          </div>
          <Link
            href={`/admin/courses/${slug}`}
            className="ml-auto text-xs text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
          >
            ← Back to course
          </Link>
        </div>

        {/* ── Filtered topic buttons (only diverged ones) ── */}
        {/* Summary-driven picker: instead of dumping all 11 topics into
             a dropdown, we surface ONLY the topics that have something
             to apply (edited / ts-only / trashed at the topic level OR
             with diverged questions). Saves the admin from clicking
             through 8 unchanged topics looking for the one that needs
             attention. Empty state replaces the picker entirely when
             nothing is out of sync. */}
        <div className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <label className="block text-[11px] font-bold tracking-widest uppercase text-zinc-500">
              Topics with changes
            </label>
            {summary && (() => {
              const divergedCount = summary.filter((s) => s.hasDivergence).length;
              return (
                <span className="text-[11px] text-zinc-500">
                  {divergedCount} of {summary.length} need{divergedCount === 1 ? "s" : ""} review
                </span>
              );
            })()}
          </div>

          {summaryLoading && (
            <div className="text-xs text-zinc-500 italic">Scanning topics…</div>
          )}

          {!summaryLoading && summary && (
            (() => {
              const diverged = summary.filter((s) => s.hasDivergence);
              if (diverged.length === 0) {
                return (
                  <div
                    className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.30)",
                      color: "#34D399",
                    }}
                  >
                    ✓ <span><strong>All topics in sync</strong> — nothing to apply for Module {moduleNumber}.</span>
                  </div>
                );
              }
              return (
                <div className="flex flex-wrap gap-2">
                  {diverged.map((s) => {
                    const meta = STATUS_META[s.topicStatus];
                    const active = s.topicNumber === topicNumber;
                    return (
                      <button
                        key={s.topicNumber}
                        onClick={() => setTopicNumber(s.topicNumber)}
                        className="text-left rounded-xl px-3 py-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background: active
                            ? "rgba(99,102,241,0.18)"
                            : "rgba(255,255,255,0.03)",
                          border: active
                            ? "2px solid rgba(99,102,241,0.6)"
                            : `1px solid ${meta.border}`,
                          minWidth: "180px",
                          maxWidth: "260px",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="inline-block w-7 h-7 rounded-md text-center leading-7 text-[12px] font-bold"
                            style={{
                              background: active
                                ? "rgba(99,102,241,0.30)"
                                : "rgba(255,255,255,0.06)",
                              color: active ? "#FFFFFF" : "#D4D4D8",
                            }}
                          >
                            {s.topicNumber}
                          </span>
                          <span
                            className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase"
                            style={{
                              background: meta.bg,
                              color: meta.color,
                            }}
                          >
                            {meta.label.split(" (")[0]}
                          </span>
                        </div>
                        <div className="text-[12px] text-zinc-200 font-medium leading-snug truncate">
                          {s.title}
                        </div>
                        {s.questionsDiverged > 0 && (
                          <div className="text-[10px] text-amber-400 mt-1">
                            {s.questionsDiverged} question{s.questionsDiverged === 1 ? "" : "s"} diverged
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-[12px] text-red-300"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.22)",
            }}
          >
            {error}
          </div>
        )}
        {applyResult && (
          <div
            className="mb-4 p-3 rounded-lg text-[12px] text-emerald-300"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.22)",
            }}
          >
            ✓ {applyResult}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-zinc-500 text-sm">Loading diff…</div>
        )}

        {data && !loading && (
          <>
            {/* ── Topic-level status banner + apply-content toggle ── */}
            <TopicStatusBanner
              status={data.topicStatus}
              dbTopic={data.db}
              tsTopic={data.ts}
              applyContent={applyContent}
              setApplyContent={setApplyContent}
            />

            {/* ── Side-by-side rendered preview ── */}
            <div className="grid lg:grid-cols-2 gap-4 mb-8">
              <RenderedSide label="Current (DB) — what students see now" tone="db" topic={data.db ? { title: data.db.title, time: data.db.time_min ? `~${data.db.time_min} min` : "", hook: data.db.hook ?? "", content: data.db.content } : null} />
              <RenderedSide label="Proposed (TS) — what apply will push" tone="ts" topic={data.ts ? { title: data.ts.title, time: data.ts.time, hook: data.ts.hook, content: data.ts.content } : null} />
            </div>

            {/* ── Per-question diff ── */}
            <QuestionDiffList
              questions={data.questions}
              applyQs={applyQs}
              toggleQ={toggleQ}
            />

            {/* ── Apply bar ── */}
            <div
              className="sticky bottom-4 mt-6 rounded-2xl p-4 flex items-center gap-3 flex-wrap"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(139,92,246,0.10))",
                border: "1px solid rgba(99,102,241,0.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="text-sm text-zinc-200 flex-1 min-w-[200px]">
                <strong>Ready to apply:</strong>{" "}
                {applyContent ? "topic content" : ""}
                {applyContent && applyQs.size > 0 ? " + " : ""}
                {applyQs.size > 0 ? `${applyQs.size} question${applyQs.size === 1 ? "" : "s"}` : ""}
                {!applyContent && applyQs.size === 0 && (
                  <span className="text-zinc-500"> nothing selected</span>
                )}
              </div>
              <button
                onClick={applyDiff}
                disabled={applying || (!applyContent && applyQs.size === 0)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                }}
              >
                {applying ? "Applying…" : `Apply to Module ${moduleNumber} · Topic ${topicNumber}`}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ─── Topic status banner ───────────────────────────────────────────
function TopicStatusBanner({
  status,
  dbTopic,
  tsTopic,
  applyContent,
  setApplyContent,
}: {
  status: QStatus;
  dbTopic: DbSide | null;
  tsTopic: TsSide | null;
  applyContent: boolean;
  setApplyContent: (v: boolean) => void;
}) {
  const meta = STATUS_META[status];
  const summary =
    status === "unchanged"
      ? "Topic content matches TS source. Nothing to apply for content."
      : status === "edited"
        ? "Topic content differs between DB and TS. Applying will overwrite the DB version."
        : status === "ts-only"
          ? "Topic doesn't exist in DB yet. Applying will create it."
          : status === "db-only"
            ? "Topic exists in DB but not in the TS source. Apply does nothing for content."
            : "Topic is soft-deleted in DB. Applying will resurrect it with TS content.";

  return (
    <div
      className="mb-4 rounded-2xl p-4 flex items-start gap-4 flex-wrap"
      style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
      }}
    >
      <div className="flex-1 min-w-[240px]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
            style={{ background: meta.border, color: meta.color }}
          >
            {meta.label}
          </span>
          {dbTopic?.title && (
            <span className="text-sm font-semibold text-white truncate">
              &ldquo;{dbTopic.title}&rdquo;
            </span>
          )}
          {!dbTopic && tsTopic?.title && (
            <span className="text-sm font-semibold text-white truncate">
              &ldquo;{tsTopic.title}&rdquo;
            </span>
          )}
        </div>
        <p className="text-[12px] text-zinc-300">{summary}</p>
      </div>
      <label
        className={`flex items-center gap-2 text-sm cursor-pointer select-none px-3 py-2 rounded-lg ${
          status === "unchanged" || status === "db-only" ? "opacity-50" : ""
        }`}
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <input
          type="checkbox"
          checked={applyContent}
          onChange={(e) => setApplyContent(e.target.checked)}
          disabled={status === "unchanged" || status === "db-only"}
          className="w-4 h-4 accent-indigo-500"
        />
        <span className="font-semibold text-zinc-200">Apply topic content</span>
      </label>
    </div>
  );
}

// ─── Side-by-side rendered preview ─────────────────────────────────
function RenderedSide({
  label,
  tone,
  topic,
}: {
  label: string;
  tone: "db" | "ts";
  topic: { title: string; time: string; hook: string; content: ContentBlock[] } | null;
}) {
  const ringColor = tone === "db" ? "#60A5FA" : "#A78BFA";
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${ringColor}33`,
      }}
    >
      <div
        className="px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase"
        style={{
          background: `${ringColor}18`,
          color: ringColor,
          borderBottom: `1px solid ${ringColor}33`,
        }}
      >
        {label}
      </div>
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {!topic ? (
          <div className="text-sm text-zinc-500 italic">No topic on this side.</div>
        ) : (
          <>
            <div className="mb-3">
              <h3 className="text-lg font-bold text-white">{topic.title}</h3>
              {topic.time && (
                <div className="text-[11px] text-zinc-500 mt-0.5">{topic.time}</div>
              )}
            </div>
            {topic.hook && (
              <div
                className="mb-4 p-3 rounded-lg text-[13px] text-zinc-300"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)" }}
                dangerouslySetInnerHTML={{ __html: topic.hook }}
              />
            )}
            <TopicRenderer content={topic.content} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Per-question diff list ────────────────────────────────────────
function QuestionDiffList({
  questions,
  applyQs,
  toggleQ,
}: {
  questions: QuestionDiff[];
  applyQs: Set<number>;
  toggleQ: (n: number) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  function toggleExp(n: number) {
    setExpanded((p) => {
      const next = new Set(p);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center text-sm text-zinc-500"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        No questions on either side.
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">
        Questions ({questions.length})
      </div>
      <div className="space-y-2">
        {questions.map((q) => {
          const meta = STATUS_META[q.status];
          const isOpen = expanded.has(q.number);
          const dbDisabled = q.status === "db-only" || q.status === "unchanged";
          return (
            <div
              key={q.number}
              className="rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${meta.border}` }}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={applyQs.has(q.number)}
                  onChange={() => toggleQ(q.number)}
                  disabled={dbDisabled}
                  className="w-4 h-4 accent-indigo-500 shrink-0 disabled:opacity-30"
                  title={dbDisabled ? "No TS version to apply" : "Tick to overwrite DB with TS version"}
                />
                <span
                  className="shrink-0 inline-block w-7 h-7 rounded-md text-center leading-7 text-[11px] font-bold"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#D4D4D8" }}
                >
                  {q.number}
                </span>
                <span
                  className="shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  {meta.label}
                </span>
                <span className="text-[13px] text-zinc-200 flex-1 min-w-0 truncate">
                  {(q.ts?.question || q.db?.question || "").slice(0, 100)}
                </span>
                <button
                  onClick={() => toggleExp(q.number)}
                  className="shrink-0 text-[11px] text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
                >
                  {isOpen ? "hide" : "show"}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="grid md:grid-cols-2 gap-3 p-3"
                      style={{ borderTop: `1px solid ${meta.border}` }}
                    >
                      <QPanel title="Current (DB)" data={q.db ? {
                        question: q.db.question,
                        options: q.db.options_json,
                        correct_index: q.db.correct_index,
                        bloom: q.db.bloom,
                        explanation: q.db.explanation,
                        meta: q.db.deleted_at ? "🗑 trashed" : null,
                      } : null} ringColor="#60A5FA" />
                      <QPanel title="Proposed (TS)" data={q.ts ? {
                        question: q.ts.question,
                        options: q.ts.options,
                        correct_index: q.ts.correct_index,
                        bloom: q.ts.bloom,
                        explanation: q.ts.explanation,
                        meta: null,
                      } : null} ringColor="#A78BFA" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QPanel({
  title,
  data,
  ringColor,
}: {
  title: string;
  data: {
    question: string;
    options: string[];
    correct_index: number;
    bloom: string | null;
    explanation: string | null;
    meta: string | null;
  } | null;
  ringColor: string;
}) {
  return (
    <div
      className="rounded-lg p-3 text-[12px]"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ringColor}33` }}
    >
      <div
        className="text-[10px] font-bold tracking-wider uppercase mb-2"
        style={{ color: ringColor }}
      >
        {title}
        {data?.meta && (
          <span className="ml-2 text-[10px] text-red-400 font-normal normal-case">
            {data.meta}
          </span>
        )}
      </div>
      {!data ? (
        <div className="text-zinc-500 italic">— not present —</div>
      ) : (
        <>
          <div className="text-zinc-100 font-medium mb-2">{data.question}</div>
          <ol className="space-y-1 mb-2 text-[11px]">
            {data.options.map((o, i) => (
              <li
                key={i}
                className={i === data.correct_index ? "text-emerald-300" : "text-zinc-400"}
              >
                <span className="font-mono">{String.fromCharCode(65 + i)}.</span> {o}
                {i === data.correct_index && <span className="ml-1">✓</span>}
              </li>
            ))}
          </ol>
          {(data.bloom || data.explanation) && (
            <div className="text-[10px] text-zinc-500 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {data.bloom && <span className="mr-2">Bloom: <strong className="text-zinc-300">{data.bloom}</strong></span>}
              {data.explanation && <div className="mt-1 italic">&ldquo;{data.explanation}&rdquo;</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
