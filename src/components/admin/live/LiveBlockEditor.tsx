"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ContentBlock } from "@/types/content";
import { BLOCK_META, makeEmpty, type BlockType } from "../blocks/types";
import { CardsEditor } from "../blocks/CardsEditor";
import { EraCardsEditor } from "../blocks/EraCardsEditor";
import { StepsEditor } from "../blocks/StepsEditor";
import { TableEditor } from "../blocks/TableEditor";
import { ImageEditor } from "../blocks/ImageEditor";
import { TextEditor } from "../blocks/TextEditor";
import EditableHtml, { isComplexHtml } from "./EditableHtml";
import SelectionToolbar from "./SelectionToolbar";
import SlashMenu from "./SlashMenu";
import BlockModal from "./BlockModal";

// LiveBlockEditor — Notion-style WYSIWYG sibling of BlockEditor.tsx.
//
// Drop-in props compatibility with BlockEditor: same `value`,
// `onChange`, `courseSlug`, `moduleNumber`, `topicNumber`, `idToken`,
// `password`. The parent (InlineModuleEditor) toggles between this
// and BlockEditor based on a localStorage preference.
//
// Render strategy per block type:
//
//   • text | callout | analogy
//        → render an EditableHtml that mirrors the EXACT styles used
//          by TopicRenderer.tsx (same Tailwind classes incl. the
//          [&_strong] / [&_mark] selectors). Click → cursor lands.
//          Type → student render updates live. Slash command → opens
//          SlashMenu. Selection → SelectionToolbar floats above.
//
//        If the existing HTML contains complex markup (inline SVG,
//        iframe, styled wrappers — see isComplexHtml()), the block
//        is rendered LOCKED with an "Edit raw HTML" badge that opens
//        BlockModal hosting the existing TextEditor form. This is
//        how the Topic-3 hero stays intact.
//
//   • cards | era-cards | steps | table | image
//        → render the student-view (visually identical to
//          TopicRenderer) wrapped in a click-zone. Click anywhere in
//          the rendered block → BlockModal opens with the existing
//          form sub-editor. PR 2 will add inline editing for these.
//
// Hover affordances on every row: subtle ring, top-right delete,
// drag-handle gutter visible (drag itself is a PR 2 feature).
//
// Save model: pure controlled component. Every change goes through
// onChange. The parent InlineModuleEditor is already running a 2s
// debounced autosave on the value prop — we add zero new save
// machinery here.

interface LiveBlockEditorProps {
  value: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
  courseSlug: string;
  moduleNumber: number;
  topicNumber: number;
  idToken: string | null;
  password: string;
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
  // Slash menu state — anchored at a caret rect when open.
  const [slashAnchor, setSlashAnchor] = useState<DOMRect | null>(null);
  // The block index whose slash trigger fired — needed so when a
  // type is picked we can replace that block with a fresh one of the
  // chosen type (instead of inserting a new empty block at the end).
  const [slashSourceIndex, setSlashSourceIndex] = useState<number | null>(
    null
  );

  // Modal state — when a structural block (or a complex-HTML text
  // block) is opened for editing.
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Local hover index so only one row at a time renders the action
  // chrome — pure visual, no state-of-record consequences.
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  function update(i: number, patch: ContentBlock) {
    const copy = [...value];
    copy[i] = patch;
    onChange(copy);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function insertAfter(i: number, type: BlockType) {
    const next = [...value];
    next.splice(i + 1, 0, makeEmpty(type));
    onChange(next);
  }
  function appendNew(type: BlockType) {
    onChange([...value, makeEmpty(type)]);
  }

  // Slash-menu handler — fired from any EditableHtml whose line is
  // empty when the user types `/`. We open the menu anchored at the
  // caret rect.
  const onSlash = useCallback(
    (sourceIndex: number) => (caretRect: DOMRect) => {
      setSlashSourceIndex(sourceIndex);
      setSlashAnchor(caretRect);
    },
    []
  );

  // When the user picks a block from the slash menu:
  //   • if the source block is empty (its slash was triggered on an
  //     empty line — which is the trigger condition), REPLACE that
  //     block in place with a fresh one of the chosen type.
  //   • otherwise insert after.
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
      {value.map((block, i) => (
        <LiveRow
          key={i}
          block={block}
          first={i === 0}
          last={i === value.length - 1}
          hovered={hoverIndex === i}
          onMouseEnter={() => setHoverIndex(i)}
          onMouseLeave={() => setHoverIndex((cur) => (cur === i ? null : cur))}
          onChange={(next) => update(i, next)}
          onDelete={() => remove(i)}
          onSlash={(rect) => onSlash(i)(rect)}
          onOpenModal={() => setModalIndex(i)}
        />
      ))}

      {/* Empty-state CTA. Identical-feel to BlockEditor's empty state
           so the toggle between Live and Classic doesn't visually
           shock. */}
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

      {/* Quiet "type / for commands" footer when there are blocks. */}
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

      {/* Floating UI surfaces. Both are no-ops when their state is
           closed/empty so they're cheap to keep mounted. */}
      <SelectionToolbar />
      <SlashMenu
        anchor={slashAnchor}
        onClose={() => {
          setSlashAnchor(null);
          setSlashSourceIndex(null);
        }}
        onSelect={handleSlashSelect}
      />

      {/* Modal — opens for structural blocks (cards/table/steps/etc.)
           AND for complex-HTML text blocks. Hosts the existing form
           sub-editor so we never lose authoring power. */}
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

// ─── Per-block renderer + row chrome ──────────────────────────

interface LiveRowProps {
  block: ContentBlock;
  first: boolean;
  last: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onChange: (next: ContentBlock) => void;
  onDelete: () => void;
  onSlash: (rect: DOMRect) => void;
  onOpenModal: () => void;
}

function LiveRow({
  block,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onChange,
  onDelete,
  onSlash,
  onOpenModal,
}: LiveRowProps) {
  const meta = BLOCK_META[block.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative group"
    >
      {/* Hover ring + drag-handle gutter. The gutter is purely visual
           in PR 1 — drag-to-reorder lands in PR 2. */}
      <div
        className="absolute -left-7 top-2 flex flex-col items-center gap-0.5 transition-opacity"
        style={{ opacity: hovered ? 0.7 : 0 }}
        aria-hidden
      >
        <button
          type="button"
          title="Drag to reorder (coming in PR 2)"
          className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-grab"
        >
          ⋮⋮
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete block"
          className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
        >
          ×
        </button>
      </div>

      {/* Hover frame. Subtle — we don't want the editor to fight
           with the rendered content for visual weight. */}
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
    </motion.div>
  );
}

// ─── BlockBody — student-view render + inline editing ─────────

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
      return <CardsBody block={block} onOpenModal={onOpenModal} hovered={hovered} />;
    case "era-cards":
      return (
        <EraCardsBody block={block} onOpenModal={onOpenModal} hovered={hovered} />
      );
    case "steps":
      return <StepsBody block={block} onOpenModal={onOpenModal} hovered={hovered} />;
    case "table":
      return <TableBody block={block} onOpenModal={onOpenModal} hovered={hovered} />;
    case "image":
      return <ImageBody block={block} onOpenModal={onOpenModal} hovered={hovered} />;
    default:
      return null;
  }
}

// ─── Inline-editable: text / callout / analogy ────────────────

// Tailwind classes copied verbatim from TopicRenderer.tsx so the live
// editor surface looks pixel-identical to the student render.
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
        // Visual frame matches TopicRenderer's callout rendering.
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
      {/* Variant chip row, only on hover. Lets the admin recolor
           without leaving the page. */}
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

// ─── Structural blocks: render student view, click → modal ────

function StructuralWrapper({
  children,
  hovered,
  onOpenModal,
  ariaLabel,
}: {
  children: React.ReactNode;
  hovered: boolean;
  onOpenModal: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpenModal}
      aria-label={ariaLabel}
      className="block w-full text-left rounded-xl transition-shadow"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(99,102,241,0.45), 0 8px 24px rgba(0,0,0,0.3)"
          : "0 0 0 1px transparent",
      }}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.12 }}
            className="flex items-center justify-center gap-1.5 -mt-1 mb-1 text-[10px] font-semibold text-indigo-300"
          >
            <span aria-hidden>✏️</span>
            Click to edit
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function CardsBody({
  block,
  hovered,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "cards" }>;
  hovered: boolean;
  onOpenModal: () => void;
}) {
  return (
    <StructuralWrapper hovered={hovered} onOpenModal={onOpenModal} ariaLabel="Edit cards">
      <div
        className={`grid gap-3 my-4 ${
          block.columns === 4
            ? "grid-cols-2 md:grid-cols-4"
            : block.columns === 3
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {block.items.map((card, i) => (
          <div key={i} className="card-glass p-4 rounded-xl">
            <span className="text-xl mb-2 block">{card.icon}</span>
            <h4 className="text-sm font-bold text-zinc-200 mb-1">{card.title || "(no title)"}</h4>
            <p
              className="text-xs text-zinc-400 leading-relaxed [&_strong]:text-zinc-200 [&_strong]:font-semibold [&_em]:text-zinc-300 [&_mark]:bg-gradient-to-r [&_mark]:from-violet-500/20 [&_mark]:to-indigo-500/20 [&_mark]:text-white [&_mark]:font-semibold [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5 [&_mark]:rounded-md [&_mark]:ring-1 [&_mark]:ring-violet-400/30 [&_mark]:shadow-[0_0_8px_rgba(139,92,246,0.15)]"
              dangerouslySetInnerHTML={{ __html: card.description }}
            />
            {card.tag && (
              <span
                className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "#818CF8",
                }}
              >
                {card.tag}
              </span>
            )}
          </div>
        ))}
        {block.items.length === 0 && (
          <div className="col-span-full text-[12px] text-zinc-500 text-center py-6 border border-dashed border-white/[0.08] rounded-xl">
            Empty cards block — click to add cards
          </div>
        )}
      </div>
    </StructuralWrapper>
  );
}

function EraCardsBody({
  block,
  hovered,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "era-cards" }>;
  hovered: boolean;
  onOpenModal: () => void;
}) {
  return (
    <StructuralWrapper hovered={hovered} onOpenModal={onOpenModal} ariaLabel="Edit timeline">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {block.items.map((card, i) => (
          <div key={i} className="card-glass p-4 rounded-xl relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
            />
            <span className="text-xl mb-2 block">{card.icon}</span>
            <div className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 mb-1">
              {card.period}
            </div>
            <h4 className="text-sm font-bold text-zinc-200 mb-1">{card.title}</h4>
            <p
              className="text-xs text-zinc-400 leading-relaxed [&_strong]:text-zinc-200 [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: card.description }}
            />
            <div
              className="text-xs font-semibold mt-2 pt-2 text-zinc-500"
              style={{ borderTop: "1px solid #2a2a33" }}
            >
              {card.limitation}
            </div>
          </div>
        ))}
        {block.items.length === 0 && (
          <div className="col-span-full text-[12px] text-zinc-500 text-center py-6 border border-dashed border-white/[0.08] rounded-xl">
            Empty timeline — click to add eras
          </div>
        )}
      </div>
    </StructuralWrapper>
  );
}

function StepsBody({
  block,
  hovered,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "steps" }>;
  hovered: boolean;
  onOpenModal: () => void;
}) {
  return (
    <StructuralWrapper hovered={hovered} onOpenModal={onOpenModal} ariaLabel="Edit steps">
      <div className="my-4 space-y-2">
        {block.items.map((step, i) => (
          <div
            key={i}
            className="flex gap-3.5 items-start p-4 rounded-xl card-glass"
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
            <div>
              <h4 className="text-sm font-bold text-zinc-200 mb-0.5">
                {step.title || "(step)"}
              </h4>
              <p
                className="text-xs text-zinc-400 leading-relaxed [&_strong]:text-zinc-200 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: step.description }}
              />
            </div>
          </div>
        ))}
        {block.items.length === 0 && (
          <div className="text-[12px] text-zinc-500 text-center py-6 border border-dashed border-white/[0.08] rounded-xl">
            Empty steps block — click to add a step
          </div>
        )}
      </div>
    </StructuralWrapper>
  );
}

function TableBody({
  block,
  hovered,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  hovered: boolean;
  onOpenModal: () => void;
}) {
  return (
    <StructuralWrapper hovered={hovered} onOpenModal={onOpenModal} ariaLabel="Edit table">
      <div
        className="my-4 rounded-xl overflow-hidden inner-glow"
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
                    className="px-4 py-2.5 text-left font-semibold text-white/90 tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid #1e1e28" }}>
                  {row.cells.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2.5 text-zinc-400 align-top"
                      style={{
                        background: ri % 2 ? "#111116" : "transparent",
                      }}
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StructuralWrapper>
  );
}

function ImageBody({
  block,
  hovered,
  onOpenModal,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  hovered: boolean;
  onOpenModal: () => void;
}) {
  return (
    <StructuralWrapper hovered={hovered} onOpenModal={onOpenModal} ariaLabel="Edit image">
      <div
        className="my-5 rounded-2xl overflow-hidden"
        style={{
          background: "#111116",
          border: "1px solid #2a2a33",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {block.src ? (
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
        ) : (
          <div className="p-6 text-center text-xs text-zinc-500">
            {block.description || "(no image — click to upload)"}
          </div>
        )}
      </div>
    </StructuralWrapper>
  );
}

// ─── ModalForBlock — picks the right form sub-editor ──────────

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
  const titleByType: Record<BlockType, string> = {
    text: "Paragraph (raw HTML)",
    callout: "Callout (raw HTML)",
    analogy: "Analogy",
    image: "Image",
    steps: "Steps",
    table: "Table",
    cards: "Cards grid",
    "era-cards": "Era cards (timeline)",
  };
  return (
    <BlockModal
      open
      onClose={onClose}
      title={titleByType[block.type]}
      icon={meta.icon}
      accent={meta.accent}
    >
      {block.type === "cards" && (
        <CardsEditor block={block} onChange={onChange} />
      )}
      {block.type === "era-cards" && (
        <EraCardsEditor block={block} onChange={onChange} />
      )}
      {block.type === "steps" && (
        <StepsEditor block={block} onChange={onChange} />
      )}
      {block.type === "table" && (
        <TableEditor block={block} onChange={onChange} />
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

// Tiny raw-HTML fallback editors for the two block types that the
// existing form-editor folder doesn't expose a dedicated component
// for (callout and analogy). We re-implement minimal HTML textareas
// here so the modal still works for the rare complex-HTML case.
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
