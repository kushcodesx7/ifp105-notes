// Shared loader for the TS-source content backing each module.
//
// Both the bulk re-seed (/api/admin/seed-ict) and the per-topic diff
// page (/admin/courses/[slug]/diff) need to pull the canonical TS
// content for a given module. Extracted from the seed-ict route so
// the two consumers can't drift on which file is authoritative for
// each module number.
//
// Dynamic `await import(...)` so callers don't bundle all 5 modules'
// content into their server chunk — each call pulls the one it
// needs on demand.

import type { ContentBlock } from "@/types/content";

export interface TsTopicRow {
  /** TS files use `id` for the topic NUMBER (1..N), not a uuid. */
  id: number;
  title: string;
  time: string;
  hook: string;
  content: ContentBlock[];
}

export interface TsMcqRow {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: string;
}

export interface TsModuleData {
  topics: TsTopicRow[];
  mcq: Record<number, TsMcqRow[]>;
}

export async function loadModuleData(
  moduleNumber: number
): Promise<TsModuleData> {
  switch (moduleNumber) {
    case 1: {
      const [t, m] = await Promise.all([
        import("@/data/module1-topics"),
        import("@/data/module1-mcq"),
      ]);
      return {
        topics: t.topics as TsTopicRow[],
        mcq: m.mcqData as Record<number, TsMcqRow[]>,
      };
    }
    case 2: {
      const [t, m] = await Promise.all([
        import("@/data/module2-topics"),
        import("@/data/module2-mcq"),
      ]);
      return {
        topics: t.topics as TsTopicRow[],
        mcq: m.mcqData as Record<number, TsMcqRow[]>,
      };
    }
    case 3: {
      const [t, m] = await Promise.all([
        import("@/data/module3-topics"),
        import("@/data/module3-mcq"),
      ]);
      return {
        topics: t.topics as TsTopicRow[],
        mcq: m.mcqData as Record<number, TsMcqRow[]>,
      };
    }
    case 4: {
      const [t, m] = await Promise.all([
        import("@/data/module4-topics"),
        import("@/data/module4-mcq"),
      ]);
      return {
        topics: t.topics as TsTopicRow[],
        mcq: m.mcqData as Record<number, TsMcqRow[]>,
      };
    }
    case 5: {
      const [t, m] = await Promise.all([
        import("@/data/module5-topics"),
        import("@/data/module5-mcq"),
      ]);
      return {
        topics: t.topics as TsTopicRow[],
        mcq: m.mcqData as Record<number, TsMcqRow[]>,
      };
    }
    default:
      throw new Error(`Unknown module number: ${moduleNumber}`);
  }
}

/** Parse "~4 mins" → 4. Topic rows store `time_min` as INT in DB;
 *  TS files use strings like "~4 mins" / "5 min" / "". */
export function parseTimeMin(time: string): number | null {
  const match = /(\d+)/.exec(time || "");
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}
