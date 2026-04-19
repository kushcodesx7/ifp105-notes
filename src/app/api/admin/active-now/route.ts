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
  /** Current in-app path the student is on, e.g. "/module/3". Null
   *  for clients that haven't been updated yet OR pre-migration DBs. */
  currentPath: string | null;
}

/** Per-path live count + sample of students. Powers the topic
 *  distribution chart on /admin. */
export interface PathDistributionEntry {
  path: string;
  /** Friendly label derived from the path — "Module 3" / "Connect" */
  label: string;
  count: number;
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
  // Try to pull current_path; fall back without it on pre-migration DBs.
  // The Supabase client's response types narrow per-call, so we cast
  // through `unknown` after the fallback to keep the union type.
  type SessionRow = {
    student_email: string;
    last_active_at: string;
    current_path?: string | null;
  };
  let sessionData: SessionRow[] | null;
  let sessionError: { message: string } | null;
  {
    const r = await supabase
      .from("student_sessions")
      .select("student_email, last_active_at, current_path")
      .gte("last_active_at", cutoffIso)
      .order("last_active_at", { ascending: false });
    sessionData = (r.data as unknown as SessionRow[]) || null;
    sessionError = r.error;
  }
  if (
    sessionError &&
    /column.*current_path.*does not exist|PGRST204|PGRST102/i.test(
      sessionError.message
    )
  ) {
    const r = await supabase
      .from("student_sessions")
      .select("student_email, last_active_at")
      .gte("last_active_at", cutoffIso)
      .order("last_active_at", { ascending: false });
    sessionData = (r.data as unknown as SessionRow[]) || null;
    sessionError = r.error;
  }

  const rows = sessionData || [];
  if (rows.length === 0) {
    return Response.json({ windowMin, items: [], distribution: [] });
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
      currentPath: row.current_path || null,
    };
  });

  // Live class digest — count active students by friendly path label.
  // Excludes hidden-section students so the teacher's own test
  // session doesn't pollute the chart. Sorted by count DESC so the
  // hottest spots float to the top.
  const counts = new Map<string, { label: string; count: number }>();
  for (const item of items) {
    if (item.hidden) continue;
    if (!item.currentPath) continue;
    const label = friendlyLabelForPath(item.currentPath);
    const key = label;
    const prev = counts.get(key);
    counts.set(key, {
      label,
      count: (prev?.count || 0) + 1,
    });
  }
  const distribution: PathDistributionEntry[] = Array.from(counts.entries())
    .map(([path, v]) => ({ path, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count);

  return Response.json(
    { windowMin, items, distribution },
    {
      headers: {
        // Per-admin and time-sensitive — no shared cache. Browser
        // refetches on every poll.
        "Cache-Control": "private, no-store",
      },
    }
  );
}

// Convert "/module/3" → "Module 3", "/connect" → "IFS Connect", etc.
// Aggregates module paths across topics so the digest groups by module
// rather than splitting Module 3's 5 students into 5 different rows.
function friendlyLabelForPath(path: string): string {
  // /module/N or /c/<slug>/module/N → "Module N"
  const moduleMatch = /^\/(?:c\/[^/]+\/)?module\/(\d+)/.exec(path);
  if (moduleMatch) return `Module ${moduleMatch[1]}`;
  if (path === "/") return "Home";
  if (path === "/connect" || path.startsWith("/connect/")) return "IFS Connect";
  if (path.startsWith("/profile")) return "Profile";
  if (path.startsWith("/batches")) return "Batches";
  if (path.startsWith("/admin")) return "Admin";
  // Fallback: trim the path to a readable form.
  return path.length > 30 ? path.slice(0, 30) + "…" : path;
}

function clampInt(v: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(v) || Number.isNaN(v)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(v)));
}
