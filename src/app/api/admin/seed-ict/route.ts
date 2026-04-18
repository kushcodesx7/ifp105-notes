import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { MODULES } from "@/lib/modules";
import type { ContentBlock } from "@/types/content";

// POST /api/admin/seed-ict
//
// One-time-ish migration that copies the TS-authored ICT content
// (src/data/moduleN-topics.ts + moduleN-mcq.ts) into the DB tables
// introduced by Phase 4 (modules / topics / questions).
//
// Idempotent via upsert-on-conflict: safe to re-run. A module that
// already exists gets its metadata refreshed; topics keep their
// existing content_json if the TS file matches. If a row has been
// edited in the UI AND differs from the TS source, the TS value
// wins on re-seed — so consider the seeder a "reset to TS" action.
//
// Requires admin auth. Called once from /admin/courses/ict after
// the Phase 5.5 code ships; also safe to re-run if a future migration
// needs to reseed.
//
// Implementation notes:
//   - Dynamic `await import(...)` on the TS data files so the seed
//     endpoint itself doesn't bundle all 5 modules' content into the
//     main server chunk. Each seed call pulls them on demand.
//   - Sequential module → topic → question ordering. Parallelising
//     wouldn't buy meaningful wall-time (the whole thing is dominated
//     by ~336 question upserts) and would make error reporting harder.

interface TopicRow {
  id: number;
  title: string;
  time: string;
  hook: string;
  content: ContentBlock[];
}

interface McqRow {
  q: string;
  opts: string[];
  ans: number;
  why: string;
  bloom?: string;
}

// ── Parsers — pull each module's TS data via dynamic import ──
async function loadModuleData(
  moduleNumber: number
): Promise<{ topics: TopicRow[]; mcq: Record<number, McqRow[]> }> {
  switch (moduleNumber) {
    case 1: {
      const [t, m] = await Promise.all([
        import("@/data/module1-topics"),
        import("@/data/module1-mcq"),
      ]);
      return { topics: t.topics as TopicRow[], mcq: m.mcqData as Record<number, McqRow[]> };
    }
    case 2: {
      const [t, m] = await Promise.all([
        import("@/data/module2-topics"),
        import("@/data/module2-mcq"),
      ]);
      return { topics: t.topics as TopicRow[], mcq: m.mcqData as Record<number, McqRow[]> };
    }
    case 3: {
      const [t, m] = await Promise.all([
        import("@/data/module3-topics"),
        import("@/data/module3-mcq"),
      ]);
      return { topics: t.topics as TopicRow[], mcq: m.mcqData as Record<number, McqRow[]> };
    }
    case 4: {
      const [t, m] = await Promise.all([
        import("@/data/module4-topics"),
        import("@/data/module4-mcq"),
      ]);
      return { topics: t.topics as TopicRow[], mcq: m.mcqData as Record<number, McqRow[]> };
    }
    case 5: {
      const [t, m] = await Promise.all([
        import("@/data/module5-topics"),
        import("@/data/module5-mcq"),
      ]);
      return { topics: t.topics as TopicRow[], mcq: m.mcqData as Record<number, McqRow[]> };
    }
    default:
      throw new Error(`Unknown module number: ${moduleNumber}`);
  }
}

// Parse "~4 mins" → 4. Topic rows store `time_min` as INT in DB;
// the TS file has strings like "~4 mins" / "5 min" / "".
function parseTimeMin(time: string): number | null {
  const match = /(\d+)/.exec(time || "");
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Seeding is expensive (5 modules × up to 20 topics × up to 10
  // questions = up to ~1000 upserts in one call). Rate-limit by the
  // admin email so a button-mash doesn't stack concurrent runs. One
  // seed per 30s is well below any legitimate need.
  const { rateLimit, rateLimitResponse } = await import("@/lib/rate-limit");
  const rl = await rateLimit({
    bucket: "admin:seed-ict",
    id: admin.email || "password-admin",
    limit: 2,
    windowSec: 30,
  });
  if (!rl.ok) return rateLimitResponse(rl, 2);

  // Resolve ICT course row. Phase 3 migration seeds it; bail if missing.
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "ict")
    .maybeSingle();

  if (courseErr) {
    return Response.json({ error: courseErr.message }, { status: 500 });
  }
  if (!course) {
    return Response.json(
      {
        error:
          "ICT course row missing. Run scripts/migration-phase3-multi-course.sql.",
      },
      { status: 503 }
    );
  }
  const courseId = (course as { id: string }).id;

  // Track counts per phase so the response is a useful progress summary.
  let modulesUpserted = 0;
  let topicsUpserted = 0;
  let questionsUpserted = 0;
  const warnings: string[] = [];

  for (const m of MODULES) {
    // ── 1. Upsert module row ──────────────────────────────────
    const { data: moduleRow, error: modErr } = await supabase
      .from("modules")
      .upsert(
        {
          course_id: courseId,
          number: m.id,
          title: m.title,
          full_title: m.fullTitle ?? null,
          subtitle: m.subtitle,
          accent: m.accent,
          order_index: m.id,
        },
        { onConflict: "course_id,number" }
      )
      .select("id")
      .single();

    if (modErr || !moduleRow) {
      return Response.json(
        {
          error: `Module ${m.id} upsert failed: ${modErr?.message || "no row returned"}`,
          counts: { modulesUpserted, topicsUpserted, questionsUpserted },
        },
        { status: 500 }
      );
    }
    modulesUpserted += 1;
    const moduleId = (moduleRow as { id: string }).id;

    // ── 2. Upsert topics for this module ──────────────────────
    const { topics: tsTopics, mcq: tsMcq } = await loadModuleData(m.id);

    for (const topic of tsTopics) {
      const { data: topicRow, error: topicErr } = await supabase
        .from("topics")
        .upsert(
          {
            module_id: moduleId,
            number: topic.id,
            title: topic.title,
            time_min: parseTimeMin(topic.time),
            hook: topic.hook || null,
            content_json: topic.content || [],
            order_index: topic.id,
          },
          { onConflict: "module_id,number" }
        )
        .select("id")
        .single();

      if (topicErr || !topicRow) {
        warnings.push(
          `Module ${m.id} Topic ${topic.id} upsert failed: ${topicErr?.message || "no row returned"}`
        );
        continue;
      }
      topicsUpserted += 1;
      const topicId = (topicRow as { id: string }).id;

      // ── 3. Upsert questions for this topic ──────────────────
      const topicMcqs = tsMcq[topic.id] || [];
      for (let i = 0; i < topicMcqs.length; i++) {
        const q = topicMcqs[i];
        const { error: qErr } = await supabase.from("questions").upsert(
          {
            topic_id: topicId,
            number: i + 1,
            question: q.q,
            options_json: q.opts,
            correct_index: q.ans,
            bloom: q.bloom || null,
            explanation: q.why || null,
            order_index: i + 1,
          },
          { onConflict: "topic_id,number" }
        );
        if (qErr) {
          warnings.push(
            `Module ${m.id} Topic ${topic.id} Q${i + 1} upsert failed: ${qErr.message}`
          );
          continue;
        }
        questionsUpserted += 1;
      }
    }
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "seed_ict",
    subjectEmail: null,
    details: {
      modulesUpserted,
      topicsUpserted,
      questionsUpserted,
      warnings: warnings.length,
    },
  });

  return Response.json({
    ok: true,
    counts: { modulesUpserted, topicsUpserted, questionsUpserted },
    warnings,
  });
}
