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
    // 1. Resolve course_id by slug. If the courses table is missing or
    //    this slug isn't there, bail to fallback.
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", courseSlug)
      .maybeSingle();

    const courseId = (course as { id: string } | null)?.id;
    if (!courseId) return null;

    // 2. Resolve the module row by (course_id, number).
    const { data: mod } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .eq("number", moduleNumber)
      .maybeSingle();

    const moduleId = (mod as { id: string } | null)?.id;
    if (!moduleId) return null;

    // 3. Load topics in order.
    const { data: topicRows } = await supabase
      .from("topics")
      .select("id, number, title, time_min, hook, content_json, order_index")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true })
      .order("number", { ascending: true });

    if (!topicRows || topicRows.length === 0) return null;

    // 4. Load all questions for these topics in one round-trip so we
    //    don't do N+1 round-trips during SSR.
    const topicIds = topicRows.map((t) => t.id as string);
    const { data: qRows } = await supabase
      .from("questions")
      .select(
        "topic_id, number, question, options_json, correct_index, bloom, explanation, difficulty, order_index"
      )
      .in("topic_id", topicIds)
      .order("order_index", { ascending: true })
      .order("number", { ascending: true });

    // 5. Transform into the student-shaped structures. The DB schema
    //    is authoring-oriented (full_title, time_min, etc.); the
    //    renderer wants the legacy TS shape. This adapter is the
    //    single place that translation happens.
    const mcqByTopicNumber: ModuleMcqBank = {};
    const topics: Topic[] = topicRows.map((t) => {
      const tRow = t as {
        id: string;
        number: number;
        title: string;
        time_min: number | null;
        hook: string | null;
        content_json: unknown;
      };

      // content_json is stored as JSONB — trust it was written by the
      // block editor which enforces the ContentBlock shape. If it's
      // not an array (shouldn't happen — `content_json NOT NULL DEFAULT
      // '[]'`) we default to empty so the page still renders.
      const content: ContentBlock[] = Array.isArray(tRow.content_json)
        ? (tRow.content_json as ContentBlock[])
        : [];

      return {
        id: tRow.number,
        title: tRow.title,
        time: tRow.time_min ? `~${tRow.time_min} mins` : "",
        badges: [], // Phase 6+ reintroduces star/hot badges on DB rows
        hook: tRow.hook || "",
        content,
      };
    });

    for (const q of qRows || []) {
      const qr = q as {
        topic_id: string;
        number: number;
        question: string;
        options_json: unknown;
        correct_index: number;
        bloom: string | null;
        explanation: string | null;
      };
      // Map topic UUID → topic number for the MCQ bank key.
      const topicRow = topicRows.find((t) => (t.id as string) === qr.topic_id);
      if (!topicRow) continue;
      const topicNumber = (topicRow as { number: number }).number;

      if (!mcqByTopicNumber[topicNumber]) mcqByTopicNumber[topicNumber] = [];
      const opts: string[] = Array.isArray(qr.options_json)
        ? (qr.options_json as string[])
        : [];
      const question: Question = {
        q: qr.question,
        opts,
        ans: qr.correct_index,
        why: qr.explanation || "",
        bloom: (qr.bloom || undefined) as Question["bloom"],
      };
      mcqByTopicNumber[topicNumber].push(question);
    }

    return { topics, mcq: mcqByTopicNumber };
  } catch {
    // Any unexpected error → fall back to TS. Not worth bringing down
    // a student session over a transient DB hiccup.
    return null;
  }
}
