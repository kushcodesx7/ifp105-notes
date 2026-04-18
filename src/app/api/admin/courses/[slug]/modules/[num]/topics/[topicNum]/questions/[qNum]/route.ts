import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// /api/admin/courses/[slug]/modules/[num]/topics/[topicNum]/questions/[qNum]
//   GET    — question detail
//   PATCH  — update any subset of: question, options, correctIndex,
//            bloom, explanation, difficulty, orderIndex, number
//   DELETE — remove the question

type RouteContext = {
  params: Promise<{
    slug: string;
    num: string;
    topicNum: string;
    qNum: string;
  }>;
};

async function resolveQuestionId(
  slug: string,
  num: string,
  topicNum: string,
  qNum: string
): Promise<
  | {
      ok: true;
      questionId: string;
      moduleNumber: number;
      topicNumber: number;
      questionNumber: number;
    }
  | { ok: false; response: Response }
> {
  const moduleNumber = parseInt(num, 10);
  const topicNumber = parseInt(topicNum, 10);
  const questionNumber = parseInt(qNum, 10);
  if (
    Number.isNaN(moduleNumber) ||
    Number.isNaN(topicNumber) ||
    Number.isNaN(questionNumber)
  ) {
    return {
      ok: false,
      response: Response.json(
        { error: "Invalid module, topic, or question number" },
        { status: 400 }
      ),
    };
  }
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const courseId = (course as { id: string } | null)?.id;
  if (!courseId) {
    return {
      ok: false,
      response: Response.json({ error: "Course not found" }, { status: 404 }),
    };
  }
  const { data: mod } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("number", moduleNumber)
    .maybeSingle();
  const moduleId = (mod as { id: string } | null)?.id;
  if (!moduleId) {
    return {
      ok: false,
      response: Response.json({ error: "Module not found" }, { status: 404 }),
    };
  }
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("module_id", moduleId)
    .eq("number", topicNumber)
    .maybeSingle();
  const topicId = (topic as { id: string } | null)?.id;
  if (!topicId) {
    return {
      ok: false,
      response: Response.json({ error: "Topic not found" }, { status: 404 }),
    };
  }
  const { data: q } = await supabase
    .from("questions")
    .select("id")
    .eq("topic_id", topicId)
    .eq("number", questionNumber)
    .maybeSingle();
  const questionId = (q as { id: string } | null)?.id;
  if (!questionId) {
    return {
      ok: false,
      response: Response.json({ error: "Question not found" }, { status: 404 }),
    };
  }
  return {
    ok: true,
    questionId,
    moduleNumber,
    topicNumber,
    questionNumber,
  };
}

function rowToQuestion(r: {
  id: string;
  number: number;
  question: string;
  options_json: unknown;
  correct_index: number;
  bloom: string | null;
  explanation: string | null;
  difficulty: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: r.id,
    number: r.number,
    question: r.question,
    options: Array.isArray(r.options_json) ? (r.options_json as string[]) : [],
    correctIndex: r.correct_index,
    bloom: r.bloom,
    explanation: r.explanation,
    difficulty: r.difficulty,
    orderIndex: r.order_index,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ─── GET ─────────────────────────────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum, qNum } = await ctx.params;
  const res = await resolveQuestionId(slug, num, topicNum, qNum);
  if (!res.ok) return res.response;

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, number, question, options_json, correct_index, bloom, explanation, difficulty, order_index, created_at, updated_at"
    )
    .eq("id", res.questionId)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ question: rowToQuestion(data) });
}

// ─── PATCH ───────────────────────────────────────────────────
// Accepts any subset of editable fields. When updating `options`, the
// new array replaces the old (options_json is authoritative). We
// re-validate `correctIndex` against the resulting array length — the
// client can send both, or one, or neither; we load the current row to
// resolve what the final array will be.
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum, qNum } = await ctx.params;
  const res = await resolveQuestionId(slug, num, topicNum, qNum);
  if (!res.ok) return res.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  // Load the current row once so validation has full context.
  const { data: current, error: loadErr } = await supabase
    .from("questions")
    .select("options_json, correct_index")
    .eq("id", res.questionId)
    .single();
  if (loadErr) return Response.json({ error: loadErr.message }, { status: 500 });

  const patch: Record<string, unknown> = {};
  if (typeof body.question === "string") patch.question = body.question.trim();

  // Resolve the final options array for correctIndex validation.
  let finalOptions: string[] = Array.isArray(current.options_json)
    ? (current.options_json as string[])
    : [];
  if (Array.isArray(body.options)) {
    const cleaned = (body.options as unknown[])
      .map((o) => (typeof o === "string" ? o.trim() : ""))
      .filter((o) => o.length > 0);
    if (cleaned.length < 2 || cleaned.length > 6) {
      return Response.json(
        { error: "options must have 2–6 non-empty entries" },
        { status: 400 }
      );
    }
    patch.options_json = cleaned;
    finalOptions = cleaned;
  }

  if (typeof body.correctIndex === "number") {
    if (
      !Number.isInteger(body.correctIndex) ||
      body.correctIndex < 0 ||
      body.correctIndex >= finalOptions.length
    ) {
      return Response.json(
        {
          error: `correctIndex must be between 0 and ${finalOptions.length - 1}`,
        },
        { status: 400 }
      );
    }
    patch.correct_index = body.correctIndex;
  } else if (patch.options_json) {
    // Options changed but no new correctIndex — make sure the old index
    // still points at a valid slot. If not, clamp to 0 so we don't leave
    // the row in an inconsistent state.
    if (current.correct_index >= finalOptions.length) {
      patch.correct_index = 0;
    }
  }

  if (body.bloom === null) patch.bloom = null;
  else if (typeof body.bloom === "string") patch.bloom = body.bloom.trim() || null;

  if (body.explanation === null) patch.explanation = null;
  else if (typeof body.explanation === "string")
    patch.explanation = body.explanation.trim() || null;

  if (body.difficulty === null) patch.difficulty = null;
  else if (typeof body.difficulty === "string")
    patch.difficulty = body.difficulty.trim() || null;

  if (typeof body.orderIndex === "number" && Number.isInteger(body.orderIndex))
    patch.order_index = body.orderIndex;
  if (typeof body.number === "number" && Number.isInteger(body.number) && body.number > 0)
    patch.number = body.number;

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No editable fields in body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("questions")
    .update(patch)
    .eq("id", res.questionId)
    .select(
      "id, number, question, options_json, correct_index, bloom, explanation, difficulty, order_index, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    if (/duplicate key|unique.*topic_id.*number|23505/i.test(error.message)) {
      return Response.json(
        { error: "Another question with that number already exists in this topic." },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) return Response.json({ error: "Question not found" }, { status: 404 });

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "update_question" as unknown as Parameters<typeof logAdminAction>[0]["action"],
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      topicNumber: res.topicNumber,
      questionNumber: res.questionNumber,
      patchKeys: Object.keys(patch),
    },
  });

  return Response.json({ question: rowToQuestion(data) });
}

// ─── DELETE ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum, qNum } = await ctx.params;
  const res = await resolveQuestionId(slug, num, topicNum, qNum);
  if (!res.ok) return res.response;

  const { error } = await supabase.from("questions").delete().eq("id", res.questionId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "delete_question" as unknown as Parameters<typeof logAdminAction>[0]["action"],
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      topicNumber: res.topicNumber,
      questionNumber: res.questionNumber,
    },
  });

  return Response.json({ ok: true });
}
