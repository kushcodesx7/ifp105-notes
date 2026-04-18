// Bloom's Taxonomy metadata — single source of truth.
//
// Every MCQ in src/data/module*-mcq.ts carries a `bloom` tag. This file
// provides the UI-facing labels, icons, colours, and one-line descriptions
// so the quiz, results screen, and (future) dashboard render consistently.
//
// Design goals:
//  1. Teach the ladder inside the UI — students should recognise "Analyze"
//     feels different from "Remember" after a few quizzes.
//  2. Colour-code so the ladder is visible at a glance (cool → warm as the
//     cognitive demand increases).
//  3. Keep labels short; the description is optional and only shown in
//     tooltips or expanded views.

export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export interface BloomMeta {
  level: BloomLevel;
  label: string;
  icon: string;
  // Tailwind-safe hex so components can use inline styles without
  // fighting the JIT purge — keeps colours consistent across locations.
  color: string;
  bgTint: string; // semi-transparent for badge backgrounds
  borderTint: string;
  description: string; // one-line "what this question asks of you"
}

export const BLOOM_META: Record<BloomLevel, BloomMeta> = {
  remember: {
    level: "remember",
    label: "Remember",
    icon: "🧠",
    color: "#60A5FA", // blue — coolest, entry-level
    bgTint: "rgba(96,165,250,0.12)",
    borderTint: "rgba(96,165,250,0.25)",
    description: "Recall a fact or definition.",
  },
  understand: {
    level: "understand",
    label: "Understand",
    icon: "💡",
    color: "#22D3EE", // cyan
    bgTint: "rgba(34,211,238,0.12)",
    borderTint: "rgba(34,211,238,0.25)",
    description: "Explain an idea in your own words.",
  },
  apply: {
    level: "apply",
    label: "Apply",
    icon: "🔧",
    color: "#34D399", // emerald
    bgTint: "rgba(52,211,153,0.12)",
    borderTint: "rgba(52,211,153,0.25)",
    description: "Use what you know in a new situation.",
  },
  analyze: {
    level: "analyze",
    label: "Analyze",
    icon: "🔍",
    color: "#A78BFA", // violet
    bgTint: "rgba(167,139,250,0.12)",
    borderTint: "rgba(167,139,250,0.25)",
    description: "Break it down — compare, contrast, or debug.",
  },
  evaluate: {
    level: "evaluate",
    label: "Evaluate",
    icon: "⚖️",
    color: "#FBBF24", // amber
    bgTint: "rgba(251,191,36,0.12)",
    borderTint: "rgba(251,191,36,0.25)",
    description: "Judge the best approach and justify it.",
  },
  create: {
    level: "create",
    label: "Create",
    icon: "✨",
    color: "#F472B6", // pink — warmest, highest cognitive demand
    bgTint: "rgba(244,114,182,0.12)",
    borderTint: "rgba(244,114,182,0.25)",
    description: "Design, construct, or combine into something new.",
  },
};

// Canonical order — follows the ladder from simplest to most advanced.
// Use this when iterating over all levels (e.g. breakdown table).
export const BLOOM_ORDER: BloomLevel[] = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
];

// ─── Confidence meter ─────────────────────────────────────────────────
// Shown after the student picks an answer but BEFORE the reveal. Ties
// into Bloom's metacognition — thinking about your own thinking.

export type ConfidenceLevel = "guessing" | "maybe" | "pretty-sure" | "certain";

export interface ConfidenceMeta {
  level: ConfidenceLevel;
  label: string;
  emoji: string;
  color: string;
  weight: number; // 1..4, used for calibration math
}

export const CONFIDENCE_META: Record<ConfidenceLevel, ConfidenceMeta> = {
  guessing: { level: "guessing", label: "Guessing", emoji: "😟", color: "#EF4444", weight: 1 },
  maybe: { level: "maybe", label: "Maybe", emoji: "😐", color: "#F59E0B", weight: 2 },
  "pretty-sure": { level: "pretty-sure", label: "Pretty sure", emoji: "😊", color: "#10B981", weight: 3 },
  certain: { level: "certain", label: "Certain", emoji: "🤩", color: "#6366F1", weight: 4 },
};

export const CONFIDENCE_ORDER: ConfidenceLevel[] = [
  "guessing",
  "maybe",
  "pretty-sure",
  "certain",
];
