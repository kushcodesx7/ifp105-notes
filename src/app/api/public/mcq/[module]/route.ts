import { NextRequest } from "next/server";
import { loadModuleFromDB } from "@/lib/module-loader";

// GET /api/public/mcq/:module?course=ict
//
// Public endpoint the lazy-load client (src/data/load-mcq.ts) hits before
// falling back to the bundled TS MCQ file. Returns:
//   { mcq: Record<topicNumber, Question[]> }   when the DB has content
//   { mcq: null }                              when DB is empty or table missing
//
// The client treats `mcq: null` as "fall through to the TS import path",
// keeping the Phase 1 code-split perf win for courses still in TS and
// getting DB-authored content everywhere else.
//
// Public (no auth) — MCQ content is already public (rendered into every
// student's browser for the quiz widget). Cached briefly so a popular
// topic doesn't hammer the DB under Monday-morning load.

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ module: string }> }
) {
  const { module } = await ctx.params;
  const moduleNumber = parseInt(module, 10);
  if (Number.isNaN(moduleNumber)) {
    return Response.json({ error: "Invalid module number" }, { status: 400 });
  }

  // Course slug. Defaults to ICT — this endpoint will become course-aware
  // once Phase 6 ships dynamic URLs. Today every caller is ICT.
  const url = new URL(_req.url);
  const slug = (url.searchParams.get("course") || "ict").trim();

  const loaded = await loadModuleFromDB(slug, moduleNumber);

  // If DB has no content for this module, return null so the client
  // falls back to the TS file.
  if (!loaded || Object.keys(loaded.mcq).length === 0) {
    return Response.json(
      { mcq: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  }

  return Response.json(
    { mcq: loaded.mcq },
    {
      headers: {
        // 60s freshness + SWR. Teacher saves show up within a minute;
        // student sessions don't pay a DB hit per topic render.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
