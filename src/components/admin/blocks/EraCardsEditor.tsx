"use client";

import type { ContentBlock, EraCard } from "@/types/content";

// Specialized 4-column timeline-ish card grid. Used in Module 1 Topic 2
// ("How Computers Grew Up") to walk through Mechanical → Electronic →
// PC → Mobile eras. Each card carries period + title + description +
// limitation. Schema is fixed at columns=4 per the type definition, so
// we don't expose a column selector — unlike the generic Cards grid.

export function EraCardsEditor({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: "era-cards" }>;
  onChange: (next: ContentBlock) => void;
}) {
  function updateCard(i: number, patch: Partial<EraCard>) {
    const items = [...block.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...block, items });
  }
  function addCard() {
    onChange({
      ...block,
      items: [
        ...block.items,
        {
          icon: "⏳",
          period: "Era",
          title: "",
          description: "",
          limitation: "",
        },
      ],
    });
  }
  function removeCard(i: number) {
    onChange({
      ...block,
      items: block.items.filter((_, idx) => idx !== i),
    });
  }
  function moveCard(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= block.items.length) return;
    const items = [...block.items];
    [items[i], items[j]] = [items[j], items[i]];
    onChange({ ...block, items });
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-zinc-500">
        Timeline-style cards. Each has a period label, title, description, and
        a one-line limitation.
      </p>

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
              placeholder="⏳"
              className="w-14 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-center text-[14px] focus:outline-none"
            />
            <input
              value={card.period}
              onChange={(e) => updateCard(i, { period: e.target.value })}
              placeholder="Era / period label (e.g. '1900s' or 'Mechanical')"
              className="flex-1 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-500/50"
            />
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => moveCard(i, -1)}
                disabled={i === 0}
                className="w-6 h-6 text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
                aria-label="Move card up"
              >
                ↑
              </button>
              <button
                onClick={() => moveCard(i, 1)}
                disabled={i === block.items.length - 1}
                className="w-6 h-6 text-[10px] text-zinc-500 hover:text-white disabled:opacity-30"
                aria-label="Move card down"
              >
                ↓
              </button>
              <button
                onClick={() => removeCard(i)}
                className="w-6 h-6 text-[11px] text-red-400 hover:text-red-300"
                aria-label="Remove era card"
              >
                ×
              </button>
            </div>
          </div>
          <input
            value={card.title}
            onChange={(e) => updateCard(i, { title: e.target.value })}
            placeholder="Card title (e.g. 'Mechanical Era')"
            className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white text-[12px] font-semibold focus:outline-none focus:border-indigo-500/50"
          />
          <input
            value={card.description}
            onChange={(e) => updateCard(i, { description: e.target.value })}
            placeholder="Description"
            className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[12px] focus:outline-none focus:border-indigo-500/50"
          />
          <input
            value={card.limitation}
            onChange={(e) => updateCard(i, { limitation: e.target.value })}
            placeholder="Limitation (shown in a divider at the bottom of the card)"
            className="w-full px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-[11px] italic focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      ))}

      <button
        onClick={addCard}
        className="w-full text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] rounded-lg py-1.5 transition-colors"
      >
        + Add era
      </button>
    </div>
  );
}
