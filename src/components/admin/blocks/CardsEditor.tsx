"use client";

import type { ContentBlock, TopicCard } from "@/types/content";

export function CardsEditor({
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
