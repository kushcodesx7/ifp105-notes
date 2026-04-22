"use client";

import { use, useEffect, useMemo, useState } from "react";
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
import { useAdminFetch } from "@/lib/useAdminFetch";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { MODULES, TOTAL_TOPICS } from "@/lib/modules";
import { TOTAL_QUESTIONS, MODULE_IDS } from "@/lib/course-stats";

// /admin/courses/[slug] — edit a single course.
//
// Two stacked sections:
//   1. Course metadata editor (code, name, description, accent…)
//   2. Modules list — add/edit/delete modules.
//
// If the slug is "ict" we show a read-only banner at the top — ICT's
// content lives in TypeScript files per the hybrid strategy, so
// editing modules here would have no effect. The metadata editor
// still works (it updates the `courses` table row).

interface Course {
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
}

interface ModuleRow {
  id: string;
  number: number;
  title: string;
  fullTitle: string | null;
  subtitle: string | null;
  description: string | null;
  accent: string | null;
  orderIndex: number;
  topicCount: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseResponse {
  course: Course;
  modules: ModuleRow[];
  migrationPending: string | null;
}

// Next 16 passes params as a Promise; `use()` unwraps inside the client component.
export default function CourseEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { idToken, password, setPassword, ready, setAuthenticated } =
    useAdminAuth();
  const { toast } = useToast();

  const credential = { idToken };
  const { data, mutate, isLoading } = useAdminFetch<CourseResponse>(
    `/api/admin/courses/${encodeURIComponent(slug)}`,
    credential,
    { enabled: ready }
  );

  const [creatingModule, setCreatingModule] = useState(false);

  if (!ready) {
    return (
      <AdminAuthGate
        password={password}
        setPassword={setPassword}
        setAuthenticated={setAuthenticated}
        probeUrl={`/api/admin/courses/${encodeURIComponent(slug)}`}
      />
    );
  }

  const course = data?.course;
  const modules = data?.modules || [];
  const migrationPending = data?.migrationPending;
  const isICT = slug === "ict";

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Courses", href: "/admin/courses" },
            { label: course?.name || slug },
          ]}
        />

        {isLoading && !data && (
          <div className="space-y-4">
            <Skeleton height={32} width="40%" radius={8} />
            <SkeletonText lines={2} />
            <Skeleton height={180} radius={16} />
          </div>
        )}

        {course && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">{course.name}</h1>
              <p className="text-sm text-zinc-500 mt-1">
                <code className="text-zinc-400">{course.slug}</code> · edit
                course metadata, manage modules
              </p>
            </div>

            {/* ICT seed / re-seed prompt. Always visible on ICT —
                previously gated on `modules.length === 0` so it
                hid once seeded. Teachers need a way to PUSH fresh
                TS content into the DB when they've updated the
                source files (e.g., after rewriting MCQs). The
                endpoint is idempotent (upsert-on-conflict), so
                re-running is safe. See `/api/admin/seed-ict`. */}
            {isICT && (
              <IctSeedPrompt
                idToken={idToken}
                password={password}
                isEmpty={modules.length === 0}
                onSeeded={() => mutate()}
              />
            )}

            <CourseMetaEditor
              course={course}
              idToken={idToken}
              password={password}
              onSaved={() => {
                mutate();
                toast({ kind: "success", message: "Course updated." });
              }}
            />

            <div className="mt-8 mb-4 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold">Modules</h2>
                <p className="text-[12px] text-zinc-500">
                  {modules.length} module{modules.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/courses/${encodeURIComponent(slug)}/questions`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  <span aria-hidden="true">📊</span>
                  MCQ bank
                </Link>
                <button
                  onClick={() => setCreatingModule((v) => !v)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-95 transition-all"
                >
                  {creatingModule ? "Cancel" : "+ New module"}
                </button>
              </div>
            </div>

            {migrationPending && (
              <div
                className="mb-4 rounded-xl p-4 text-[13px]"
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
              {creatingModule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <NewModuleForm
                    slug={slug}
                    nextNumber={
                      (modules[modules.length - 1]?.number ?? 0) + 1
                    }
                    idToken={idToken}
                    password={password}
                    onCreated={() => {
                      setCreatingModule(false);
                      mutate();
                      toast({ kind: "success", message: "Module created." });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {modules.length === 0 && !creatingModule && !isICT && (
              <div className="text-center py-8 text-sm text-zinc-500">
                No modules yet. Click + New module to add the first one.
              </div>
            )}

            <div className="space-y-2">
              {modules.map((m) => (
                <ModuleRowCard
                  key={m.id}
                  slug={slug}
                  module={m}
                  idToken={idToken}
                  password={password}
                  onChange={() => mutate()}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ─── Course meta editor ─────────────────────────────────────

function CourseMetaEditor({
  course,
  idToken,
  password,
  onSaved,
}: {
  course: Course;
  idToken: string | null;
  password: string;
  onSaved: () => void;
}) {
  const [code, setCode] = useState(course.code);
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description || "");
  const [accent, setAccent] = useState(course.accent || "#6366F1");
  const [institution, setInstitution] = useState(course.institution || "");
  const [active, setActive] = useState(course.active);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dirty =
    code !== course.code ||
    name !== course.name ||
    description !== (course.description || "") ||
    accent !== (course.accent || "#6366F1") ||
    institution !== (course.institution || "") ||
    active !== course.active;

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(course.slug)}`,
        "PATCH",
        { idToken, password },
        { code, name, description, accent, institution, active }
      );
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <h2 className="text-sm font-bold mb-4">Course metadata</h2>

      <div className="grid md:grid-cols-2 gap-3">
        <LabelledInput label="Course name" value={name} onChange={setName} />
        <LabelledInput label="Course code" value={code} onChange={setCode} />
        <div className="md:col-span-2">
          <LabelledInput
            label="Description"
            value={description}
            onChange={setDescription}
            textarea
          />
        </div>
        <LabelledInput
          label="Institution"
          value={institution}
          onChange={setInstitution}
        />
        <div className="flex items-end gap-3">
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
          <label className="ml-auto inline-flex items-center gap-2 text-[12px] text-zinc-400">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
            Active (visible to students)
          </label>
        </div>
      </div>

      {err && <p className="text-[12px] text-red-400 mt-3">{err}</p>}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {!dirty && (
          <span className="text-[11px] text-zinc-600">No changes</span>
        )}
      </div>
    </div>
  );
}

// ─── Module row ──────────────────────────────────────────────

function ModuleRowCard({
  slug,
  module: m,
  idToken,
  password,
  onChange,
}: {
  slug: string;
  module: ModuleRow;
  idToken: string | null;
  password: string;
  onChange: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Two-step delete: DangerDeleteDialog makes the admin retype the
  // module label ("Module N") before Confirm enables — cognitive
  // friction against misclicks. Auth is the admin's Google ID token;
  // the dialog no longer doubles as a password prompt since the
  // shared-password admin path was removed. Throwing from onConfirm
  // surfaces the error inline in the dialog.
  async function runDelete() {
    await adminWrite(
      `/api/admin/courses/${encodeURIComponent(slug)}/modules/${m.number}`,
      "DELETE",
      { idToken, password }
    );
    setDeleteOpen(false);
    onChange();
  }

  return (
    <>
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            background: (m.accent || "#6366F1") + "22",
            color: m.accent || "#6366F1",
          }}
        >
          {m.number}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{m.title}</div>
          <div className="text-[11px] text-zinc-500 truncate">
            {m.topicCount} topic{m.topicCount === 1 ? "" : "s"} ·{" "}
            {m.questionCount} question{m.questionCount === 1 ? "" : "s"}
            {m.subtitle && ` · ${m.subtitle}`}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/courses/${encodeURIComponent(slug)}/modules/${m.number}`}
            className="text-xs font-semibold text-white bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-lg transition-colors"
          >
            Edit →
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] px-3 py-1.5 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <DangerDeleteDialog
        open={deleteOpen}
        title={`Delete module ${m.number}?`}
        target={`Module ${m.number}: ${m.title}`}
        consequences={[
          `${m.topicCount} topic${m.topicCount === 1 ? "" : "s"}`,
          `${m.questionCount} question${m.questionCount === 1 ? "" : "s"}`,
          `Any uploaded images for topics in this module`,
        ]}
        confirmPhrase={`Module ${m.number}`}
        confirmLabel="Delete module"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={runDelete}
      />
    </>
  );
}

// ─── New module form ────────────────────────────────────────

function NewModuleForm({
  slug,
  nextNumber,
  idToken,
  password,
  onCreated,
}: {
  slug: string;
  nextNumber: number;
  idToken: string | null;
  password: string;
  onCreated: () => void;
}) {
  const [number, setNumber] = useState(String(nextNumber));
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [accent, setAccent] = useState("#6366F1");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules`,
        "POST",
        { idToken, password },
        {
          number: parseInt(number, 10) || undefined,
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          accent,
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
      <h3 className="text-sm font-bold mb-3">New module</h3>
      <div className="grid md:grid-cols-4 gap-3">
        <LabelledInput label="Number" value={number} onChange={setNumber} />
        <div className="md:col-span-3">
          <LabelledInput
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Introduction to Python"
          />
        </div>
        <div className="md:col-span-3">
          <LabelledInput
            label="Subtitle (optional)"
            value={subtitle}
            onChange={setSubtitle}
          />
        </div>
        <label className="text-[11px] text-zinc-500 block">
          <span className="block mb-1">Accent</span>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer bg-transparent border border-white/[0.08]"
          />
        </label>
      </div>
      {err && <p className="text-[12px] text-red-400 mt-3">{err}</p>}
      <div className="mt-4">
        <button
          onClick={submit}
          disabled={submitting || !title.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
        >
          {submitting ? "Creating…" : "Create module"}
        </button>
      </div>
    </div>
  );
}

// ─── Small labelled input helper ────────────────────────────

function LabelledInput({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50";
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
    </label>
  );
}

// ─── ICT seed prompt (Phase 5.5) ───────────────────────────
// Shown on /admin/courses/ict when the DB has 0 modules for ICT. One
// click ports the TS files (src/data/module*.ts + module*-mcq.ts) into
// modules / topics / questions rows. Safe to re-run — the seeder uses
// upsert-on-conflict so a second click just refreshes the data.

function IctSeedPrompt({
  idToken,
  password,
  isEmpty,
  onSeeded,
}: {
  idToken: string | null;
  password: string;
  isEmpty: boolean;
  onSeeded: () => void;
}) {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{
    counts: { modulesUpserted: number; topicsUpserted: number; questionsUpserted: number };
    warnings: string[];
    scope: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // Which module to re-seed. "all" = every module (original behaviour);
  // a number = only that module, others untouched. Added for the
  // Module 5 rewrite (Apr 2026) so a teacher can push one module's
  // TS without clobbering admin-UI edits in the others. Union is
  // typed as "all" | number so a 6th module lands without a type
  // tweak here; the button list below is derived from MODULE_IDS.
  const [scopeChoice, setScopeChoice] = useState<"all" | number>("all");

  // Pre-flight divergence preview. Loaded once on open (for "all
  // modules"); per-module scope reads from the same cached payload
  // by filtering client-side. Added Apr 2026 so the admin can see
  // EXACTLY how many questions would be overwritten before clicking
  // Re-seed. Modules with divergence gate the button behind a typed
  // "OVERWRITE N" confirmation.
  interface ModulePreview {
    moduleNumber: number;
    title: string;
    topics: { total: number; new: number; changed: number; unchanged: number };
    questions: {
      total: number;
      new: number;
      changed: number;
      unchanged: number;
      deleted: number;
    };
    hasDivergence: boolean;
  }
  const [preview, setPreview] = useState<ModulePreview[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErr, setPreviewErr] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Which modules are in the current scope.
  const scopedPreviews = useMemo(() => {
    if (!preview) return null;
    return scopeChoice === "all"
      ? preview
      : preview.filter((p) => p.moduleNumber === scopeChoice);
  }, [preview, scopeChoice]);

  const divergentModules = scopedPreviews?.filter((p) => p.hasDivergence) ?? [];
  const needsConfirm = divergentModules.length > 0;
  // Confirm phrase shape: "OVERWRITE ALL" for all-scope with divergence,
  // or "OVERWRITE MODULE N" for a single-module scope with divergence.
  const confirmPhrase = needsConfirm
    ? scopeChoice === "all"
      ? "OVERWRITE ALL"
      : `OVERWRITE MODULE ${scopeChoice}`
    : null;
  const armed = !needsConfirm || confirmText === confirmPhrase;

  async function loadPreview() {
    if (isEmpty) return; // no DB state to compare against
    setPreviewLoading(true);
    setPreviewErr(null);
    try {
      const headers: Record<string, string> = {};
      if (idToken) headers["x-id-token"] = idToken;
      const res = await fetch("/api/admin/seed-ict/preview", {
        method: "GET",
        headers,
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setPreviewErr(json.error || `HTTP ${res.status}`);
      } else {
        setPreview(json.modules || []);
      }
    } catch (e) {
      setPreviewErr((e as Error).message);
    } finally {
      setPreviewLoading(false);
    }
  }

  // Auto-load preview once the card is visible and DB is non-empty.
  // Intentionally only fires on mount; admin can refresh via the
  // button if the DB changed while they were looking.
  useEffect(() => {
    if (!isEmpty && preview === null && !previewLoading) {
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmpty]);

  // Clear the confirmation input when the scope changes so typed
  // "OVERWRITE MODULE 1" doesn't silently arm a "Module 3" re-seed.
  useEffect(() => {
    setConfirmText("");
  }, [scopeChoice]);

  async function runSeed(moduleNumber: number | null) {
    // Extra belt-and-suspenders for Module 1 — this is the module the
    // teacher has explicitly finalised by hand in the admin UI. The
    // typed-confirmation gate already catches divergence, but Module 1
    // is easy to muscle-memory past in a tired moment, so even for a
    // non-divergent re-seed (or for all-modules scope that INCLUDES
    // Module 1), we surface a native confirm() so the teacher has to
    // physically OK "yes, re-seed Module 1 specifically". Non-Module-1
    // seeds go straight through.
    const touchesModule1 =
      moduleNumber === 1 || (moduleNumber == null /* "all" */);
    if (touchesModule1) {
      const scopeLabel =
        moduleNumber === 1 ? "Module 1 ONLY" : "ALL modules (including Module 1)";
      const ok =
        typeof window === "undefined"
          ? true
          : window.confirm(
              `You are about to re-seed ${scopeLabel}.\n\nModule 1 is the one you finalised in the admin UI. Any admin-UI edits to Module 1 that differ from the TS source WILL BE OVERWRITTEN.\n\nContinue?`
            );
      if (!ok) return;
    }

    setErr(null);
    setSeeding(true);
    try {
      const r = await adminWrite<{
        ok: boolean;
        counts: { modulesUpserted: number; topicsUpserted: number; questionsUpserted: number };
        warnings: string[];
      }>(
        "/api/admin/seed-ict",
        "POST",
        { idToken, password },
        moduleNumber != null ? { moduleNumber } : {}
      );
      setResult({
        counts: r.counts,
        warnings: r.warnings,
        scope: moduleNumber != null ? `Module ${moduleNumber} only` : "all modules",
      });
      setConfirmText("");
      // Re-fetch the preview so the post-seed state is current — after
      // a successful seed, divergence should be 0 for the scope we
      // just seeded.
      loadPreview();
      onSeeded();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div
      className="mb-6 rounded-xl p-5"
      style={{
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.3)",
      }}
    >
      <h3 className="text-sm font-bold text-white mb-1">
        {isEmpty ? "📥 Port ICT into the database" : "♻️ Re-seed ICT from TS files"}
      </h3>
      <p className="text-[12px] text-zinc-400 mb-3 leading-relaxed">
        {isEmpty ? (
          <>
            ICT content currently lives in TypeScript files (<code>src/data/module*.ts</code>).
            Click below to copy all {MODULES.length} modules, {TOTAL_TOPICS} topics, and {TOTAL_QUESTIONS} MCQs into the DB
            tables so you can edit them from this UI. <strong>Students keep seeing
            the same content</strong> — the module pages prefer the DB copy and fall
            back to TS automatically if anything goes wrong.
          </>
        ) : (
          <>
            <strong>Pushes the latest TS source into the DB</strong>, overwriting any
            content with the same module/topic/question position. Use after editing
            the source TS files (e.g., MCQ rewrites). DB-edited rows that share a
            slot will be overwritten by TS — the seeder is &ldquo;reset to TS source.&rdquo;
            Safe to run multiple times.
          </>
        )}
      </p>
      {result ? (
        <div className="space-y-1 text-[12px]">
          <p className="text-emerald-400">
            ✓ Seeded ({result.scope}): {result.counts.modulesUpserted} modules ·{" "}
            {result.counts.topicsUpserted} topics ·{" "}
            {result.counts.questionsUpserted} questions
          </p>
          {result.warnings.length > 0 && (
            <details className="text-amber-400">
              <summary className="cursor-pointer">
                {result.warnings.length} warning{result.warnings.length === 1 ? "" : "s"}
              </summary>
              <ul className="mt-1 ml-4 list-disc text-[11px] text-amber-300/80">
                {result.warnings.slice(0, 10).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
                {result.warnings.length > 10 && (
                  <li>…and {result.warnings.length - 10} more</li>
                )}
              </ul>
            </details>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Scope picker — only shown after the initial port, because
              on an empty DB "all modules" is the only sensible choice. */}
          {!isEmpty && (
            <div
              className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-[11px] text-zinc-400 font-semibold">
                Scope:
              </span>
              {(["all", ...MODULE_IDS] as const).map((opt) => {
                const label = opt === "all" ? "All modules" : `Module ${opt}`;
                const active = scopeChoice === opt;
                // Per-module divergence dot: red = admin edits would
                // be overwritten; amber = new content only; green =
                // no changes; grey = preview not yet loaded.
                const modPreview =
                  opt !== "all" && preview
                    ? preview.find((p) => p.moduleNumber === opt)
                    : null;
                const dotColor = modPreview
                  ? modPreview.hasDivergence
                    ? "#F87171" // red: would clobber admin edits
                    : modPreview.questions.new > 0
                      ? "#FBBF24" // amber: fresh content only
                      : "#34D399" // green: no changes
                  : null;
                return (
                  <button
                    key={String(opt)}
                    onClick={() => setScopeChoice(opt)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                        : "rgba(255,255,255,0.04)",
                      color: active ? "#fff" : "#A1A1AA",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {dotColor && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: dotColor }}
                        aria-hidden="true"
                      />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Divergence preview panel. Shows per-module counts of
              "new / changed / unchanged" questions for the current
              scope, so the teacher knows exactly what this Re-seed
              will touch BEFORE they click the button. */}
          {!isEmpty && (
            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${
                  needsConfirm
                    ? "rgba(248,113,113,0.3)"
                    : "rgba(255,255,255,0.06)"
                }`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-zinc-400 font-semibold">
                  Preview — what this Re-seed would do
                </span>
                <button
                  onClick={loadPreview}
                  disabled={previewLoading}
                  className="text-[10px] text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
                >
                  {previewLoading ? "Refreshing…" : "↻ Refresh"}
                </button>
              </div>
              {previewErr && (
                <p className="text-[11px] text-red-400">{previewErr}</p>
              )}
              {previewLoading && !scopedPreviews && (
                <p className="text-[11px] text-zinc-500">Comparing TS source against the DB…</p>
              )}
              {scopedPreviews && scopedPreviews.length === 0 && (
                <p className="text-[11px] text-zinc-500">No modules in scope.</p>
              )}
              {scopedPreviews && scopedPreviews.length > 0 && (
                <div className="space-y-1.5">
                  {scopedPreviews.map((p) => {
                    const tone = p.hasDivergence
                      ? "text-red-300"
                      : p.questions.new > 0
                        ? "text-amber-300"
                        : "text-emerald-300";
                    return (
                      <div
                        key={p.moduleNumber}
                        className="text-[11px] flex items-baseline gap-2 flex-wrap"
                      >
                        <span className="font-bold text-zinc-200 w-20 shrink-0">
                          M{p.moduleNumber}
                        </span>
                        <span className="text-zinc-400 truncate flex-1">
                          {p.title}
                        </span>
                        <span className={`${tone} tabular-nums font-semibold`}>
                          {p.hasDivergence
                            ? `⚠ ${p.questions.changed} would be overwritten`
                            : p.questions.new > 0
                              ? `${p.questions.new} new · ${p.questions.unchanged} unchanged`
                              : `✓ ${p.questions.unchanged} in sync`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {needsConfirm && scopedPreviews && (
                <p className="text-[11px] text-red-300 mt-2 leading-relaxed">
                  ⚠ At least one module in scope has admin-UI edits
                  that differ from the TS source. Re-seeding would{" "}
                  <strong>overwrite</strong> those edits. Type{" "}
                  <code className="px-1 py-0.5 rounded bg-white/[0.06] text-white font-mono">
                    {confirmPhrase}
                  </code>{" "}
                  below to confirm.
                </p>
              )}
              {needsConfirm && (
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type "${confirmPhrase}" to enable`}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full mt-2 px-3 py-2 text-[12px] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: armed
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                />
              )}
            </div>
          )}

          <button
            onClick={() =>
              runSeed(typeof scopeChoice === "number" ? scopeChoice : null)
            }
            disabled={seeding || (!isEmpty && !armed)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
          >
            {seeding
              ? "Seeding…"
              : isEmpty
                ? "Seed ICT into database"
                : needsConfirm && !armed
                  ? `Type "${confirmPhrase}" above to enable`
                  : scopeChoice === "all"
                    ? "♻️ Re-seed ALL modules from TS source"
                    : `♻️ Re-seed ONLY Module ${scopeChoice} from TS source`}
          </button>
        </div>
      )}
      {err && <p className="text-[12px] text-red-400 mt-2">{err}</p>}
    </div>
  );
}
