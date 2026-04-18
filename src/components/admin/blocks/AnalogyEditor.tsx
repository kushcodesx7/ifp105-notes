"use client";

import type { ContentBlock } from "@/types/content";
import { HtmlTextarea, PlainInput } from "./primitives";

export function AnalogyEditor({
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
