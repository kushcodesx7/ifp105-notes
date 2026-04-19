"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, {
  useAdminAuth,
  adminWrite,
} from "@/components/admin/AdminAuthGate";
import DangerDeleteDialog from "@/components/admin/DangerDeleteDialog";
import { useToast } from "@/components/admin/Toast";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAdminFetch } from "@/lib/useAdminFetch";

// /admin/courses — the Phase 4 entry point.
//
// Lists every course on the platform and lets the teacher:
//   - See status at a glance (active/inactive, module count, last edit)
//   - Create a new course (inline form, minimal friction)
//   - Drill into a course to edit modules/topics/questions
//
// The course labelled "ict" is a first-class citizen here too, but its
// content (modules/topics) stays in TS files per the hybrid strategy —
// clicking it shows a banner explaining that.

interface CourseRow {
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

interface CoursesResponse {
  courses: CourseRow[];
  migrationPending?: string;
}

export default function CoursesPage() {
  const { idToken, password, setPassword, ready, setAuthenticated } =
    useAdminAuth();
  const { toast } = useToast();

  const credential = idToken ? { idToken } : password;
  const { data, isLoading, mutate } = useAdminFetch<CoursesResponse>(
    "/api/admin/courses",
    credential,
    { enabled: ready }
  );

  const [creating, setCreating] = useState(false);
  // Track which course (if any) is being hard-deleted via the danger
  // dialog. `null` means the dialog is closed. Declared BEFORE the
  // conditional auth-gate return so React's hook order stays stable
  // across renders — the previous order (useState after the if-return)
  // violated the rules of hooks and broke the page on React 19.
  const [hardDeleteTarget, setHardDeleteTarget] = useState<CourseRow | null>(
    null
  );

  if (!ready) {
    return (
      <AdminAuthGate
        password={password}
        setPassword={setPassword}
        setAuthenticated={setAuthenticated}
        probeUrl="/api/admin/courses"
      />
    );
  }

  // Soft delete = "Hide" — reversible, low-blast-radius. Keeps the
  // cheap confirm() path. Hard delete = cascades across modules,
  // topics, questions, and orphans course_id references in
  // student_progress — routed through DangerDeleteDialog which makes
  // the admin retype the course slug before Confirm enables.
  async function handleSoftDelete(slug: string) {
    if (
      !confirm(
        `Hide course "${slug}" from the student-facing course picker? (Soft delete — all data preserved, reversible.)`
      )
    )
      return;
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}`,
        "DELETE",
        { idToken, password }
      );
      toast({ kind: "success", message: "Course hidden." });
      mutate();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  // Hard delete runs ONLY through the DangerDeleteDialog. Auth is the
  // current admin's Google ID token; the dialog enforces a retype of
  // the course slug before enabling Confirm (anti-misclick friction).
  async function runHardDelete(slug: string) {
    await adminWrite(
      `/api/admin/courses/${encodeURIComponent(slug)}?hard=true`,
      "DELETE",
      { idToken, password }
    );
    setHardDeleteTarget(null);
    toast({ kind: "success", message: "Course permanently deleted." });
    mutate();
  }

  const courses = data?.courses || [];
  const migrationPending = data?.migrationPending;

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[{ label: "Admin", href: "/admin" }, { label: "Courses" }]}
        />

        <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Courses</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Every course this deployment serves · create · edit · archive
            </p>
          </div>
          <button
            onClick={() => setCreating((v) => !v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-95 transition-all"
          >
            {creating ? "Cancel" : "+ New course"}
          </button>
        </div>

        {migrationPending && (
          <div
            className="mb-6 rounded-xl p-4 text-[13px]"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#fcd34d",
            }}
          >
            ⚠️ {migrationPending}
          </div>
        )}

        <AnimatePresence initial={false}>
          {creating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <NewCourseForm
                idToken={idToken}
                password={password}
                onCreated={() => {
                  setCreating(false);
                  mutate();
                  toast({ kind: "success", message: "Course created." });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && !data && (
          <div className="grid md:grid-cols-2 gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!isLoading && courses.length === 0 && !creating && (
          <div className="text-center py-12 text-sm text-zinc-500">
            No courses yet. Click <span className="text-zinc-300">+ New course</span>{" "}
            to create your first one.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onDelete={() => handleSoftDelete(c.slug)}
              onHardDelete={() => setHardDeleteTarget(c)}
            />
          ))}
        </div>
      </div>

      <DangerDeleteDialog
        open={hardDeleteTarget !== null}
        title={`Permanently delete "${hardDeleteTarget?.name ?? ""}"?`}
        target={`Course: ${hardDeleteTarget?.code ?? ""} — ${hardDeleteTarget?.name ?? ""} (${hardDeleteTarget?.slug ?? ""})`}
        consequences={[
          `All ${hardDeleteTarget?.moduleCount ?? 0} module${(hardDeleteTarget?.moduleCount ?? 0) === 1 ? "" : "s"} in this course`,
          `Every topic inside those modules`,
          `Every MCQ inside those topics`,
          `Uploaded images for this course (in Supabase Storage)`,
          `Any existing student_progress rows that reference this course will be orphaned`,
        ]}
        confirmPhrase={hardDeleteTarget?.slug ?? ""}
        confirmLabel="Delete course permanently"
        onCancel={() => setHardDeleteTarget(null)}
        onConfirm={() => runHardDelete(hardDeleteTarget!.slug)}
      />
    </main>
  );
}

// ─── Course card ──────────────────────────────────────────────

function CourseCard({
  course,
  onDelete,
  onHardDelete,
}: {
  course: CourseRow;
  onDelete: () => void;
  onHardDelete: () => void;
}) {
  const isICT = course.slug === "ict";
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        opacity: course.active ? 1 : 0.55,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: course.accent || "#6366F1" }}
              aria-hidden="true"
            />
            <h2 className="text-base font-bold truncate">{course.name}</h2>
            {!course.active && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                hidden
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            <span className="text-zinc-400">{course.code}</span>
            {course.institution && ` · ${course.institution}`}
          </p>
        </div>
        <code className="text-[10px] text-zinc-600 bg-white/[0.03] rounded px-1.5 py-0.5 shrink-0">
          {course.slug}
        </code>
      </div>

      {course.description && (
        <p className="text-[12px] text-zinc-500 line-clamp-2 mb-3">
          {course.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-4">
        <span>
          <span className="text-zinc-300 font-semibold">
            {course.moduleCount}
          </span>{" "}
          modules
        </span>
        <span className="text-zinc-700">·</span>
        <span>
          Edited{" "}
          {new Date(course.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
        {isICT && (
          <>
            <span className="text-zinc-700">·</span>
            <span className="text-amber-400/80">content in TS files</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/admin/courses/${encodeURIComponent(course.slug)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/[0.05] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg transition-colors"
        >
          Edit →
        </Link>
        {course.active ? (
          <button
            onClick={onDelete}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] px-3 py-1.5 rounded-lg transition-colors"
          >
            Hide
          </button>
        ) : null}
        {!isICT && (
          <button
            onClick={onHardDelete}
            className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] px-3 py-1.5 rounded-lg transition-colors ml-auto"
            title="Permanently delete (cascades)"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── New course form ──────────────────────────────────────────

function NewCourseForm({
  idToken,
  password,
  onCreated,
}: {
  idToken: string | null;
  password: string;
  onCreated: () => void;
}) {
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#6366F1");
  const [institution, setInstitution] = useState("Amity Tashkent");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Auto-suggest slug from name as the teacher types. Only replaces the
  // slug if the teacher hasn't manually edited it yet (flagged by
  // `slugTouched`). Avoids the annoying pattern where you type the slug
  // first, then the name overwrites it.
  const [slugTouched, setSlugTouched] = useState(false);
  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) {
      setSlug(
        v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40)
      );
    }
  }

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      await adminWrite(
        "/api/admin/courses",
        "POST",
        { idToken, password },
        {
          slug: slug.trim(),
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          accent: accent.trim() || undefined,
          institution: institution.trim() || undefined,
        }
      );
      onCreated();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(99,102,241,0.04)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <h2 className="text-sm font-bold mb-4">New course</h2>

      <div className="grid md:grid-cols-2 gap-3">
        <Field
          label="Course name"
          placeholder="Python Programming"
          value={name}
          onChange={onNameChange}
        />
        <Field
          label="Slug (URL)"
          placeholder="python-101"
          value={slug}
          onChange={(v) => {
            setSlug(v.toLowerCase());
            setSlugTouched(true);
          }}
          hint="Lowercase, hyphens only. Permanent once set."
          mono
        />
        <Field
          label="Course code"
          placeholder="PY101"
          value={code}
          onChange={setCode}
        />
        <Field
          label="Institution"
          placeholder="Amity Tashkent"
          value={institution}
          onChange={setInstitution}
        />
        <div className="md:col-span-2">
          <Field
            label="Description"
            placeholder="One-line pitch shown on the course picker."
            value={description}
            onChange={setDescription}
            textarea
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="text-[11px] text-zinc-500 block">
            <span className="block mb-1">Accent color</span>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer bg-transparent border border-white/[0.08]"
            />
          </label>
          <code className="text-[11px] text-zinc-500 mb-2.5">{accent}</code>
        </div>
      </div>

      {err && (
        <p className="text-[12px] text-red-400 mt-3">{err}</p>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={submit}
          disabled={submitting || !slug.trim() || !code.trim() || !name.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
        >
          {submitting ? "Creating…" : "Create course"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  mono,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  mono?: boolean;
  textarea?: boolean;
}) {
  const cls = `w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 ${
    mono ? "font-mono" : ""
  }`;
  return (
    <label className="block">
      <span className="text-[11px] text-zinc-500 block mb-1">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {hint && <span className="text-[10px] text-zinc-600 block mt-1">{hint}</span>}
    </label>
  );
}
