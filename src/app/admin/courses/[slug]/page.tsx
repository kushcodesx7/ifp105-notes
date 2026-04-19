"use client";

import { use, useState } from "react";
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

            {/* Phase 5.5: ICT can be seeded into the DB and edited from
                the UI. When the DB is empty for ICT (modules.length === 0)
                we offer a one-click seeder that copies the TS files in.
                After seeding, students read from the DB (with TS fallback
                if anything goes wrong). See `/api/admin/seed-ict`. */}
            {isICT && modules.length === 0 && (
              <IctSeedPrompt
                idToken={idToken}
                password={password}
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
  onSeeded,
}: {
  idToken: string | null;
  password: string;
  onSeeded: () => void;
}) {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{
    counts: { modulesUpserted: number; topicsUpserted: number; questionsUpserted: number };
    warnings: string[];
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function runSeed() {
    setErr(null);
    setSeeding(true);
    try {
      const r = await adminWrite<{
        ok: boolean;
        counts: { modulesUpserted: number; topicsUpserted: number; questionsUpserted: number };
        warnings: string[];
      }>("/api/admin/seed-ict", "POST", { idToken, password }, {});
      setResult({ counts: r.counts, warnings: r.warnings });
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
        📥 Port ICT into the database
      </h3>
      <p className="text-[12px] text-zinc-400 mb-3 leading-relaxed">
        ICT content currently lives in TypeScript files (<code>src/data/module*.ts</code>).
        Click below to copy all 5 modules, ~48 topics, and ~336 MCQs into the DB
        tables so you can edit them from this UI. <strong>Students keep seeing
        the same content</strong> — the module pages prefer the DB copy and fall
        back to TS automatically if anything goes wrong.
      </p>
      {result ? (
        <div className="space-y-1 text-[12px]">
          <p className="text-emerald-400">
            ✓ Seeded {result.counts.modulesUpserted} modules ·{" "}
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
        <button
          onClick={runSeed}
          disabled={seeding}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
        >
          {seeding ? "Seeding (takes ~20s)…" : "Seed ICT into database"}
        </button>
      )}
      {err && <p className="text-[12px] text-red-400 mt-2">{err}</p>}
    </div>
  );
}
