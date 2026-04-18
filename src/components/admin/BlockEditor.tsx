"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentBlock } from "@/types/content";
import {
  BLOCK_MENU,
  BLOCK_META,
  makeEmpty,
  type BlockType,
} from "./blocks/types";
import { BlockActionBtn } from "./blocks/primitives";
import { BlockCommandPalette } from "./blocks/BlockCommandPalette";
import { TextEditor } from "./blocks/TextEditor";
import { CalloutEditor } from "./blocks/CalloutEditor";
import { AnalogyEditor } from "./blocks/AnalogyEditor";
import { ImageEditor } from "./blocks/ImageEditor";
import { StepsEditor } from "./blocks/StepsEditor";
import { TableEditor } from "./blocks/TableEditor";
import { CardsEditor } from "./blocks/CardsEditor";
import { EraCardsEditor } from "./blocks/EraCardsEditor";

// Block editor for the topic body (`topics.content_json`).
//
// Phase 2 refactor split this file from 1575 lines into:
//   components/admin/BlockEditor.tsx      — this wrapper + BlockRow chrome
//   components/admin/blocks/types.ts      — BLOCK_MENU, BLOCK_META, makeEmpty
//   components/admin/blocks/primitives.tsx — shared inputs / action buttons
//   components/admin/blocks/BlockCommandPalette.tsx
//   components/admin/blocks/{Text,Callout,Analogy,Image,Steps,Table,Cards,EraCards}Editor.tsx
//
// This wrapper renders an editable list of ContentBlocks with:
//   - Per-block inline editors (dispatched via the `block.type` switch below)
//   - Reorder (↑ / ↓), delete (hover-revealed on the row chrome)
//   - "Add block" trigger → filterable ⌘K-style command palette
//   - Image uploads go through /api/admin/upload → Supabase Storage
//
// The parent owns the blocks array and the save side-effect (this is
// a controlled component: `value` in, `onChange` out).

interface BlockEditorProps {
  value: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
  /** Upload context — written into uploaded file's storage key prefix. */
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  /** Auth passthrough for the upload API. */
  idToken: string | null;
  password: string;
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

// ─── Row chrome (glass card around each block + hover actions) ──

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
        transition:
          "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
      }}
    >
      {/* Left gutter — accent stripe + type icon + drag-handle preview */}
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

      {/* Main editor surface */}
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
          <EraCardsEditor block={block} onChange={onChange} />
        )}
      </div>
    </motion.div>
  );
}
