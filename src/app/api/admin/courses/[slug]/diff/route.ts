import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { loadModuleData } from "@/lib/seed-source";
import { jsonEqualNormalised } from "@/lib/json-equal";
import type { ContentBlock } from "@/types/content";

// GET /api/admin/courses/[slug]/diff?module=N&topic=M
//
// Powers the per-topic re-seed preview at /admin/courses/[slug]/diff.
// Returns BOTH sides side-by-side:
//   · `db`  — what's currently stored in the database for this topic
//             (the live student-facing version)
//   · `ts`  — what the canonical TS source says this topic should be
//             (what re-seeding would push)
//
// The page renders both with the SAME TopicRenderer the students see,
// so the teacher can spot every visual difference before clicking
// "Apply." Question-level granularity is included so the apply step
// can take per-question checkboxes ("update content + Q1+Q3, leave
// Q2 alone").
//
// Auth: admin only. No rate limit — read-only, cheap.

interface DbTopic {
  id: string;
  number: number;
  title: string;
  time_min: number | null;
  hook: string | null;
  content_json: ContentBlock[] | null;
  deleted_at: string | null;
}

interface DbQuestion {
  number: number;
  question: string;
  options_json: string[];
  correct_index: number;
  bloom: string | null;
  explanation: string | null;
  deleted_at: string | null;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const moduleNumber = parseInt(sp.get("module") || "", 10);
  const topicNumber = parseInt(sp.get("topic") || "", 10);

  if (!Number.isFinite(moduleNumber) || moduleNumber < 1) {
    return Response.json({ error: "module query param required" }, { status: 400 });
  }
  if (!Number.isFinite(topicNumber) || topicNumber < 1) {
    return Response.json({ error: "topic query param required" }, { status: 400 });
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
    .select("id, number, title")
    .eq("course_id", (course as { id: string }).id)
    .eq("number", moduleNumber)
    .maybeSingle();

  // ─── Pull DB-side topic + questions ───
  // Include soft-deleted rows so the diff can show "this question is
  // currently trashed in DB" — matters for the M5 case where the
  // teacher hand-deleted some questions.
  let dbTopic: DbTopic | null = null;
  let dbQuestions: DbQuestion[] = [];
  if (moduleRow) {
    const modId = (moduleRow as { id: string }).id;
    const tRes = await supabase
      .from("topics")
      .select("id, number, title, time_min, hook, content_json, deleted_at")
      .eq("module_id", modId)
      .eq("number", topicNumber)
      .maybeSingle();
    dbTopic = (tRes.data ?? null) as DbTopic | null;
    if (dbTopic) {
      const { data: qData } = await supabase
        .from("questions")
        .select("number, question, options_json, correct_index, bloom, explanation, deleted_at")
        .eq("topic_id", dbTopic.id)
        .order("number", { ascending: true });
      dbQuestions = (qData ?? []) as DbQuestion[];
    }
  }

  // ─── Pull TS-side topic + questions ───
  let tsTopic: {
    number: number;
    title: string;
    time: string;
    hook: string;
    content: ContentBlock[];
  } | null = null;
  let tsQuestions: Array<{
    number: number;
    question: string;
    options: string[];
    correct_index: number;
    bloom: string | null;
    explanation: string;
  }> = [];
  try {
    const { topics, mcq } = await loadModuleData(moduleNumber);
    const found = topics.find((t) => t.id === topicNumber);
    if (found) {
      tsTopic = {
        number: found.id,
        title: found.title,
        time: found.time,
        hook: found.hook,
        content: found.content,
      };
      const tsMcqs = mcq[topicNumber] ?? [];
      tsQuestions = tsMcqs.map((q, i) => ({
        number: i + 1,
        question: q.q,
        options: q.opts,
        correct_index: q.ans,
        bloom: q.bloom ?? null,
        explanation: q.why,
      }));
    }
  } catch {
    /* unknown module — TS side stays null, DB side may still be present */
  }

  // ─── Per-question diff classification ───
  // For each question NUMBER appearing in either side, classify:
  //   - "unchanged"  — DB matches TS exactly
  //   - "edited"     — both exist, content differs
  //   - "ts-only"    — only in TS (apply would CREATE in DB)
  //   - "db-only"    — only in DB (apply would NOT delete; unaffected)
  //   - "trashed"    — DB has it but deleted_at set; apply would
  //                    resurrect it (deleted_at -> null)
  const allNumbers = new Set<number>([
    ...dbQuestions.map((q) => q.number),
    ...tsQuestions.map((q) => q.number),
  ]);
  const perQuestion = Array.from(allNumbers)
    .sort((a, z) => a - z)
    .map((n) => {
      const db = dbQuestions.find((q) => q.number === n) || null;
      const ts = tsQuestions.find((q) => q.number === n) || null;
      let status: "unchanged" | "edited" | "ts-only" | "db-only" | "trashed";
      if (!db && ts) status = "ts-only";
      else if (db && !ts) status = "db-only";
      else if (db && ts) {
        if (db.deleted_at) status = "trashed";
        else {
          // jsonEqualNormalised handles options_json key-order +
          // null/undefined drift introduced by Postgres JSONB
          // round-trip — was producing false "edited" reports on
          // questions that rendered identically on both sides.
          const sameOpts = jsonEqualNormalised(db.options_json ?? [], ts.options);
          const differs =
            (db.question ?? "").trim() !== (ts.question ?? "").trim() ||
            db.correct_index !== ts.correct_index ||
            (db.bloom ?? null) !== (ts.bloom ?? null) ||
            (db.explanation ?? "").trim() !== (ts.explanation ?? "").trim() ||
            !sameOpts;
          status = differs ? "edited" : "unchanged";
        }
      } else {
        // shouldn't happen — neither side has it
        status = "unchanged";
      }
      return { number: n, status, db, ts };
    });

  // ─── Topic-level diff classification ───
  let topicStatus: "unchanged" | "edited" | "ts-only" | "db-only" | "trashed";
  if (!dbTopic && tsTopic) topicStatus = "ts-only";
  else if (dbTopic && !tsTopic) topicStatus = "db-only";
  else if (dbTopic && tsTopic) {
    if (dbTopic.deleted_at) topicStatus = "trashed";
    else {
      // Use the normalised deep-equal so JSONB round-trip doesn't
      // produce ghost "edited" status on topics that render
      // identically on both sides.
      const sameContent = jsonEqualNormalised(
        dbTopic.content_json ?? [],
        tsTopic.content
      );
      const differs =
        (dbTopic.title ?? "").trim() !== (tsTopic.title ?? "").trim() ||
        (dbTopic.hook ?? "").trim() !== (tsTopic.hook ?? "").trim() ||
        !sameContent;
      topicStatus = differs ? "edited" : "unchanged";
    }
  } else {
    topicStatus = "unchanged";
  }

  return Response.json({
    course: { slug },
    module: { number: moduleNumber, title: (moduleRow as { title?: string } | null)?.title ?? null },
    topic: { number: topicNumber },
    db: dbTopic
      ? {
          title: dbTopic.title,
          time_min: dbTopic.time_min,
          hook: dbTopic.hook,
          content: dbTopic.content_json ?? [],
          trashed: !!dbTopic.deleted_at,
        }
      : null,
    ts: tsTopic,
    topicStatus,
    questions: perQuestion,
  });
}
