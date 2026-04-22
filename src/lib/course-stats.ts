// Course-wide content stats — SINGLE source of truth for any number
// that counts questions or flashcards across the whole course.
//
// Previously each page did its own sum:
//   · /app/page.tsx              computed TOTAL_QUESTIONS inline
//   · /admin/courses/[slug]/page.tsx  hard-coded "370 MCQs" in a <p>
//   · seed-ict comment said "~336 question upserts"
//
// Three calculations of the same number, all drifting with every
// content rewrite. Now: ONE computation here, every consumer imports
// from this file.
//
// Sums at module-evaluation time (not per render). The 5 MCQ files
// are ~480 objects of string/number; bundler cost is negligible and
// tree-shaking still drops unused exports from client chunks. If we
// ever add a 6th module, extend MODULE_MCQ_DATA and MODULE_FLASHCARD_
// DATA below — every other file keeps working unchanged.

import { mcqData as _m1 } from "@/data/module1-mcq";
import { mcqData as _m2 } from "@/data/module2-mcq";
import { mcqData as _m3 } from "@/data/module3-mcq";
import { mcqData as _m4 } from "@/data/module4-mcq";
import { mcqData as _m5 } from "@/data/module5-mcq";
import { flashcardData } from "@/data/flashcards";
import { MODULES } from "@/lib/modules";

type TopicMcq = Record<number, { q: string; opts: string[]; ans: number }[]>;

const MODULE_MCQ_DATA: Record<number, TopicMcq> = {
  1: _m1 as TopicMcq,
  2: _m2 as TopicMcq,
  3: _m3 as TopicMcq,
  4: _m4 as TopicMcq,
  5: _m5 as TopicMcq,
};

// ── Question counts ────────────────────────────────────────────

/**
 * How many MCQs exist in (module, topic)? Returns 0 if the module
 * or topic doesn't exist so callers don't have to null-check.
 */
export function getTopicQuestionCount(
  moduleId: number,
  topicId: number
): number {
  const mod = MODULE_MCQ_DATA[moduleId];
  if (!mod) return 0;
  const topic = mod[topicId];
  return Array.isArray(topic) ? topic.length : 0;
}

/** How many MCQs exist in a module (summed across all topics)? */
export function getModuleQuestionCount(moduleId: number): number {
  const mod = MODULE_MCQ_DATA[moduleId];
  if (!mod) return 0;
  return Object.values(mod).reduce(
    (s, arr) => s + (Array.isArray(arr) ? arr.length : 0),
    0
  );
}

/**
 * Every module's MCQ count, keyed by module id. Use this when you
 * need ALL counts at once (admin dashboard, course-stats card).
 * Lazy-memoised since the underlying data never changes at runtime.
 */
let _moduleCounts: Record<number, number> | null = null;
export function getAllModuleQuestionCounts(): Record<number, number> {
  if (_moduleCounts) return _moduleCounts;
  const out: Record<number, number> = {};
  for (const m of MODULES) out[m.id] = getModuleQuestionCount(m.id);
  _moduleCounts = out;
  return out;
}

/**
 * Total MCQs across the whole course. Today ~480 (10 × 48 topics,
 * give-or-take a few topics that shrunk in the recent rewrites).
 * Computed once at module load, frozen afterwards.
 */
export const TOTAL_QUESTIONS = MODULES.reduce(
  (sum, m) => sum + getModuleQuestionCount(m.id),
  0
);

// ── Flashcard counts ───────────────────────────────────────────

/** How many flashcards exist in (module, topic)? 0 if missing. */
export function getTopicFlashcardCount(
  moduleId: number,
  topicId: number
): number {
  const mod = flashcardData[moduleId];
  if (!mod) return 0;
  const topic = mod[topicId];
  return Array.isArray(topic) ? topic.length : 0;
}

/** How many flashcards exist in a module (summed across topics)? */
export function getModuleFlashcardCount(moduleId: number): number {
  const mod = flashcardData[moduleId];
  if (!mod) return 0;
  return Object.values(mod).reduce(
    (s, arr) => s + (Array.isArray(arr) ? arr.length : 0),
    0
  );
}

/** Total flashcards across the course. */
export const TOTAL_FLASHCARDS = MODULES.reduce(
  (sum, m) => sum + getModuleFlashcardCount(m.id),
  0
);

// ── Module iteration ───────────────────────────────────────────
//
// MODULE_IDS replaces every hardcoded `[1, 2, 3, 4, 5]` in the
// codebase. Derived from MODULES so a 6th module automatically
// rolls everywhere.
export const MODULE_IDS: number[] = MODULES.map((m) => m.id);
