import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";

// GET /api/admin/courses/[slug]/question-bank
//
// Flattens every MCQ in a course into one array with the module +
// topic context baked in. Powers the cross-module MCQ bank page
// (/admin/courses/[slug]/questions) — teacher sees every question
// in one scrollable table, filter by Bloom's level, sort by
// difficulty, spot coverage gaps.
//
// One round-trip via PostgREST embedding: questions → topic →
// module → course filter.

type RouteContext = { params: Promise<{ slug: string }> };

interface BankRow {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  bloom: string | null;
  explanation: string | null;
  difficulty: string | null;
  moduleNumber: number;
  moduleTitle: string;
  topicNumber: number;
  topicTitle: string;
}

interface BloomDistribution {
  level: string | null;
  count: number;
}

interface ModuleBreakdown {
  moduleNumber: number;
  title: string;
  questionCount: number;
  byBloom: Record<string, number>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;

  // Resolve course_id. Bail cleanly if the slug is unknown — the
  // page surfaces this as "course not found" rather than an empty list.
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const courseId = (course as { id: string } | null)?.id;
  if (!courseId) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  // Pull questions joined with topic + module via two embedded reads.
  // The filter moves into the FK join so we never fetch other courses'
  // rows.
  const { data, error } = await supabase
    .from("questions")
    .select(
      `id, number, question, options_json, correct_index, bloom, explanation, difficulty,
       topic:topics!inner(number, title, module:modules!inner(number, title, course_id))`
    )
    .eq("topic.module.course_id", courseId)
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

  // PostgREST return shape note: Supabase's TS inference models `!inner`
  // FK joins as arrays even when the FK guarantees a single row. We
  // cast through `unknown` and normalise both shapes in the map below.
  type ModuleJoin = { number: number; title: string; course_id: string };
  type TopicJoin = {
    number: number;
    title: string;
    module: ModuleJoin | ModuleJoin[] | null;
  };
  type Row = {
    id: string;
    number: number;
    question: string;
    options_json: unknown;
    correct_index: number;
    bloom: string | null;
    explanation: string | null;
    difficulty: string | null;
    topic: TopicJoin | TopicJoin[] | null;
  };

  function pickOne<T>(v: T | T[] | null | undefined): T | null {
    if (!v) return null;
    return Array.isArray(v) ? v[0] ?? null : v;
  }

  const questions: BankRow[] = ((data as unknown as Row[]) || [])
    .map((q) => {
      const topic = pickOne(q.topic);
      const mod = pickOne(topic?.module);
      if (!topic || !mod) return null;
      return {
        id: q.id,
        number: q.number,
        question: q.question,
        options: Array.isArray(q.options_json) ? (q.options_json as string[]) : [],
        correctIndex: q.correct_index,
        bloom: q.bloom,
        explanation: q.explanation,
        difficulty: q.difficulty,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        topicNumber: topic.number,
        topicTitle: topic.title,
      } satisfies BankRow;
    })
    .filter((q): q is BankRow => q !== null)
    .sort(
      (a, b) =>
        a.moduleNumber - b.moduleNumber ||
        a.topicNumber - b.topicNumber ||
        a.number - b.number
    );

  // Aggregates for the dashboard strip above the table.
  const bloomCounts = new Map<string, number>();
  const modules = new Map<
    number,
    { title: string; questionCount: number; byBloom: Record<string, number> }
  >();
  for (const q of questions) {
    const key = (q.bloom || "(untagged)").toLowerCase();
    bloomCounts.set(key, (bloomCounts.get(key) || 0) + 1);

    let m = modules.get(q.moduleNumber);
    if (!m) {
      m = { title: q.moduleTitle, questionCount: 0, byBloom: {} };
      modules.set(q.moduleNumber, m);
    }
    m.questionCount += 1;
    m.byBloom[key] = (m.byBloom[key] || 0) + 1;
  }

  const bloomDistribution: BloomDistribution[] = Array.from(
    bloomCounts.entries()
  ).map(([level, count]) => ({
    level: level === "(untagged)" ? null : level,
    count,
  }));

  const moduleBreakdown: ModuleBreakdown[] = Array.from(modules.entries())
    .sort(([a], [b]) => a - b)
    .map(([moduleNumber, m]) => ({
      moduleNumber,
      title: m.title,
      questionCount: m.questionCount,
      byBloom: m.byBloom,
    }));

  return Response.json({
    questions,
    bloomDistribution,
    moduleBreakdown,
    total: questions.length,
  });
}
