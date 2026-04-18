import "server-only";
import { supabase } from "@/lib/supabase";
import type {
  ContentBlock,
  Topic,
  Question,
  ModuleMcqBank,
} from "@/types/content";

// Server-only loader that reads a module's topics (+ their MCQ bank)
// from the Phase 4 DB tables. Used by the student-facing module pages
// as a read-through-DB adapter: if the DB has content for (course, n),
// we use it; otherwise we fall back to the legacy TS files.
//
// The fallback is the whole point — a corrupt row or a dropped table
// doesn't take students offline, and the TS files remain a disaster-
// recovery source of truth until we're confident the DB copy is clean.
//
// This file is `server-only` because it imports supabase (built with
// the service-role key). Importing it from a client component triggers
// the same "supabaseKey is required" hydration crash the Phase 3 hotfix
// (PR #92) fixed.

export interface LoadedModule {
  /** Student-shaped topics (same shape TopicRenderer consumes). */
  topics: Topic[];
  /** Student-shaped MCQ bank, keyed by topic id within the module. */
  mcq: ModuleMcqBank;
}

/**
 * Load a module's topics + MCQs from the DB. Returns null if:
 *   - The courses/modules/topics/questions tables don't exist yet
 *     (migration pending), OR
 *   - The course slug isn't registered, OR
 *   - The module number isn't in the DB for that course, OR
 *   - The module has zero topics in the DB.
 *
 * Callers should treat null as "fall back to the TS source".
 */
export async function loadModuleFromDB(
  courseSlug: string,
  moduleNumber: number
): Promise<LoadedModule | null> {
  try {
    // Before: 4 SEQUENTIAL round-trips (course → module → topics →
    // questions). Each ~100-200ms to Supabase. Total ~600ms per module
    // page render + each MCQ API hit.
    //
    // After: 2 round-trips via PostgREST embedding.
    //   1. modules JOIN courses ON slug  — resolves module_id with the
    //      course filter baked into the FK join.
    //   2. topics JOIN questions (one-to-many embed) — returns every
    //      topic row with its MCQs inline. PostgREST stitches the
    //      array of questions into each topic row server-side.
    //
    // Cuts total latency ~50%. Big win on the /api/public/mcq cold
    // path which was 2.3s TTFB in the audit.

    // ── 1. Module lookup (course filter via relation join) ──
    const { data: mod } = await supabase
      .from("modules")
      .select("id, course:courses!inner(slug)")
      .eq("courses.slug", courseSlug)
      .eq("number", moduleNumber)
      .maybeSingle();

    const moduleId = (mod as { id: string } | null)?.id;
    if (!moduleId) return null;

    // ── 2. Topics + their questions embedded (one round-trip) ──
    const { data: topicRows } = await supabase
      .from("topics")
      .select(
        `id, number, title, time_min, hook, content_json, order_index,
         questions(number, question, options_json, correct_index, bloom, explanation, difficulty, order_index)`
      )
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true })
      .order("number", { ascending: true });

    if (!topicRows || topicRows.length === 0) return null;

    // ── 3. Transform the embedded shape into the student-side
    //    Topic[] + ModuleMcqBank structures the renderer expects.
    //    PostgREST returns each topic row with a nested `questions`
    //    array; we keep the original sort order but also sort
    //    questions by (order_index, number) client-side in case the
    //    embed arrives unsorted.
    const mcqByTopicNumber: ModuleMcqBank = {};
    const topics: Topic[] = topicRows.map((t) => {
      const tRow = t as {
        id: string;
        number: number;
        title: string;
        time_min: number | null;
        hook: string | null;
        content_json: unknown;
        questions:
          | {
              number: number;
              question: string;
              options_json: unknown;
              correct_index: number;
              bloom: string | null;
              explanation: string | null;
              order_index: number;
            }[]
          | null;
      };

      // content_json: NOT NULL DEFAULT '[]'::jsonb → always an array.
      // Defensive `Array.isArray` in case a hand-edited row is
      // malformed.
      const content: ContentBlock[] = Array.isArray(tRow.content_json)
        ? (tRow.content_json as ContentBlock[])
        : [];

      // Stitch embedded MCQs into the bank keyed by topic number.
      const embedded = tRow.questions || [];
      const sorted = [...embedded].sort(
        (a, b) =>
          (a.order_index ?? 0) - (b.order_index ?? 0) ||
          (a.number ?? 0) - (b.number ?? 0)
      );
      mcqByTopicNumber[tRow.number] = sorted.map((qr) => ({
        q: qr.question,
        opts: Array.isArray(qr.options_json) ? (qr.options_json as string[]) : [],
        ans: qr.correct_index,
        why: qr.explanation || "",
        // bloom is now required on the canonical Question type. If the
        // DB row happens to carry null (old / imported content) we
        // default to "understand" — the least noisy assumption for
        // content that clearly exists at or above the recall level.
        bloom: (qr.bloom as Question["bloom"]) || "understand",
      }));

      return {
        id: tRow.number,
        title: tRow.title,
        time: tRow.time_min ? `~${tRow.time_min} mins` : "",
        badges: [], // Phase 6+ reintroduces star/hot badges on DB rows
        hook: tRow.hook || "",
        content,
      };
    });

    return { topics, mcq: mcqByTopicNumber };
  } catch {
    // Any unexpected error → fall back to TS. Not worth bringing down
    // a student session over a transient DB hiccup.
    return null;
  }
}
