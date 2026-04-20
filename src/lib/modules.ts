// Single source of truth for module metadata.
// Previously TOTAL_TOPICS = 48 was hard-coded in /api/connect,
// /api/connect/glimpse, /api/admin/summary, and /api/progress/admin.
// Change one module's topic count and four files silently drift. Never again.
//
// Phase 2: `ModuleMeta` now lives in src/types/content.ts; this file is
// the DATA for ICT. The registry (src/lib/course-registry.ts) is the
// public API — API routes and components should import from there, not
// here. This file will be consumed by the registry (today) or by a
// seeder that ports these literals into the DB (Phase 3).

import type { ModuleMeta } from "@/types/content";

export type { ModuleMeta };

export const MODULES: ModuleMeta[] = [
  { id: 1, title: "Hardware", fullTitle: "Hardware & Software",  subtitle: "Computer fundamentals",    accent: "#6366F1", topicCount: 11 },
  { id: 2, title: "Office",   fullTitle: "Office Automation",    subtitle: "Word, Excel, PowerPoint",  accent: "#10B981", topicCount: 9 },
  { id: 3, title: "Social",   fullTitle: "Social Media",         subtitle: "Internet & web basics",    accent: "#3B82F6", topicCount: 7 },
  { id: 4, title: "HTML",     fullTitle: "HTML & Web Dev",       subtitle: "Building web pages",       accent: "#06B6D4", topicCount: 11 },
  { id: 5, title: "Tech",     fullTitle: "Tech Trends",          subtitle: "Modern tech landscape",    accent: "#8B5CF6", topicCount: 10 },
];

export const TOTAL_TOPICS = MODULES.reduce((sum, m) => sum + m.topicCount, 0);

// Lookup helpers
export const MODULE_TOTALS: Record<number, number> = Object.fromEntries(
  MODULES.map((m) => [m.id, m.topicCount])
);

export function getModule(id: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}

/**
 * Module-weighted completion percentage.
 *
 * Every module counts equally (with 5 modules, each = 20% of overall
 * completion). A student who finishes Module 1 sees 20%, not
 * "11/48 = 23%". Rationale: the teacher's mental model is
 * "how many modules done?" and uneven topic counts per module made
 * the flat percentage confusing — finishing the 11-topic Module 1
 * read higher than finishing the 7-topic Module 3 despite being one
 * module either way.
 *
 * Usage:
 *   moduleWeightedPct({ 1: 11, 2: 0, 3: 0, 4: 0, 5: 0 }) // 20
 *   moduleWeightedPct({ 1: 11, 2: 9, 3: 0, 4: 0, 5: 0 }) // 40
 *   moduleWeightedPct({ 1: 5,  2: 0, 3: 0, 4: 0, 5: 0 }) // 9
 *     (5 of 11 = 45% of Module 1 = 9% of overall)
 */
export function moduleWeightedPct(
  completedByModule: Record<number, number>
): number {
  if (MODULES.length === 0) return 0;
  const perModuleWeight = 100 / MODULES.length;
  let total = 0;
  for (const m of MODULES) {
    const done = completedByModule[m.id] || 0;
    const clampedDone = Math.min(done, m.topicCount);
    if (m.topicCount > 0) {
      total += (clampedDone / m.topicCount) * perModuleWeight;
    }
  }
  return Math.round(total);
}
