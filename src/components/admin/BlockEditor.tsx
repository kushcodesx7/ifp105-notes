"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentBlock, TopicCard, TableRow, StepItem } from "@/types/content";

// Block editor for the topic body (`topics.content_json`).
//
// Renders an editable list of ContentBlocks with:
//   - Per-block inline editors (text / callout / analogy / image / steps
//     / table / cards). Specialized era-cards omitted from the MVP —
//     only Module 1 Topic 2 uses it and it stays in TS files.
//   - Reorder (↑ / ↓), delete, and "Add block" dropdown
//   - Image uploads go through /api/admin/upload → Supabase Storage
//     → URL written into `block.src`
//
// The parent owns the blocks array and the save side-effect (this
// component is controlled: `value` in, `onChange` out). The topic
// editor panel in /admin/courses/[slug]/modules/[num] wires onChange
// to a debounced PATCH of contentJson.

interface BlockEditorProps {
  value: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
  // Upload context — written into the uploaded file's storage path so
  // cleanup scripts can find orphaned uploads per course/module/topic.
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  // Auth passthrough for the upload API
  idToken: string | null;
  password: string;
}

type BlockType = ContentBlock["type"];

interface BlockMenuEntry {
  type: BlockType;
  label: string;
  icon: string;
  hint: string;
  // Space-separated keywords for the command-palette filter.
  keywords: string;
}

const BLOCK_MENU: BlockMenuEntry[] = [
  {
    type: "text",
    label: "Paragraph",
    icon: "📝",
    hint: "Plain text with bold + highlight",
    keywords: "text paragraph body prose copy",
  },
  {
    type: "callout",
    label: "Callout",
    icon: "💡",
    hint: "Coloured info box (amber, blue, red, purple…)",
    keywords: "callout info warning note tip aside",
  },
  {
    type: "analogy",
    label: "Analogy",
    icon: "🧠",
    hint: "Labelled analogy — real-world comparison",
    keywords: "analogy example comparison metaphor",
  },
  {
    type: "image",
    label: "Image",
    icon: "🖼",
    hint: "Upload + caption",
    keywords: "image picture photo diagram upload",
  },
  {
    type: "steps",
    label: "Steps",
    icon: "👣",
    hint: "Numbered step-by-step list",
    keywords: "steps list procedure walkthrough tutorial",
  },
  {
    type: "table",
    label: "Table",
    icon: "📊",
    hint: "Headers + rows + cells",
    keywords: "table grid rows columns data",
  },
  {
    type: "cards",
    label: "Cards grid",
    icon: "🃏",
    hint: "Icon + title + description cards",
    keywords: "cards grid tiles features highlights",
  },
];

// Icon + colour metadata keyed by block type — used for the per-row
// pill and the drag-handle gutter so each block type is recognisable
// at a glance without reading the tiny type label.
const BLOCK_META: Record<BlockType, { icon: string; accent: string }> = {
  text: { icon: "📝", accent: "#818CF8" },
  callout: { icon: "💡", accent: "#FCD34D" },
  analogy: { icon: "🧠", accent: "#F472B6" },
  image: { icon: "🖼", accent: "#60A5FA" },
  steps: { icon: "👣", accent: "#34D399" },
  table: { icon: "📊", accent: "#FB923C" },
  cards: { icon: "🃏", accent: "#A78BFA" },
  "era-cards": { icon: "📜", accent: "#78716C" },
};

function makeEmpty(type: BlockType): ContentBlock {
  switch (type) {
    case "text":
      return { type: "text", html: "" };
    case "callout":
      return { type: "callout", variant: "blue", html: "" };
    case "analogy":
      return { type: "analogy", label: "Real-world parallel", html: "" };
    case "image":
      return { type: "image", src: undefined, description: "" };
    case "steps":
      return { type: "steps", items: [{ title: "", description: "" }] };
    case "table":
      return {
        type: "table",
        headers: ["Column 1", "Column 2"],
        rows: [{ cells: ["", ""] }],
      };
    case "cards":
      return {
        type: "cards",
        columns: 2,
        items: [{ icon: "✨", title: "", description: "" }],
      };
    case "era-cards":
      return { type: "era-cards", columns: 4, items: [] };
  }
}

export default function BlockEditor({
  value,
  onChange,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: BlockEditorProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function update(i: number, next: ContentBlock) {
    const copy = [...value];
    copy[i] = next;
    onChange(copy);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const copy = [...value];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  }

  function add(type: BlockType) {
    onChange([...value, makeEmpty(type)]);
    setMenuOpen(false);
  }

  return (
    <div className="space-y-2">
      {value.map((block, i) => (
        <BlockRow
          key={i}
          block={block}
          first={i === 0}
          last={i === value.length - 1}
          onChange={(next) => update(i, next)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          courseSlug={courseSlug}
          moduleNumber={moduleNumber}
          topicNumber={topicNumber}
          idToken={idToken}
          password={password}
        />
      ))}

      {value.length === 0 && (
        <div
          className="text-center py-8 rounded-2xl"
          style={{
            background: "rgba(99,102,241,0.03)",
            border: "1px dashed rgba(99,102,241,0.25)",
          }}
        >
          <div className="text-3xl mb-2" aria-hidden="true">✨</div>
          <p className="text-[13px] text-zinc-400 mb-3">
            This topic&apos;s body is empty. Add a block to start writing.
          </p>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-[12px] font-semibold text-white px-4 py-2 rounded-full inline-flex items-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            <span aria-hidden="true">+</span> Insert first block
          </button>
        </div>
      )}

      {/* Add-block trigger — subtle by default, prominent on hover.
          Styled to read as "start writing here" rather than "hit this
          form button". */}
      {value.length > 0 && (
        <button
          onClick={() => setMenuOpen(true)}
          className="group w-full mt-1 py-2 rounded-xl flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 hover:text-white transition-all"
          style={{
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(99,102,241,0.05)";
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            +
          </span>
          <span>Add block</span>
          <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-[1px] rounded bg-white/[0.04] border border-white/[0.06] text-zinc-500">
            click
          </kbd>
        </button>
      )}

      {/* Command palette — filter-as-you-type block inserter */}
      <BlockCommandPalette
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelect={(type) => {
          add(type);
          setMenuOpen(false);
        }}
      />
    </div>
  );
}

// ─── Command palette (filterable block picker) ─────────────

function BlockCommandPalette({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on open, focus the input.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_MENU;
    return BLOCK_MENU.filter((m) => {
      const hay = `${m.label} ${m.keywords} ${m.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  // Keep the active index in bounds as the list filters.
  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      onSelect(filtered[activeIndex].type);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,25,0.97), rgba(10,10,18,0.98))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
              backdropFilter: "blur(24px) saturate(160%)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Insert block"
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span aria-hidden="true" className="text-zinc-500 text-sm">
                ⌘K
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type to filter — paragraph, callout, image…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                Esc
              </kbd>
            </div>
            <div className="max-h-[320px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-center py-6 text-[12px] text-zinc-500">
                  No block types match &quot;{query}&quot;
                </p>
              ) : (
                filtered.map((m, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={m.type}
                      onClick={() => onSelect(m.type)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        background: active ? "rgba(99,102,241,0.12)" : "transparent",
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{
                          background: `${BLOCK_META[m.type].accent}1A`,
                          border: `1px solid ${BLOCK_META[m.type].accent}30`,
                        }}
                      >
                        {m.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-white">
                          {m.label}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
                          {m.hint}
                        </div>
                      </div>
                      {active && (
                        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300 shrink-0">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div
              className="flex items-center justify-between px-4 py-2 text-[10px] text-zinc-500"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">↑↓</kbd> to navigate
              </span>
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">↵</kbd> to insert
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Row wrapper (chrome + per-type editor) ─────────────────

function BlockRow({
  block,
  first,
  last,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: {
  block: ContentBlock;
  first: boolean;
  last: boolean;
  onChange: (next: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  password: string;
}) {
  const meta = BLOCK_META[block.type];
  const menuEntry = BLOCK_MENU.find((m) => m.type === block.type);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group flex items-stretch rounded-xl"
      style={{
        background: hovered
          ? "rgba(255,255,255,0.035)"
          : "rgba(255,255,255,0.018)",
        border: `1px solid ${
          hovered ? `${meta.accent}30` : "rgba(255,255,255,0.05)"
        }`,
        boxShadow: hovered
          ? `0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px ${meta.accent}15`
          : "none",
        transition: "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
      }}
    >
      {/* Left gutter — accent stripe + drag handle + type icon.
          Gives the block an identity at a glance and something to
          grab when reordering. Drag-and-drop isn't wired yet (we use
          the up/down buttons on the right), but the handle previews
          the affordance. */}
      <div
        className="flex flex-col items-center gap-1 py-3 px-1.5 shrink-0 rounded-l-xl"
        style={{
          background: `${meta.accent}0D`,
          borderRight: `1px solid ${meta.accent}22`,
        }}
      >
        <span
          className="text-sm"
          aria-hidden="true"
          title={menuEntry?.label || block.type}
        >
          {meta.icon}
        </span>
        <motion.span
          animate={{ opacity: hovered ? 0.6 : 0.2 }}
          className="text-[10px] font-bold tracking-tight select-none"
          style={{ color: meta.accent }}
          aria-hidden="true"
          title="Drag handle (use arrow buttons to reorder)"
        >
          ⋮⋮
        </motion.span>
      </div>

      {/* Main block editor area */}
      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: `${meta.accent}14`,
              color: meta.accent,
              border: `1px solid ${meta.accent}28`,
            }}
          >
            {menuEntry?.label || block.type}
          </span>
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-0.5"
              >
                <BlockActionBtn
                  onClick={onMoveUp}
                  disabled={first}
                  label="Move up"
                >
                  ↑
                </BlockActionBtn>
                <BlockActionBtn
                  onClick={onMoveDown}
                  disabled={last}
                  label="Move down"
                >
                  ↓
                </BlockActionBtn>
                <span
                  className="mx-1 w-px h-4"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  aria-hidden="true"
                />
                <BlockActionBtn
                  onClick={onDelete}
                  label="Delete block"
                  danger
                >
                  ×
                </BlockActionBtn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {block.type === "text" && (
          <TextEditor block={block} onChange={onChange} />
        )}
        {block.type === "callout" && (
          <CalloutEditor block={block} onChange={onChange} />
        )}
        {block.type === "analogy" && (
          <AnalogyEditor block={block} onChange={onChange} />
        )}
        {block.type === "image" && (
          <ImageEditor
            block={block}
            onChange={onChange}
            courseSlug={courseSlug}
            moduleNumber={moduleNumber}
            topicNumber={topicNumber}
            idToken={idToken}
            password={password}
          />
        )}
        {block.type === "steps" && (
          <StepsEditor block={block} onChange={onChange} />
        )}
        {block.type === "table" && (
          <TableEditor block={block} onChange={onChange} />
        )}
        {block.type === "cards" && (
          <CardsEditor block={block} onChange={onChange} />
        )}
        {block.type === "era-cards" && (
          <p className="text-[11px] text-zinc-500 italic">
            era-cards editing not supported in the MVP — edit via JSON in a
            future phase.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Small primitive: row action button ─────────────────────

function BlockActionBtn({
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

// ─── Shared UI primitives ──────────────────────────────────

function HtmlTextarea({
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

  // Wrap the current selection with start/end tags, or insert them at
  // the cursor when nothing is selected. Used by the toolbar buttons.
  function wrap(startTag: string, endTag: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value: v } = el;
    const before = v.slice(0, s);
    const selected = v.slice(s, e);
    const after = v.slice(e);
    const next = `${before}${startTag}${selected}${endTag}${after}`;
    onChange(next);
    // Restore selection just inside the wrapper on next tick.
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + startTag.length, e + startTag.length);
    }, 0);
  }

  const [focused, setFocused] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  function checkSelection() {
    const el = ref.current;
    if (!el) return setHasSelection(false);
    setHasSelection(el.selectionStart !== el.selectionEnd);
  }

  // Keyboard shortcuts inside the textarea — ⌘B / ⌘I / ⌘E (highlight).
  // Standard Notion-ish muscle memory. Guards against triggering when
  // the textarea isn't focused so they don't fight other hotkeys.
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
      {/* Floating-ish toolbar — fades in on focus OR when text is
          selected. Anchored above the textarea so it doesn't jump
          around like a real floating toolbar would, but gives the
          same "context-aware" vibe. */}
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
              <span
                className="font-semibold"
                style={{ color: "#A78BFA" }}
              >
                H
              </span>
            </FormatBtn>
            <span
              className="mx-1 w-px h-4 self-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-hidden="true"
            />
            <FormatBtn
              onClick={() => wrap("<br>", "")}
              title="Line break"
            >
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
          // Delay so clicks on toolbar buttons still fire before we
          // tear down the toolbar.
          setTimeout(() => setFocused(false), 120);
        }}
        onSelect={checkSelection}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[14px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-400/40 focus:bg-white/[0.04] transition-colors resize-y"
        style={{
          fontFamily: "inherit",
        }}
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

function PlainInput({
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

// ─── Text block ────────────────────────────────────────────

function TextEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "text" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <HtmlTextarea
      value={block.html}
      onChange={(html) => onChange({ ...block, html })}
      placeholder="Write a paragraph. Strong/highlight/italic via the toolbar above."
      rows={3}
    />
  );
}

// ─── Callout block ─────────────────────────────────────────

const CALLOUT_VARIANTS: { value: "amber" | "blue" | "red" | "purple" | "dark"; label: string }[] = [
  { value: "blue", label: "Blue (info)" },
  { value: "amber", label: "Amber (tip)" },
  { value: "red", label: "Red (warning)" },
  { value: "purple", label: "Purple (highlight)" },
  { value: "dark", label: "Dark (quote)" },
];

function CalloutEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <select
        value={block.variant || "blue"}
        onChange={(e) =>
          onChange({
            ...block,
            variant: e.target.value as "amber" | "blue" | "red" | "purple" | "dark",
          })
        }
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-indigo-500/50"
      >
        {CALLOUT_VARIANTS.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
      <HtmlTextarea
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        placeholder="Callout content."
      />
    </div>
  );
}

// ─── Analogy block ─────────────────────────────────────────

function AnalogyEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "analogy" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <PlainInput
        value={block.label}
        onChange={(label) => onChange({ ...block, label })}
        placeholder="Label (e.g. 'Real-world parallel')"
      />
      <HtmlTextarea
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        placeholder="Analogy content — link the new concept to something the student already knows."
      />
    </div>
  );
}

// ─── Image block ───────────────────────────────────────────

function ImageEditor({
  block,
  onChange,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  onChange: (next: ContentBlock) => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  password: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("courseSlug", courseSlug);
      fd.append("moduleNumber", String(moduleNumber));
      fd.append("topicNumber", String(topicNumber));

      const headers: Record<string, string> = {};
      if (idToken) headers["x-id-token"] = idToken;
      else if (password) headers["x-admin-password"] = password;

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers,
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);
      onChange({ ...block, src: json.url });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {block.src ? (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.description}
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <label
          className="block cursor-pointer text-center py-6 rounded-lg text-[12px] text-zinc-500 hover:text-white transition-colors"
          style={{
            background: "rgba(99,102,241,0.04)",
            border: "1px dashed rgba(99,102,241,0.3)",
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {uploading ? "Uploading…" : "Click to upload image (max 5 MB)"}
        </label>
      )}

      {block.src && (
        <div className="flex items-center gap-2">
          <code
            className="text-[10px] text-zinc-600 truncate flex-1"
            title={block.src}
          >
            {block.src}
          </code>
          <label
            className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            Replace
          </label>
          <button
            onClick={() => onChange({ ...block, src: undefined })}
            className="text-[11px] text-zinc-500 hover:text-red-400"
          >
            Remove
          </button>
        </div>
      )}

      <PlainInput
        value={block.description}
        onChange={(description) => onChange({ ...block, description })}
        placeholder="Alt text (describe the image for accessibility)"
      />

      {err && <p className="text-[11px] text-red-400">{err}</p>}
    </div>
  );
}

// ─── Steps block ───────────────────────────────────────────

function StepsEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "steps" }>;
  onChange: (next: ContentBlock) => void;
}) {
  function updateItem(i: number, patch: Partial<StepItem>) {
    const next = [...block.items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...block, items: next });
  }
  function add() {
    onChange({
      ...block,
      items: [...block.items, { title: "", description: "" }],
    });
  }
  function remove(i: number) {
    onChange({
      ...block,
      items: block.items.filter((_, idx) => idx !== i),
    });
  }
  function move(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= block.items.length) return;
    const next = [...block.items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...block, items: next });
  }

  return (
    <div className="space-y-2">
      {block.items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-2 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span className="shrink-0 w-6 h-6 rounded bg-white/[0.04] text-[10px] font-bold text-zinc-400 flex items-center justify-center mt-1">
            {i + 1}
          </span>
          <div className="flex-1 space-y-1.5">
            <PlainInput
              value={item.title}
              onChange={(title) => updateItem(i, { title })}
              placeholder="Step title"
            />
            <PlainInput
              value={item.description}
              onChange={(description) => updateItem(i, { description })}
              placeholder="Step description"
            />
          </div>
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="w-6 h-5 text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
            >
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === block.items.length - 1}
              className="w-6 h-5 text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
            >
              ↓
            </button>
            <button
              onClick={() => remove(i)}
              className="w-6 h-5 text-[10px] text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add step
      </button>
    </div>
  );
}

// ─── Table block ───────────────────────────────────────────

function TableEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  onChange: (next: ContentBlock) => void;
}) {
  const colCount = block.headers.length;

  function setHeader(i: number, v: string) {
    const headers = [...block.headers];
    headers[i] = v;
    onChange({ ...block, headers });
  }
  function setCell(ri: number, ci: number, v: string) {
    const rows = block.rows.map((row, idx) => {
      if (idx !== ri) return row;
      const cells = [...row.cells];
      cells[ci] = v;
      return { cells };
    });
    onChange({ ...block, rows });
  }
  function addRow() {
    onChange({
      ...block,
      rows: [...block.rows, { cells: Array(colCount).fill("") }],
    });
  }
  function removeRow(ri: number) {
    onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== ri) });
  }
  function addColumn() {
    onChange({
      ...block,
      headers: [...block.headers, `Column ${colCount + 1}`],
      rows: block.rows.map((r) => ({ cells: [...r.cells, ""] })),
    });
  }
  function removeColumn(ci: number) {
    if (colCount <= 1) return;
    onChange({
      ...block,
      headers: block.headers.filter((_, idx) => idx !== ci),
      rows: block.rows.map((r) => ({
        cells: r.cells.filter((_, idx) => idx !== ci),
      })),
    });
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className="p-1 text-left align-top">
                  <div className="flex items-center gap-1">
                    <input
                      value={h}
                      onChange={(e) => setHeader(i, e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white/[0.06] border border-white/[0.08] text-white text-[12px] font-semibold focus:outline-none focus:border-indigo-500/50"
                    />
                    <button
                      onClick={() => removeColumn(i)}
                      disabled={colCount <= 1}
                      className="text-[11px] text-red-400 hover:text-red-300 disabled:opacity-30 w-5 h-6"
                      title="Remove column"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-1 w-8">
                <button
                  onClick={addColumn}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 w-6 h-6 rounded bg-indigo-500/[0.08]"
                  title="Add column"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="p-1 align-top">
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      placeholder={`r${ri + 1} c${ci + 1}`}
                      className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[12px] focus:outline-none focus:border-indigo-500/50"
                    />
                  </td>
                ))}
                <td className="p-1 w-8">
                  <button
                    onClick={() => removeRow(ri)}
                    className="text-[11px] text-red-400 hover:text-red-300 w-6 h-6"
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add row
      </button>
      <p className="text-[10px] text-zinc-600">
        Cells accept inline HTML (&lt;strong&gt;, &lt;em&gt;, &lt;mark&gt;, &lt;br&gt;).
      </p>
    </div>
  );
}

// ─── Cards grid block ──────────────────────────────────────

function CardsEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "cards" }>;
  onChange: (next: ContentBlock) => void;
}) {
  function setColumns(n: 2 | 3 | 4) {
    onChange({ ...block, columns: n });
  }
  function updateCard(i: number, patch: Partial<TopicCard>) {
    const items = [...block.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...block, items });
  }
  function addCard() {
    onChange({
      ...block,
      items: [...block.items, { icon: "✨", title: "", description: "" }],
    });
  }
  function removeCard(i: number) {
    onChange({
      ...block,
      items: block.items.filter((_, idx) => idx !== i),
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-zinc-500">Columns:</span>
        {([2, 3, 4] as const).map((n) => (
          <button
            key={n}
            onClick={() => setColumns(n)}
            className={`px-2 py-0.5 rounded ${
              block.columns === n
                ? "bg-indigo-500 text-white"
                : "bg-white/[0.04] text-zinc-400 hover:text-white"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {block.items.map((card, i) => (
        <div
          key={i}
          className="p-2 rounded-lg space-y-1.5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-2">
            <input
              value={card.icon}
              onChange={(e) => updateCard(i, { icon: e.target.value })}
              placeholder="🧠"
              className="w-14 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-center text-[14px] focus:outline-none"
            />
            <input
              value={card.title}
              onChange={(e) => updateCard(i, { title: e.target.value })}
              placeholder="Card title"
              className="flex-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white text-[12px] font-semibold focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={() => removeCard(i)}
              className="w-6 h-6 text-[11px] text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
          <input
            value={card.description}
            onChange={(e) => updateCard(i, { description: e.target.value })}
            placeholder="Card description"
            className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[12px] focus:outline-none focus:border-indigo-500/50"
          />
          <div className="flex items-center gap-2">
            <input
              value={card.tag || ""}
              onChange={(e) =>
                updateCard(i, { tag: e.target.value || undefined })
              }
              placeholder="Optional tag"
              className="flex-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[11px] focus:outline-none focus:border-indigo-500/50"
            />
            <select
              value={card.tagColor || "default"}
              onChange={(e) =>
                updateCard(i, {
                  tagColor:
                    e.target.value === "default" ? undefined : e.target.value,
                })
              }
              className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white text-[11px] focus:outline-none"
            >
              <option value="default">indigo</option>
              <option value="amber">purple</option>
              <option value="blue">blue</option>
              <option value="grn">green</option>
            </select>
          </div>
        </div>
      ))}

      <button
        onClick={addCard}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add card
      </button>
    </div>
  );
}

// Silence unused-import warning — used only inside editors via closures
// but TS doesn't count Extract types as uses.
export type { ContentBlock, TopicCard, TableRow, StepItem };
