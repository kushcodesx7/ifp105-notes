"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CORE_CONCEPTS,
  CONCEPT_GROUPS,
  type ConceptCard as TConceptCard,
  type ConceptGroup,
} from "@/data/core-concepts";

// CoreConcepts — the "Core ICT Concepts" section on /exam-prep.
//
// Pedagogical framing (carved into every label and heading): these are
// the fundamental ideas covered in the IFP105 module material. Revising
// them helps a student who is preparing or retaking the subject feel
// confident with any ICT question. The framing is plain revision —
// never a prediction about what will appear on a specific exam.
//
// Each concept renders as a card with two columns on desktop:
//   · LEFT  — a sample answer (Define / Explain / Example /
//             Diagram / Useful phrases)
//   · RIGHT — study notes (strong points / common mistakes / tip)
// On mobile, the two columns stack.
//
// Studied state is per-concept, 3-state (not-yet · reviewed · confident),
// stored in a single localStorage key. 3 states match the confidence
// ratings already used in McqQuiz so the vocabulary stays consistent.

type Status = "not-yet" | "reviewed" | "confident";

const STORAGE_KEY = "examPrep:coreConcepts:v1";
// Whether the student has globally opted out of the "try it first"
// prompt. Some students prefer to read the model answer directly
// (revision-sprint mode); others want the active-recall friction.
// Stored separately from progress data because it's a UI preference.
const SKIP_TRY_FIRST_KEY = "examPrep:skipTryFirst:v1";

// URL hash prefix for deep-linking to a specific concept. Visiting
// `/exam-prep#concept-hardware` opens that card automatically and
// scrolls to it. Used by the "copy link" button on each card so
// students can share specific concepts in study-group chats.
const HASH_PREFIX = "concept-";

/**
 * Build the prompt question shown in "try it first" mode. Synthesised
 * from the concept title: comparison concepts ("X vs Y") get a
 * "Differentiate" prompt; everything else gets a generic "Define +
 * examples + diagram" prompt that maps cleanly onto the D·E·E·D
 * recipe taught at the top of the page. Keeps every prompt one short
 * sentence so a nervous student isn't reading instructions when they
 * should be writing.
 */
function tryFirstPrompt(title: string): string {
  // Strip a parenthetical so "Hardware (something)" still reads cleanly.
  const cleaned = title.replace(/\s*\(.*?\)\s*/g, "").trim();
  // "X vs Y" pattern → comparison prompt
  const vsMatch = cleaned.match(/^(.*?)\s+vs\s+(.*)$/i);
  if (vsMatch) {
    return `Differentiate ${vsMatch[1].trim()} and ${vsMatch[2].trim()}. Give an example of each and a labelled diagram.`;
  }
  // "X — sub-detail" → use the X part for the prompt
  const dashMatch = cleaned.match(/^(.*?)\s+—\s+/);
  const subject = dashMatch ? dashMatch[1].trim() : cleaned;
  return `Define ${subject}. Explain why it matters, give 2–3 examples, and draw a labelled diagram.`;
}

interface StoredMap {
  // concept-id → status
  [conceptId: string]: Status;
}

const STATUS_LABELS: Record<Status, { text: string; color: string; chip: string }> = {
  "not-yet": {
    text: "I haven't reviewed this yet",
    color: "#A1A1AA",
    chip: "Not yet",
  },
  reviewed: {
    text: "I've reviewed this",
    color: "#FCD34D",
    chip: "Reviewed",
  },
  confident: {
    text: "I'm confident on this",
    color: "#34D399",
    chip: "Confident ✓",
  },
};

function nextStatus(s: Status): Status {
  if (s === "not-yet") return "reviewed";
  if (s === "reviewed") return "confident";
  return "not-yet";
}

function loadStatuses(): StoredMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveStatuses(map: StoredMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota / privacy mode — best effort.
  }
}

const ALL_GROUPS = Object.keys(CONCEPT_GROUPS) as ConceptGroup[];

export default function CoreConcepts() {
  // Active group tab. "all" shows every concept (used when search is
  // active so cross-group matches all show up).
  const [activeGroup, setActiveGroup] = useState<ConceptGroup | "all">(
    "computer-basics"
  );
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<StoredMap>({});
  const [openId, setOpenId] = useState<string | null>(null);
  // Concepts the student has revealed in THIS session (memory-only,
  // not persisted). When a card opens for the first time AND the
  // global skip flag is off, we show a "try it first" gate before the
  // model answer. Keeping this in-memory means a concept revealed
  // yesterday gets the prompt again today — that's the spaced-recall
  // benefit. Persisting it would defeat the point.
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  // Global "skip the try-first prompt" preference. Persisted because
  // it's a UI choice, not progress data. Some students just want to
  // read.
  const [skipTryFirst, setSkipTryFirst] = useState(false);
  // Briefly highlights a card when it opens via deep-link, so the
  // student visually clocks where they landed.
  const [flashId, setFlashId] = useState<string | null>(null);
  // Toast feedback for the "copy link" button — id of the concept
  // whose URL was just copied.
  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);

  // Hydrate statuses + skip-preference from localStorage AFTER mount
  // so SSR and the first client render are byte-identical (no studied
  // chips on first paint), avoiding hydration mismatches.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatuses(loadStatuses());
    if (typeof window !== "undefined") {
      try {
        setSkipTryFirst(localStorage.getItem(SKIP_TRY_FIRST_KEY) === "1");
      } catch {
        // localStorage may throw in privacy mode — leave default.
      }
    }
  }, []);

  const reveal = useCallback((id: string) => {
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  function toggleSkipTryFirst() {
    setSkipTryFirst((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(SKIP_TRY_FIRST_KEY, "1");
        else localStorage.removeItem(SKIP_TRY_FIRST_KEY);
      } catch {}
      return next;
    });
  }

  // Deep-link: `/exam-prep#concept-<id>` opens that concept and
  // scrolls to it. Listens to hashchange so an in-page link click or
  // a URL pasted into a new tab both work. Auto-reveals the model
  // answer too (deep-link == "I want this specific answer now") so
  // the student doesn't hit the try-first gate on a navigation they
  // explicitly chose.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function applyHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash.startsWith(HASH_PREFIX)) return;
      const id = hash.slice(HASH_PREFIX.length);
      const concept = CORE_CONCEPTS.find((c) => c.id === id);
      if (!concept) return;
      // Switch to the right group tab so the card is in the visible
      // pool, otherwise filter would hide it after we open it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveGroup(concept.group);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenId(id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlashId(id);
      reveal(id);
      // Wait for the next frame so the open-state has rendered, then
      // scroll. Otherwise we'd scroll to the card BEFORE the body
      // expanded, leaving the student staring at a half-scrolled page.
      requestAnimationFrame(() => {
        const el = document.getElementById(`concept-card-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      // Clear the flash highlight after 1.6s so the card returns to
      // its normal styling.
      setTimeout(() => setFlashId(null), 1600);
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [reveal]);

  // Copy a shareable URL for one concept to the clipboard. Uses the
  // modern Clipboard API; falls back to a textarea hack on old
  // browsers / non-secure contexts. Also rewrites the address bar via
  // history.replaceState so what the student sees and what's on the
  // clipboard match exactly.
  const copyLink = useCallback(async (id: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#${HASH_PREFIX}${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
    setLinkCopiedId(id);
    try {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}#${HASH_PREFIX}${id}`
      );
    } catch {}
    setTimeout(() => setLinkCopiedId(null), 1800);
  }, []);

  function bumpStatus(id: string) {
    setStatuses((prev) => {
      const cur = prev[id] ?? "not-yet";
      const next = nextStatus(cur);
      const updated = { ...prev };
      if (next === "not-yet") delete updated[id];
      else updated[id] = next;
      saveStatuses(updated);
      return updated;
    });
  }

  // Filtered + grouped concept list.
  const visibleConcepts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let pool = CORE_CONCEPTS;
    if (activeGroup !== "all") {
      pool = pool.filter((c) => c.group === activeGroup);
    }
    if (q) {
      pool = pool.filter((c) => {
        const hay = `${c.title} ${c.tags.join(" ")} ${c.define}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return pool;
  }, [activeGroup, search]);

  // Aggregate progress across the whole bank, regardless of current
  // filter — students should see total progress, not "12/12 in this
  // tab" which would mis-represent their preparation.
  const reviewed = Object.values(statuses).filter(
    (s) => s === "reviewed" || s === "confident"
  ).length;
  const confident = Object.values(statuses).filter((s) => s === "confident").length;
  const total = CORE_CONCEPTS.length;
  const reviewedPct = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  // Switching to "all" automatically when the user types a search,
  // so cross-group matches don't disappear inside an active tab.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (search.trim()) setActiveGroup("all");
  }, [search]);

  return (
    <section
      id="core-concepts"
      className="mt-16 mb-10"
      aria-labelledby="core-concepts-heading"
    >
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
            Core ICT Concepts
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "rgba(99,102,241,0.15)",
              color: "#A5B4FC",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            {total} concepts
          </span>
        </div>
        <h2
          id="core-concepts-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
        >
          Concept Review — Revise the Core Ideas
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          These are the core ICT concepts covered in the IFP105 modules. Work
          through each one using the <strong className="text-indigo-300">D·E·E·D
          structure</strong> — a useful way to revise definitions, examples,
          and diagrams while preparing or retaking the subject.
        </p>
      </div>

      {/* Progress + search */}
      <div
        className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-semibold text-zinc-300">
              Your revision progress:
            </span>
            <span className="text-[12px] font-bold text-white">
              {reviewed} / {total}
            </span>
            <span className="text-[10px] text-zinc-500">
              ({confident} confident)
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
            role="progressbar"
            aria-valuenow={reviewedPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full"
              style={{
                background:
                  "linear-gradient(90deg, #818CF8, #34D399)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${reviewedPct}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
        <div className="sm:w-72">
          <label className="sr-only" htmlFor="concept-search">
            Search concepts
          </label>
          <input
            id="concept-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search — e.g. HTML, AI, Excel"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-500 text-[13px] focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Group tabs */}
      <div
        className="flex gap-1.5 mb-4 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Concept groups"
      >
        <GroupTab
          icon="🔆"
          label="All"
          active={activeGroup === "all"}
          accent="#818CF8"
          count={CORE_CONCEPTS.length}
          onClick={() => setActiveGroup("all")}
        />
        {ALL_GROUPS.map((g) => {
          const meta = CONCEPT_GROUPS[g];
          const count = CORE_CONCEPTS.filter((c) => c.group === g).length;
          return (
            <GroupTab
              key={g}
              icon={meta.icon}
              label={meta.label}
              accent={meta.accent}
              count={count}
              active={activeGroup === g}
              onClick={() => setActiveGroup(g)}
            />
          );
        })}
      </div>

      {/* Active group description (skipped when "all" or searching) */}
      {activeGroup !== "all" && !search.trim() && (
        <p className="text-[12px] text-zinc-500 mb-3 px-1">
          {CONCEPT_GROUPS[activeGroup].description}
        </p>
      )}

      {/* Try-first preference — small inline toggle on the right side
           so it's discoverable but not loud. Defaults OFF so first-time
           students get the active-recall benefit; once a student
           prefers reading, one tap dismisses it forever. */}
      <div className="flex items-center justify-end mb-3 px-1">
        <label className="inline-flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded accent-indigo-500"
            checked={skipTryFirst}
            onChange={toggleSkipTryFirst}
          />
          <span>Skip the &ldquo;try it first&rdquo; prompt — show answers directly</span>
        </label>
      </div>

      {/* Empty state */}
      {visibleConcepts.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-sm text-zinc-400">
            No concepts match{" "}
            <code className="font-mono text-zinc-300">
              &quot;{search}&quot;
            </code>{" "}
            — try a different keyword.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleConcepts.map((c) => (
            <ConceptAccordion
              key={c.id}
              concept={c}
              status={statuses[c.id] ?? "not-yet"}
              isOpen={openId === c.id}
              isRevealed={revealed.has(c.id) || skipTryFirst}
              isFlashing={flashId === c.id}
              isLinkCopied={linkCopiedId === c.id}
              onToggle={() => setOpenId((cur) => (cur === c.id ? null : c.id))}
              onBumpStatus={() => bumpStatus(c.id)}
              onReveal={() => reveal(c.id)}
              onCopyLink={() => copyLink(c.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Group tab ────────────────────────────────────────────────────

function GroupTab({
  icon,
  label,
  active,
  count,
  accent,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  count: number;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className="shrink-0 px-3 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5"
      style={{
        background: active ? `${accent}22` : "rgba(255,255,255,0.03)",
        color: active ? accent : "#A1A1AA",
        border: `1px solid ${active ? `${accent}55` : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
      <span
        className="text-[10px] font-bold px-1.5 rounded-full"
        style={{
          background: active ? `${accent}33` : "rgba(255,255,255,0.04)",
          color: active ? accent : "#71717A",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Single concept accordion ─────────────────────────────────────

function ConceptAccordion({
  concept,
  status,
  isOpen,
  isRevealed,
  isFlashing,
  isLinkCopied,
  onToggle,
  onBumpStatus,
  onReveal,
  onCopyLink,
}: {
  concept: TConceptCard;
  status: Status;
  isOpen: boolean;
  /** True when the model answer should render directly (revealed in
   *  this session OR global skip-try-first preference is on). */
  isRevealed: boolean;
  /** Briefly true after a deep-link navigation lands on this card. */
  isFlashing: boolean;
  /** True for ~1.8s after the copy-link button was tapped on this
   *  card; flips the icon to a checkmark to confirm. */
  isLinkCopied: boolean;
  onToggle: () => void;
  onBumpStatus: () => void;
  /** Marks the concept as revealed in-session — model answer renders
   *  in place of the try-first gate. */
  onReveal: () => void;
  /** Copy a shareable URL of this concept to the clipboard. */
  onCopyLink: () => void;
}) {
  const groupMeta = CONCEPT_GROUPS[concept.group];
  const statusMeta = STATUS_LABELS[status];

  return (
    <div
      id={`concept-card-${concept.id}`}
      className="card-glass rounded-2xl overflow-hidden transition-all duration-500"
      style={
        isFlashing
          ? {
              boxShadow: `0 0 0 2px ${groupMeta.accent}80, 0 12px 40px ${groupMeta.accent}30`,
            }
          : undefined
      }
    >
      {/* Header — clickable to expand */}
      <div className="w-full flex items-stretch">
        <button
          onClick={onToggle}
          className="flex-1 text-left px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors min-w-0"
          aria-expanded={isOpen}
          aria-controls={`concept-body-${concept.id}`}
        >
          <span
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base mt-0.5"
            style={{
              background: `${groupMeta.accent}22`,
              border: `1px solid ${groupMeta.accent}44`,
            }}
            aria-hidden
          >
            {groupMeta.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                style={{
                  background: `${groupMeta.accent}1F`,
                  color: groupMeta.accent,
                  border: `1px solid ${groupMeta.accent}33`,
                }}
              >
                {groupMeta.label}
              </span>
              {concept.relatedModules && concept.relatedModules.length > 0 && (
                <span className="text-[10px] text-zinc-500">
                  Module {concept.relatedModules.join(", ")}
                </span>
              )}
            </div>
            <h3 className="text-[15px] sm:text-base text-white font-semibold leading-snug">
              {concept.title}
            </h3>
          </div>
          <span
            className="shrink-0 text-zinc-400 text-xs mt-1 transition-transform"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>
        {/* Copy-link button — share the concept's deep-link with a
             classmate. Renders a checkmark for ~1.8s after copy so
             the student knows the action took effect. */}
        <button
          onClick={onCopyLink}
          className="shrink-0 px-2.5 sm:px-3 text-[14px] transition-colors hover:bg-white/[0.04] flex items-center justify-center"
          style={{
            color: isLinkCopied ? "#34D399" : "#A1A1AA",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
          }}
          aria-label={isLinkCopied ? "Link copied" : `Copy link to ${concept.title}`}
          title={isLinkCopied ? "Link copied!" : "Copy link to share"}
        >
          {isLinkCopied ? "✓" : "🔗"}
        </button>
        {/* Status chip — separate button so toggling status doesn't
             expand the card. */}
        <button
          onClick={onBumpStatus}
          className="shrink-0 px-3 sm:px-4 text-[10.5px] font-bold uppercase tracking-wider transition-colors hover:bg-white/[0.04]"
          style={{
            color: statusMeta.color,
            borderLeft: "1px solid rgba(255,255,255,0.05)",
          }}
          aria-label={`Status: ${statusMeta.text}. Tap to cycle.`}
          title={`${statusMeta.text} — tap to change`}
        >
          {statusMeta.chip}
        </button>
      </div>

      {/* Body — only mounted when open, so the SVG diagrams don't
           load for collapsed cards. When the card hasn't been
           revealed yet, we show a try-first gate instead of the
           model answer; the student attempts the answer in their
           head/on paper before peeking. Active recall > re-reading. */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`concept-body-${concept.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-4 sm:px-5 py-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {isRevealed ? (
                <div className="grid lg:grid-cols-[1fr_320px] gap-5">
                  {/* LEFT — student's model answer */}
                  <div className="min-w-0">
                    <ModelAnswer concept={concept} />
                  </div>
                  {/* RIGHT — study notes */}
                  <ExaminerNotes concept={concept} />
                </div>
              ) : (
                <TryFirstGate
                  concept={concept}
                  groupAccent={groupMeta.accent}
                  onReveal={onReveal}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Try-first gate ───────────────────────────────────────────────
// Shown when a concept opens for the first time in this session and
// the student hasn't globally opted out. Frames the concept as a
// question, gives them a moment to think, and only reveals the model
// answer when they tap. The active-recall bump from this is the
// biggest single learning multiplier on this page.
function TryFirstGate({
  concept,
  groupAccent,
  onReveal,
}: {
  concept: TConceptCard;
  groupAccent: string;
  onReveal: () => void;
}) {
  const prompt = tryFirstPrompt(concept.title);
  return (
    <div
      className="rounded-xl p-5 sm:p-6 text-center"
      style={{
        background: `linear-gradient(180deg, ${groupAccent}0F, transparent)`,
        border: `1px solid ${groupAccent}33`,
      }}
    >
      <div
        className="inline-block text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: groupAccent }}
      >
        ✏️ Try it first
      </div>
      <p className="text-[15px] sm:text-base text-white font-semibold leading-relaxed max-w-xl mx-auto">
        &ldquo;{prompt}&rdquo;
      </p>
      <p className="text-[12px] text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed">
        Take 30 seconds. Sketch your D·E·E·D in your head or on paper.
        Reading after attempting is far stickier than just reading.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={onReveal}
          className="text-[13px] font-bold px-4 py-2 rounded-full text-white transition-transform hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${groupAccent}, ${groupAccent}CC)`,
            boxShadow: `0 4px 16px ${groupAccent}55`,
          }}
        >
          Show the model answer →
        </button>
      </div>
    </div>
  );
}

// ─── Model answer (left panel) ────────────────────────────────────

function ModelAnswer({ concept }: { concept: TConceptCard }) {
  return (
    <div className="space-y-4 text-[13.5px] text-zinc-300 leading-relaxed">
      <Section
        letter="D"
        word="Define"
        accent="#818CF8"
        body={
          <p
            className="[&_strong]:text-zinc-100 [&_strong]:font-semibold [&_em]:text-violet-300 [&_code]:font-mono [&_code]:text-amber-300 [&_code]:text-[12.5px]"
            dangerouslySetInnerHTML={{ __html: concept.define }}
          />
        }
      />
      <Section
        letter="E"
        word="Explain"
        accent="#60A5FA"
        body={
          <p
            className="[&_strong]:text-zinc-100 [&_strong]:font-semibold [&_em]:text-blue-300 [&_code]:font-mono [&_code]:text-amber-300 [&_code]:text-[12.5px]"
            dangerouslySetInnerHTML={{ __html: concept.explain }}
          />
        }
      />
      <Section
        letter="E"
        word="Examples"
        accent="#34D399"
        body={
          <ul className="list-disc ml-5 space-y-1.5">
            {concept.examples.map((ex, i) => (
              <li
                key={i}
                className="[&_strong]:text-zinc-100 [&_strong]:font-semibold [&_em]:text-emerald-300 [&_code]:font-mono [&_code]:text-amber-300 [&_code]:text-[12.5px]"
                dangerouslySetInnerHTML={{ __html: ex }}
              />
            ))}
          </ul>
        }
      />
      <Section
        letter="D"
        word="Diagram"
        accent="#A78BFA"
        body={
          <div>
            <div
              className="rounded-xl p-3 mb-2 overflow-x-auto"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              dangerouslySetInnerHTML={{ __html: concept.diagramSvg }}
            />
            <p className="text-[12px] text-zinc-400 italic px-1">
              {concept.diagramCaption}
            </p>
          </div>
        }
      />

      {/* Key phrases — pinned at the bottom of the model answer */}
      <div
        className="mt-5 rounded-xl p-3.5"
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.18)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            🎯 Useful phrases to remember
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {concept.keyPhrases.map((phrase, i) => (
            <span
              key={i}
              className="text-[11px] px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "#C4B5FD",
                border: "1px solid rgba(99,102,241,0.22)",
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// One D·E·E·D section — letter chip + heading + body block.
function Section({
  letter,
  word,
  accent,
  body,
}: {
  letter: string;
  word: string;
  accent: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] mt-0.5"
        style={{
          background: `${accent}22`,
          color: accent,
          border: `1px solid ${accent}44`,
        }}
      >
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-bold uppercase tracking-wider mb-1"
          style={{ color: accent }}
        >
          {word}
        </div>
        <div>{body}</div>
      </div>
    </div>
  );
}

// ─── Study notes (right panel) ────────────────────────────────────

function ExaminerNotes({ concept }: { concept: TConceptCard }) {
  return (
    <aside
      className="rounded-xl p-4 space-y-4 self-start"
      style={{
        background: "linear-gradient(180deg, rgba(20,20,30,0.6), rgba(15,15,22,0.5))",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      aria-label="Study notes"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
            📋 Study Notes
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          What makes a clear answer for this concept, and what to watch out for.
        </p>
      </div>

      <NoteBlock
        title="Strong points"
        accent="#34D399"
        items={concept.earnsMarks}
      />
      <NoteBlock
        title="Common mistakes"
        accent="#F87171"
        items={concept.losesMarks}
      />

      <div
        className="rounded-lg p-3"
        style={{
          background: "rgba(251,191,36,0.06)",
          border: "1px solid rgba(251,191,36,0.20)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            💡 Tip
          </span>
        </div>
        <p
          className="text-[12px] text-zinc-300 leading-relaxed [&_strong]:text-amber-200 [&_strong]:font-semibold [&_em]:text-amber-300 [&_code]:font-mono [&_code]:text-amber-300 [&_code]:text-[11.5px]"
          dangerouslySetInnerHTML={{ __html: concept.tip }}
        />
      </div>
    </aside>
  );
}

function NoteBlock({
  title,
  accent,
  items,
}: {
  title: string;
  accent: string;
  items: string[];
}) {
  return (
    <div>
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
        style={{ color: accent }}
      >
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-[12px] text-zinc-300 leading-snug pl-3 relative [&_strong]:text-zinc-100 [&_strong]:font-semibold [&_em]:text-zinc-100 [&_code]:font-mono [&_code]:text-amber-300 [&_code]:text-[11.5px]"
          >
            <span
              className="absolute left-0 top-[7px] w-1 h-1 rounded-full"
              style={{ background: accent }}
              aria-hidden
            />
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
