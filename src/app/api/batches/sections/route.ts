import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { CANONICAL_SECTIONS, compareSections } from "@/lib/sections";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/batches/sections?batchId=2025-2026
// Returns the list of sections in a batch with student counts from roll_list.
//
// CRITICAL: we ALWAYS return every canonical section (Section 1–6), even if
// the teacher hasn't imported roll_list entries for it yet. Otherwise
// students whose section hasn't been imported can't even pick it from the
// dropdown — which is exactly the bug that was blocking registration.
//
// Additional sections that exist in roll_list but are not in the canonical
// list (e.g., a teacher-added "Section 7") are also returned.
export async function GET(req: NextRequest) {
  // Rate limit — registration dropdown lookup, hit once per page load.
  // 60/min per IP covers refresh bursts during the Monday registration
  // surge without throttling anyone legit.
  const rl = await rateLimit({
    bucket: "public:sections",
    id: ipFromRequest(req),
    limit: 60,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 60);

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return Response.json({ error: "batchId required" }, { status: 400 });
  }

  // Get all roll entries for this batch to compute real counts
  const { data: rolls, error } = await supabase
    .from("roll_list")
    .select("section")
    .eq("batch_id", batchId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Count per section (null/empty section treated as Section 1 — legacy behaviour)
  const countMap: Record<string, number> = {};
  for (const r of rolls || []) {
    const sec = (r as { section?: string | null }).section || "Section 1";
    countMap[sec] = (countMap[sec] || 0) + 1;
  }

  // Start with the canonical list so every section is always offered
  const seen = new Set<string>(CANONICAL_SECTIONS);
  const sections = CANONICAL_SECTIONS.map((name) => ({
    name,
    studentCount: countMap[name] || 0,
    pending: !countMap[name], // true when roll list hasn't been imported
  }));

  // Append any non-canonical sections that exist in the DB (custom sections
  // a teacher added), so we don't hide real data.
  for (const [name, count] of Object.entries(countMap)) {
    if (seen.has(name)) continue;
    sections.push({ name, studentCount: count, pending: false });
    seen.add(name);
  }

  sections.sort((a, b) => compareSections(a.name, b.name));

  return Response.json({ sections });
}
