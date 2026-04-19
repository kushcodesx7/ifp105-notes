"use client";

import { useState } from "react";

// Shared "add question" form. Sends `x-id-token` only — the
// shared-password admin path was removed. The `password` prop is kept
// as a legacy no-op for call-site compat.

interface Props {
  slug: string;
  moduleNumber: number | string;
  topicNumber: number;
  nextNumber: number;
  idToken: string | null;
  password?: string;
  onCreated: () => void;
  /** Default 4 options; some pages (compact MCQ panel) start with 2. */
  initialOptions?: number;
}

export default function SharedNewQuestionForm({
  slug,
  moduleNumber,
  topicNumber,
  nextNumber,
  idToken,
  password,
  onCreated,
  initialOptions = 4,
}: Props) {
  void password; // legacy no-op prop (see file header)
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(
    Array(initialOptions).fill("")
  );
  const [correctIndex, setCorrectIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setText("");
    setOptions(Array(initialOptions).fill(""));
    setCorrectIndex(0);
    setErr(null);
  }

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (idToken) headers["x-id-token"] = idToken;

      const res = await fetch(
        `/api/admin/courses/${encodeURIComponent(slug)}/modules/${moduleNumber}/topics/${topicNumber}/questions`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            number: nextNumber,
            question: text.trim(),
            options: options.map((o) => o.trim()).filter(Boolean),
            correctIndex,
          }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Create failed (${res.status})`);
      }
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
        className="mt-3 w-full text-[12px] text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.08] rounded-lg py-2"
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
                setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
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
