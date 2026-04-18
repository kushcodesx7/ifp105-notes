// Section-accent palette — the six hues that brand /connect section
// pills, home-page widgets, and the activity ticker. Previously
// duplicated in three files (connect page, HomeConnectGlimpse,
// HomeActivityStrip). Now the single source of truth.
//
// The palette is deliberately section-stable: "Section 1" always shows
// the same indigo, "Section 2" always the same emerald, etc. Any
// new UI that needs to reference a section's colour should import
// `sectionColor()` here — do NOT redeclare the table.

export interface SectionColor {
  from: string;
  to: string;
  glow: string;
  dot: string;
}

export const SECTION_COLORS: Record<string, SectionColor> = {
  "Section 1": {
    from: "#6366F1",
    to: "#8B5CF6",
    glow: "rgba(99,102,241,0.35)",
    dot: "#6366F1",
  },
  "Section 2": {
    from: "#10B981",
    to: "#059669",
    glow: "rgba(16,185,129,0.35)",
    dot: "#10B981",
  },
  "Section 3": {
    from: "#3B82F6",
    to: "#06B6D4",
    glow: "rgba(59,130,246,0.35)",
    dot: "#3B82F6",
  },
  "Section 4": {
    from: "#06B6D4",
    to: "#0EA5E9",
    glow: "rgba(6,182,212,0.35)",
    dot: "#06B6D4",
  },
  "Section 5": {
    from: "#8B5CF6",
    to: "#EC4899",
    glow: "rgba(139,92,246,0.35)",
    dot: "#8B5CF6",
  },
  "Section 6": {
    from: "#F59E0B",
    to: "#EF4444",
    glow: "rgba(245,158,11,0.35)",
    dot: "#F59E0B",
  },
};

const NEUTRAL: SectionColor = {
  from: "#71717a",
  to: "#52525b",
  glow: "rgba(113,113,122,0.25)",
  dot: "#71717a",
};

/**
 * Look up a section's palette. Unknown / null sections return a neutral
 * grey — safe to use unconditionally.
 */
export function sectionColor(section: string | null | undefined): SectionColor {
  if (!section) return NEUTRAL;
  return SECTION_COLORS[section] ?? NEUTRAL;
}

/** Convenience: just the dot colour. Used where only a single hex is needed. */
export function sectionDot(section: string | null | undefined): string {
  return sectionColor(section).dot;
}
