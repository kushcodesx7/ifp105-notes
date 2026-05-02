"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from "framer-motion";
import type { ContentBlock } from "@/types/content";
import { BLOCK_META, makeEmpty, type BlockType } from "../blocks/types";
import { ImageEditor } from "../blocks/ImageEditor";
import { TextEditor } from "../blocks/TextEditor";
import EditableHtml, { isComplexHtml } from "./EditableHtml";
import SelectionToolbar from "./SelectionToolbar";
import SlashMenu from "./SlashMenu";
import BlockModal from "./BlockModal";

// LiveBlockEditor — Notion-style WYSIWYG editor for the topic body.
//
// PR 2 expands PR 1's "edit text inline, structural blocks via modal"
// into full inline editing for every block type:
//
//   text | callout | analogy   → contentEditable surface that mirrors
//                                 the student render exactly. Selection
//                                 toolbar (B/I/H), slash command (/) for
//                                 inserting blocks, complex-HTML guard
//                                 keeps inline-SVG heroes safe.
//
//   cards | era-cards          → each card's icon, title, description,
//                                 tag are individually editable. Per-card
//                                 × delete + grid-level + add card. The
//                                 column count flips via a hover chip.
//
//   steps                       → numbered card per step, title +
//                                 description editable inline, hover ×
//                                 delete, + add step.
//
//   table                       → each header + cell is its own
//                                 EditableHtml instance, hover-revealed
//                                 row/col add buttons.
//
//   image                       → alt text inline. Source upload still
//                                 routes through the existing ImageEditor
//                                 form (file upload to /api/admin/upload
//                                 needs the form pipeline) shown in a
//                                 BlockModal — click the rendered image
//                                 to open it.
//
// Row chrome (hover): a -8px-left gutter with a drag handle (Framer
// Motion's Reorder.Item, no extra deps), a duplicate button, a type
// pill that cycles compatible types (text ↔ callout ↔ analogy), and
// a delete button. The drag handle uses a per-row useDragControls()
// so dragging is only triggered by the handle, never by accidental
// click-and-drag inside the editing surface.
//
// Save model: pure controlled component. Every change goes through
// onChange. The parent InlineModuleEditor's existing 2s autosave on
// contentJson handles persistence — no new save machinery here.

interface LiveBlockEditorProps {
  value: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  password: string;
}

// Stable per-row keys. Reorder.Item needs identity that survives
// content edits (which replace block references) AND drag-reorders
// (which permute block positions). Index alone fails on reorder.
// Block-reference alone fails on edit (every commit creates a new
// reference because the parent rebuilds the value array).
//
// Strategy:
//   1. Maintain { blocks, ids } state alongside the prop value.
//   2. SYNCHRONOUSLY compute ids on every render using the LATEST
//      registry, with two fallbacks: ref-match wins; same-length
//      index inheritance otherwise (the typical edit case where a
//      block at position i was replaced by a new ref).
//   3. Effect commits the new registry after the render so future
//      renders see the upgraded mapping.
//
// Result: when the user edits a block (new ref at the same index),
// the row's ID is preserved → React reconciles same key → no remount,
// no flicker, no Reorder confusion. When the user drags to reorder
// (refs unchanged, just permuted), ref-match preserves IDs across
// positions. When a block is added/removed, only the new entries
// get fresh UUIDs.
function mintId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `b-${crypto.randomUUID()}`;
  }
  return `b-${Math.random().toString(36).slice(2)}`;
}

function computeIds(
  blocks: ContentBlock[],
  prev: { blocks: ContentBlock[]; ids: string[] }
): string[] {
  const refToId = new Map<ContentBlock, string>();
  prev.blocks.forEach((b, i) => refToId.set(b, prev.ids[i]));

  return blocks.map((b, i) => {
    // 1. Same reference → reuse the existing id (drag-reorder case).
    const byRef = refToId.get(b);
    if (byRef) return byRef;
    // 2. Same length, ref differs → assume content edit; inherit
    //    the old id at this index. (We could be wrong if the user
    //    mutated *and* reordered in the same render, but the parent
    //    can't do both — onChange is one-shot — so this is safe.)
    if (blocks.length === prev.blocks.length && prev.ids[i]) {
      return prev.ids[i];
    }
    // 3. Otherwise, new block → mint a fresh id.
    return mintId();
  });
}

function useBlockIds(blocks: ContentBlock[]): string[] {
  // Lazy init mints ids for every block in the initial value so the
  // first render returns real ids (not placeholders).
  const [registry, setRegistry] = useState<{
    blocks: ContentBlock[];
    ids: string[];
  }>(() => ({
    blocks: [...blocks],
    ids: blocks.map(() => mintId()),
  }));

  // Synchronous render-time id computation. This is what makes the
  // edit case flicker-free: we don't wait for an effect to upgrade
  // a placeholder. The registry only acts as the *source* for the
  // next render's lookup; THIS render uses the latest known mapping
  // applied to the current blocks.
  const ids = computeIds(blocks, registry);

  // Effect commits the (block, id) pairing back to state so the next
  // render sees the upgraded registry. Returns the same reference
  // when nothing actually changed → no infinite loops.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRegistry((prev) => {
      if (
        prev.blocks.length === blocks.length &&
        prev.blocks.every((b, i) => b === blocks[i])
      ) {
        return prev;
      }
      const newIds = computeIds(blocks, prev);
      return { blocks: [...blocks], ids: newIds };
    });
  }, [blocks]);

  return ids;
}

export default function LiveBlockEditor({
  value,
  onChange,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: LiveBlockEditorProps) {
  const stableKeys = useBlockIds(value);

  // ── Undo / redo stack ────────────────────────────────────
  // Stores the LAST N snapshots of `value` so the admin can ⌘Z out of
  // a typo, accidental delete, or a misplaced drag. Capped to keep
  // memory bounded — block content can be a few KB per snapshot, so
  // 50 entries is ~500KB worst case, comfortable.
  //
  // Behaviour:
  //   · Every wrapped onChange (`commitChange` below) pushes the
  //     PREVIOUS value to the past stack, then clears the redo stack
  //     (because forward history is invalidated by a new edit).
  //   · ⌘Z / Ctrl+Z pops the past stack, applies that snapshot, and
  //     pushes the current snapshot onto the redo stack.
  //   · ⌘⇧Z (or Ctrl+Y) does the reverse.
  //   · A `suppressNext` flag prevents the undo/redo's own onChange
  //     call from being recorded as a NEW edit — that would create
  //     an infinite history loop and break redo entirely.
  const past = useRef<ContentBlock[][]>([]);
  const future = useRef<ContentBlock[][]>([]);
  const suppressNext = useRef(false);
  const lastValueRef = useRef<ContentBlock[]>(value);
  const HISTORY_LIMIT = 50;
  // Force re-render when undo/redo changes button-enabled state. Local
  // state suffices — refs above hold the actual stacks.
  const [, forceRender] = useState(0);

  // Sync `lastValueRef` so the snapshot we push on the NEXT edit is
  // the value as it was BEFORE the edit. If we push `value` at edit
  // time, we'd be storing the post-edit state, which is wrong.
  useEffect(() => {
    if (suppressNext.current) {
      // Edit came from undo/redo itself — don't disturb the stacks.
      suppressNext.current = false;
    }
    lastValueRef.current = value;
  }, [value]);

  /**
   * Wraps onChange to record a history snapshot before applying the
   * change. Use this in place of `onChange(...)` for every mutation
   * except the undo/redo paths themselves.
   */
  const commitChange = useCallback(
    (next: ContentBlock[]) => {
      // Skip dedupe-identical edits (typing-time autosave can
      // produce many onChange calls with the same shape if React
      // batches differently across renders).
      const prev = lastValueRef.current;
      try {
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          onChange(next);
          return;
        }
      } catch {
        // Fallthrough — JSON.stringify can throw on circular refs;
        // we'd rather record a redundant snapshot than swallow the
        // edit.
      }
      past.current.push(structuredClone(prev));
      if (past.current.length > HISTORY_LIMIT) past.current.shift();
      // A fresh edit invalidates the redo stack — you can't redo into
      // a future you've now diverged from.
      future.current = [];
      forceRender((n) => n + 1);
      onChange(next);
    },
    [onChange]
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(structuredClone(lastValueRef.current));
    if (future.current.length > HISTORY_LIMIT) future.current.shift();
    suppressNext.current = true;
    forceRender((n) => n + 1);
    onChange(prev);
  }, [onChange]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(structuredClone(lastValueRef.current));
    if (past.current.length > HISTORY_LIMIT) past.current.shift();
    suppressNext.current = true;
    forceRender((n) => n + 1);
    onChange(next);
  }, [onChange]);

  // Keyboard shortcuts: ⌘Z (undo), ⌘⇧Z or Ctrl+Y (redo). Captured at
  // the document level so the admin can hit them from anywhere on the
  // page — including while a contentEditable surface has focus, since
  // contentEditable's native undo is unreliable across blur/save
  // cycles. We preventDefault to override the browser's own undo
  // behaviour, otherwise the browser would try to undo character-level
  // edits inside the contenteditable while we'd undo block-level
  // edits — confusing race.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const key = e.key.toLowerCase();
      // ⌘Z (no shift) → undo
      if (key === "z" && !e.shiftKey) {
        if (past.current.length === 0) return;
        e.preventDefault();
        undo();
        return;
      }
      // ⌘⇧Z or Ctrl+Y → redo
      if ((key === "z" && e.shiftKey) || key === "y") {
        if (future.current.length === 0) return;
        e.preventDefault();
        redo();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Slash-menu state.
  const [slashAnchor, setSlashAnchor] = useState<DOMRect | null>(null);
  const [slashSourceIndex, setSlashSourceIndex] = useState<number | null>(
    null
  );
  // Modal state for image upload + complex-HTML editing.
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  // Hover index for chrome — visual only.
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  function update(i: number, patch: ContentBlock) {
    const copy = [...value];
    copy[i] = patch;
    commitChange(copy);
  }
  function remove(i: number) {
    commitChange(value.filter((_, idx) => idx !== i));
  }
  function duplicate(i: number) {
    const next = [...value];
    next.splice(i + 1, 0, structuredClone(value[i]));
    commitChange(next);
  }
  function insertAfter(i: number, type: BlockType) {
    const next = [...value];
    next.splice(i + 1, 0, makeEmpty(type));
    commitChange(next);
  }
  function appendNew(type: BlockType) {
    commitChange([...value, makeEmpty(type)]);
  }

  // Drag-reorder. Framer Motion's Reorder works best with values that
  // are stable across content edits — using the block object itself
  // means every keystroke that creates a new block reference would
  // unnecessarily remount the row. So we drive Reorder with the ID
  // array (stable strings) and map back to blocks on commit.
  function onReorder(reorderedIds: string[]) {
    const idToBlock = new Map<string, ContentBlock>();
    stableKeys.forEach((id, i) => idToBlock.set(id, value[i]));
    const nextBlocks: ContentBlock[] = [];
    for (const id of reorderedIds) {
      const b = idToBlock.get(id);
      if (b) nextBlocks.push(b);
    }
    if (nextBlocks.length === value.length) commitChange(nextBlocks);
  }

  const onSlash = useCallback(
    (sourceIndex: number) => (caretRect: DOMRect) => {
      setSlashSourceIndex(sourceIndex);
      setSlashAnchor(caretRect);
    },
    []
  );

  function handleSlashSelect(type: BlockType) {
    const idx = slashSourceIndex;
    setSlashAnchor(null);
    setSlashSourceIndex(null);
    if (idx == null) {
      appendNew(type);
      return;
    }
    const src = value[idx];
    const empty =
      (src.type === "text" && !src.html.trim()) ||
      (src.type === "callout" && !src.html.trim()) ||
      (src.type === "analogy" && !src.html.trim());
    if (empty) {
      update(idx, makeEmpty(type));
    } else {
      insertAfter(idx, type);
    }
  }

  return (
    <div className="space-y-2 relative">
      <Reorder.Group
        axis="y"
        values={stableKeys}
        onReorder={onReorder}
        className="space-y-2"
      >
        {value.map((block, i) => (
          <LiveRow
            key={stableKeys[i]}
            id={stableKeys[i]}
            block={block}
            hovered={hoverIndex === i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() =>
              setHoverIndex((cur) => (cur === i ? null : cur))
            }
            onChange={(next) => update(i, next)}
            onDelete={() => remove(i)}
            onDuplicate={() => duplicate(i)}
            onSlash={(rect) => onSlash(i)(rect)}
            onOpenModal={() => setModalIndex(i)}
          />
        ))}
      </Reorder.Group>

      {/* Empty state */}
      {value.length === 0 && (
        <div
          className="text-center py-8 rounded-2xl"
          style={{
            background: "rgba(99,102,241,0.03)",
            border: "1px dashed rgba(99,102,241,0.25)",
          }}
        >
          <div className="text-3xl mb-2" aria-hidden>
            ✨
          </div>
          <p className="text-[13px] text-zinc-400 mb-3">
            This topic&apos;s body is empty. Type{" "}
            <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
              /
            </kbd>{" "}
            in a paragraph or click below to add a block.
          </p>
          <button
            onClick={() => appendNew("text")}
            className="text-[12px] font-semibold text-white px-4 py-2 rounded-full inline-flex items-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            <span aria-hidden>+</span> Insert paragraph
          </button>
        </div>
      )}

      {/* Add-paragraph footer */}
      {value.length > 0 && (
        <button
          onClick={() => appendNew("text")}
          className="group w-full mt-2 py-2 rounded-xl flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 hover:text-white transition-all"
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
          <span>Add paragraph</span>
          <span className="text-[10px] text-zinc-600">
            (or type{" "}
            <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">
              /
            </kbd>{" "}
            on an empty line)
          </span>
        </button>
      )}

      <SelectionToolbar />
      <SlashMenu
        anchor={slashAnchor}
        onClose={() => {
          setSlashAnchor(null);
          setSlashSourceIndex(null);
        }}
        onSelect={handleSlashSelect}
      />

      {/* Modal — only for image upload + complex-HTML text editing.
           Structural blocks now edit inline. */}
      {modalIndex != null && value[modalIndex] && (
        <ModalForBlock
          block={value[modalIndex]}
          onChange={(next) => update(modalIndex, next)}
          onClose={() => setModalIndex(null)}
          courseSlug={courseSlug}
          moduleNumber={moduleNumber}
          topicNumber={topicNumber}
          idToken={idToken}
          password={password}
        />
      )}
    </div>
  );
}

// ─── Row + chrome ─────────────────────────────────────────

interface LiveRowProps {
  /** Stable string id used by Reorder.Item. */
  id: string;
  block: ContentBlock;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onChange: (next: ContentBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSlash: (rect: DOMRect) => void;
  onOpenModal: () => void;
}

function LiveRow({
  id,
  block,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onChange,
  onDelete,
  onDuplicate,
  onSlash,
  onOpenModal,
}: LiveRowProps) {
  const meta = BLOCK_META[block.type];
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={dragControls}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileDrag={{
        scale: 1.01,
        boxShadow: "0 24px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.4)",
        background: "rgba(15,15,25,0.85)",
      }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
      className="relative group rounded-lg"
      style={{ touchAction: "none" }}
    >
      {/* Hover gutter — drag, duplicate, type-convert, delete. */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute -left-9 top-1.5 flex flex-col items-center gap-0.5 z-10"
            aria-hidden
          >
            <button
              type="button"
              onPointerDown={(e) => dragControls.start(e)}
              title="Drag to reorder"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-grab active:cursor-grabbing"
              // Don't blur the editable while initiating a drag.
              onMouseDown={(e) => e.preventDefault()}
            >
              ⋮⋮
            </button>
            <ConvertBtn block={block} onChange={onChange} />
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate block"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-indigo-300 hover:bg-indigo-500/10"
              onMouseDown={(e) => e.preventDefault()}
            >
              ⎘
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete block"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
              onMouseDown={(e) => e.preventDefault()}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover frame */}
      <div
        className="rounded-lg transition-all"
        style={{
          padding: "1px",
          background: hovered
            ? `linear-gradient(135deg, ${meta.accent}30, transparent)`
            : "transparent",
        }}
      >
        <div
          className="relative rounded-lg"
          style={{
            background: hovered ? "rgba(255,255,255,0.012)" : "transparent",
          }}
        >
          <BlockBody
            block={block}
            onChange={onChange}
            onSlash={onSlash}
            onOpenModal={onOpenModal}
            hovered={hovered}
          />
        </div>
      </div>
    </Reorder.Item>
  );
}

// Type-convert pill — only enabled for the inline-text family
// (text ↔ callout ↔ analogy) where the html payload is portable.
// Other block types have incompatible shapes, so we hide the chip.
function ConvertBtn({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (next: ContentBlock) => void;
}) {
  if (block.type !== "text" && block.type !== "callout" && block.type !== "analogy") {
    return null;
  }
  function nextType(): "text" | "callout" | "analogy" {
    if (block.type === "text") return "callout";
    if (block.type === "callout") return "analogy";
    return "text";
  }
  function convert() {
    const t = nextType();
    if (block.type === "analogy" && t === "text") {
      onChange({ type: "text", html: block.html });
      return;
    }
    if (block.type === "text" && t === "callout") {
      onChange({ type: "callout", variant: "blue", html: block.html });
      return;
    }
    if (block.type === "callout" && t === "analogy") {
      onChange({
        type: "analogy",
        label: "Real-world parallel",
        html: block.html,
      });
      return;
    }
  }
  return (
    <button
      type="button"
      onClick={convert}
      title={`Convert to ${nextType()}`}
      className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-violet-300 hover:bg-violet-500/10"
      onMouseDown={(e) => e.preventDefault()}
    >
      ⇄
    </button>
  );
}

// ─── BlockBody dispatcher ─────────────────────────────────

function BlockBody({
  block,
  onChange,
  onSlash,
  onOpenModal,
  hovered,
}: {
  block: ContentBlock;
  onChange: (next: ContentBlock) => void;
  onSlash: (rect: DOMRect) => void;
  onOpenModal: () => void;
  hovered: boolean;
}) {
  switch (block.type) {
    case "text":
      return (
        <TextBody
          block={block}
          onChange={onChange}
          onSlash={onSlash}
          onOpenModal={onOpenModal}
        />
      );
    case "callout":
      return (
        <CalloutBody
          block={block}
          onChange={onChange}
          onSlash={onSlash}
          onOpenModal={onOpenModal}
        />
      );
    case "analogy":
      return (
        <AnalogyBody block={block} onChange={onChange} onSlash={onSlash} />
      );
    case "cards":
      return <CardsInlineBody block={block} onChange={onChange} hovered={hovered} />;
    case "era-cards":
      return (
        <EraCardsInlineBody block={block} onChange={onChange} hovered={hovered} />
      );
    case "steps":
      return <StepsInlineBody block={block} onChange={onChange} hovered={hovered} />;
    case "table":
      return <TableInlineBody block={block} onChange={onChange} hovered={hovered} />;
    case "image":
      return (
        <ImageInlineBody
          block={block}
          onChange={onChange}
          onOpenModal={onOpenModal}
          hovered={hovered}
        />
      );
    default:
      return null;
  }
}

// ─── Inline-editable: text / callout / analogy (unchanged from PR 1) ───

const TEXT_CLASSES = [
  "text-[14px] text-zinc-400 leading-[1.9] my-3",
  "[&_strong]:text-zinc-200 [&_strong]:font-semibold",
  "[&_mark]:bg-gradient-to-r [&_mark]:from-violet-500/20 [&_mark]:to-indigo-500/20",
  "[&_mark]:text-white [&_mark]:font-semibold",
  "[&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5",
  "[&_mark]:rounded-md [&_mark]:ring-1 [&_mark]:ring-violet-400/30",
  "[&_mark]:shadow-[0_0_8px_rgba(139,92,246,0.15)]",
].join(" ");

const CALLOUT_CLASSES_BASE = [
  "my-4 px-4 py-3 rounded-r-xl text-[13px] leading-[1.85]",
  "[&_strong]:font-bold",
  "[&_mark]:bg-gradient-to-r [&_mark]:from-violet-500/20 [&_mark]:to-indigo-500/20",
  "[&_mark]:text-white [&_mark]:font-semibold",
  "[&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5",
  "[&_mark]:rounded-md [&_mark]:ring-1 [&_mark]:ring-violet-400/30",
  "[&_mark]:shadow-[0_0_8px_rgba(139,92,246,0.15)]",
  "[&_em]:text-white/90",
  "[&_code]:bg-white/10 [&_code]:text-violet-200 [&_code]:px-1.5",
  "[&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px]",
  "[&_code]:font-mono [&_code]:font-semibold",
].join(" ");

const calloutColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  default: {
    bg: "rgba(99,102,241,0.08)",
    border: "#4F46E5",
    text: "#818CF8",
  },
  amber: { bg: "rgba(124,58,237,0.08)", border: "#7C3AED", text: "#A78BFA" },
  blue: { bg: "rgba(37,99,235,0.08)", border: "#2563EB", text: "#60A5FA" },
  red: { bg: "rgba(239,68,68,0.08)", border: "#EF4444", text: "#F87171" },
  purple: { bg: "rgba(124,58,237,0.08)", border: "#7C3AED", text: "#A78BFA" },
  dark: { bg: "#0D0D1F", border: "#4F46E5", text: "#A5B4FC" },
};

const ANALOGY_BODY_CLASSES = [
  "text-[13px] text-zinc-400 leading-[1.85] pl-3",
  "[&_strong]:text-zinc-200 [&_strong]:font-semibold",
  "[&_mark]:bg-gradient-to-r [&_mark]:from-violet-500/20 [&_mark]:to-indigo-500/20",
  "[&_mark]:text-white [&_mark]:font-semibold",
  "[&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5",
  "[&_mark]:rounded-md [&_mark]:ring-1 [&_mark]:ring-violet-400/30",
  "[&_mark]:shadow-[0_0_8px_rgba(139,92,246,0.15)]",
].join(" ");

const CARD_DESC_CLASSES = [
  "text-xs text-zinc-400 leading-relaxed",
  "[&_strong]:text-zinc-200 [&_strong]:font-semibold",
  "[&_em]:text-zinc-300",
  "[&_mark]:bg-gradient-to-r [&_mark]:from-violet-500/20 [&_mark]:to-indigo-500/20",
  "[&_mark]:text-white [&_mark]:font-semibold",
  "[&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5",
  "[&_mark]:rounded-md [&_mark]:ring-1 [&_mark]:ring-violet-400/30",
  "[&_mark]:shadow-[0_0_8px_rgba(139,92,246,0.15)]",
].join(" ");

function ComplexHtmlBadge({
  onOpenModal,
  label = "Advanced HTML",
}: {
  onOpenModal: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpenModal}
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 px-2 py-1 mt-1 rounded-full"
      style={{
        background: "rgba(245,158,11,0.10)",
        border: "1px solid rgba(245,158,11,0.30)",
      }}
      title="This block contains inline SVG or complex HTML — click to edit raw"
    >
      <span aria-hidden>🔧</span>
      {label} — click to edit raw
    </button>
  );
}

function TextBody({
  block,
  onChange,
  onSlash,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "text" }>;
  onChange: (next: ContentBlock) => void;
  onSlash: (rect: DOMRect) => void;
  onOpenModal: () => void;
}) {
  const complex = isComplexHtml(block.html);
  if (complex) {
    return (
      <div className="my-3 group">
        <div
          className={TEXT_CLASSES}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
        <ComplexHtmlBadge onOpenModal={onOpenModal} />
      </div>
    );
  }
  return (
    <div data-live-editable="true">
      <EditableHtml
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        placeholder="Type / for commands, or just write…"
        className={TEXT_CLASSES}
        onSlash={onSlash}
        ariaLabel="Paragraph block"
      />
    </div>
  );
}

function CalloutBody({
  block,
  onChange,
  onSlash,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  onChange: (next: ContentBlock) => void;
  onSlash: (rect: DOMRect) => void;
  onOpenModal: () => void;
}) {
  const colors = calloutColors[block.variant || "default"];
  const complex = isComplexHtml(block.html);
  return (
    <div
      className="my-4 group/callout"
      style={{
        background: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        color: block.variant === "dark" ? "rgba(255,255,255,0.8)" : colors.text,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      <div data-live-editable="true">
        {complex ? (
          <>
            <div
              className={CALLOUT_CLASSES_BASE}
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
            <div className="px-4 pb-3">
              <ComplexHtmlBadge onOpenModal={onOpenModal} />
            </div>
          </>
        ) : (
          <EditableHtml
            value={block.html}
            onChange={(html) => onChange({ ...block, html })}
            placeholder="Callout text — type / for commands"
            className={CALLOUT_CLASSES_BASE}
            onSlash={onSlash}
            ariaLabel="Callout block"
          />
        )}
      </div>
      <CalloutVariantChips block={block} onChange={onChange} />
    </div>
  );
}

function CalloutVariantChips({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  onChange: (next: ContentBlock) => void;
}) {
  const variants: Array<{
    key: NonNullable<typeof block.variant>;
    label: string;
  }> = [
    { key: "blue", label: "Blue" },
    { key: "amber", label: "Amber" },
    { key: "red", label: "Red" },
    { key: "purple", label: "Purple" },
    { key: "dark", label: "Dark" },
  ];
  return (
    <div className="px-4 pb-2 flex items-center gap-1.5 opacity-0 group-hover/callout:opacity-100 transition-opacity">
      <span className="text-[10px] text-zinc-500 mr-1">Style:</span>
      {variants.map((v) => {
        const active = (block.variant || "default") === v.key;
        const c = calloutColors[v.key];
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => onChange({ ...block, variant: v.key })}
            className="text-[10px] px-2 py-0.5 rounded-full transition-all"
            style={{
              background: active ? c.bg : "rgba(255,255,255,0.04)",
              color: active ? c.text : "#9CA3AF",
              border: `1px solid ${active ? c.border : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

function AnalogyBody({
  block,
  onChange,
  onSlash,
}: {
  block: Extract<ContentBlock, { type: "analogy" }>;
  onChange: (next: ContentBlock) => void;
  onSlash: (rect: DOMRect) => void;
}) {
  return (
    <div className="my-4 p-5 rounded-xl relative overflow-hidden card-glass">
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{
          background: "linear-gradient(180deg, #7C3AED, #4F46E5, #2563EB)",
        }}
      />
      <div data-live-editable="true">
        <EditableHtml
          value={block.label}
          onChange={(label) => onChange({ ...block, label })}
          placeholder="Analogy label (e.g. 💡 Real-world parallel)"
          className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2 pl-3"
          singleLine
          plainTextPaste
          ariaLabel="Analogy label"
        />
      </div>
      <div data-live-editable="true">
        <EditableHtml
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          placeholder="Analogy body — explain the comparison"
          className={ANALOGY_BODY_CLASSES}
          onSlash={onSlash}
          ariaLabel="Analogy body"
        />
      </div>
    </div>
  );
}

// ─── Cards (inline) ───────────────────────────────────────

const TAG_COLOR_CYCLE = ["default", "amber", "blue", "grn"] as const;
// Tag colours used by `cards` blocks. Keys match `card.tagColor` values
// in the content data. Note: `amber` is a legacy alias that renders
// purple — kept for back-compat with existing data. `grn` is the
// short form historically used by the form-based editor; `green` is
// the long form found in module data files. Any value not in this
// map falls back to `default` (see CardTagEditor).
const tagColorMap: Record<string, { bg: string; color: string }> = {
  default: { bg: "rgba(99,102,241,0.12)", color: "#818CF8" },
  amber: { bg: "rgba(124,58,237,0.12)", color: "#A78BFA" },
  blue: { bg: "rgba(37,99,235,0.12)", color: "#60A5FA" },
  grn: { bg: "rgba(34,197,94,0.12)", color: "#4ADE80" },
  green: { bg: "rgba(34,197,94,0.12)", color: "#4ADE80" },
  pink: { bg: "rgba(236,72,153,0.12)", color: "#F472B6" },
  purple: { bg: "rgba(124,58,237,0.12)", color: "#A78BFA" },
  red: { bg: "rgba(239,68,68,0.12)", color: "#F87171" },
};

function CardsInlineBody({
  block,
  onChange,
  hovered,
}: {
  block: Extract<ContentBlock, { type: "cards" }>;
  onChange: (next: ContentBlock) => void;
  hovered: boolean;
}) {
  function patchCard(i: number, patch: Partial<(typeof block.items)[number]>) {
    const items = [...block.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...block, items });
  }
  function removeCard(i: number) {
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });
  }
  function addCard() {
    onChange({
      ...block,
      items: [
        ...block.items,
        { icon: "✨", title: "", description: "", tag: undefined },
      ],
    });
  }
  function cycleTagColor(i: number) {
    const cur = block.items[i].tagColor || "default";
    const idx = TAG_COLOR_CYCLE.indexOf(
      cur as (typeof TAG_COLOR_CYCLE)[number]
    );
    const next = TAG_COLOR_CYCLE[(idx + 1) % TAG_COLOR_CYCLE.length];
    patchCard(i, { tagColor: next });
  }

  return (
    <div className="my-4 group/cards">
      {/* Column-count chips on hover. */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-1.5 mb-2"
          >
            <span className="text-[10px] text-zinc-500">Columns:</span>
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...block, columns: n })}
                className="text-[10px] px-2 py-0.5 rounded-full transition-all"
                style={{
                  background:
                    block.columns === n
                      ? "rgba(99,102,241,0.18)"
                      : "rgba(255,255,255,0.04)",
                  color: block.columns === n ? "#A5B4FC" : "#9CA3AF",
                  border: `1px solid ${block.columns === n ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {n}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`grid gap-3 ${
          block.columns === 4
            ? "grid-cols-2 md:grid-cols-4"
            : block.columns === 3
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {block.items.map((card, i) => (
          <div
            key={i}
            className="card-glass p-4 rounded-xl relative group/card"
          >
            <button
              type="button"
              onClick={() => removeCard(i)}
              title="Remove card"
              aria-label="Remove card"
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/card:opacity-100 transition-opacity"
              onMouseDown={(e) => e.preventDefault()}
            >
              ×
            </button>
            <div data-live-editable="true">
              <EditableHtml
                value={card.icon}
                onChange={(v) => patchCard(i, { icon: v })}
                placeholder="✨"
                className="text-xl mb-2 block min-h-[1.6em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel={`Card ${i + 1} icon`}
              />
            </div>
            <div data-live-editable="true">
              <EditableHtml
                value={card.title}
                onChange={(v) => patchCard(i, { title: v })}
                placeholder="Card title"
                className="text-sm font-bold text-zinc-200 mb-1 min-h-[1.4em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel={`Card ${i + 1} title`}
              />
            </div>
            <div data-live-editable="true">
              <EditableHtml
                value={card.description}
                onChange={(v) => patchCard(i, { description: v })}
                placeholder="Card description — supports bold, highlight"
                className={`${CARD_DESC_CLASSES} min-h-[2.4em]`}
                ariaLabel={`Card ${i + 1} description`}
              />
            </div>
            {/* Tag — clickable for color, contenteditable for text. If
                 the value is empty we show a "+ tag" affordance on
                 hover. */}
            <CardTagEditor
              card={card}
              onChange={(patch) => patchCard(i, patch)}
              cycleColor={() => cycleTagColor(i)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCard}
        className="mt-3 w-full py-2 rounded-xl flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 hover:text-white transition-all opacity-0 group-hover/cards:opacity-100"
        style={{
          background: "transparent",
          border: "1px dashed rgba(255,255,255,0.08)",
        }}
      >
        <span aria-hidden>+</span> Add card
      </button>
    </div>
  );
}

function CardTagEditor({
  card,
  onChange,
  cycleColor,
}: {
  card: Extract<ContentBlock, { type: "cards" }>["items"][number];
  onChange: (patch: Partial<typeof card>) => void;
  cycleColor: () => void;
}) {
  const tagColor = card.tagColor || "default";
  // Defensive: any unknown tagColor value falls back to default. Without
  // this, an unknown value (e.g. older content authored before a colour
  // was renamed) used to crash CardTagEditor with `Cannot read 'bg' of
  // undefined`, which the ErrorBoundary caught as "Something broke".
  const c = tagColorMap[tagColor] ?? tagColorMap.default;
  const has = (card.tag ?? "").trim().length > 0;
  return (
    <div className="mt-2 flex items-center gap-1 group/tag">
      <span
        className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full transition-all"
        style={{
          background: has ? c.bg : "rgba(255,255,255,0.04)",
          color: has ? c.color : "#71717A",
          border: `1px solid ${has ? "transparent" : "rgba(255,255,255,0.08)"}`,
        }}
        data-live-editable="true"
      >
        <EditableHtml
          value={card.tag ?? ""}
          onChange={(v) => onChange({ tag: v.trim() ? v : undefined })}
          placeholder="+ tag"
          className="inline-block min-w-[2em]"
          singleLine
          plainTextPaste
          forceEditable
          ariaLabel="Card tag"
        />
      </span>
      {has && (
        <button
          type="button"
          onClick={cycleColor}
          title="Cycle tag colour"
          className="text-[9px] text-zinc-500 hover:text-white opacity-0 group-hover/tag:opacity-100 transition-opacity"
          onMouseDown={(e) => e.preventDefault()}
        >
          🎨
        </button>
      )}
    </div>
  );
}

// ─── Era cards (inline) ───────────────────────────────────

function EraCardsInlineBody({
  block,
  onChange,
  hovered,
}: {
  block: Extract<ContentBlock, { type: "era-cards" }>;
  onChange: (next: ContentBlock) => void;
  hovered: boolean;
}) {
  function patch(i: number, p: Partial<(typeof block.items)[number]>) {
    const items = [...block.items];
    items[i] = { ...items[i], ...p };
    onChange({ ...block, items });
  }
  function removeEra(i: number) {
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });
  }
  function addEra() {
    onChange({
      ...block,
      items: [
        ...block.items,
        {
          icon: "📜",
          period: "1800s",
          title: "New era",
          description: "",
          limitation: "",
        },
      ],
    });
  }

  return (
    <div className="my-4 group/era">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {block.items.map((card, i) => (
          <div
            key={i}
            className="card-glass p-4 rounded-xl relative overflow-hidden group/erac"
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
              }}
            />
            <button
              type="button"
              onClick={() => removeEra(i)}
              title="Remove era"
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/erac:opacity-100 transition-opacity"
              onMouseDown={(e) => e.preventDefault()}
            >
              ×
            </button>
            <div data-live-editable="true">
              <EditableHtml
                value={card.icon}
                onChange={(v) => patch(i, { icon: v })}
                placeholder="📜"
                className="text-xl mb-2 block min-h-[1.6em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel="Era icon"
              />
            </div>
            <div data-live-editable="true">
              <EditableHtml
                value={card.period}
                onChange={(v) => patch(i, { period: v })}
                placeholder="1800s"
                className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 mb-1 min-h-[1.2em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel="Era period"
              />
            </div>
            <div data-live-editable="true">
              <EditableHtml
                value={card.title}
                onChange={(v) => patch(i, { title: v })}
                placeholder="Era name"
                className="text-sm font-bold text-zinc-200 mb-1 min-h-[1.4em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel="Era title"
              />
            </div>
            <div data-live-editable="true">
              <EditableHtml
                value={card.description}
                onChange={(v) => patch(i, { description: v })}
                placeholder="What happened? (supports bold)"
                className={`${CARD_DESC_CLASSES} min-h-[2.4em]`}
                ariaLabel="Era description"
              />
            </div>
            <div
              className="mt-2 pt-2"
              style={{ borderTop: "1px solid #2a2a33" }}
              data-live-editable="true"
            >
              <EditableHtml
                value={card.limitation}
                onChange={(v) => patch(i, { limitation: v })}
                placeholder="Limitation / why it ended"
                className="text-xs font-semibold text-zinc-500 min-h-[1.4em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel="Era limitation"
              />
            </div>
          </div>
        ))}
      </div>
      {hovered && (
        <button
          type="button"
          onClick={addEra}
          className="mt-3 w-full py-2 rounded-xl flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 hover:text-white transition-all"
          style={{
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <span aria-hidden>+</span> Add era
        </button>
      )}
    </div>
  );
}

// ─── Steps (inline) ───────────────────────────────────────

function StepsInlineBody({
  block,
  onChange,
  hovered,
}: {
  block: Extract<ContentBlock, { type: "steps" }>;
  onChange: (next: ContentBlock) => void;
  hovered: boolean;
}) {
  function patch(i: number, p: Partial<(typeof block.items)[number]>) {
    const items = [...block.items];
    items[i] = { ...items[i], ...p };
    onChange({ ...block, items });
  }
  function removeStep(i: number) {
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });
  }
  function addStep() {
    onChange({
      ...block,
      items: [...block.items, { title: "", description: "" }],
    });
  }
  return (
    <div className="my-4 space-y-2 group/steps">
      {block.items.map((step, i) => (
        <div
          key={i}
          className="flex gap-3.5 items-start p-4 rounded-xl card-glass relative group/step"
        >
          <div
            className="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #1a1a2e, #2a2a44)",
              color: "#818CF8",
              border: "1px solid #333350",
            }}
          >
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div data-live-editable="true">
              <EditableHtml
                value={step.title}
                onChange={(v) => patch(i, { title: v })}
                placeholder="Step title"
                className="text-sm font-bold text-zinc-200 mb-0.5 min-h-[1.4em]"
                singleLine
                plainTextPaste
                forceEditable
                ariaLabel={`Step ${i + 1} title`}
              />
            </div>
            <div data-live-editable="true">
              <EditableHtml
                value={step.description}
                onChange={(v) => patch(i, { description: v })}
                placeholder="What happens in this step"
                className={`${CARD_DESC_CLASSES} min-h-[1.4em]`}
                ariaLabel={`Step ${i + 1} description`}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeStep(i)}
            title="Remove step"
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/step:opacity-100 transition-opacity"
            onMouseDown={(e) => e.preventDefault()}
          >
            ×
          </button>
        </div>
      ))}
      {hovered && (
        <button
          type="button"
          onClick={addStep}
          className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 hover:text-white transition-all"
          style={{
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <span aria-hidden>+</span> Add step
        </button>
      )}
    </div>
  );
}

// ─── Table (inline) ───────────────────────────────────────

function TableInlineBody({
  block,
  onChange,
  hovered,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  onChange: (next: ContentBlock) => void;
  hovered: boolean;
}) {
  function setHeader(i: number, v: string) {
    const headers = [...block.headers];
    headers[i] = v;
    onChange({ ...block, headers });
  }
  function setCell(ri: number, ci: number, v: string) {
    const rows = block.rows.map((r, idx) =>
      idx === ri ? { cells: r.cells.map((c, cidx) => (cidx === ci ? v : c)) } : r
    );
    onChange({ ...block, rows });
  }
  function addRow() {
    const empty = block.headers.map(() => "");
    onChange({ ...block, rows: [...block.rows, { cells: empty }] });
  }
  function removeRow(i: number) {
    onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== i) });
  }
  function addCol() {
    onChange({
      ...block,
      headers: [...block.headers, `Column ${block.headers.length + 1}`],
      rows: block.rows.map((r) => ({ cells: [...r.cells, ""] })),
    });
  }
  function removeCol(i: number) {
    if (block.headers.length <= 1) return;
    onChange({
      ...block,
      headers: block.headers.filter((_, idx) => idx !== i),
      rows: block.rows.map((r) => ({
        cells: r.cells.filter((_, idx) => idx !== i),
      })),
    });
  }
  return (
    <div className="my-4 group/table">
      <div
        className="rounded-xl overflow-hidden inner-glow"
        style={{ border: "1px solid #2a2a33" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-max">
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #4338CA)",
                }}
              >
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-left font-semibold text-white/90 tracking-wide whitespace-nowrap relative group/th"
                    data-live-editable="true"
                  >
                    <EditableHtml
                      value={h}
                      onChange={(v) => setHeader(i, v)}
                      placeholder={`Column ${i + 1}`}
                      className="min-w-[60px] inline-block"
                      singleLine
                      plainTextPaste
                      forceEditable
                      ariaLabel={`Header ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCol(i)}
                      title="Remove column"
                      className="ml-2 text-white/60 hover:text-red-300 opacity-0 group-hover/th:opacity-100 transition-opacity"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      ×
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderTop: "1px solid #1e1e28" }}
                  className="group/tr"
                >
                  {row.cells.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2.5 text-zinc-400 align-top relative"
                      style={{
                        background: ri % 2 ? "#111116" : "transparent",
                      }}
                      data-live-editable="true"
                    >
                      <EditableHtml
                        value={cell}
                        onChange={(v) => setCell(ri, ci, v)}
                        placeholder="—"
                        className="min-w-[40px]"
                        ariaLabel={`Row ${ri + 1} cell ${ci + 1}`}
                      />
                      {ci === row.cells.length - 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(ri)}
                          title="Remove row"
                          className="absolute top-1 right-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover/tr:opacity-100 transition-opacity"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hovered && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="flex-1 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-white transition-all"
            style={{
              background: "transparent",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            + Add row
          </button>
          <button
            type="button"
            onClick={addCol}
            className="flex-1 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-white transition-all"
            style={{
              background: "transparent",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            + Add column
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Image (inline alt-text; src via modal) ───────────────

function ImageInlineBody({
  block,
  onChange,
  onOpenModal,
  hovered,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  onChange: (next: ContentBlock) => void;
  onOpenModal: () => void;
  hovered: boolean;
}) {
  return (
    <div
      className="my-5 rounded-2xl overflow-hidden relative"
      style={{
        background: "#111116",
        border: "1px solid #2a2a33",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {block.src ? (
        <button
          type="button"
          onClick={onOpenModal}
          className="block w-full"
          title="Click to change image"
        >
          <Image
            src={block.src}
            alt={block.description}
            width={800}
            height={400}
            className="w-full h-auto rounded-2xl"
            loading="lazy"
            quality={80}
            sizes="(max-width: 768px) 100vw, 800px"
            placeholder="empty"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenModal}
          className="block w-full p-8 text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          📷 No image — click to upload
        </button>
      )}

      {/* Inline alt-text caption — editable. */}
      <div
        className="px-4 py-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        data-live-editable="true"
      >
        <EditableHtml
          value={block.description}
          onChange={(v) => onChange({ ...block, description: v })}
          placeholder="Alt text — describes the image for accessibility"
          className="text-[11px] text-zinc-500 italic min-h-[1.4em]"
          singleLine
          plainTextPaste
          forceEditable
          ariaLabel="Image alt text"
        />
      </div>

      {hovered && block.src && (
        <button
          type="button"
          onClick={onOpenModal}
          className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full text-white"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          Replace
        </button>
      )}
    </div>
  );
}

// ─── Modal — image upload + complex-HTML escape hatch ─────

function ModalForBlock({
  block,
  onChange,
  onClose,
  courseSlug,
  moduleNumber,
  topicNumber,
  idToken,
  password,
}: {
  block: ContentBlock;
  onChange: (next: ContentBlock) => void;
  onClose: () => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  password: string;
}) {
  const meta = BLOCK_META[block.type];
  const titleByType: Partial<Record<BlockType, string>> = {
    text: "Paragraph (raw HTML)",
    callout: "Callout (raw HTML)",
    analogy: "Analogy (raw HTML)",
    image: "Image",
  };
  const title = titleByType[block.type] ?? `Edit ${block.type}`;
  return (
    <BlockModal
      open
      onClose={onClose}
      title={title}
      icon={meta.icon}
      accent={meta.accent}
    >
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
      {block.type === "text" && (
        <TextEditor block={block} onChange={onChange} />
      )}
      {block.type === "callout" && (
        <RawHtmlFallback block={block} onChange={onChange} />
      )}
      {block.type === "analogy" && (
        <AnalogyRawFallback block={block} onChange={onChange} />
      )}
    </BlockModal>
  );
}

function RawHtmlFallback({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-zinc-500">
        Edit the raw HTML for this callout. Inline tags allowed:{" "}
        <code className="text-zinc-300">strong</code>,{" "}
        <code className="text-zinc-300">em</code>,{" "}
        <code className="text-zinc-300">mark</code>,{" "}
        <code className="text-zinc-300">br</code>.
      </p>
      <textarea
        value={block.html}
        onChange={(e) => onChange({ ...block, html: e.target.value })}
        rows={10}
        spellCheck
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
      />
    </div>
  );
}

function AnalogyRawFallback({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "analogy" }>;
  onChange: (next: ContentBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Label
      </label>
      <input
        value={block.label}
        onChange={(e) => onChange({ ...block, label: e.target.value })}
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
      />
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mt-3">
        Body (raw HTML)
      </label>
      <textarea
        value={block.html}
        onChange={(e) => onChange({ ...block, html: e.target.value })}
        rows={8}
        spellCheck
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm font-mono text-zinc-200 focus:outline-none focus:border-indigo-500/50"
      />
    </div>
  );
}
