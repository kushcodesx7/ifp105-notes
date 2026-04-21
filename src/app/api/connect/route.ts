import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { isHiddenSection } from "@/lib/hidden-sections";
import { moduleWeightedPct } from "@/lib/modules";
import { verifyGoogleIdToken } from "@/lib/verify-google-token";
import { isAdminEmail } from "@/lib/admins";
import { ipFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/connect — list of all registered students for IFS Connect
// Optional query params:
//   batchId — filter by batch
//   section — filter by section
export async function GET(req: NextRequest) {
  // Rate limit — public endpoint returning student directory (no emails).
  // 60/min is plenty for a student scrolling the Connect feed while also
  // bounding scrapers. Fail-open if Redis unavailable.
  const rl = await rateLimit({
    bucket: "public:connect",
    id: ipFromRequest(req),
    limit: 60,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl, 60);

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  const section = searchParams.get("section");

  // Hidden sections (e.g. "Test Section") are filtered out for the public
  // feed so students never see test accounts. But the teacher (or any user
  // who actually belongs to a hidden section) needs to see those profiles to
  // test features against their own account. We include hidden sections when:
  //   - caller is an admin, OR
  //   - caller's own section is hidden
  // Response becomes private-cached in those cases so a student's request
  // can't hit a cached response that contains test profiles.
  const idToken = req.headers.get("x-id-token");
  const caller = idToken ? await verifyGoogleIdToken(idToken) : null;
  let callerOwnSectionIsHidden = false;
  if (caller) {
    const { data: self } = await supabase
      .from("students")
      .select("section")
      .eq("email", caller.email)
      .maybeSingle();
    const selfSection = (self as { section?: string | null } | null)?.section;
    if (selfSection && isHiddenSection(selfSection)) callerOwnSectionIsHidden = true;
  }
  const includeHidden =
    !!caller && (isAdminEmail(caller.email) || callerOwnSectionIsHidden);

  const studentQuery = supabase
    .from("students")
    .select(
      "enrollment_no, name, email, batch_id, section, linkedin_url, photo_url, bio, skills, added_at"
    )
    .order("added_at", { ascending: false });
  if (batchId) studentQuery.eq("batch_id", batchId);
  if (section) studentQuery.eq("section", section);

  // Pull the name column too — used below to override each student's
  // display name with the teacher-verified roll-list name when set.
  // Graceful fallback if the migration hasn't been applied yet (handled
  // below in studentsRes mapping; missing column → null name).
  const rollQuery = supabase
    .from("roll_list")
    .select("batch_id, section, enrollment_no, name", { count: "exact" });
  if (batchId) rollQuery.eq("batch_id", batchId);
  if (section) rollQuery.eq("section", section);

  // Pull completion data so each card can show a progress bar.
  // Include module_number so the percentage can use the module-weighted
  // formula (each module = 100/MODULES.length of overall), not a flat
  // done/TOTAL_TOPICS. Teacher wants 1 module done = 20% exactly, not
  // the uneven "11 of 48 = 23%" the flat formula produced.
  const progressQuery = supabase
    .from("student_progress")
    .select("student_email, module_number, completed");

  // All three queries in parallel (borrowed from the admin perf work)
  const [studentsRes, rollRes, progressRes] = await Promise.all([
    studentQuery,
    rollQuery,
    progressQuery,
  ]);

  if (studentsRes.error) {
    return Response.json({ error: studentsRes.error.message }, { status: 500 });
  }

  // Graceful: if roll_list.name column is missing (migration not applied),
  // retry with the old column set so the feed still renders. Students
  // just won't get the teacher-verified name upgrade until the migration
  // runs — everything else works.
  let rollRows = rollRes.data as
    | { batch_id: string; section: string; enrollment_no: string; name: string | null }[]
    | null;
  if (rollRes.error && /name|PGRST204/i.test(rollRes.error.message)) {
    const fb = await supabase
      .from("roll_list")
      .select("batch_id, section, enrollment_no");
    rollRows = (fb.data || []).map((r) => ({
      ...(r as { batch_id: string; section: string; enrollment_no: string }),
      name: null,
    }));
  }

  // Index teacher-verified names by (batch, section, roll) for O(1) lookup.
  const rollNameByKey = new Map<string, string>();
  for (const r of rollRows || []) {
    if (!r.name) continue;
    const key = `${r.batch_id}__${r.section}__${r.enrollment_no}`;
    rollNameByKey.set(key, r.name);
  }

  // Aggregate per-email BY MODULE so we can feed the module-weighted
  // percentage helper. Flat "count of completed rows" would hit the
  // same uneven-module bias we fixed on /api/connect/glimpse.
  const doneByEmailByModule: Record<string, Record<number, number>> = {};
  for (const row of progressRes.data || []) {
    if (!row.student_email || !row.completed) continue;
    if (typeof row.module_number !== "number") continue;
    const byMod =
      doneByEmailByModule[row.student_email] ??
      (doneByEmailByModule[row.student_email] = {});
    byMod[row.module_number] = (byMod[row.module_number] || 0) + 1;
  }

  // Filter out test/hidden sections before mapping — unless the caller is
  // an admin or belongs to a hidden section themselves.
  const visibleStudentRows = (studentsRes.data || []).filter(
    (s) => includeHidden || !isHiddenSection(s.section)
  );

  // Map to public shape (email never leaves the server side).
  // Progress is always public — no opt-out.
  //
  // `name` is the teacher-verified roll-list name when available
  // ("Oysha Abdullayeva"), falling back to the student's chosen display
  // name ("248_oysha"). This way the Connect feed shows real names as
  // soon as the teacher uploads them, with no UI change needed. The
  // client-side `prettyName()` helper strips numeric prefixes from the
  // legacy format — it's a no-op on the real name path.
  const students = visibleStudentRows.map((s) => {
    const byMod = s.email ? doneByEmailByModule[s.email] || {} : {};
    // Each module contributes 20% to overall completion (5 modules ×
    // 20% = 100%). Matches the teacher's mental model and the fixed
    // glimpse endpoint.
    const completionPct = Math.min(100, moduleWeightedPct(byMod));
    const rollKey = `${s.batch_id || ""}__${s.section || ""}__${
      s.enrollment_no || ""
    }`;
    const preferredName = rollNameByKey.get(rollKey) || s.name;
    return {
      enrollmentNo: s.enrollment_no,
      name: preferredName,
      batchId: s.batch_id,
      section: s.section,
      linkedinUrl: s.linkedin_url,
      photoUrl: s.photo_url,
      bio: s.bio,
      skills: (s as { skills?: string[] }).skills || [],
      addedAt: s.added_at,
      lastThree: (s.enrollment_no || "").slice(-3),
      completionPct,
    };
  });

  const perSectionTotals: Record<string, number> = {};
  let visibleRollCount = 0;
  for (const r of rollRows || []) {
    const sec = r.section || "";
    if (!sec) continue;
    if (!includeHidden && isHiddenSection(sec)) continue;
    perSectionTotals[sec] = (perSectionTotals[sec] || 0) + 1;
    visibleRollCount += 1;
  }

  return Response.json(
    {
      students,
      totalRolls: visibleRollCount,
      perSectionTotals,
    },
    {
      headers: {
        // Response contains personalized data (hidden sections) when a
        // privileged caller is signed in → private cache so a student's
        // request can't be served the admin's cached response.
        "Cache-Control": includeHidden
          ? "private, max-age=30"
          : "public, max-age=120, stale-while-revalidate=600",
      },
    }
  );
}
