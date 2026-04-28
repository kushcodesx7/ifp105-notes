import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { MODULES } from "@/lib/modules";
import { loadModuleData, parseTimeMin } from "@/lib/seed-source";

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
//     by the full-bank question upserts, ~10 per topic × 48 topics)
//     and would make error reporting harder.

// loadModuleData + parseTimeMin extracted to @/lib/seed-source so the
// new /admin/courses/[slug]/diff endpoints share the same canonical
// loader and the two consumers can't drift on which TS file is
// authoritative for each module number.

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Optional body: { moduleNumber?: 1..5 }
  //   - omitted / null → re-seed every module (original behaviour)
  //   - 1..5          → re-seed ONLY that module, leaving the others
  //                     alone entirely (no upsert, no overwrite).
  // Added Apr 2026 so a teacher can rewrite ONE module's TS content
  // (e.g. Module 5 got simplified for school students) and push just
  // that slice to the DB without clobbering in-admin edits the teacher
  // has made to the OTHER modules since the last full seed.
  const body = await req.json().catch(() => ({}));
  const rawScope = body?.moduleNumber;
  const moduleScope =
    typeof rawScope === "number" &&
    Number.isFinite(rawScope) &&
    rawScope >= 1 &&
    rawScope <= 5
      ? Math.floor(rawScope)
      : null;

  // Seeding is expensive (5 modules × up to 20 topics × up to 10
  // questions = up to ~1000 upserts in one call). Rate-limit by the
  // admin email so a button-mash doesn't stack concurrent runs. One
  // seed per 30s is well below any legitimate need.
  const { rateLimit, rateLimitResponse } = await import("@/lib/rate-limit");
  const rl = await rateLimit({
    bucket: "admin:seed-ict",
    id: admin.email || "unknown-admin",
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
  let topicsSoftDeleted = 0;
  const warnings: string[] = [];
  // Collect the seeded module→topic-ids map while we're walking the
  // upsert tree anyway, so the revalidatePath loop below can reuse it
  // instead of calling `loadModuleData(m.id)` a second time per module.
  const seededTopicIds: Record<number, number[]> = {};

  // If a moduleScope was passed, narrow the loop to just that module.
  // Everything else (topics + questions for the other 4 modules) is
  // untouched — no upsert fires, so the DB rows stay exactly as the
  // teacher last left them via the admin editor.
  const modulesToSeed = moduleScope != null
    ? MODULES.filter((m) => m.id === moduleScope)
    : MODULES;

  for (const m of modulesToSeed) {
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
          counts: { modulesUpserted, topicsUpserted, topicsSoftDeleted, questionsUpserted },
        },
        { status: 500 }
      );
    }
    modulesUpserted += 1;
    const moduleId = (moduleRow as { id: string }).id;

    // ── 2. Upsert topics for this module ──────────────────────
    const { topics: tsTopics, mcq: tsMcq } = await loadModuleData(m.id);
    seededTopicIds[m.id] = tsTopics.map((t) => t.id);

    // ── 2a. Soft-delete topics no longer in the TS file ───────
    // When the TS source shrinks (e.g. Module 2 went from 9 → 4 topics
    // in the Apr 27 2026 rewrite), the upsert loop below will refresh
    // topics 1-4 but leaves rows 5-9 sitting in the DB. The student
    // module loader filters `deleted_at IS NULL` so flipping the stale
    // rows to deleted hides them from students immediately.
    //
    // This is non-destructive — content_json is preserved on the row,
    // and a future re-seed that brings back topic 5 in the TS file
    // will UN-soft-delete it via the existing `deleted_at: null` clause
    // in the upsert below.
    const tsTopicNumbers = new Set(tsTopics.map((t) => t.id));
    const { data: existingTopics } = await supabase
      .from("topics")
      .select("id, number, deleted_at")
      .eq("module_id", moduleId);
    const staleTopicIds: string[] = [];
    for (const row of (existingTopics || []) as Array<{
      id: string;
      number: number;
      deleted_at: string | null;
    }>) {
      if (!tsTopicNumbers.has(row.number) && row.deleted_at == null) {
        staleTopicIds.push(row.id);
      }
    }
    if (staleTopicIds.length > 0) {
      const nowIso = new Date().toISOString();
      const { error: deleteErr } = await supabase
        .from("topics")
        .update({ deleted_at: nowIso })
        .in("id", staleTopicIds);
      if (deleteErr) {
        warnings.push(
          `Module ${m.id}: failed to soft-delete ${staleTopicIds.length} stale topic(s): ${deleteErr.message}`
        );
      } else {
        topicsSoftDeleted += staleTopicIds.length;
        // Cascade the soft-delete to the questions under those topics
        // so the orphan questions don't keep counting toward the
        // module's question total. Best-effort — if this fails the
        // topic is hidden anyway and the questions just become
        // unreachable orphans rather than visible junk.
        const { error: qDeleteErr } = await supabase
          .from("questions")
          .update({ deleted_at: nowIso })
          .in("topic_id", staleTopicIds);
        if (qDeleteErr) {
          warnings.push(
            `Module ${m.id}: questions under stale topics not cascaded: ${qDeleteErr.message}`
          );
        }
      }
    }

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
            // Seed = "the TS file is authoritative, this topic is live."
            // Without this, re-seeding a topic whose DB row was
            // soft-deleted (e.g. Module 3 topic 6 after the Apr 23
            // Facebook→LinkedIn overhaul) would write new content
            // into the deleted row and students would still see
            // nothing. An explicit deleted_at: null resurrects the
            // row as part of the same upsert.
            deleted_at: null,
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
            // Same resurrection logic as the topic upsert above —
            // re-seeding must produce LIVE rows, not overwrite
            // previously-trashed ones with new content that stays
            // invisible.
            deleted_at: null,
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
      topicsSoftDeleted,
      questionsUpserted,
      moduleScope,
      warnings: warnings.length,
    },
  });

  // Bust the CDN + Next.js data caches for the student-facing surfaces
  // that read from the DB tables we just rewrote. Without this, students
  // keep seeing the PRE-seed MCQ/flashcard content for up to ~2.5 min
  // because /api/public/mcq/[N] and /api/public/flashcards/[module]/[topic]
  // are cached `public, max-age=30, stale-while-revalidate=120`.
  //
  // Per-question admin edits already do this for the single touched
  // question — but the bulk seed didn't, so a teacher re-seeding
  // Module 5 would re-publish the file correctly yet still see stale
  // questions in the student view.
  //
  // Scope-aware: when we seeded just one module, only invalidate that
  // module's public routes. When all modules seeded, invalidate the
  // whole bank.
  try {
    for (const m of modulesToSeed) {
      revalidatePath(`/module/${m.id}`);
      revalidatePath(`/api/public/mcq/${m.id}`);
      // Reuse the topic IDs we already collected during the upsert
      // loop above — previously this did a second `loadModuleData(m.id)`
      // dynamic import per module (each one a separate chunk fetch),
      // doubling the seed endpoint's cold-start cost.
      const topicIds = seededTopicIds[m.id] || [];
      for (const tid of topicIds) {
        revalidatePath(`/api/public/flashcards/${m.id}/${tid}`);
      }
    }
    // Also bust the landing page and admin editor surfaces that list
    // question counts / topic counts.
    revalidatePath("/");
    revalidatePath("/admin/courses/ict");
  } catch {
    // revalidatePath can throw in some edge contexts — never block the
    // seed response on it. Caches will self-expire within 2.5 minutes
    // even without this best-effort invalidation.
  }

  return Response.json({
    ok: true,
    counts: {
      modulesUpserted,
      topicsUpserted,
      topicsSoftDeleted,
      questionsUpserted,
    },
    scope: moduleScope != null ? `module_${moduleScope}` : "all_modules",
    warnings,
  });
}
