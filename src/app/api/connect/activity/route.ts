import { supabase } from "@/lib/supabase";
import { isHiddenSection } from "@/lib/hidden-sections";

// GET /api/connect/activity
// Recent peer activity for the home page glimpse. Two event types:
//   - "completed": someone finished a topic (student_progress.completed in last 48h)
//   - "joined":    someone registered on IFS Connect (students.added_at in last 48h)
//
// No websockets / subscriptions — plain queries. The frontend refreshes this
// via SWR every minute so it feels "live enough" without the cost.

const WINDOW_MS = 48 * 60 * 60 * 1000; // 48h — enough to feel alive even on a slow day
const MAX_EVENTS = 10;

// Display name of each topic per module — keep in sync with module topic data
// (first-30-chars trunc is fine; activity strip won't show long titles)
const MODULE_NAMES: Record<number, string> = {
  1: "Hardware",
  2: "Office",
  3: "Social",
  4: "HTML",
  5: "Tech",
};

interface ActivityEvent {
  id: string; // stable for React keys
  type: "completed" | "joined";
  who: string; // student name (already stored as-is in DB)
  section: string;
  photoUrl: string | null;
  // completed:
  moduleNumber?: number;
  moduleName?: string;
  topicId?: number;
  // common
  at: string; // ISO
}

export async function GET() {
  const sinceIso = new Date(Date.now() - WINDOW_MS).toISOString();

  // Map of email → {name, section, photoUrl} so we can join progress → student
  const [studentsRes, progressRes] = await Promise.all([
    supabase
      .from("students")
      .select("email, name, section, photo_url, added_at"),
    supabase
      .from("student_progress")
      .select("student_email, module_number, topic_id, completed, updated_at")
      .eq("completed", true)
      .gte("updated_at", sinceIso)
      .order("updated_at", { ascending: false })
      .limit(MAX_EVENTS * 2), // over-fetch so we can filter out hidden sections
  ]);

  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  // Build lookup map from email → student row (filter hidden sections here —
  // any event tied to a student in a hidden section will simply be dropped).
  interface StudentMeta {
    name: string;
    section: string;
    photoUrl: string | null;
    addedAt: string | null;
  }
  const studentByEmail: Record<string, StudentMeta> = {};
  for (const s of studentsRes.data || []) {
    if (!s.email || isHiddenSection(s.section)) continue;
    studentByEmail[s.email] = {
      name: s.name || "",
      section: s.section || "",
      photoUrl: s.photo_url || null,
      addedAt: s.added_at || null,
    };
  }

  const events: ActivityEvent[] = [];

  // "completed" events
  for (const row of progressRes.data || []) {
    const email = row.student_email;
    if (!email) continue;
    const meta = studentByEmail[email];
    if (!meta) continue; // hidden section or email not in students table — skip
    events.push({
      id: `c-${email}-${row.module_number}-${row.topic_id}`,
      type: "completed",
      who: meta.name,
      section: meta.section,
      photoUrl: meta.photoUrl,
      moduleNumber: row.module_number,
      moduleName: MODULE_NAMES[row.module_number] || `Module ${row.module_number}`,
      topicId: row.topic_id,
      at: row.updated_at,
    });
  }

  // "joined" events — students with added_at in window
  for (const [email, meta] of Object.entries(studentByEmail)) {
    if (!meta.addedAt) continue;
    if (meta.addedAt < sinceIso) continue;
    events.push({
      id: `j-${email}`,
      type: "joined",
      who: meta.name,
      section: meta.section,
      photoUrl: meta.photoUrl,
      at: meta.addedAt,
    });
  }

  // Sort combined feed newest first, cap
  events.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  const feed = events.slice(0, MAX_EVENTS);

  return Response.json(
    { events: feed },
    {
      headers: {
        // 30s fresh, 5 min stale — activity feels live without hammering
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      },
    }
  );
}
