"use client";

import type { ContentBlock } from "@/types/content";
import { HtmlTextarea } from "./primitives";

const CALLOUT_VARIANTS: {
  value: "amber" | "blue" | "red" | "purple" | "dark";
  label: string;
}[] = [
  { value: "blue", label: "Blue (info)" },
  { value: "amber", label: "Amber (tip)" },
  { value: "red", label: "Red (warning)" },
  { value: "purple", label: "Purple (highlight)" },
  { value: "dark", label: "Dark (quote)" },
];

export function CalloutEditor({
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
