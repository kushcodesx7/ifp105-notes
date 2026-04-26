import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { loadModuleData } from "@/lib/seed-source";
import type { ContentBlock } from "@/types/content";

// GET /api/admin/courses/[slug]/diff/summary?module=N
//
// Per-module list of every topic's divergence summary. Powers the
// filtered topic picker on /admin/courses/[slug]/diff so the admin
// only sees buttons for topics that actually need attention.
//
// One call returns:
//   [
//     { topicNumber, title, status: "unchanged"|"edited"|"ts-only"|...,
//       questionsTotal, questionsDiverged }
//     ...
//   ]
//
// Fast path: ONE topics query + ONE questions query (joined on
// topic_id). Both filtered to this module. Then per-topic comparison
// against the TS source happens in JS — no per-topic DB roundtrips.

interface DbTopic {
  id: string;
  number: number;
  title: string;
  hook: string | null;
  content_json: ContentBlock[] | null;
  deleted_at: string | null;
}
interface DbQuestion {
  topic_id: string;
  number: number;
  question: string;
  options_json: string[];
  correct_index: number;
  bloom: string | null;
  explanation: string | null;
  deleted_at: string | null;
}

type DiffStatus = "unchanged" | "edited" | "ts-only" | "db-only" | "trashed";

function classifyTopic(
  db: DbTopic | null,
  ts: { title: string; hook: string; content: ContentBlock[] } | null
): DiffStatus {
  if (!db && ts) return "ts-only";
  if (db && !ts) return "db-only";
  if (!db || !ts) return "unchanged";
  if (db.deleted_at) return "trashed";
  const sameContent =
    JSON.stringify(db.content_json ?? []) === JSON.stringify(ts.content);
  const differs =
    db.title !== ts.title ||
    (db.hook ?? "") !== (ts.hook ?? "") ||
    !sameContent;
  return differs ? "edited" : "unchanged";
}

function classifyQuestion(
  db: DbQuestion | undefined,
  ts:
    | {
        question: string;
        options: string[];
        correct_index: number;
        bloom: string | null;
        explanation: string;
      }
    | undefined
): DiffStatus {
  if (!db && ts) return "ts-only";
  if (db && !ts) return "db-only";
  if (!db || !ts) return "unchanged";
  if (db.deleted_at) return "trashed";
  const sameOpts =
    Array.isArray(db.options_json) &&
    db.options_json.length === ts.options.length &&
    db.options_json.every((v, i) => v === ts.options[i]);
  const differs =
    db.question !== ts.question ||
    db.correct_index !== ts.correct_index ||
    (db.bloom ?? null) !== (ts.bloom ?? null) ||
    (db.explanation ?? null) !== (ts.explanation ?? null) ||
    !sameOpts;
  return differs ? "edited" : "unchanged";
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const moduleNumber = parseInt(req.nextUrl.searchParams.get("module") || "", 10);
  if (!Number.isFinite(moduleNumber) || moduleNumber < 1) {
    return Response.json({ error: "module query param required" }, { status: 400 });
  }

  // Resolve course → module
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!course) {
    return Response.json({ error: `Course "${slug}" not found` }, { status: 404 });
  }
  const { data: moduleRow } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", (course as { id: string }).id)
    .eq("number", moduleNumber)
    .maybeSingle();

  // Pull DB topics + questions for this module (one query each).
  let dbTopics: DbTopic[] = [];
  let dbQuestions: DbQuestion[] = [];
  if (moduleRow) {
    const moduleId = (moduleRow as { id: string }).id;
    const [tRes, qRes] = await Promise.all([
      supabase
        .from("topics")
        .select("id, number, title, hook, content_json, deleted_at")
        .eq("module_id", moduleId)
        .order("number", { ascending: true }),
      supabase
        .from("questions")
        .select("topic_id, number, question, options_json, correct_index, bloom, explanation, deleted_at, topics!inner(module_id)")
        .eq("topics.module_id", moduleId),
    ]);
    dbTopics = (tRes.data ?? []) as DbTopic[];
    dbQuestions = (qRes.data ?? []) as DbQuestion[];
  }

  // Pull TS source
  let tsTopics: Array<{
    number: number;
    title: string;
    hook: string;
    content: ContentBlock[];
  }> = [];
  let tsMcq: Record<number, Array<{
    question: string;
    options: string[];
    correct_index: number;
    bloom: string | null;
    explanation: string;
  }>> = {};
  try {
    const data = await loadModuleData(moduleNumber);
    tsTopics = data.topics.map((t) => ({
      number: t.id,
      title: t.title,
      hook: t.hook,
      content: t.content,
    }));
    for (const [topicNumStr, qs] of Object.entries(data.mcq)) {
      tsMcq[parseInt(topicNumStr, 10)] = qs.map((q) => ({
        question: q.q,
        options: q.opts,
        correct_index: q.ans,
        bloom: q.bloom ?? null,
        explanation: q.why,
      }));
    }
  } catch {
    /* unknown module — TS side stays empty */
  }

  // Build per-topic summary across the union of topic numbers
  const topicNumbers = new Set<number>([
    ...dbTopics.map((t) => t.number),
    ...tsTopics.map((t) => t.number),
  ]);

  const summary = Array.from(topicNumbers)
    .sort((a, z) => a - z)
    .map((tNum) => {
      const dbT = dbTopics.find((t) => t.number === tNum) || null;
      const tsT = tsTopics.find((t) => t.number === tNum) || null;
      const topicStatus = classifyTopic(dbT, tsT);

      // Per-question diff for this topic
      const dbQs = dbT
        ? dbQuestions.filter((q) => q.topic_id === dbT.id)
        : [];
      const tsQs = tsMcq[tNum] ?? [];
      const qNumbers = new Set<number>([
        ...dbQs.map((q) => q.number),
        ...tsQs.map((_q, i) => i + 1),
      ]);
      let questionsDiverged = 0;
      for (const n of qNumbers) {
        const dbQ = dbQs.find((q) => q.number === n);
        const tsQ = tsQs[n - 1];
        const s = classifyQuestion(dbQ, tsQ);
        if (s === "edited" || s === "ts-only" || s === "trashed") {
          questionsDiverged++;
        }
      }

      const hasDivergence =
        topicStatus === "edited" ||
        topicStatus === "ts-only" ||
        topicStatus === "trashed" ||
        questionsDiverged > 0;

      return {
        topicNumber: tNum,
        title: tsT?.title ?? dbT?.title ?? `Topic ${tNum}`,
        topicStatus,
        questionsTotal: qNumbers.size,
        questionsDiverged,
        hasDivergence,
      };
    });

  return Response.json(
    { module: moduleNumber, topics: summary },
    {
      headers: {
        // Admin-only, short cache so consecutive module-switches don't
        // re-thrash the DB during a click-through.
        "Cache-Control": "private, max-age=15",
      },
    }
  );
}
