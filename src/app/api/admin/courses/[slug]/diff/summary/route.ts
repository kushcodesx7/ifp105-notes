import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { loadModuleData } from "@/lib/seed-source";
import { jsonEqualNormalised } from "@/lib/json-equal";
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
  // Normalised deep-equal (sorts keys, drops undefined) so JSONB
  // round-trip doesn't produce ghost-diff false positives.
  const sameContent = jsonEqualNormalised(db.content_json ?? [], ts.content);
  const differs =
    (db.title ?? "").trim() !== (ts.title ?? "").trim() ||
    (db.hook ?? "").trim() !== (ts.hook ?? "").trim() ||
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
  const sameOpts = jsonEqualNormalised(db.options_json ?? [], ts.options);
  const differs =
    (db.question ?? "").trim() !== (ts.question ?? "").trim() ||
    db.correct_index !== ts.correct_index ||
    (db.bloom ?? null) !== (ts.bloom ?? null) ||
    (db.explanation ?? "").trim() !== (ts.explanation ?? "").trim() ||
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
      // Per-status breakdown so the topic button can render an
      // at-a-glance summary like "5 added · 3 unchanged · 2 trashed"
      // — saves the admin from drilling into every topic to see what
      // would actually change. Especially useful for topics where the
      // teacher hand-deleted DB questions and TS still has them all.
      const breakdown = {
        unchanged: 0,
        edited: 0,
        tsOnly: 0,
        dbOnly: 0,
        trashed: 0,
      };
      let questionsDiverged = 0;
      for (const n of qNumbers) {
        const dbQ = dbQs.find((q) => q.number === n);
        const tsQ = tsQs[n - 1];
        const s = classifyQuestion(dbQ, tsQ);
        if (s === "edited") breakdown.edited++;
        else if (s === "ts-only") breakdown.tsOnly++;
        else if (s === "db-only") breakdown.dbOnly++;
        else if (s === "trashed") breakdown.trashed++;
        else breakdown.unchanged++;
        if (s === "edited" || s === "ts-only" || s === "trashed") {
          questionsDiverged++;
        }
      }

      const hasDivergence =
        topicStatus === "edited" ||
        topicStatus === "ts-only" ||
        topicStatus === "trashed" ||
        questionsDiverged > 0;

      // Also report DB-vs-TS counts so the UI can show "3/8 in DB"
      // for topics where the teacher trimmed the question bank.
      const dbCount = dbQs.filter((q) => !q.deleted_at).length;
      const tsCount = tsQs.length;

      return {
        topicNumber: tNum,
        title: tsT?.title ?? dbT?.title ?? `Topic ${tNum}`,
        topicStatus,
        questionsTotal: qNumbers.size,
        questionsDiverged,
        questionsInDb: dbCount,
        questionsInTs: tsCount,
        breakdown,
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
