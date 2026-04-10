import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(req: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
  const pw = req.headers.get("x-admin-password");
  return pw === ADMIN_PASSWORD;
}

// GET — return full data including roll list (admin only)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: batches, error } = await supabase
    .from("batches")
    .select("id, name, accent")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const result = await Promise.all(
    batches.map(async (batch) => {
      const { data: rolls } = await supabase
        .from("roll_list")
        .select("enrollment_no")
        .eq("batch_id", batch.id);

      const { data: students } = await supabase
        .from("students")
        .select("enrollment_no, name, email, linkedin_url, added_at")
        .eq("batch_id", batch.id)
        .order("added_at", { ascending: true });

      return {
        id: batch.id,
        name: batch.name,
        accent: batch.accent,
        rollList: (rolls || []).map((r) => r.enrollment_no),
        students: (students || []).map((s) => ({
          enrollmentNo: s.enrollment_no,
          name: s.name,
          email: s.email,
          linkedinUrl: s.linkedin_url,
          addedAt: s.added_at,
        })),
      };
    })
  );

  return Response.json({ batches: result });
}

// POST — admin actions
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  switch (action) {
    case "add-batch": {
      const { id, name, accent } = body;
      if (!id || !name) {
        return Response.json({ error: "Batch id and name required" }, { status: 400 });
      }
      const { error } = await supabase.from("batches").insert({
        id,
        name,
        accent: accent || "#6366F1",
      });
      if (error) {
        if (error.code === "23505") {
          return Response.json({ error: "Batch already exists" }, { status: 400 });
        }
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ success: true });
    }

    case "add-rolls": {
      const { batchId, rolls } = body;
      const newRolls = (rolls as string[])
        .map((r: string) => r.trim().toUpperCase())
        .filter(Boolean)
        .map((enrollment_no) => ({ batch_id: batchId, enrollment_no }));

      const { error } = await supabase
        .from("roll_list")
        .upsert(newRolls, { onConflict: "batch_id,enrollment_no" });

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ success: true, count: newRolls.length });
    }

    case "delete-student": {
      const { batchId: bid, enrollmentNo } = body;
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("batch_id", bid)
        .eq("enrollment_no", enrollmentNo.toUpperCase());

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ success: true });
    }

    case "delete-batch": {
      const { batchId: delId } = body;
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", delId);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ success: true });
    }

    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }
}
