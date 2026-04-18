"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// UI primitives shared across the per-type block editors. Extracted
// from BlockEditor.tsx during the Phase 2 refactor so:
//   - Each block editor file is self-contained and readable.
//   - A single place owns formatting toolbar + textarea styling,
//     so future tweaks don't drift between block types.
//
// Nothing in here is block-type specific.

// ─── Plain text input (single-line) ───────────────────────

export function PlainInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
    />
  );
}

// ─── Rich textarea with floating-style formatting toolbar ─

/**
 * Textarea for HTML-flavoured content blocks (text / callout / analogy).
 * Shows a formatting pill above the textarea when focused or when the
 * selection is non-empty — B / I / H (highlight) / ↵ (line break).
 * Keyboard shortcuts: ⌘B / ⌘I / ⌘E.
 */
export function HtmlTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  // Wrap the current selection with start/end tags, or insert the
  // tags at the cursor when nothing is selected. The onMouseDown
  // toolbar buttons fire this BEFORE onBlur tears the toolbar down.
  function wrap(startTag: string, endTag: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value: v } = el;
    const before = v.slice(0, s);
    const selected = v.slice(s, e);
    const after = v.slice(e);
    const next = `${before}${startTag}${selected}${endTag}${after}`;
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + startTag.length, e + startTag.length);
    }, 0);
  }

  function checkSelection() {
    const el = ref.current;
    if (!el) return setHasSelection(false);
    setHasSelection(el.selectionStart !== el.selectionEnd);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") {
      e.preventDefault();
      wrap("<strong>", "</strong>");
    } else if (key === "i") {
      e.preventDefault();
      wrap("<em>", "</em>");
    } else if (key === "e") {
      e.preventDefault();
      wrap("<mark>", "</mark>");
    }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {(focused || hasSelection) && (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-0.5 mb-1.5 px-1 py-1 rounded-lg w-fit"
            style={{
              background: "rgba(15,15,25,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
            }}
          >
            <FormatBtn
              onClick={() => wrap("<strong>", "</strong>")}
              title="Bold"
              shortcut="⌘B"
            >
              <span className="font-bold">B</span>
            </FormatBtn>
            <FormatBtn
              onClick={() => wrap("<em>", "</em>")}
              title="Italic"
              shortcut="⌘I"
            >
              <span className="italic font-serif">I</span>
            </FormatBtn>
            <FormatBtn
              onClick={() => wrap("<mark>", "</mark>")}
              title="Highlight"
              shortcut="⌘E"
            >
              <span className="font-semibold" style={{ color: "#A78BFA" }}>
                H
              </span>
            </FormatBtn>
            <span
              className="mx-1 w-px h-4 self-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-hidden="true"
            />
            <FormatBtn onClick={() => wrap("<br>", "")} title="Line break">
              ↵
            </FormatBtn>
          </motion.div>
        )}
      </AnimatePresence>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setTimeout(() => setFocused(false), 120);
        }}
        onSelect={checkSelection}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[14px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-400/40 focus:bg-white/[0.04] transition-colors resize-y"
        style={{ fontFamily: "inherit" }}
      />
      <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-2">
        <span>
          HTML: <code className="text-zinc-500">&lt;strong&gt;</code>{" "}
          <code className="text-zinc-500">&lt;em&gt;</code>{" "}
          <code className="text-zinc-500">&lt;mark&gt;</code>{" "}
          <code className="text-zinc-500">&lt;br&gt;</code>
        </span>
        <span className="text-zinc-700">·</span>
        <span>
          <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">⌘B</kbd>{" "}
          <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">⌘I</kbd>{" "}
          <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">⌘E</kbd>
        </span>
      </p>
    </div>
  );
}

function FormatBtn({
  onClick,
  title,
  shortcut,
  children,
}: {
  onClick: () => void;
  title: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // onMouseDown (not onClick) so the button fires BEFORE the
      // textarea's onBlur removes the toolbar.
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={shortcut ? `${title} (${shortcut})` : title}
      className="w-7 h-7 rounded-md text-[12px] text-zinc-200 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}

// ─── BlockRow action button (hover-revealed ↑/↓/×) ────────

export function BlockActionBtn({
  onClick,
  disabled,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-7 h-7 rounded-md text-[13px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
        color: danger ? "#F87171" : "#E4E4E7",
        border: danger
          ? "1px solid rgba(239,68,68,0.2)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = danger
          ? "rgba(239,68,68,0.16)"
          : "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = danger
          ? "rgba(239,68,68,0.35)"
          : "rgba(255,255,255,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(239,68,68,0.08)"
          : "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = danger
          ? "rgba(239,68,68,0.2)"
          : "rgba(255,255,255,0.06)";
      }}
    >
      {children}
    </button>
  );
}
