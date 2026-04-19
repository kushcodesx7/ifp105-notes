"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, {
  useAdminAuth,
  adminWrite,
} from "@/components/admin/AdminAuthGate";
import { useToast } from "@/components/admin/Toast";
import { useAdminFetch } from "@/lib/useAdminFetch";
import BlockEditor from "@/components/admin/BlockEditor";
import FlashcardsEditor, { type Flashcard } from "@/components/admin/FlashcardsEditor";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LabelledInput from "@/components/admin/shared/LabelledInput";
import SharedQuestionEditor from "@/components/admin/shared/QuestionEditor";
import SharedNewQuestionForm from "@/components/admin/shared/NewQuestionForm";
import TopicRenderer from "@/components/module/TopicRenderer";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import type { ContentBlock } from "@/types/content";

// /admin/courses/[slug]/modules/[num]
//
// Lists topics for a module and surfaces three editors inline per topic:
//   - Scalar fields (title, hook, timeMin)
//   - Body content (ContentBlock[]) via BlockEditor — Phase 5
//   - MCQ list via QuestionEditor
//
// Expand a topic to access all three without leaving the page.

interface Topic {
  id: string;
  number: number;
  title: string;
  timeMin: number | null;
  hook: string | null;
  orderIndex: number;
  questionCount: number;
  flashcardCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ModuleDetail {
  id: string;
  number: number;
  title: string;
  fullTitle: string | null;
  subtitle: string | null;
  description: string | null;
  accent: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface ModuleResponse {
  module: ModuleDetail;
  topics: Topic[];
}

interface Question {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  bloom: string | null;
  explanation: string | null;
  difficulty: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionsResponse {
  questions: Question[];
  migrationPending?: string;
}

export default function ModuleEditPage({
  params,
}: {
  params: Promise<{ slug: string; num: string }>;
}) {
  const { slug, num } = use(params);
  const { idToken, password, setPassword, ready, setAuthenticated } =
    useAdminAuth();
  const { toast } = useToast();

  const credential = idToken ? { idToken } : password;
  const { data, mutate, isLoading } = useAdminFetch<ModuleResponse>(
    `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}`,
    credential,
    { enabled: ready }
  );

  const [creatingTopic, setCreatingTopic] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (!ready) {
    return (
      <AdminAuthGate
        password={password}
        setPassword={setPassword}
        setAuthenticated={setAuthenticated}
        probeUrl={`/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}`}
      />
    );
  }

  const module_ = data?.module;
  const topics = data?.topics || [];

  function toggle(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <main className="min-h-screen">
      <Navbar title="Admin" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Courses", href: "/admin/courses" },
            {
              label: slug,
              href: `/admin/courses/${encodeURIComponent(slug)}`,
            },
            { label: `Module ${num}` },
          ]}
        />

        {isLoading && !data && (
          <div className="space-y-4">
            <Skeleton height={32} width="50%" radius={8} />
            <SkeletonText lines={2} />
            <Skeleton height={120} radius={16} />
            <Skeleton height={120} radius={16} />
          </div>
        )}

        {module_ && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Module {module_.number}: {module_.title}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {module_.subtitle || "Edit topics and MCQs"}
              </p>
            </div>

            <ModuleMetaEditor
              slug={slug}
              module={module_}
              idToken={idToken}
              password={password}
              onSaved={() => {
                mutate();
                toast({ kind: "success", message: "Module updated." });
              }}
            />

            <div className="mt-8 mb-4 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold">Topics</h2>
                <p className="text-[12px] text-zinc-500">
                  {topics.length} topic{topics.length === 1 ? "" : "s"} ·
                  expand to edit MCQs
                </p>
              </div>
              <button
                onClick={() => setCreatingTopic((v) => !v)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-95 transition-all"
              >
                {creatingTopic ? "Cancel" : "+ New topic"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {creatingTopic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <NewTopicForm
                    slug={slug}
                    num={num}
                    nextNumber={(topics[topics.length - 1]?.number ?? 0) + 1}
                    idToken={idToken}
                    password={password}
                    onCreated={() => {
                      setCreatingTopic(false);
                      mutate();
                      toast({ kind: "success", message: "Topic created." });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {topics.length === 0 && !creatingTopic && (
              <div className="text-center py-8 text-sm text-zinc-500">
                No topics yet. Click + New topic to add the first one.
              </div>
            )}

            <div className="space-y-2">
              {topics.map((t) => (
                <TopicRow
                  key={t.id}
                  slug={slug}
                  num={num}
                  topic={t}
                  expanded={expanded.has(t.number)}
                  onToggle={() => toggle(t.number)}
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

// ─── Module meta editor ─────────────────────────────────────

function ModuleMetaEditor({
  slug,
  module: m,
  idToken,
  password,
  onSaved,
}: {
  slug: string;
  module: ModuleDetail;
  idToken: string | null;
  password: string;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(m.title);
  const [subtitle, setSubtitle] = useState(m.subtitle || "");
  const [description, setDescription] = useState(m.description || "");
  const [accent, setAccent] = useState(m.accent || "#6366F1");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dirty =
    title !== m.title ||
    subtitle !== (m.subtitle || "") ||
    description !== (m.description || "") ||
    accent !== (m.accent || "#6366F1");

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${m.number}`,
        "PATCH",
        { idToken, password },
        { title, subtitle, description, accent }
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
      <h2 className="text-sm font-bold mb-4">Module metadata</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <LabelledInput label="Title" value={title} onChange={setTitle} />
        <LabelledInput label="Subtitle" value={subtitle} onChange={setSubtitle} />
        <div className="md:col-span-2">
          <LabelledInput
            label="Description"
            value={description}
            onChange={setDescription}
            textarea
          />
        </div>
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
        {!dirty && <span className="text-[11px] text-zinc-600">No changes</span>}
      </div>
    </div>
  );
}

// ─── Topic row with expandable MCQ editor ───────────────────

function TopicRow({
  slug,
  num,
  topic,
  expanded,
  onToggle,
  idToken,
  password,
  onChange,
}: {
  slug: string;
  num: string;
  topic: Topic;
  expanded: boolean;
  onToggle: () => void;
  idToken: string | null;
  password: string;
  onChange: () => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold bg-white/[0.04] text-zinc-300"
          aria-hidden="true"
        >
          {topic.number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{topic.title}</div>
          <div className="text-[11px] text-zinc-500 truncate">
            {topic.questionCount} question
            {topic.questionCount === 1 ? "" : "s"}
            {" · "}
            {topic.flashcardCount} flashcard
            {topic.flashcardCount === 1 ? "" : "s"}
            {topic.timeMin ? ` · ${topic.timeMin} min` : ""}
          </div>
        </div>
        <span className="text-zinc-500 text-xs shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-white/[0.05]">
              <TopicEditorPanel
                slug={slug}
                num={num}
                topic={topic}
                idToken={idToken}
                password={password}
                onChange={onChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TopicDetail {
  id: string;
  number: number;
  title: string;
  timeMin: number | null;
  hook: string | null;
  contentJson: ContentBlock[];
  flashcardsJson: Flashcard[];
  flashcardsSource?: "db" | "ts" | "empty";
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface TopicDetailResponse {
  topic: TopicDetail;
}

function TopicEditorPanel({
  slug,
  num,
  topic,
  idToken,
  password,
  onChange,
}: {
  slug: string;
  num: string;
  topic: Topic;
  idToken: string | null;
  password: string;
  onChange: () => void;
}) {
  // useToast lives in context — safe to call from any sub-component.
  // Replaces the four `alert()` calls below; alert blocks the main
  // thread and can't be styled, while toasts queue and animate.
  const { toast } = useToast();

  const [title, setTitle] = useState(topic.title);
  const [hook, setHook] = useState(topic.hook || "");
  const [timeMin, setTimeMin] = useState(
    topic.timeMin != null ? String(topic.timeMin) : ""
  );
  const [saving, setSaving] = useState(false);

  const credential = idToken ? { idToken } : password;

  // Full topic detail (includes contentJson). The list endpoint used
  // by the parent doesn't return content_json to keep the payload
  // small — we only pay for it when the teacher actually opens the
  // topic to edit its body.
  const { data: detailData, mutate: mutateDetail } =
    useAdminFetch<TopicDetailResponse>(
      `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}`,
      credential
    );

  // Body blocks + dirty tracking. Seed from the fetched detail, reset
  // whenever the server version changes (e.g. after save).
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [bodyDirty, setBodyDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savingBody, setSavingBody] = useState(false);

  // Flashcards — same dirty-tracking dance as content blocks. Separate
  // save button / PATCH so one typo in a card doesn't block the body
  // from saving (and vice versa).
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsDirty, setFlashcardsDirty] = useState(false);
  const [savingFlashcards, setSavingFlashcards] = useState(false);
  // "ts" = the loaded deck came from the bundled TS file, not the DB.
  // First Save will migrate them. UI shows a hint banner so the
  // teacher knows why they're seeing cards that aren't yet editable.
  const flashcardsSource = detailData?.topic.flashcardsSource ?? "empty";

  const serverBlocks = detailData?.topic.contentJson;
  useEffect(() => {
    if (!serverBlocks) return;
    setBlocks(serverBlocks);
    setBodyDirty(false);
    // Only re-sync when the server version actually changes (by JSON
    // identity via stringify). Prevents overwriting in-flight edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serverBlocks)]);

  const serverFlashcards = detailData?.topic.flashcardsJson;
  useEffect(() => {
    if (!serverFlashcards) return;
    setFlashcards(serverFlashcards);
    setFlashcardsDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serverFlashcards)]);

  function handleBlocksChange(next: ContentBlock[]) {
    setBlocks(next);
    setBodyDirty(true);
  }

  async function saveBody() {
    setSavingBody(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}`,
        "PATCH",
        { idToken, password },
        { contentJson: blocks }
      );
      setBodyDirty(false);
      mutateDetail();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setSavingBody(false);
    }
  }

  async function saveFlashcards() {
    setSavingFlashcards(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}`,
        "PATCH",
        { idToken, password },
        { flashcardsJson: flashcards }
      );
      setFlashcardsDirty(false);
      mutateDetail();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setSavingFlashcards(false);
    }
  }

  const { data: qData, mutate: mutateQs } = useAdminFetch<QuestionsResponse>(
    `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}/questions`,
    credential
  );
  const questions = qData?.questions || [];

  async function saveMeta() {
    setSaving(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}`,
        "PATCH",
        { idToken, password },
        {
          title,
          hook,
          timeMin: timeMin.trim() === "" ? null : parseInt(timeMin, 10),
        }
      );
      onChange();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  // Move-to-trash is reversible, so the heavy password-reprompt dialog
  // got swapped for a light ConfirmDialog. Permanent delete still
  // requires a trip through /admin/tools/trash (where a second confirm
  // fires before the row actually dies).
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function runDeleteTopic() {
    setDeleting(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}`,
        "DELETE",
        { idToken, password }
      );
      setDeleteOpen(false);
      onChange();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <LabelledInput label="Title" value={title} onChange={setTitle} />
        </div>
        <LabelledInput
          label="Time (minutes)"
          value={timeMin}
          onChange={setTimeMin}
        />
        <div className="md:col-span-3">
          <LabelledInput
            label="Hook (one-line opener)"
            value={hook}
            onChange={setHook}
            textarea
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={saveMeta}
          disabled={saving}
          className="text-xs font-semibold text-white bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save topic"}
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] px-3 py-1.5 rounded-lg transition-colors ml-auto"
        >
          Delete topic
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`Move topic ${topic.number} to trash?`}
        description={`"${topic.title}" and its ${topic.questionCount} question${topic.questionCount === 1 ? "" : "s"} will be moved to /admin/tools/trash. You can restore them anytime.`}
        warning="Students won't see this topic or its questions until it's restored."
        confirmLabel="Move to trash"
        cancelLabel="Keep topic"
        kind="danger"
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={runDeleteTopic}
      />

      {/* ── Topic body (content blocks) — Phase 5 ───────────── */}
      <div className="mt-5 border-t border-white/[0.05] pt-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-[13px] font-bold">Topic body</h3>
            <p className="text-[11px] text-zinc-500">
              Blocks rendered above the quiz — paragraphs, callouts, images, steps, tables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="text-[11px] font-semibold text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={saveBody}
              disabled={!bodyDirty || savingBody}
              className="text-[11px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 px-2.5 py-1 rounded"
            >
              {savingBody ? "Saving…" : bodyDirty ? "Save body" : "Saved"}
            </button>
          </div>
        </div>

        {showPreview ? (
          <div
            className="rounded-lg p-4"
            style={{
              background: "#08080F",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {blocks.length === 0 ? (
              <p className="text-[12px] text-zinc-600 italic text-center py-4">
                (Empty — nothing to preview yet.)
              </p>
            ) : (
              <TopicRenderer content={blocks} />
            )}
          </div>
        ) : (
          <BlockEditor
            value={blocks}
            onChange={handleBlocksChange}
            courseSlug={slug}
            moduleNumber={parseInt(num, 10)}
            topicNumber={topic.number}
            idToken={idToken}
            password={password}
          />
        )}
      </div>

      {/* ── Flashcards ─────────────────────────────────────────
           Separate from body content because these render in a
           different student surface (the Quick-Review deck below
           the topic), have a different authoring cadence (~5-8
           cards vs. full body of mixed blocks), and should save
           independently so a half-edited card can't block body
           saves. */}
      <div className="mt-5 border-t border-white/[0.05] pt-4">
        {flashcardsSource === "ts" && (
          <div
            className="mb-3 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#FCD34D",
            }}
          >
            <strong>📦 Loaded from bundled file</strong> — these {flashcards.length} card{flashcards.length === 1 ? "" : "s"} live in <code className="px-1 py-0.5 rounded bg-black/30">src/data/flashcards.ts</code>. Click <strong>Save cards</strong> below to migrate them to the database — then you can edit, delete, and reorder freely.
          </div>
        )}
        <FlashcardsEditor
          value={flashcards}
          onChange={(next) => {
            setFlashcards(next);
            setFlashcardsDirty(true);
          }}
          onSave={saveFlashcards}
          saving={savingFlashcards}
          dirty={flashcardsDirty || flashcardsSource === "ts"}
        />
      </div>

      <div className="mt-5 border-t border-white/[0.05] pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold">
            Questions ({questions.length})
          </h3>
        </div>
        {qData?.migrationPending && (
          <div
            className="mb-3 rounded-xl p-3 text-[12px]"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#fcd34d",
            }}
          >
            ⚠️ {qData.migrationPending}
          </div>
        )}
        <div className="space-y-2">
          {questions.map((q) => (
            <SharedQuestionEditor
              key={q.id}
              slug={slug}
              moduleNumber={num}
              topicNumber={topic.number}
              question={q}
              idToken={idToken}
              password={password}
              onChange={() => {
                mutateQs();
                onChange();
              }}
            />
          ))}
        </div>
        <SharedNewQuestionForm
          slug={slug}
          moduleNumber={num}
          topicNumber={topic.number}
          nextNumber={(questions[questions.length - 1]?.number ?? 0) + 1}
          idToken={idToken}
          password={password}
          initialOptions={2}
          onCreated={() => {
            mutateQs();
            onChange();
          }}
        />
      </div>
    </div>
  );
}



// ─── New topic form ─────────────────────────────────────────

function NewTopicForm({
  slug,
  num,
  nextNumber,
  idToken,
  password,
  onCreated,
}: {
  slug: string;
  num: string;
  nextNumber: number;
  idToken: string | null;
  password: string;
  onCreated: () => void;
}) {
  const [number, setNumber] = useState(String(nextNumber));
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [timeMin, setTimeMin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics`,
        "POST",
        { idToken, password },
        {
          number: parseInt(number, 10) || undefined,
          title: title.trim(),
          hook: hook.trim() || undefined,
          timeMin: timeMin.trim() === "" ? undefined : parseInt(timeMin, 10),
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
      <h3 className="text-sm font-bold mb-3">New topic</h3>
      <div className="grid md:grid-cols-4 gap-3">
        <LabelledInput label="Number" value={number} onChange={setNumber} />
        <div className="md:col-span-3">
          <LabelledInput
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Variables and types"
          />
        </div>
        <div className="md:col-span-3">
          <LabelledInput
            label="Hook (optional)"
            value={hook}
            onChange={setHook}
            textarea
          />
        </div>
        <LabelledInput
          label="Time (min)"
          value={timeMin}
          onChange={setTimeMin}
        />
      </div>
      {err && <p className="text-[12px] text-red-400 mt-3">{err}</p>}
      <div className="mt-4">
        <button
          onClick={submit}
          disabled={submitting || !title.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
        >
          {submitting ? "Creating…" : "Create topic"}
        </button>
      </div>
    </div>
  );
}

