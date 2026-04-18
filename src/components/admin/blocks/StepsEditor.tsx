"use client";

import type { ContentBlock, StepItem } from "@/types/content";
import { PlainInput } from "./primitives";

export function StepsEditor({
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
