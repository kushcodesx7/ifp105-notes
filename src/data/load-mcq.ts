// Lazy-loaded MCQ dispatcher.
//
// Two-step resolution: DB first, TS fallback.
//
//   1. Hit /api/public/mcq/:module?course=<slug>. Server reads the DB
//      (via module-loader). If the module is in DB, we get the MCQ bank
//      as JSON and return it.
//   2. If the endpoint returns { mcq: null } (DB empty / table missing),
//      fall through to the legacy dynamic-import path below. Each branch
//      of the switch is a literal specifier so webpack/turbopack can
//      code-split each module's bank into its own chunk — the Phase 1
//      perf win remains for TS-sourced courses.
//
// The returned type matches the canonical `Question` interface in
// src/types/content.ts so callers don't care where the data came from.
// `Question` used to be redeclared here; it's now re-exported for
// backward-compat only — prefer importing from "@/types/content"
// directly in new code.

import type { Question, ModuleMcqBank } from "@/types/content";

export type { Question };

async function loadFromDB(
  courseSlug: string,
  moduleNumber: number
): Promise<ModuleMcqBank | null> {
  try {
    const res = await fetch(
      `/api/public/mcq/${moduleNumber}?course=${encodeURIComponent(courseSlug)}`,
      {
        // SWR-friendly — the endpoint already sets Cache-Control.
        cache: "default",
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { mcq: ModuleMcqBank | null };
    return json.mcq;
  } catch {
    return null;
  }
}

async function loadFromTS(moduleNumber: number): Promise<ModuleMcqBank> {
  switch (moduleNumber) {
    case 1:
      return (await import("@/data/module1-mcq")).mcqData;
    case 2:
      return (await import("@/data/module2-mcq")).mcqData;
    case 3:
      return (await import("@/data/module3-mcq")).mcqData;
    case 4:
      return (await import("@/data/module4-mcq")).mcqData;
    case 5:
      return (await import("@/data/module5-mcq")).mcqData;
    default:
      return {};
  }
}

export async function loadMcqData(
  moduleNumber: number,
  courseSlug = "ict"
): Promise<ModuleMcqBank> {
  // 1. DB first (lets teacher edits propagate to students within ~60s).
  const fromDb = await loadFromDB(courseSlug, moduleNumber);
  if (fromDb && Object.keys(fromDb).length > 0) return fromDb;

  // 2. TS fallback — keeps the code-split lazy-load for the bundled files.
  return loadFromTS(moduleNumber);
}
