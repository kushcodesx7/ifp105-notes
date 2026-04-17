import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/batches/sections?batchId=2025-2026
// Returns list of distinct sections in a batch with student counts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return Response.json({ error: "batchId required" }, { status: 400 });
  }

  // Get all roll entries for this batch
  const { data: rolls, error } = await supabase
    .from("roll_list")
    .select("section, enrollment_no")
    .eq("batch_id", batchId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Group by section
  const sectionMap: Record<string, number> = {};
  for (const r of rolls || []) {
    const sec = r.section || "Section 1";
    sectionMap[sec] = (sectionMap[sec] || 0) + 1;
  }

  // Sort sections naturally (Section 1, Section 2, etc)
  const sections = Object.entries(sectionMap)
    .map(([name, count]) => ({ name, studentCount: count }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  return Response.json({ sections });
}
