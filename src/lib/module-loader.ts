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

// ── Shape of a single row returned by the get_module_bundle RPC. ──
// Kept in sync with scripts/migration-module-bundle-rpc.sql.
interface BundleRow {
  topic_id: string;
  topic_number: number;
  topic_title: string;
  topic_time_min: number | null;
  topic_hook: string | null;
  topic_content_json: unknown;
  topic_order_index: number | null;
  questions:
    | {
        number: number;
        question: string;
        options_json: unknown;
        correct_index: number;
        bloom: string | null;
        explanation: string | null;
        order_index: number | null;
      }[]
    | null;
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
 *
 * Performance path (Apr 2026):
 *   1. PRIMARY — one `get_module_bundle` RPC call. One round-trip to
 *      Supabase; the Postgres function joins courses → modules →
 *      topics, embeds questions, and returns a single result set.
 *   2. FALLBACK — if the RPC doesn't exist (migration pending) OR
 *      the RPC call errors for any reason, we retry with the
 *      previous two-query embed path so existing deployments keep
 *      working without a hard dependency on the migration.
 *
 * The combined win: typical cold-path drops from ~600ms (original 4
 * sequential queries) → ~300ms (2 queries after the first optimisation)
 * → ~150ms (single RPC call).
 */
export async function loadModuleFromDB(
  courseSlug: string,
  moduleNumber: number
): Promise<LoadedModule | null> {
  // Primary: single RPC call. Preferred path when the migration has
  // been applied.
  const viaRpc = await loadViaRpc(courseSlug, moduleNumber);
  if (viaRpc !== "rpc-missing") return viaRpc;

  // Fallback: the previous two-query path. Keeps the site working
  // even when an admin hasn't applied migration-module-bundle-rpc.sql
  // yet.
  return loadViaEmbed(courseSlug, moduleNumber);
}

/**
 * Single-round-trip loader via the `get_module_bundle` Postgres
 * function. Returns:
 *   - LoadedModule        — rows found, module has content
 *   - null                — rows empty (module exists but no topics)
 *   - "rpc-missing"       — the function isn't defined in this DB
 *                           (migration pending) — caller should fall
 *                           back to the embed path
 */
async function loadViaRpc(
  courseSlug: string,
  moduleNumber: number
): Promise<LoadedModule | null | "rpc-missing"> {
  try {
    const { data, error } = await supabase.rpc("get_module_bundle", {
      p_course_slug: courseSlug,
      p_module_number: moduleNumber,
    });

    if (error) {
      // "function does not exist" (42883) OR "could not find the
      // function in the schema cache" (PGRST202) = migration hasn't
      // landed yet. Signal fallback rather than treat as "no content".
      if (
        /function.*does not exist|42883|PGRST202|could not find the function/i.test(
          error.message
        )
      ) {
        return "rpc-missing";
      }
      // Other errors — treat as "no DB content" so the caller falls
      // through to the TS source. Don't bring the module page down
      // over a transient DB hiccup.
      return null;
    }

    const rows = (data ?? []) as BundleRow[];
    if (rows.length === 0) return null;
    return transformBundleRows(rows);
  } catch {
    // Any unexpected throw → let the caller fall back.
    return "rpc-missing";
  }
}

/**
 * Fallback two-query path. Preserves the previous behaviour for
 * deployments where the RPC migration hasn't been applied.
 */
async function loadViaEmbed(
  courseSlug: string,
  moduleNumber: number
): Promise<LoadedModule | null> {
  try {
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
         questions(number, question, options_json, correct_index, bloom, explanation, difficulty, order_index, deleted_at)`
      )
      .eq("module_id", moduleId)
      .is("deleted_at", null)
      .order("order_index", { ascending: true })
      .order("number", { ascending: true });

    if (!topicRows || topicRows.length === 0) return null;

    // Shape the embed result into the same BundleRow[] the RPC
    // transform expects, so the downstream code path is shared.
    const bundleRows: BundleRow[] = topicRows.map((t) => {
      const tRow = t as {
        id: string;
        number: number;
        title: string;
        time_min: number | null;
        hook: string | null;
        content_json: unknown;
        order_index: number | null;
        questions:
          | {
              number: number;
              question: string;
              options_json: unknown;
              correct_index: number;
              bloom: string | null;
              explanation: string | null;
              difficulty: string | null;
              order_index: number | null;
              deleted_at: string | null;
            }[]
          | null;
      };
      // Drop soft-deleted questions client-side — PostgREST doesn't
      // predicate-filter embedded relations here so we have to. Strip
      // the extra columns (difficulty, deleted_at) that the embed
      // selects but the RPC doesn't so both paths produce an identical
      // BundleRow shape.
      const live = (tRow.questions || []).filter((q) => !q.deleted_at);
      return {
        topic_id: tRow.id,
        topic_number: tRow.number,
        topic_title: tRow.title,
        topic_time_min: tRow.time_min,
        topic_hook: tRow.hook,
        topic_content_json: tRow.content_json,
        topic_order_index: tRow.order_index,
        questions: live.map((q) => ({
          number: q.number,
          question: q.question,
          options_json: q.options_json,
          correct_index: q.correct_index,
          bloom: q.bloom,
          explanation: q.explanation,
          order_index: q.order_index,
        })),
      };
    });

    return transformBundleRows(bundleRows);
  } catch {
    // Any unexpected error → fall back to TS. Not worth bringing down
    // a student session over a transient DB hiccup.
    return null;
  }
}

/**
 * Shared transform: BundleRow[] (from either the RPC or the embed
 * fallback) → the student-shaped { topics, mcq } the TopicRenderer
 * consumes. Single code path means the two paths can never produce
 * subtly different student-visible output.
 */
function transformBundleRows(rows: BundleRow[]): LoadedModule {
  const mcqByTopicNumber: ModuleMcqBank = {};
  const topics: Topic[] = rows.map((row) => {
    // content_json: NOT NULL DEFAULT '[]'::jsonb → always an array.
    // Defensive `Array.isArray` in case a hand-edited row is malformed.
    const content: ContentBlock[] = Array.isArray(row.topic_content_json)
      ? (row.topic_content_json as ContentBlock[])
      : [];

    // Sort questions client-side as a belt-and-suspenders check even
    // though the RPC already sorts by (order_index, number).
    const qs = Array.isArray(row.questions) ? row.questions : [];
    const sorted = [...qs].sort(
      (a, b) =>
        (a.order_index ?? 0) - (b.order_index ?? 0) ||
        (a.number ?? 0) - (b.number ?? 0)
    );
    mcqByTopicNumber[row.topic_number] = sorted.map((qr) => ({
      q: qr.question,
      opts: Array.isArray(qr.options_json) ? (qr.options_json as string[]) : [],
      ans: qr.correct_index,
      why: qr.explanation || "",
      // bloom is required on the canonical Question type. If the DB
      // row happens to carry null (old / imported content) we default
      // to "understand" — least-noisy assumption for content that
      // clearly exists at or above the recall level.
      bloom: (qr.bloom as Question["bloom"]) || "understand",
    }));

    return {
      id: row.topic_number,
      title: row.topic_title,
      time: row.topic_time_min ? `~${row.topic_time_min} mins` : "",
      badges: [], // Phase 6+ reintroduces star/hot badges on DB rows
      hook: row.topic_hook || "",
      content,
    };
  });

  return { topics, mcq: mcqByTopicNumber };
}
