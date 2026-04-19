"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";

// Shared MCQ question editor. Was duplicated as `QuestionEditor` in the
// admin module detail page and `InlineQuestionEditor` in the inline
// editor. Unified here during Phase 2 refactor.
//
// Auth: sends `x-id-token` only. The shared-password admin path was
// removed — the `password` prop is kept as a legacy no-op so the ~5
// call sites don't have to update in the same PR.

export interface SharedQuestion {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  bloom: string | null;
  explanation: string | null;
  difficulty: string | null;
}

interface Props {
  slug: string;
  moduleNumber: number | string;
  topicNumber: number;
  question: SharedQuestion;
  idToken: string | null;
  /** Legacy no-op — password admin path removed. Kept for call-site compat. */
  password?: string;
  onChange: () => void;
  /** Compact mode trims some chrome for use inside narrow accordions. */
  variant?: "default" | "compact";
}

function authHeaders(idToken: string | null, password?: string): HeadersInit {
  void password; // legacy no-op param (see interface comment)
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (idToken) h["x-id-token"] = idToken;
  return h;
}

export default function SharedQuestionEditor({
  slug,
  moduleNumber,
  topicNumber,
  question: q,
  idToken,
  password,
  onChange,
  variant = "default",
}: Props) {
  // useToast falls back to a no-op when no provider is in scope (the
  // default context value), so it's safe to call from any caller —
  // the inline editor wraps itself in ToastProvider; the admin pages
  // get it from /admin/layout.tsx.
  const { toast } = useToast();
  const [text, setText] = useState(q.question);
  const [options, setOptions] = useState<string[]>(q.options);
  const [correctIndex, setCorrectIndex] = useState(q.correctIndex);
  const [explanation, setExplanation] = useState(q.explanation || "");
  const [bloom, setBloom] = useState(q.bloom || "");
  const [difficulty, setDifficulty] = useState(q.difficulty || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Re-sync when a different question is loaded into the same slot
  // (happens when the parent switches topics or refetches). Without
  // this, the local edits would stick across navigations.
  useEffect(() => {
    setText(q.question);
    setOptions(q.options);
    setCorrectIndex(q.correctIndex);
    setExplanation(q.explanation || "");
    setBloom(q.bloom || "");
    setDifficulty(q.difficulty || "");
  }, [q.id, q.question, q.correctIndex, q.explanation, q.options, q.bloom, q.difficulty]);

  const dirty =
    text !== q.question ||
    JSON.stringify(options) !== JSON.stringify(q.options) ||
    correctIndex !== q.correctIndex ||
    explanation !== (q.explanation || "") ||
    bloom !== (q.bloom || "") ||
    difficulty !== (q.difficulty || "");

  const endpoint = `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicNumber}/questions/${q.number}`;

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: authHeaders(idToken, password),
        body: JSON.stringify({
          question: text,
          options,
          correctIndex,
          explanation,
          bloom: bloom || null,
          difficulty: difficulty || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Save failed (${res.status})`);
      }
      onChange();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function del() {
    setDeleting(true);
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: authHeaders(idToken, password),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Delete failed (${res.status})`);
      }
      setConfirmOpen(false);
      onChange();
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  }

  const showMetaRow = variant === "default";

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
        {/* Top-right delete icon — same action as the Delete button at
             the bottom of the card, but always visible without scrolling
             past the option list. Bottom button stays for the "I just
             finished editing, now delete" flow. */}
        <button
          onClick={() => setConfirmOpen(true)}
          title="Delete this question"
          aria-label={`Delete question ${q.number}`}
          className="shrink-0 w-7 h-7 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center justify-center mt-1"
        >
          🗑️
        </button>
      </div>

      <div className="space-y-1.5 mb-2 pl-7">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`shared-correct-${q.id}`}
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className="w-4 h-4 accent-emerald-500 shrink-0"
              aria-label={`Mark option ${i + 1} as correct`}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const v = e.target.value;
                setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
              }}
              placeholder={`Option ${i + 1}`}
              className={`w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 ${
                correctIndex === i
                  ? "border-emerald-500/40"
                  : "border-white/[0.06]"
              }`}
            />
            {options.length > 2 && (
              <button
                onClick={() => {
                  setOptions((prev) => prev.filter((_, idx) => idx !== i));
                  if (correctIndex === i) setCorrectIndex(0);
                  else if (correctIndex > i) setCorrectIndex((v) => v - 1);
                }}
                className="text-zinc-600 hover:text-red-400 text-sm shrink-0 w-6 h-6 rounded"
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

      {showMetaRow ? (
        <div className="grid md:grid-cols-3 gap-2 pl-7 mb-2">
          <label className="block">
            <span className="text-[11px] text-zinc-500 block mb-1">
              Explanation
            </span>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Why this answer is correct"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-zinc-500 block mb-1">Bloom</span>
            <input
              type="text"
              value={bloom}
              onChange={(e) => setBloom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-zinc-500 block mb-1">
              Difficulty
            </span>
            <input
              type="text"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </label>
        </div>
      ) : (
        <div className="pl-7 mb-2">
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={2}
            placeholder="Explanation (why this answer is correct)"
            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      )}

      {err && <p className="text-[11px] text-red-400 mb-2 pl-7">{err}</p>}

      <div className="flex items-center gap-2 pl-7">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="text-[11px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40 px-2.5 py-1 rounded"
        >
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] px-2.5 py-1 rounded ml-auto"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Move question ${q.number} to trash?`}
        description={
          q.question.length > 140 ? q.question.slice(0, 140) + "…" : q.question
        }
        warning="The question goes to /admin/tools/trash — restore anytime."
        confirmLabel="Move to trash"
        cancelLabel="Keep"
        kind="danger"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={del}
      />
    </div>
  );
}
