import type { ContentBlock } from "@/types/content";

// Canonical metadata for each block type — shared between the block
// editor wrapper, the insert-block command palette, and any future
// block-aware UI. Centralising this avoids three places drifting when
// a new block type is added.

export type BlockType = ContentBlock["type"];

export interface BlockMenuEntry {
  type: BlockType;
  label: string;
  icon: string;
  hint: string;
  /** Space-separated keywords for the command-palette filter. */
  keywords: string;
}

export const BLOCK_MENU: BlockMenuEntry[] = [
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
  {
    type: "era-cards",
    label: "Era cards (timeline)",
    icon: "📜",
    hint: "Timeline of eras with period + limitation (used in ICT Module 1 Topic 2)",
    keywords: "era timeline history period mechanical electronic",
  },
];

// Icon + accent per block type — used for the per-row pill and the
// left-gutter column so each block is recognisable at a glance
// without reading the tiny type label.
export const BLOCK_META: Record<
  BlockType,
  { icon: string; accent: string }
> = {
  text: { icon: "📝", accent: "#818CF8" },
  callout: { icon: "💡", accent: "#FCD34D" },
  analogy: { icon: "🧠", accent: "#F472B6" },
  image: { icon: "🖼", accent: "#60A5FA" },
  steps: { icon: "👣", accent: "#34D399" },
  table: { icon: "📊", accent: "#FB923C" },
  cards: { icon: "🃏", accent: "#A78BFA" },
  "era-cards": { icon: "📜", accent: "#78716C" },
};

// Factory for a fresh block of a given type, wired to minimal valid
// defaults so the palette can insert-and-focus without the user
// having to scaffold each field.
export function makeEmpty(type: BlockType): ContentBlock {
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
