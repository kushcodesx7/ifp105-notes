"use client";

import type { ContentBlock } from "@/types/content";
import { HtmlTextarea } from "./primitives";

export function TextEditor({
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
