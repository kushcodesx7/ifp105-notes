import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// /api/admin/courses/[slug]/modules/[num]/topics/[topicNum]/questions
//   GET  — list MCQs for the topic
//   POST — create a new MCQ
//
// Each question is an MCQ with an array of option texts in
// `options_json` and a 0-based `correct_index` pointing into that array.

type RouteContext = {
  params: Promise<{ slug: string; num: string; topicNum: string }>;
};

async function resolveTopicId(
  slug: string,
  num: string,
  topicNum: string
): Promise<
  | { ok: true; topicId: string; moduleNumber: number; topicNumber: number }
  | { ok: false; response: Response }
> {
  const moduleNumber = parseInt(num, 10);
  const topicNumber = parseInt(topicNum, 10);
  if (Number.isNaN(moduleNumber) || Number.isNaN(topicNumber)) {
    return {
      ok: false,
      response: Response.json(
        { error: "Invalid module or topic number" },
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
    .is("deleted_at", null)
    .maybeSingle();
  const topicId = (topic as { id: string } | null)?.id;
  if (!topicId) {
    return {
      ok: false,
      response: Response.json({ error: "Topic not found" }, { status: 404 }),
    };
  }
  return { ok: true, topicId, moduleNumber, topicNumber };
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

// ─── GET — list ──────────────────────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum } = await ctx.params;
  const res = await resolveTopicId(slug, num, topicNum);
  if (!res.ok) return res.response;

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, number, question, options_json, correct_index, bloom, explanation, difficulty, order_index, created_at, updated_at"
    )
    .eq("topic_id", res.topicId)
    // Hide soft-deleted questions from the topic editor.
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("number", { ascending: true });

  if (error) {
    if (/relation.*questions.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          questions: [],
          migrationPending:
            "questions table missing — run scripts/migration-phase4-course-content-tables.sql",
        },
        { status: 200 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ questions: (data || []).map(rowToQuestion) });
}

// ─── POST — create a question ────────────────────────────────
// Body: {
//   question: string,
//   options: string[] (≥2, ≤6),
//   correctIndex: number (0-based, in range),
//   number?: int, bloom?, explanation?, difficulty?, orderIndex?
// }
export async function POST(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug, num, topicNum } = await ctx.params;
  const res = await resolveTopicId(slug, num, topicNum);
  if (!res.ok) return res.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const question = String(body.question || "").trim();
  if (!question) {
    return Response.json({ error: "question is required" }, { status: 400 });
  }

  const options = Array.isArray(body.options)
    ? (body.options as unknown[])
        .map((o) => (typeof o === "string" ? o.trim() : ""))
        .filter((o) => o.length > 0)
    : [];

  if (options.length < 2) {
    return Response.json(
      { error: "At least 2 non-empty options are required" },
      { status: 400 }
    );
  }
  if (options.length > 6) {
    return Response.json(
      { error: "At most 6 options are allowed" },
      { status: 400 }
    );
  }

  const correctIndex =
    typeof body.correctIndex === "number" ? body.correctIndex : 0;
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    return Response.json(
      { error: `correctIndex must be between 0 and ${options.length - 1}` },
      { status: 400 }
    );
  }

  let number: number;
  if (
    typeof body.number === "number" &&
    Number.isInteger(body.number) &&
    body.number > 0
  ) {
    number = body.number;
  } else {
    const { data: maxRow } = await supabase
      .from("questions")
      .select("number")
      .eq("topic_id", res.topicId)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();
    number = ((maxRow as { number: number } | null)?.number ?? 0) + 1;
  }

  const insertRow: Record<string, unknown> = {
    topic_id: res.topicId,
    number,
    question,
    options_json: options,
    correct_index: correctIndex,
    bloom: typeof body.bloom === "string" ? body.bloom.trim() || null : null,
    explanation:
      typeof body.explanation === "string" ? body.explanation.trim() || null : null,
    difficulty:
      typeof body.difficulty === "string" ? body.difficulty.trim() || null : null,
    order_index:
      typeof body.orderIndex === "number" && Number.isInteger(body.orderIndex)
        ? body.orderIndex
        : number,
  };

  const { data, error } = await supabase
    .from("questions")
    .insert(insertRow)
    .select(
      "id, number, question, options_json, correct_index, bloom, explanation, difficulty, order_index, created_at, updated_at"
    )
    .single();

  if (error) {
    if (/relation.*questions.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          error:
            "questions table missing — run scripts/migration-phase4-course-content-tables.sql",
        },
        { status: 503 }
      );
    }
    if (/duplicate key|unique.*topic_id.*number|23505/i.test(error.message)) {
      return Response.json(
        { error: `Question ${number} already exists in this topic.` },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "create_question",
    subjectEmail: null,
    details: {
      courseSlug: slug,
      moduleNumber: res.moduleNumber,
      topicNumber: res.topicNumber,
      questionNumber: number,
    },
  });

  return Response.json({ question: rowToQuestion(data) }, { status: 201 });
}
