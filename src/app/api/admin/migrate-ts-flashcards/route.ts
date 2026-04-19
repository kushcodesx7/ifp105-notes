import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";
import { flashcardData } from "@/data/flashcards";
// migrate-ts-flashcards intentionally still imports flashcardData
// directly because it walks EVERY (module, topic) entry — the lookup
// helper is for single-deck reads. Duplicating the iteration in the
// helper would be more code, not less.

// POST /api/admin/migrate-ts-flashcards?course=<slug>
//
// One-shot migration: walks every TS-defined flashcard deck in
// src/data/flashcards.ts and POSTs them into topics.flashcards_json
// for matching topics in the named course (defaults to "ict"). Skips
// topics whose DB row already has flashcards (so re-running won't
// blow away admin edits).
//
// Returns a per-topic report:
//   { migrated: [{moduleNumber, topicNumber, cardCount}], skipped: [...], errors: [...] }
//
// Idempotent. Safe to re-run; non-destructive (will never overwrite).
//
// Why this exists: PR #113 added the override path (DB cards win when
// present), but ICT topics start with empty DB rows so students still
// fall back to the bundled TS data. This endpoint flips them all to
// DB-backed in one click → from then on the admin can edit / delete /
// reorder + use trash on every topic.

interface Result {
  scanned: number;
  migrated: { moduleNumber: number; topicNumber: number; cardCount: number }[];
  skipped: {
    moduleNumber: number;
    topicNumber: number;
    reason: "already-has-cards" | "no-topic-row" | "ts-empty";
  }[];
  errors: { moduleNumber: number; topicNumber: number; message: string }[];
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  // Course is configurable via ?course=<slug> so future courses can
  // also migrate bundled decks if they ever exist. Defaults to ICT
  // (today the only course with a bundled TS deck).
  const url = new URL(req.url);
  const slug = (url.searchParams.get("course") || "ict").trim();

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const courseId = (course as { id: string } | null)?.id;
  if (!courseId) {
    return Response.json(
      { error: `Course '${slug}' not found in DB — run seed-ict first if migrating ICT.` },
      { status: 404 }
    );
  }

  // Pull every (module_number, topic_number, id) for the course in
  // one query so we can match TS keys to DB rows without N+1 reads.
  const { data: modRows } = await supabase
    .from("modules")
    .select("id, number")
    .eq("course_id", courseId);
  const moduleIdByNumber = new Map<number, string>();
  for (const m of (modRows || []) as { id: string; number: number }[]) {
    moduleIdByNumber.set(m.number, m.id);
  }

  const moduleIds = Array.from(moduleIdByNumber.values());
  if (moduleIds.length === 0) {
    return Response.json(
      { error: `No modules found for course '${slug}'. Seed the course first.` },
      { status: 404 }
    );
  }

  const { data: topicRows } = await supabase
    .from("topics")
    .select("id, number, module_id, flashcards_json")
    .in("module_id", moduleIds);

  type TopicRow = {
    id: string;
    number: number;
    module_id: string;
    flashcards_json: unknown;
  };
  // Index DB topics by (moduleNumber, topicNumber) → row.
  const dbByKey = new Map<string, TopicRow>();
  for (const row of (topicRows || []) as TopicRow[]) {
    // Reverse-lookup module number from the id we cached above.
    let moduleNumber: number | null = null;
    for (const [num, id] of moduleIdByNumber) {
      if (id === row.module_id) {
        moduleNumber = num;
        break;
      }
    }
    if (moduleNumber == null) continue;
    dbByKey.set(`${moduleNumber}:${row.number}`, row);
  }

  const result: Result = {
    scanned: 0,
    migrated: [],
    skipped: [],
    errors: [],
  };

  // Walk every TS deck. flashcardData is keyed by moduleNumber →
  // topicNumber → cards[]. Each entry becomes one PATCH-equivalent
  // upsert on the topic row.
  for (const [modNumStr, topicMap] of Object.entries(flashcardData)) {
    const moduleNumber = parseInt(modNumStr, 10);
    for (const [topicNumStr, tsCards] of Object.entries(
      topicMap as Record<number, { front: string; back: string }[]>
    )) {
      const topicNumber = parseInt(topicNumStr, 10);
      result.scanned += 1;

      const cards = (tsCards as { front: string; back: string }[]) || [];
      if (cards.length === 0) {
        result.skipped.push({
          moduleNumber,
          topicNumber,
          reason: "ts-empty",
        });
        continue;
      }

      const dbRow = dbByKey.get(`${moduleNumber}:${topicNumber}`);
      if (!dbRow) {
        result.skipped.push({
          moduleNumber,
          topicNumber,
          reason: "no-topic-row",
        });
        continue;
      }

      // Skip topics where the admin has already written cards (live
      // OR trashed). We never want to clobber existing DB edits.
      const existing = Array.isArray(dbRow.flashcards_json)
        ? (dbRow.flashcards_json as unknown[])
        : [];
      if (existing.length > 0) {
        result.skipped.push({
          moduleNumber,
          topicNumber,
          reason: "already-has-cards",
        });
        continue;
      }

      // Validate + clean each card. Same shape the API PATCH expects.
      const cleaned = cards
        .map((c) => ({
          front: (c.front || "").trim(),
          back: (c.back || "").trim(),
        }))
        .filter((c) => c.front && c.back);

      if (cleaned.length === 0) {
        result.skipped.push({
          moduleNumber,
          topicNumber,
          reason: "ts-empty",
        });
        continue;
      }

      const { error } = await supabase
        .from("topics")
        .update({ flashcards_json: cleaned })
        .eq("id", dbRow.id);

      if (error) {
        result.errors.push({
          moduleNumber,
          topicNumber,
          message: error.message,
        });
      } else {
        result.migrated.push({
          moduleNumber,
          topicNumber,
          cardCount: cleaned.length,
        });
      }
    }
  }

  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "migrate_ts_flashcards",
    subjectEmail: null,
    details: {
      scanned: result.scanned,
      migrated: result.migrated.length,
      skipped: result.skipped.length,
      errors: result.errors.length,
    },
  });

  return Response.json(result);
}
