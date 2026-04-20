import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/public/flashcards/:module/:topic?course=ict
//
// Public endpoint the student Flashcards component hits before falling
// back to the bundled TS flashcards. Returns:
//   { cards: [{front, back}] }  when the DB row has non-empty cards
//   { cards: null }             when DB has nothing (→ TS fallback wins)
//
// Public (no auth) — flashcards are already public content rendered
// into every student's browser. Cached so a popular topic doesn't
// hammer the DB on Monday mornings.

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ module: string; topic: string }> }
) {
  const { module, topic } = await ctx.params;
  const moduleNumber = parseInt(module, 10);
  const topicNumber = parseInt(topic, 10);
  if (Number.isNaN(moduleNumber) || Number.isNaN(topicNumber)) {
    return Response.json(
      { error: "Invalid module or topic number" },
      { status: 400 }
    );
  }

  // 180/min/IP — a student flipping between 10 topics on a module page
  // fires exactly 10 requests; 180 is well above any realistic human
  // pace and still bounded enough to trip obvious abuse.
  const rl = await rateLimit({
    bucket: "public:flashcards",
    id: ipFromRequest(req),
    limit: 180,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 180);

  const url = new URL(req.url);
  const slug = (url.searchParams.get("course") || "ict").trim();

  // Resolve course → module → topic via two cheap lookups. We don't
  // need a join here because the caller knows (slug, moduleNumber,
  // topicNumber) and each lookup hits a UNIQUE constraint.
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const courseId = (course as { id: string } | null)?.id;
  if (!courseId) return Response.json({ cards: null }, cacheHeaders());

  const { data: mod } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("number", moduleNumber)
    .maybeSingle();
  const moduleId = (mod as { id: string } | null)?.id;
  if (!moduleId) return Response.json({ cards: null }, cacheHeaders());

  const { data: topicRow, error } = await supabase
    .from("topics")
    .select("flashcards_json")
    .eq("module_id", moduleId)
    .eq("number", topicNumber)
    .maybeSingle();

  // flashcards_json column doesn't exist yet (pre-migration) — swallow
  // the error so the student page keeps working via the TS fallback.
  if (error) {
    return Response.json({ cards: null }, cacheHeaders());
  }

  const raw = (topicRow as { flashcards_json: unknown } | null)?.flashcards_json;
  // Filter out cards moved to in-array trash (deletedAt is set). Layer
  // 2 of the trash feature stores deleted cards alongside live ones in
  // the same JSONB column so they can be restored — but students must
  // never see them.
  type CardRow = { front: string; back: string; deletedAt?: string | null };
  // Fingerprint per card — stable hash of the front text. Used by
  // the client to key "I know this" state by content rather than
  // array position, so admin deletes / reorders don't silently
  // transfer the flag to the wrong card. Matches questionFingerprint
  // in McqQuiz. FNV-1a for speed; collisions are benign (worst case
  // two cards share a known-flag, which is visually recoverable).
  function fpFront(front: string): string {
    let h = 2166136261;
    for (let i = 0; i < front.length; i++) {
      h ^= front.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return String(h >>> 0);
  }
  const liveCards =
    Array.isArray(raw) && raw.length > 0
      ? (raw as CardRow[])
          .filter((c) => !c.deletedAt)
          .map(({ front, back }) => ({
            front,
            back,
            fp: fpFront(front),
          }))
      : null;
  const cards = liveCards && liveCards.length > 0 ? liveCards : null;

  return Response.json({ cards }, cacheHeaders());
}

function cacheHeaders() {
  return {
    headers: {
      // 30 s fresh + 2 min SWR. Was 5 min + 30 min but that made admin
      // flashcard edits invisible to students for up to 5 minutes —
      // unacceptable UX when the teacher is actively correcting a card
      // during class. 30 s still absorbs the Monday-morning thundering
      // herd (≈218 students × 50 topics loaded in the first 10 min) so
      // we don't lose the protection entirely.
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  };
}
