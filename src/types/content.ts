// Canonical content types for the whole platform.
//
// Phase 1 (now): re-exports / aliases over the existing shapes that live
// in src/data/module1-topics.ts + module1-mcq.ts. Why here and not
// there? Because data files describe content; types/ describes the
// model. Future courses (Python, Data Science) won't live next to
// module1-topics.ts — they'll live in the DB. Types must be in a
// course-agnostic place so every caller can import them without
// depending on IFP105's files.
//
// Phase 2+ will make these the authoritative interfaces and the data
// files will `import type` from here. Today we keep them wire-compatible
// with the data-file exports so nothing breaks.

import type { BloomLevel } from "@/lib/blooms";

// ── Content block union (paragraphs, images, cards, callouts, tables) ──
// This is the "rich text" representation stored in a topic. Keep in
// sync with TopicRenderer.tsx's switch and the data files' inline use.

export interface TopicCard {
  icon: string;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

export interface EraCard {
  icon: string;
  period: string;
  title: string;
  description: string;
  limitation: string;
}

export interface TableRow {
  cells: string[];
}

export interface StepItem {
  title: string;
  description: string;
}

export type ContentBlock =
  | { type: "text"; html: string }
  | { type: "cards"; columns: 2 | 3 | 4; items: TopicCard[] }
  | { type: "era-cards"; columns: 4; items: EraCard[] }
  | {
      type: "callout";
      variant?: "amber" | "blue" | "red" | "purple" | "dark";
      html: string;
    }
  | { type: "analogy"; label: string; html: string }
  | { type: "table"; headers: string[]; rows: TableRow[] }
  | { type: "steps"; items: StepItem[] }
  | { type: "image"; src?: string; description: string };

// ── A learning topic (what used to be "Topic 1 of Module 1") ──
// `id` is unique within its module (not globally). `content` is the
// ordered list of blocks rendered inside TopicRenderer.

export interface Topic {
  id: number;
  title: string;
  time: string;
  badges: { text: string; type: "star" | "hot" }[];
  hook: string;
  content: ContentBlock[];
}

// ── An MCQ question (shape stored in moduleN-mcq.ts + the DB in Phase 3) ──
// `ans` is the 0-based index of the correct option in `opts`. `bloom`
// tags where this question sits on Bloom's taxonomy ladder.

export interface Question {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: BloomLevel;
}

// Convenience: a course's MCQ bank keyed by topic id within a module.
export type ModuleMcqBank = Record<number, Question[]>;

// ── A module (a chapter of the course) ──
// `topicCount` is authoritative — API routes derive completion % from
// it and the home page shows "N topics" labels from it.

export interface ModuleMeta {
  id: number;
  // Short label used in admin grids and compact UIs (e.g. "Hardware").
  title: string;
  // Optional full title shown to students in the Navbar dropdown and
  // module hero ("Hardware & Software"). Falls back to `title` if not
  // provided — callers doing `m.fullTitle ?? m.title` always get a
  // usable string.
  fullTitle?: string;
  subtitle: string;
  accent: string;
  topicCount: number;
}

// ── A course (the new abstraction — Phase 1 just has one: "ict") ──
// Phase 2+ will extend this with `description`, `icon`, `active`,
// `batches[]`, etc. For now, everything above the course level is
// derived from data files via src/lib/course-registry.ts.

export interface Course {
  slug: string; // "ict", "python", … — used in URLs and storage keys
  code: string; // "IFP105" — editable display code shown to students
  name: string; // "ICT Fundamentals" — full human-readable title
  description: string;
  accent: string;
  modules: ModuleMeta[];
}

// Re-export BloomLevel so downstream files can `import type { BloomLevel } from "@/types/content"`
// without needing to know blooms.ts exists.
export type { BloomLevel };
