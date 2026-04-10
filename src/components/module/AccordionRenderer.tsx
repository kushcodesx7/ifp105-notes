"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopicRenderer from "./TopicRenderer";

interface ContentBlock {
  type: string;
  html?: string;
  label?: string;
  headers?: string[];
  rows?: { cells: string[] }[];
  items?: unknown[];
  columns?: number;
  variant?: string;
  src?: string;
  description?: string;
}

interface Section {
  title: string;
  blocks: ContentBlock[];
}

// Group content blocks into logical sections based on headings and block types
function groupIntoSections(content: ContentBlock[]): Section[] {
  const sections: Section[] = [];
  let currentBlocks: ContentBlock[] = [];
  let sectionIndex = 1;

  for (const block of content) {
    // Start new section on analogy or table blocks (natural breakpoints)
    if (
      (block.type === "analogy" || block.type === "table" || block.type === "steps") &&
      currentBlocks.length > 0
    ) {
      sections.push({
        title: getSectionTitle(currentBlocks, sectionIndex),
        blocks: currentBlocks,
      });
      sectionIndex++;
      currentBlocks = [block];
    } else {
      currentBlocks.push(block);
    }
  }

  if (currentBlocks.length > 0) {
    sections.push({
      title: getSectionTitle(currentBlocks, sectionIndex),
      blocks: currentBlocks,
    });
  }

  // If we only got 1 section, split more aggressively
  if (sections.length <= 1 && content.length > 3) {
    return content.map((block, i) => ({
      title: getBlockTitle(block, i + 1),
      blocks: [block],
    }));
  }

  return sections;
}

function getSectionTitle(blocks: ContentBlock[], index: number): string {
  // Try to extract a meaningful title from the first block
  const first = blocks[0];
  if (first?.type === "text" && first.html) {
    const match = first.html.match(/<(?:strong|mark|b)>(.*?)<\/(?:strong|mark|b)>/);
    if (match) return match[1].replace(/<[^>]+>/g, "").substring(0, 50);
  }
  if (first?.type === "analogy" && first.label) return first.label;
  return `Section ${index}`;
}

function getBlockTitle(block: ContentBlock, index: number): string {
  if (block.type === "text" && block.html) {
    const match = block.html.match(/<(?:strong|mark|b)>(.*?)<\/(?:strong|mark|b)>/);
    if (match) return match[1].replace(/<[^>]+>/g, "").substring(0, 50);
    // Grab first ~40 chars as fallback
    const text = block.html.replace(/<[^>]+>/g, "").substring(0, 40);
    return text + (block.html.replace(/<[^>]+>/g, "").length > 40 ? "..." : "");
  }
  if (block.type === "analogy") return block.label || "Analogy";
  if (block.type === "callout") {
    if (block.variant === "dark") return "Code Example";
    if (block.variant === "red") return "Common Mistakes";
    if (block.variant === "amber") return "Key Distinction";
    if (block.variant === "blue") return "Structure Rule";
    return "Note";
  }
  if (block.type === "table") return "Reference Table";
  if (block.type === "steps") return "Step-by-Step";
  if (block.type === "cards") return "Key Concepts";
  if (block.type === "image") return "Illustration";
  return `Section ${index}`;
}

interface AccordionRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any[];
}

export default function AccordionRenderer({ content }: AccordionRendererProps) {
  const sections = groupIntoSections(content);
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.map((_, i) => i)) // All open by default
  );

  const allOpen = openSections.size === sections.length;

  function toggleAll() {
    if (allOpen) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(sections.map((_, i) => i)));
    }
  }

  function toggleSection(index: number) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  // If content is very short (1-2 blocks), don't use accordion
  if (content.length <= 2) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <TopicRenderer content={content as any} />;
  }

  return (
    <div>
      {/* Expand/Collapse controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={toggleAll}
          className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
        >
          {allOpen ? "▼ Collapse All" : "▶ Expand All"}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((section, i) => {
          const isOpen = openSections.has(i);
          return (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: isOpen ? "transparent" : "rgba(255,255,255,0.02)",
              }}
            >
              {/* Section header */}
              <button
                onClick={() => toggleSection(i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
              >
                <motion.span
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-zinc-500 text-xs shrink-0"
                >
                  ▶
                </motion.span>
                <span className="text-xs font-medium text-zinc-400 truncate">
                  {section.title}
                </span>
                <span className="ml-auto text-[10px] text-zinc-600 shrink-0">
                  {section.blocks.length} block{section.blocks.length > 1 ? "s" : ""}
                </span>
              </button>

              {/* Section content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      { /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                      <TopicRenderer content={section.blocks as any} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
