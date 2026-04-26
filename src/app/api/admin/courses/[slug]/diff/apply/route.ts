import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { loadModuleData, parseTimeMin } from "@/lib/seed-source";

// POST /api/admin/courses/[slug]/diff/apply
//
// Per-topic, opt-in re-seed. Companion to the GET /diff endpoint.
//
// Body:
//   {
//     module: number,                     // 1..N
//     topic: number,                      // 1..N
//     applyContent: boolean,              // overwrite content_json + title + hook + time_min from TS
//     applyQuestionNumbers: number[]      // question NUMBERS to upsert from TS (empty = none)
//   }
//
// Behaviour:
//   · If applyContent is true: upsert the topics row with TS content,
//     resurrecting if soft-deleted (deleted_at set to NULL).
//   · For each question number in applyQuestionNumbers: upsert the
//     question row from TS, again resurrecting if soft-deleted.
//   · Questions in DB that the teacher unchecked → untouched.
//   · Questions only in DB (added via inline editor) → untouched.
//
// This is the same upsert primitive as /admin/seed-ict but scoped
// to a single topic + a hand-picked subset of questions, exactly
// matching the granular control the diff page UI gives the teacher.

interface ApplyBody {
  module?: number;
  topic?: number;
  applyContent?: boolean;
  applyQuestionNumbers?: number[];
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Defense-in-depth rate limit. Per-admin so a click-storm doesn't
  // multiply concurrent upserts. 30 applies per 5min is well above
  // any realistic teacher cadence.
  const rl = await rateLimit({
    bucket: "admin:diff:apply",
    id: actorFromAuth(admin),
    limit: 30,
    windowSec: 300,
  });
  if (!rl.ok) return rateLimitResponse(rl, 30);

  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as ApplyBody;

  const moduleNumber =
    typeof body.module === "number" && body.module >= 1
      ? Math.floor(body.module)
      : null;
  const topicNumber =
    typeof body.topic === "number" && body.topic >= 1
      ? Math.floor(body.topic)
      : null;
  const applyContent = !!body.applyContent;
  const applyQs = Array.isArray(body.applyQuestionNumbers)
    ? body.applyQuestionNumbers.filter(
        (n): n is number => typeof n === "number" && n >= 1
      )
    : [];

  if (moduleNumber == null || topicNumber == null) {
    return Response.json(
      { error: "module and topic are required positive integers" },
      { status: 400 }
    );
  }
  if (!applyContent && applyQs.length === 0) {
    return Response.json(
      { error: "Nothing to apply — pick content and/or at least one question" },
      { status: 400 }
    );
  }

  // Resolve course → module → topic
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!course) {
    return Response.json({ error: `Course "${slug}" not found` }, { status: 404 });
  }
  const courseId = (course as { id: string }).id;

  const { data: moduleRow } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("number", moduleNumber)
    .maybeSingle();
  if (!moduleRow) {
    return Response.json(
      { error: `Module ${moduleNumber} not found in course ${slug}` },
      { status: 404 }
    );
  }
  const moduleId = (moduleRow as { id: string }).id;

  // Pull the canonical TS source for this module
  let tsModule;
  try {
    tsModule = await loadModuleData(moduleNumber);
  } catch (e) {
    return Response.json(
      { error: `No TS source for module ${moduleNumber}: ${(e as Error).message}` },
      { status: 404 }
    );
  }
  const tsTopic = tsModule.topics.find((t) => t.id === topicNumber);
  if (!tsTopic) {
    return Response.json(
      { error: `Topic ${topicNumber} not found in TS source for module ${moduleNumber}` },
      { status: 404 }
    );
  }

  // ─── 1. Apply topic content (if requested) ───
  let topicId: string | null = null;
  if (applyContent) {
    const { data: topicRow, error: topicErr } = await supabase
      .from("topics")
      .upsert(
        {
          module_id: moduleId,
          number: tsTopic.id,
          title: tsTopic.title,
          time_min: parseTimeMin(tsTopic.time),
          hook: tsTopic.hook || null,
          content_json: tsTopic.content || [],
          order_index: tsTopic.id,
          // Same resurrection logic as the bulk seed (PR #150) — apply
          // means "TS is now authoritative + LIVE."
          deleted_at: null,
        },
        { onConflict: "module_id,number" }
      )
      .select("id")
      .single();
    if (topicErr || !topicRow) {
      return Response.json(
        { error: `Topic upsert failed: ${topicErr?.message || "no row"}` },
        { status: 500 }
      );
    }
    topicId = (topicRow as { id: string }).id;
  } else {
    // We still need topicId for question upserts. Look it up.
    const { data: row } = await supabase
      .from("topics")
      .select("id")
      .eq("module_id", moduleId)
      .eq("number", topicNumber)
      .maybeSingle();
    if (!row) {
      return Response.json(
        {
          error:
            "Topic doesn't exist in DB yet. Tick 'Apply content' first to create it.",
        },
        { status: 400 }
      );
    }
    topicId = (row as { id: string }).id;
  }

  // ─── 2. Apply selected questions ───
  // Map TS question NUMBER → its TS data. The TS file's mcqData[topicNum]
  // is a 0-indexed array; question.number = arrayIndex + 1.
  const tsMcqs = tsModule.mcq[topicNumber] ?? [];
  const tsByNumber = new Map<number, (typeof tsMcqs)[number]>();
  tsMcqs.forEach((q, i) => tsByNumber.set(i + 1, q));

  let questionsApplied = 0;
  const questionWarnings: string[] = [];
  for (const qNum of applyQs) {
    const tsQ = tsByNumber.get(qNum);
    if (!tsQ) {
      questionWarnings.push(`Q${qNum}: not in TS source — skipped`);
      continue;
    }
    const { error: qErr } = await supabase.from("questions").upsert(
      {
        topic_id: topicId,
        number: qNum,
        question: tsQ.q,
        options_json: tsQ.opts,
        correct_index: tsQ.ans,
        bloom: tsQ.bloom || null,
        explanation: tsQ.why || null,
        order_index: qNum,
        deleted_at: null, // resurrect if soft-deleted
      },
      { onConflict: "topic_id,number" }
    );
    if (qErr) {
      questionWarnings.push(`Q${qNum}: ${qErr.message}`);
      continue;
    }
    questionsApplied += 1;
  }

  // Audit log — each apply is one row so the trail shows which
  // teacher applied what to which topic.
  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "seed_ict",
    subjectEmail: null,
    details: {
      via: "diff-apply",
      slug,
      moduleNumber,
      topicNumber,
      appliedContent: applyContent,
      appliedQuestionNumbers: applyQs,
      questionsApplied,
      warnings: questionWarnings,
    },
  });

  // Bust caches for student-facing surfaces
  try {
    revalidatePath(`/module/${moduleNumber}`);
    revalidatePath(`/api/public/mcq/${moduleNumber}`);
  } catch {}

  return Response.json({
    ok: true,
    appliedContent: applyContent,
    questionsApplied,
    warnings: questionWarnings,
  });
}
