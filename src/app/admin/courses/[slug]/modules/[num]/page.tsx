"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminAuthGate, {
  useAdminAuth,
  adminWrite,
} from "@/components/admin/AdminAuthGate";
import { useToast } from "@/components/admin/Toast";
import { useAdminFetch } from "@/lib/useAdminFetch";

// /admin/courses/[slug]/modules/[num]
//
// Lists topics for a module and surfaces the MCQ editor inline per
// topic — expand a topic to edit its questions without leaving the page.
// Topic body content (ContentBlock[]) is Phase 5; here we only edit
// the scalar fields (title, hook, timeMin).

interface Topic {
  id: string;
  number: number;
  title: string;
  timeMin: number | null;
  hook: string | null;
  orderIndex: number;
  questionCount: number;
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

        {isLoading && !data && <p className="text-sm text-zinc-500">Loading…</p>}

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
  const [title, setTitle] = useState(topic.title);
  const [hook, setHook] = useState(topic.hook || "");
  const [timeMin, setTimeMin] = useState(
    topic.timeMin != null ? String(topic.timeMin) : ""
  );
  const [saving, setSaving] = useState(false);

  const credential = idToken ? { idToken } : password;
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
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTopic() {
    if (
      !confirm(
        `Delete topic ${topic.number} "${topic.title}"? Cascades to ${topic.questionCount} question(s).`
      )
    )
      return;
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topic.number}`,
        "DELETE",
        { idToken, password }
      );
      onChange();
    } catch (e) {
      alert((e as Error).message);
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
          onClick={deleteTopic}
          className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] px-3 py-1.5 rounded-lg transition-colors ml-auto"
        >
          Delete topic
        </button>
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
            <QuestionEditor
              key={q.id}
              slug={slug}
              num={num}
              topicNum={topic.number}
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
        <NewQuestionForm
          slug={slug}
          num={num}
          topicNum={topic.number}
          nextNumber={(questions[questions.length - 1]?.number ?? 0) + 1}
          idToken={idToken}
          password={password}
          onCreated={() => {
            mutateQs();
            onChange();
          }}
        />
      </div>
    </div>
  );
}

// ─── MCQ editor (per question) ──────────────────────────────

function QuestionEditor({
  slug,
  num,
  topicNum,
  question: q,
  idToken,
  password,
  onChange,
}: {
  slug: string;
  num: string;
  topicNum: number;
  question: Question;
  idToken: string | null;
  password: string;
  onChange: () => void;
}) {
  const [text, setText] = useState(q.question);
  const [options, setOptions] = useState<string[]>(q.options);
  const [correctIndex, setCorrectIndex] = useState(q.correctIndex);
  const [explanation, setExplanation] = useState(q.explanation || "");
  const [bloom, setBloom] = useState(q.bloom || "");
  const [difficulty, setDifficulty] = useState(q.difficulty || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setOption(i: number, v: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    if (correctIndex === i) setCorrectIndex(0);
    else if (correctIndex > i) setCorrectIndex((v) => v - 1);
  }

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topicNum}/questions/${q.number}`,
        "PATCH",
        { idToken, password },
        {
          question: text,
          options,
          correctIndex,
          explanation,
          bloom: bloom || null,
          difficulty: difficulty || null,
        }
      );
      onChange();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm(`Delete question ${q.number}?`)) return;
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topicNum}/questions/${q.number}`,
        "DELETE",
        { idToken, password }
      );
      onChange();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-[11px] text-zinc-500 font-mono shrink-0 mt-1.5">
          Q{q.number}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
          placeholder="Question text…"
        />
      </div>

      <div className="space-y-1.5 mb-2 pl-7">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${q.id}`}
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className="w-4 h-4 accent-emerald-500 shrink-0"
              aria-label={`Mark option ${i + 1} as correct`}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className={`w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 ${
                correctIndex === i
                  ? "border-emerald-500/40"
                  : "border-white/[0.06]"
              }`}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="text-zinc-600 hover:text-red-400 text-sm shrink-0 w-6 h-6 rounded"
                aria-label="Remove option"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            onClick={addOption}
            className="text-[11px] text-indigo-400 hover:text-indigo-300"
          >
            + Add option
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-2 pl-7 mb-2">
        <LabelledInput
          label="Explanation"
          value={explanation}
          onChange={setExplanation}
          textarea
        />
        <LabelledInput label="Bloom" value={bloom} onChange={setBloom} />
        <LabelledInput
          label="Difficulty"
          value={difficulty}
          onChange={setDifficulty}
        />
      </div>

      {err && <p className="text-[11px] text-red-400 mb-2 pl-7">{err}</p>}

      <div className="flex items-center gap-2 pl-7">
        <button
          onClick={save}
          disabled={saving}
          className="text-[11px] font-semibold text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1 rounded-md transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={del}
          className="text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] px-2.5 py-1 rounded-md transition-colors ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function NewQuestionForm({
  slug,
  num,
  topicNum,
  nextNumber,
  idToken,
  password,
  onCreated,
}: {
  slug: string;
  num: string;
  topicNum: number;
  nextNumber: number;
  idToken: string | null;
  password: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setText("");
    setOptions(["", ""]);
    setCorrectIndex(0);
    setErr(null);
  }

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      await adminWrite(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${num}/topics/${topicNum}/questions`,
        "POST",
        { idToken, password },
        {
          number: nextNumber,
          question: text.trim(),
          options: options.map((o) => o.trim()).filter(Boolean),
          correctIndex,
        }
      );
      reset();
      setOpen(false);
      onCreated();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-[12px] text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.08] rounded-lg py-2 transition-colors"
      >
        + Add question
      </button>
    );
  }

  return (
    <div
      className="mt-3 rounded-lg p-3"
      style={{
        background: "rgba(99,102,241,0.04)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Question text…"
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 mb-2"
      />
      <div className="space-y-1.5 mb-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className="w-4 h-4 accent-emerald-500"
              aria-label={`Mark option ${i + 1} as correct`}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const v = e.target.value;
                setOptions((prev) => {
                  const next = [...prev];
                  next[i] = v;
                  return next;
                });
              }}
              placeholder={`Option ${i + 1}`}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
            {options.length > 2 && (
              <button
                onClick={() => {
                  setOptions((prev) => prev.filter((_, idx) => idx !== i));
                  if (correctIndex >= i && correctIndex > 0)
                    setCorrectIndex((v) => v - 1);
                }}
                className="text-zinc-600 hover:text-red-400 text-sm w-6 h-6"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            onClick={() => setOptions((prev) => [...prev, ""])}
            className="text-[11px] text-indigo-400 hover:text-indigo-300"
          >
            + Add option
          </button>
        )}
      </div>
      {err && <p className="text-[11px] text-red-400 mb-2">{err}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={
            submitting ||
            !text.trim() ||
            options.filter((o) => o.trim()).length < 2
          }
          className="text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 px-3 py-1.5 rounded-lg"
        >
          {submitting ? "Creating…" : "Create question"}
        </button>
        <button
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-xs text-zinc-400 hover:text-white px-3 py-1.5"
        >
          Cancel
        </button>
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

// ─── Shared input helper ────────────────────────────────────

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
