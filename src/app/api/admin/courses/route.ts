import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/verify-google-token";
import { logAdminAction, actorFromAuth } from "@/lib/admin-audit";

// /api/admin/courses — list + create courses.
//
// Phase 4 / admin course editor. Writes to the `courses` table introduced
// by migration-phase3-multi-course.sql. Graceful-fallback: if the table
// is missing (pre-migration) we return an empty list + an `apply`
// hint that the UI renders as "Run migration-phase3-multi-course.sql".
//
// Slug rules:
//   - lowercase, url-safe (a-z, 0-9, hyphen). Stable forever — never
//     shown to students in display text, only in URLs like /c/<slug>/...
//   - code + name are the editable display fields the teacher renames
//     per semester.

// Shape sent to the UI. Keep this in sync with any TypeScript types the
// /admin/courses page uses — the shape flows through useAdminFetch and
// is the contract between server + client.
export interface CourseRow {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  accent: string | null;
  icon: string | null;
  institution: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  moduleCount: number;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

function validateSlug(slug: string): string | null {
  if (!slug) return "slug is required";
  if (!SLUG_RE.test(slug)) {
    return "slug must be 2–40 chars, lowercase letters, digits, and hyphens only (e.g. 'python-101')";
  }
  return null;
}

// ─── GET — list courses (+ per-course module count) ───────────────
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const { data: courseData, error } = await supabase
    .from("courses")
    .select(
      "id, slug, code, name, description, accent, icon, institution, active, created_at, updated_at"
    )
    .order("created_at", { ascending: true });

  if (error) {
    // Table missing → tell the UI to prompt for migration.
    if (/relation.*courses.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          courses: [],
          migrationPending:
            "courses table missing — run scripts/migration-phase3-multi-course.sql",
        },
        { status: 200 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Fetch module counts in one grouped query. If the `modules` table is
  // missing (Phase 4 migration not yet run) we gracefully fall back to
  // zero counts so the page still renders.
  const countsByCourse = new Map<string, number>();
  const { data: moduleRows, error: modErr } = await supabase
    .from("modules")
    .select("course_id");

  if (!modErr && moduleRows) {
    for (const m of moduleRows as { course_id: string }[]) {
      countsByCourse.set(m.course_id, (countsByCourse.get(m.course_id) || 0) + 1);
    }
  } else if (modErr && !/relation.*modules.*does not exist|42P01/i.test(modErr.message)) {
    // Real error, not "table missing" — surface it.
    return Response.json({ error: modErr.message }, { status: 500 });
  }

  const courses: CourseRow[] = (courseData || []).map((c) => ({
    id: c.id,
    slug: c.slug,
    code: c.code,
    name: c.name,
    description: c.description,
    accent: c.accent,
    icon: c.icon,
    institution: c.institution,
    active: c.active,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    moduleCount: countsByCourse.get(c.id) || 0,
  }));

  return Response.json({ courses });
}

// ─── POST — create a new course ───────────────────────────────────
// Body: { slug, code, name, description?, accent?, icon?, institution? }
//
// Idempotent-ish: a duplicate slug returns 409 with a clear message so
// the UI can prompt the teacher to pick a different one.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return admin.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  const slug = String(body.slug || "").trim().toLowerCase();
  const code = String(body.code || "").trim();
  const name = String(body.name || "").trim();
  const description =
    typeof body.description === "string" ? body.description.trim() : null;
  const accent =
    typeof body.accent === "string" ? body.accent.trim() : null;
  const icon = typeof body.icon === "string" ? body.icon.trim() : null;
  const institution =
    typeof body.institution === "string" ? body.institution.trim() : null;

  const slugErr = validateSlug(slug);
  if (slugErr) return Response.json({ error: slugErr }, { status: 400 });
  if (!code) return Response.json({ error: "code is required" }, { status: 400 });
  if (!name) return Response.json({ error: "name is required" }, { status: 400 });

  const insertRow: Record<string, unknown> = {
    slug,
    code,
    name,
    description,
    accent,
    icon,
    institution,
    active: true,
  };

  const { data, error } = await supabase
    .from("courses")
    .insert(insertRow)
    .select(
      "id, slug, code, name, description, accent, icon, institution, active, created_at, updated_at"
    )
    .single();

  if (error) {
    if (/relation.*courses.*does not exist|42P01/i.test(error.message)) {
      return Response.json(
        {
          error:
            "courses table missing — run scripts/migration-phase3-multi-course.sql first.",
        },
        { status: 503 }
      );
    }
    if (/duplicate key|unique.*slug|23505/i.test(error.message)) {
      return Response.json(
        { error: `Slug "${slug}" is already used by another course.` },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Audit log. We reuse the existing admin_actions table; the `action`
  // column is TEXT so we can add new kinds without a migration. The
  // kind union in admin-audit.ts intentionally stays narrow to the
  // existing cases — cast the new kinds through `as AdminActionKind`
  // at the call site so TS stays happy without a type churn PR.
  await logAdminAction({
    actorEmail: actorFromAuth(admin),
    action: "create_course" as unknown as Parameters<typeof logAdminAction>[0]["action"],
    subjectEmail: null,
    details: { slug, code, name },
  });

  const course: CourseRow = {
    id: data.id,
    slug: data.slug,
    code: data.code,
    name: data.name,
    description: data.description,
    accent: data.accent,
    icon: data.icon,
    institution: data.institution,
    active: data.active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    moduleCount: 0,
  };
  return Response.json({ course }, { status: 201 });
}
