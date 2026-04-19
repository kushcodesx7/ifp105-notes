import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { isHiddenSection } from "@/lib/hidden-sections";

// GET /api/admin/active-now?windowMin=10
//
// Returns students whose `last_active_at` is within the last N minutes
// (default 10). Powers the "Live now" widget on the admin home page so
// the teacher can see who's actually in the app right now instead of
// just looking at "active this week" totals.
//
// Hidden sections (Test Section etc.) are INCLUDED — admins want to
// see their own test student popping up here while debugging.
//
// Admin-only. No caching — staleness defeats the purpose.

export interface ActiveStudent {
  email: string;
  name: string;
  section: string | null;
  hidden: boolean;
  lastActiveAt: string;
  /** Seconds since last activity. Lets the client render "now" / "2m". */
  ageSec: number;
  photoUrl: string | null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const url = new URL(req.url);
  const windowMin = clampInt(
    parseInt(url.searchParams.get("windowMin") || "10", 10),
    1,
    60,
    10
  );
  const cutoffIso = new Date(Date.now() - windowMin * 60_000).toISOString();

  // Pull active sessions in window. Light query — most students aren't
  // active in any given 10-minute slice, even on a Monday peak.
  const { data: sessions } = await supabase
    .from("student_sessions")
    .select("student_email, last_active_at")
    .gte("last_active_at", cutoffIso)
    .order("last_active_at", { ascending: false });

  const rows = (sessions || []) as { student_email: string; last_active_at: string }[];
  if (rows.length === 0) {
    return Response.json({ windowMin, items: [] });
  }

  // Hydrate student names / sections / photos in one batch.
  const emails = rows.map((r) => r.student_email);
  const { data: students } = await supabase
    .from("students")
    .select("email, name, section, photo_url")
    .in("email", emails);

  type StudentRow = {
    email: string;
    name: string | null;
    section: string | null;
    photo_url: string | null;
  };
  const byEmail = new Map<string, StudentRow>();
  for (const s of (students || []) as StudentRow[]) {
    byEmail.set(s.email, s);
  }

  const now = Date.now();
  const items: ActiveStudent[] = rows.map((row) => {
    const s = byEmail.get(row.student_email);
    return {
      email: row.student_email,
      name: s?.name || row.student_email.split("@")[0] || "Student",
      section: s?.section || null,
      hidden: isHiddenSection(s?.section),
      lastActiveAt: row.last_active_at,
      ageSec: Math.max(
        0,
        Math.floor((now - new Date(row.last_active_at).getTime()) / 1000)
      ),
      photoUrl: s?.photo_url || null,
    };
  });

  return Response.json(
    { windowMin, items },
    {
      headers: {
        // Per-admin and time-sensitive — no shared cache. Browser
        // refetches on every poll.
        "Cache-Control": "private, no-store",
      },
    }
  );
}

function clampInt(v: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(v) || Number.isNaN(v)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(v)));
}
