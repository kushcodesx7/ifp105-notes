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
  questionsInDb: number;
  questionsInTs: number;
  breakdown: {
    unchanged: number;
    edited: number;
    tsOnly: number;
    dbOnly: number;
    trashed: number;
  };
  hasDivergence: boolean;
}

// Plain-language labels for each diff status. Replaces the previous
// jargon ("TS source", "DB", "ts-only") which was confusing for the
// teacher who's not a developer. New labels use vocabulary the
// admin already understands: "what students see" + "new version".
const STATUS_META: Record<
  QStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  unchanged: {
    label: "No change",
    color: "#A1A1AA",
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
  },
  edited: {
    label: "Has updates",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.30)",
  },
  "ts-only": {
    label: "New (will be added)",
    color: "#34D399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.30)",
  },
  "db-only": {
    label: "Only on site (kept)",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.10)",
    border: "rgba(96,165,250,0.30)",
  },
  trashed: {
    label: "Was deleted (would come back)",
    color: "#F87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.30)",
  },
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
  // Question NUMBERS the admin wants to soft-delete. Lets us shrink
  // a topic's bank — e.g., M3 trimmed from 10 questions to 5, the
  // teacher needs to clear out 6-10.
  const [trashQs, setTrashQs] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  // ─── Filter scope ─────────────────────────────────────────────
  // Lets the admin narrow the picker to "only topics with content
  // changes" or "only topics with question changes" — useful when
  // they want to do a targeted pass (e.g., update all the lesson
  // copy edits in one go without seeing question-only diffs).
  type FilterScope = "all" | "content" | "questions";
  const [filterScope, setFilterScope] = useState<FilterScope>("all");

  // ─── Dismissed-topics persistence ─────────────────────────────
  // Per-admin, per-device choice to hide a topic from the picker
  // ("I've reviewed this and I don't want to apply"). Persisted in
  // localStorage so it survives reloads. Keyed on
  //   `${slug}::M${moduleNumber}::T${topicNumber}`
  // so dismissals don't bleed across courses or modules.
  const dismissKey = `ifp105_diff_dismissed_v1`;
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  // Hydrate dismissals from localStorage on mount (client-only).
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined"
        ? window.localStorage.getItem(dismissKey)
        : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDismissed(new Set(parsed.filter((x): x is string => typeof x === "string")));
      }
    } catch {}
  }, [dismissKey]);

  function persistDismissed(next: Set<string>) {
    try {
      window.localStorage.setItem(dismissKey, JSON.stringify(Array.from(next)));
    } catch {}
  }
  function dismissKeyFor(mod: number, top: number) {
    return `${slug}::M${mod}::T${top}`;
  }
  function dismissTopic(mod: number, top: number) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(dismissKeyFor(mod, top));
      persistDismissed(next);
      return next;
    });
  }
  function undismissTopic(mod: number, top: number) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.delete(dismissKeyFor(mod, top));
      persistDismissed(next);
      return next;
    });
  }

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
          // Auto-select the first NON-DISMISSED diverged topic so a
          // module switch lands on something useful. If everything
          // is either in sync OR dismissed, leave topicNumber null
          // and let the empty-state UI explain.
          const firstDiverged = topics.find(
            (t) =>
              t.hasDivergence &&
              !dismissed.has(dismissKeyFor(moduleNumber, t.topicNumber))
          );
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
    // `dismissed` and `dismissKeyFor` are read non-reactively at
    // fetch time — re-running this effect when a dismiss toggles
    // would clobber the teacher's current topic selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // Reset trash selection when the diff data refreshes — the
          // db-only question numbers may have shifted after a previous
          // apply and we don't want stale selections to delete the
          // wrong rows.
          setTrashQs(new Set());
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

  function toggleTrashQ(n: number) {
    setTrashQs((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }
  function toggleQ(n: number) {
    setApplyQs((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  async function applyDiff() {
    if (!applyContent && applyQs.size === 0 && trashQs.size === 0) {
      setError("Pick at least one thing to apply (content, a question, or a question to remove).");
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
          trashQuestionNumbers: Array.from(trashQs).sort((a, z) => a - z),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Failed (${res.status})`);
      } else {
        const trashed = (json.questionsTrashed as number | undefined) ?? 0;
        setApplyResult(
          `Updated! Lesson content: ${json.appliedContent ? "yes" : "no"} · ${json.questionsApplied} questions added/updated${trashed > 0 ? ` · ${trashed} questions removed` : ""}${json.warnings?.length ? ` · ${json.warnings.length} warning(s)` : ""}.`
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
            { label: "Update lessons & questions" },
          ]}
        />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Update lessons & questions</h1>
          <p className="text-sm text-zinc-400 mt-1">
            See what students see now, side-by-side with the new version. Pick exactly what to update — lesson content and/or specific questions. Nothing is changed until you click <strong className="text-white">Push update to students</strong>.
          </p>
        </div>

        {/* How-it-works hint — 3 quick steps the first-time admin can
             skim. Subtle (low-contrast) so it stays helpful without
             stealing focus from the actual controls. */}
        <div
          className="mb-5 rounded-xl px-4 py-3 text-[12px] flex items-start gap-3 flex-wrap"
          style={{
            background: "rgba(167,139,250,0.06)",
            border: "1px solid rgba(167,139,250,0.18)",
          }}
        >
          <span className="text-base shrink-0" aria-hidden="true">💡</span>
          <div className="text-zinc-300 leading-relaxed flex-1 min-w-0">
            <strong className="text-white">How to use this page:</strong>{" "}
            <span className="text-zinc-400">
              <strong className="text-zinc-300">1.</strong> Pick a Module · {" "}
              <strong className="text-zinc-300">2.</strong> Click any topic with changes (only topics that need attention show up) · {" "}
              <strong className="text-zinc-300">3.</strong> Compare the two sides + tick what you want to update · {" "}
              <strong className="text-zinc-300">4.</strong> Click the green button at the bottom.
            </span>
          </div>
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

        {/* ── Filter scope selector ── */}
        {/* Narrows the picker. The admin can choose "Content only"
             when reviewing lesson edits in bulk, or "Questions only"
             when triaging quiz changes. "All" is the default and
             matches the previous behaviour. */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <label className="block text-[11px] font-bold tracking-widest uppercase text-zinc-500">
            Show topics with:
          </label>
          {([
            { id: "all", label: "Any change" },
            { id: "content", label: "Content changes" },
            { id: "questions", label: "Question changes" },
          ] as const).map((opt) => {
            const active = filterScope === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFilterScope(opt.id)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                style={{
                  background: active
                    ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                    : "rgba(255,255,255,0.04)",
                  color: active ? "#fff" : "#A1A1AA",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* ── Filtered topic buttons (only diverged ones, optionally
              narrowed by scope, optionally including dismissed) ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <label className="block text-[11px] font-bold tracking-widest uppercase text-zinc-500">
              Topics with changes
            </label>
            {summary && (() => {
              // Helper: does this topic match the current scope filter?
              const inScope = (s: TopicSummary): boolean => {
                if (filterScope === "all") return s.hasDivergence;
                if (filterScope === "content") {
                  return (
                    s.topicStatus === "edited" ||
                    s.topicStatus === "ts-only" ||
                    s.topicStatus === "trashed"
                  );
                }
                // questions
                return s.questionsDiverged > 0;
              };
              const divergedAll = summary.filter(inScope);
              const dismissedHere = divergedAll.filter((s) =>
                dismissed.has(dismissKeyFor(moduleNumber, s.topicNumber))
              ).length;
              const visibleCount = divergedAll.length - dismissedHere;
              return (
                <span className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span>
                    {visibleCount} of {summary.length} need{visibleCount === 1 ? "s" : ""} review
                  </span>
                  {dismissedHere > 0 && (
                    <button
                      onClick={() => setShowDismissed((v) => !v)}
                      className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
                    >
                      {showDismissed ? "Hide" : "Show"} {dismissedHere} dismissed
                    </button>
                  )}
                </span>
              );
            })()}
          </div>

          {summaryLoading && (
            <div className="text-xs text-zinc-500 italic">Scanning topics…</div>
          )}

          {!summaryLoading && summary && (
            (() => {
              const inScope = (s: TopicSummary): boolean => {
                if (filterScope === "all") return s.hasDivergence;
                if (filterScope === "content") {
                  return (
                    s.topicStatus === "edited" ||
                    s.topicStatus === "ts-only" ||
                    s.topicStatus === "trashed"
                  );
                }
                return s.questionsDiverged > 0;
              };
              const divergedAll = summary.filter(inScope);
              const visible = divergedAll.filter((s) => {
                const isDismissed = dismissed.has(
                  dismissKeyFor(moduleNumber, s.topicNumber)
                );
                return showDismissed ? true : !isDismissed;
              });

              if (divergedAll.length === 0) {
                const scopeLabel =
                  filterScope === "content" ? "content" :
                  filterScope === "questions" ? "question" :
                  "any";
                return (
                  <div
                    className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.30)",
                      color: "#34D399",
                    }}
                  >
                    ✓ <span><strong>All topics in sync</strong> — nothing to apply for Module {moduleNumber}{filterScope !== "all" ? ` (${scopeLabel} filter)` : ""}.</span>
                  </div>
                );
              }
              if (visible.length === 0) {
                return (
                  <div
                    className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                    style={{
                      background: "rgba(96,165,250,0.08)",
                      border: "1px solid rgba(96,165,250,0.30)",
                      color: "#60A5FA",
                    }}
                  >
                    ✓ <span><strong>All visible topics dismissed.</strong> Click &ldquo;Show dismissed&rdquo; above to bring them back.</span>
                  </div>
                );
              }
              return (
                <div className="flex flex-wrap gap-2">
                  {visible.map((s) => {
                    const meta = STATUS_META[s.topicStatus];
                    const active = s.topicNumber === topicNumber;
                    return (
                      // Use a div + role=button so we can nest a real
                      // <button> for "Dismiss" inside without producing
                      // invalid HTML (button-in-button). Keyboard
                      // navigation preserved via tabIndex + Enter/Space
                      // handler.
                      <div
                        key={s.topicNumber}
                        role="button"
                        tabIndex={0}
                        onClick={() => setTopicNumber(s.topicNumber)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setTopicNumber(s.topicNumber);
                          }
                        }}
                        className="text-left rounded-xl px-3 py-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
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
                        {/* Question count line: "3 in DB · 8 in TS"
                             so the admin sees at a glance that they
                             trimmed a topic. Only shown when counts
                             differ (otherwise noise). */}
                        {s.questionsInDb !== s.questionsInTs && (
                          <div className="text-[10px] text-zinc-400 mt-1">
                            <span className="text-blue-300">{s.questionsInDb} in DB</span>
                            <span className="text-zinc-600"> · </span>
                            <span className="text-violet-300">{s.questionsInTs} in TS</span>
                          </div>
                        )}
                        {/* Per-status mini-breakdown chips. Each chip
                             only renders if its count > 0, so the
                             button stays clean when nothing applies. */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.breakdown.tsOnly > 0 && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
                              title="New questions that aren't on the site yet — applying will publish them"
                            >
                              + {s.breakdown.tsOnly} new
                            </span>
                          )}
                          {s.breakdown.edited > 0 && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}
                              title="Questions with updated text or options — applying replaces what students see"
                            >
                              ~ {s.breakdown.edited} updated
                            </span>
                          )}
                          {s.breakdown.trashed > 0 && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: "rgba(248,113,113,0.15)", color: "#F87171" }}
                              title="Questions you previously deleted from the site — applying brings them back"
                            >
                              ↺ {s.breakdown.trashed} would come back
                            </span>
                          )}
                          {s.breakdown.dbOnly > 0 && (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: "rgba(96,165,250,0.15)", color: "#60A5FA" }}
                              title="Questions you've added directly through the admin editor — applying leaves these alone"
                            >
                              ✦ {s.breakdown.dbOnly} kept as-is
                            </span>
                          )}
                        </div>
                        {/* Dismiss / un-dismiss inline action. Click
                             stops propagation so it doesn't also
                             fire the parent button's setTopicNumber.
                             Persists in localStorage per (slug,
                             module, topic) so it survives reloads. */}
                        {(() => {
                          const k = dismissKeyFor(moduleNumber, s.topicNumber);
                          const isDismissed = dismissed.has(k);
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isDismissed) {
                                  undismissTopic(moduleNumber, s.topicNumber);
                                } else {
                                  dismissTopic(moduleNumber, s.topicNumber);
                                  // If we just dismissed the currently-
                                  // selected topic, clear it so the
                                  // detail panel disappears.
                                  if (topicNumber === s.topicNumber) {
                                    setTopicNumber(null);
                                  }
                                }
                              }}
                              className="mt-2 text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                              title={
                                isDismissed
                                  ? "Bring this topic back into the picker"
                                  : "I've reviewed this and don't want to apply — hide from picker"
                              }
                            >
                              {isDismissed ? "↺ Restore" : "× Dismiss (don't apply)"}
                            </button>
                          );
                        })()}
                      </div>
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
              <RenderedSide label="🎓 What students see now" tone="db" topic={data.db ? { title: data.db.title, time: data.db.time_min ? `~${data.db.time_min} min` : "", hook: data.db.hook ?? "", content: data.db.content } : null} />
              <RenderedSide label="✨ What apply will change it to" tone="ts" topic={data.ts ? { title: data.ts.title, time: data.ts.time, hook: data.ts.hook, content: data.ts.content } : null} />
            </div>

            {/* ── Per-question diff ── */}
            <QuestionDiffList
              questions={data.questions}
              applyQs={applyQs}
              toggleQ={toggleQ}
              trashQs={trashQs}
              toggleTrashQ={toggleTrashQ}
              setTrashQs={setTrashQs}
            />

            {/* ── Apply bar ── */}
            {/* Plain-language "what will happen" summary above the
                 button so the admin reads a sentence in normal English
                 before they click. Was previously a terse
                 "topic content + 2 questions" line that didn't tell
                 a non-developer what the action actually does. */}
            <div
              className="sticky bottom-4 mt-6 rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(139,92,246,0.10))",
                border: "1px solid rgba(99,102,241,0.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-sm text-zinc-200 flex-1 min-w-[200px]">
                  <strong>Ready to update:</strong>{" "}
                  {(() => {
                    const parts: string[] = [];
                    if (applyContent) parts.push("lesson content");
                    if (applyQs.size > 0) {
                      parts.push(
                        `${applyQs.size} question${applyQs.size === 1 ? "" : "s"} added/updated`
                      );
                    }
                    if (trashQs.size > 0) {
                      parts.push(
                        `${trashQs.size} question${trashQs.size === 1 ? "" : "s"} removed`
                      );
                    }
                    if (parts.length === 0) {
                      return (
                        <span className="text-zinc-500">
                          nothing selected — tick at least one item above
                        </span>
                      );
                    }
                    return (
                      <>
                        {parts.join(" + ")}.{" "}
                        <span className="text-zinc-400">
                          Students will see the new version on their next page load.
                        </span>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={applyDiff}
                  disabled={applying || (!applyContent && applyQs.size === 0 && trashQs.size === 0)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                  }}
                >
                  {applying
                    ? "Updating…"
                    : `✅ Push update to students`}
                </button>
              </div>
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
  // Plain-language summaries — replaces the previous teacher-confusing
  // jargon ("TS source", "DB", "soft-deleted").
  const summary =
    status === "unchanged"
      ? "Lesson content is up to date. Nothing to update here."
      : status === "edited"
        ? "Lesson content has updates available. Applying will replace what students see now."
        : status === "ts-only"
          ? "This topic isn't on the site yet. Applying will publish it."
          : status === "db-only"
            ? "This topic only exists on the site (no new version). Nothing to update for content."
            : "This topic was deleted from the site earlier. Applying will bring it back.";

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
        <span className="font-semibold text-zinc-200">Update lesson content</span>
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
  trashQs,
  toggleTrashQ,
  setTrashQs,
}: {
  questions: QuestionDiff[];
  applyQs: Set<number>;
  toggleQ: (n: number) => void;
  trashQs: Set<number>;
  toggleTrashQ: (n: number) => void;
  setTrashQs: (s: Set<number>) => void;
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

  // List of "kept as-is" question numbers (only on the site, not in
  // the new TS source). These are the candidates for removal.
  const dbOnlyNumbers = questions
    .filter((q) => q.status === "db-only")
    .map((q) => q.number);
  const allDbOnlyTicked =
    dbOnlyNumbers.length > 0 &&
    dbOnlyNumbers.every((n) => trashQs.has(n));

  return (
    <div>
      <div className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">
        Tick the questions you want to update ({questions.length} total)
      </div>

      {/* Master "remove extras" toggle — visible only when there are
           db-only questions that could be removed. One click ticks
           them all for soft-deletion. Common for module trims (e.g.,
           M3 from 10 questions to 5). */}
      {dbOnlyNumbers.length > 0 && (
        <div
          className="rounded-xl p-3 mb-3 flex items-start gap-3 flex-wrap"
          style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.22)",
          }}
        >
          <span className="text-base shrink-0" aria-hidden="true">🗑️</span>
          <label className="flex-1 min-w-0 flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allDbOnlyTicked}
              onChange={() => {
                const next = new Set(trashQs);
                if (allDbOnlyTicked) {
                  for (const n of dbOnlyNumbers) next.delete(n);
                } else {
                  for (const n of dbOnlyNumbers) next.add(n);
                }
                setTrashQs(next);
              }}
              className="w-4 h-4 accent-red-500 shrink-0 mt-0.5"
            />
            <div>
              <div className="text-sm font-semibold text-red-300">
                Also remove the {dbOnlyNumbers.length} extra question{dbOnlyNumbers.length === 1 ? "" : "s"} not in the new version
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Recoverable via /admin/tools/trash. Use this when the new version has fewer questions than the site (e.g., trimmed from 10 to 5).
              </div>
            </div>
          </label>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((q) => {
          const meta = STATUS_META[q.status];
          const isOpen = expanded.has(q.number);
          const dbDisabled = q.status === "db-only" || q.status === "unchanged";
          const isDbOnly = q.status === "db-only";
          const willTrash = trashQs.has(q.number);
          return (
            <div
              key={q.number}
              className="rounded-xl overflow-hidden"
              style={{
                background: willTrash ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${willTrash ? "rgba(248,113,113,0.30)" : meta.border}`,
              }}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={applyQs.has(q.number)}
                  onChange={() => toggleQ(q.number)}
                  disabled={dbDisabled}
                  className="w-4 h-4 accent-indigo-500 shrink-0 disabled:opacity-30"
                  title={dbDisabled ? "No new version to apply for this question" : "Tick to update with the new version"}
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
                  {willTrash ? "Will be removed" : meta.label}
                </span>
                <span
                  className={`text-[13px] flex-1 min-w-0 truncate ${willTrash ? "line-through text-zinc-500" : "text-zinc-200"}`}
                >
                  {(q.ts?.question || q.db?.question || "").slice(0, 100)}
                </span>
                {/* Per-question Trash toggle — only for db-only
                     questions, since you can't "remove" something
                     that isn't already in the DB. */}
                {isDbOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrashQ(q.number);
                    }}
                    className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full transition-colors"
                    style={{
                      background: willTrash
                        ? "rgba(248,113,113,0.18)"
                        : "rgba(255,255,255,0.04)",
                      color: willTrash ? "#F87171" : "#A1A1AA",
                      border: `1px solid ${willTrash ? "rgba(248,113,113,0.40)" : "rgba(255,255,255,0.10)"}`,
                    }}
                    title={willTrash ? "Click to keep this question" : "Remove this question (soft-delete, recoverable)"}
                  >
                    {willTrash ? "↺ keep" : "× remove"}
                  </button>
                )}
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
                      <QPanel title="🎓 What students see now" data={q.db ? {
                        question: q.db.question,
                        options: q.db.options_json,
                        correct_index: q.db.correct_index,
                        bloom: q.db.bloom,
                        explanation: q.db.explanation,
                        meta: q.db.deleted_at ? "🗑 trashed" : null,
                      } : null} ringColor="#60A5FA" />
                      <QPanel title="✨ New version" data={q.ts ? {
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
