import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { MODULES } from "@/lib/modules";

// GET /api/admin/seed-ict/preview?moduleNumber=1   (or omit for all)
//
// Pre-flight for the destructive `/api/admin/seed-ict` POST. Compares
// the TS source of truth against whatever's currently in the
// `questions` table for each (module, topic) and reports how many
// rows would change — WITHOUT touching the DB.
//
// The admin Re-seed card uses this to:
//   · show "Module N: X new · Y changed · Z unchanged" per scope
//   · require a TYPED confirmation when Y > 0 (so the teacher can't
//     silently overwrite their own admin-UI edits)
//
// Why it exists: the seed is "TS wins." If the teacher edits questions
// in the admin UI after a seed, those edits are at risk every time
// they click Re-seed. Before this endpoint, the only UX gate was a
// text description in the card — no actual indication of which modules
// diverge. Now the admin UI knows exactly which modules are safe to
// re-seed silently and which ones need explicit consent.
//
// Admin-only. Read-only. No rate limit — it's a diagnostic.

interface TopicTs {
  id: number;
  title: string;
  time: string;
  hook: string;
  content: unknown[];
}
interface McqTs {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: string;
}

async function loadModuleData(
  moduleNumber: number
): Promise<{ topics: TopicTs[]; mcq: Record<number, McqTs[]> }> {
  // Same switch as the seed endpoint — kept in sync by hand because
  // dynamic-import doesn't accept template literals in the Next
  // Edge/Node runtime targets we deploy to.
  switch (moduleNumber) {
    case 1: {
      const [t, m] = await Promise.all([
        import("@/data/module1-topics"),
        import("@/data/module1-mcq"),
      ]);
      return {
        topics: t.topics as TopicTs[],
        mcq: m.mcqData as Record<number, McqTs[]>,
      };
    }
    case 2: {
      const [t, m] = await Promise.all([
        import("@/data/module2-topics"),
        import("@/data/module2-mcq"),
      ]);
      return {
        topics: t.topics as TopicTs[],
        mcq: m.mcqData as Record<number, McqTs[]>,
      };
    }
    case 3: {
      const [t, m] = await Promise.all([
        import("@/data/module3-topics"),
        import("@/data/module3-mcq"),
      ]);
      return {
        topics: t.topics as TopicTs[],
        mcq: m.mcqData as Record<number, McqTs[]>,
      };
    }
    case 4: {
      const [t, m] = await Promise.all([
        import("@/data/module4-topics"),
        import("@/data/module4-mcq"),
      ]);
      return {
        topics: t.topics as TopicTs[],
        mcq: m.mcqData as Record<number, McqTs[]>,
      };
    }
    case 5: {
      const [t, m] = await Promise.all([
        import("@/data/module5-topics"),
        import("@/data/module5-mcq"),
      ]);
      return {
        topics: t.topics as TopicTs[],
        mcq: m.mcqData as Record<number, McqTs[]>,
      };
    }
    default:
      throw new Error(`Unknown module number: ${moduleNumber}`);
  }
}

interface ModulePreview {
  moduleNumber: number;
  title: string;
  topics: { total: number; new: number; changed: number; unchanged: number };
  questions: {
    total: number;
    new: number;
    changed: number;
    unchanged: number;
    deleted: number;
  };
  /** True if re-seeding this module would overwrite at least one DB
   *  question that differs from TS. Admin UI gates the Re-seed button
   *  on a typed confirmation when this is true. */
  hasDivergence: boolean;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const raw = req.nextUrl.searchParams.get("moduleNumber");
  const moduleScope =
    raw != null && /^\d+$/.test(raw) ? parseInt(raw, 10) : null;
  const modulesToCheck =
    moduleScope != null
      ? MODULES.filter((m) => m.id === moduleScope)
      : MODULES;

  // Resolve ICT course id (matches the seed endpoint's lookup).
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "ict")
    .maybeSingle();
  const courseId = (course as { id: string } | null)?.id ?? null;

  const results: ModulePreview[] = [];

  for (const m of modulesToCheck) {
    const { topics: tsTopics, mcq: tsMcq } = await loadModuleData(m.id);

    // Pull DB state for this module in one round trip.
    let modRowQ = supabase
      .from("modules")
      .select("id")
      .eq("number", m.id);
    if (courseId) modRowQ = modRowQ.eq("course_id", courseId);
    const { data: modRow } = await modRowQ.maybeSingle();
    const modId = (modRow as { id: string } | null)?.id ?? null;

    if (!modId) {
      // Module doesn't exist in DB yet — everything is new.
      const totalQ = tsTopics.reduce(
        (s, t) => s + (tsMcq[t.id]?.length ?? 0),
        0
      );
      results.push({
        moduleNumber: m.id,
        title: m.fullTitle ?? m.title,
        topics: {
          total: tsTopics.length,
          new: tsTopics.length,
          changed: 0,
          unchanged: 0,
        },
        questions: {
          total: totalQ,
          new: totalQ,
          changed: 0,
          unchanged: 0,
          deleted: 0,
        },
        hasDivergence: false, // no DB edits to clobber
      });
      continue;
    }

    // DB topics + questions for this module, one query each.
    const [topicsRes, questionsRes] = await Promise.all([
      supabase
        .from("topics")
        .select("id, number")
        .eq("module_id", modId),
      // Join topics → questions in one go via an RPC-ish select.
      supabase
        .from("questions")
        .select("topic_id, number, question, options_json, correct_index, bloom, explanation, topics!inner(module_id, number)")
        .eq("topics.module_id", modId),
    ]);

    const dbTopics = (topicsRes.data ?? []) as Array<{
      id: string;
      number: number;
    }>;
    // Map topic.number → topic.id for lookup.
    const dbTopicNumById: Record<string, number> = {};
    const dbTopicIdByNum: Record<number, string> = {};
    for (const t of dbTopics) {
      dbTopicNumById[t.id] = t.number;
      dbTopicIdByNum[t.number] = t.id;
    }

    // Topic diff — new/changed/unchanged by number.
    // "changed" for topics is hard (content_json is a big JSONB blob)
    // so we keep it simple: if the topic exists in both, call it
    // unchanged. The TEACHER's main concern is question-level edits,
    // which we DO check precisely below.
    let topicsNew = 0,
      topicsUnchanged = 0;
    for (const t of tsTopics) {
      if (dbTopicIdByNum[t.id]) topicsUnchanged++;
      else topicsNew++;
    }

    // Questions: compare each (topic.number, question.number) between
    // TS and DB. "changed" = exists in both but any field differs.
    // "new" = in TS, missing in DB. "deleted" = in DB, not in TS
    // (reseeding leaves these alone — upsert doesn't delete).
    let qNew = 0,
      qChanged = 0,
      qUnchanged = 0,
      qDeleted = 0;
    const tsKeySet = new Set<string>();
    for (const ts of tsTopics) {
      const tsQs = tsMcq[ts.id] ?? [];
      for (let i = 0; i < tsQs.length; i++) {
        tsKeySet.add(`${ts.id}|${i + 1}`);
      }
    }
    const dbRows = (questionsRes.data ?? []) as Array<{
      topic_id: string;
      number: number;
      question: string;
      options_json: string[];
      correct_index: number;
      bloom: string | null;
      explanation: string | null;
    }>;
    const dbKeyMap = new Map<string, (typeof dbRows)[number]>();
    for (const r of dbRows) {
      const tNum = dbTopicNumById[r.topic_id];
      if (tNum == null) continue;
      dbKeyMap.set(`${tNum}|${r.number}`, r);
    }

    for (const ts of tsTopics) {
      const tsQs = tsMcq[ts.id] ?? [];
      for (let i = 0; i < tsQs.length; i++) {
        const key = `${ts.id}|${i + 1}`;
        const dbQ = dbKeyMap.get(key);
        if (!dbQ) {
          qNew++;
          continue;
        }
        const tsQ = tsQs[i];
        const sameOpts =
          Array.isArray(dbQ.options_json) &&
          dbQ.options_json.length === tsQ.opts.length &&
          dbQ.options_json.every((v, j) => v === tsQ.opts[j]);
        const differs =
          dbQ.question !== tsQ.q ||
          dbQ.correct_index !== tsQ.ans ||
          (dbQ.bloom ?? null) !== (tsQ.bloom ?? null) ||
          (dbQ.explanation ?? null) !== (tsQ.why ?? null) ||
          !sameOpts;
        if (differs) qChanged++;
        else qUnchanged++;
      }
    }
    for (const [key] of dbKeyMap) {
      if (!tsKeySet.has(key)) qDeleted++;
    }

    results.push({
      moduleNumber: m.id,
      title: m.fullTitle ?? m.title,
      topics: {
        total: tsTopics.length,
        new: topicsNew,
        changed: 0, // not precisely tracked — see note above
        unchanged: topicsUnchanged,
      },
      questions: {
        total: qNew + qChanged + qUnchanged,
        new: qNew,
        changed: qChanged,
        unchanged: qUnchanged,
        deleted: qDeleted,
      },
      // A module has "divergence" when at least one DB question has
      // different content from the TS source. That's the exact
      // condition where re-seeding would silently overwrite an
      // admin-UI edit. qNew > 0 alone isn't divergence (no conflict;
      // TS is just filling in blanks).
      hasDivergence: qChanged > 0,
    });
  }

  return Response.json(
    { modules: results },
    {
      headers: {
        // Admin-facing, changes only when content is edited. 30s is a
        // reasonable window for the admin to click around the Re-seed
        // card without the DB thrashing.
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
