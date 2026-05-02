"use client";

import { useEffect, useMemo, useState } from "react";
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
// the fundamental ideas in the IFP105 syllabus. Master them and the
// student can answer ANY ICT question with confidence. The framing is
// NEVER "this will come on the exam".
//
// Each concept renders as a card with two columns on desktop:
//   · LEFT  — student's model answer (Define / Explain / Example /
//             Diagram / Key phrases)
//   · RIGHT — examiner's notes (earns marks / loses marks / tip)
// On mobile, the two columns stack.
//
// Studied state is per-concept, 3-state (not-yet · reviewed · confident),
// stored in a single localStorage key. 3 states match the confidence
// ratings already used in McqQuiz so the vocabulary stays consistent.

type Status = "not-yet" | "reviewed" | "confident";

const STORAGE_KEY = "examPrep:coreConcepts:v1";

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

  // Hydrate statuses from localStorage AFTER mount so SSR and the
  // first client render are byte-identical (no studied chips on first
  // paint), avoiding hydration mismatches.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatuses(loadStatuses());
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
          Master These — Answer Anything
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          These are the fundamental ICT concepts in your IFP105 syllabus. Practice
          the <strong className="text-indigo-300">D·E·E·D method</strong> on each
          one — if you can write all of them clearly, you&rsquo;ll handle any ICT
          question with confidence in exams, assignments, and real life.
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
              Your preparation:
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
              onToggle={() => setOpenId((cur) => (cur === c.id ? null : c.id))}
              onBumpStatus={() => bumpStatus(c.id)}
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
  onToggle,
  onBumpStatus,
}: {
  concept: TConceptCard;
  status: Status;
  isOpen: boolean;
  onToggle: () => void;
  onBumpStatus: () => void;
}) {
  const groupMeta = CONCEPT_GROUPS[concept.group];
  const statusMeta = STATUS_LABELS[status];

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
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
           load for collapsed cards. */}
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
              <div className="grid lg:grid-cols-[1fr_320px] gap-5">
                {/* LEFT — student's model answer */}
                <div className="min-w-0">
                  <ModelAnswer concept={concept} />
                </div>
                {/* RIGHT — examiner's notes */}
                <ExaminerNotes concept={concept} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
            🎯 Key phrases the examiner wants
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

// ─── Examiner notes (right panel) ─────────────────────────────────

function ExaminerNotes({ concept }: { concept: TConceptCard }) {
  return (
    <aside
      className="rounded-xl p-4 space-y-4 self-start"
      style={{
        background: "linear-gradient(180deg, rgba(20,20,30,0.6), rgba(15,15,22,0.5))",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      aria-label="Examiner's notes"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
            📋 Examiner&rsquo;s Notes
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          What earns and loses marks for this specific concept.
        </p>
      </div>

      <NoteBlock
        title="Earns marks"
        accent="#34D399"
        items={concept.earnsMarks}
      />
      <NoteBlock
        title="Loses marks"
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
