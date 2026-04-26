"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BLOCK_MENU, BLOCK_META, type BlockType } from "../blocks/types";

// SlashMenu — Notion-style "/" command palette anchored at the cursor.
//
// Differs from BlockCommandPalette (centred ⌘K modal) in two ways:
//   1. Position is anchored to the caret rect, not centred.
//   2. The host editable stays focused — typing in the host filters
//      the list (we mirror keystrokes via onKeyDown). This means the
//      user types `/cal` and Callout filters in, no input swap.
//
// Trigger flow:
//   · The host EditableHtml fires `onSlash(caretRect)` only when the
//     line is empty (see EditableHtml.handleKey).
//   · We open at that rect and listen to keystrokes on the document
//     until the user picks one (Enter), cancels (Esc / blur), or
//     types a non-letter that breaks the filter (space).
//
// The host editable does NOT lose focus while the menu is open. That
// way, when the menu closes, the cursor stays on the empty line so
// the parent can either replace that block or insert a new one.

interface SlashMenuProps {
  /** When set, the menu is anchored at this DOMRect. null = closed. */
  anchor: DOMRect | null;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
}

export default function SlashMenu({
  anchor,
  onClose,
  onSelect,
}: SlashMenuProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset query and active index whenever the anchor (a new open
  // event) appears.
  useEffect(() => {
    if (!anchor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");

    setActiveIndex(0);
  }, [anchor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_MENU;
    return BLOCK_MENU.filter((m) => {
      const hay = `${m.label} ${m.keywords} ${m.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  // Keep activeIndex in bounds as filtered list shrinks. Whitelisted —
  // canonical clamp pattern.
  useEffect(() => {
    if (activeIndex >= filtered.length)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  // Document-level keystroke handler while open. We can't put the
  // listener on a focused input (there isn't one — the host editable
  // is still focused) so we hijack the document's keydown phase.
  useEffect(() => {
    if (!anchor) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter") {
        const pick = filtered[activeIndex];
        if (pick) {
          e.preventDefault();
          onSelect(pick.type);
          onClose();
        }
        return;
      }
      if (e.key === "Backspace") {
        // Backspace shrinks the filter. If it empties, leave the menu
        // open showing the full list — the user pressed `/` so the
        // intent is still "I want to insert a block".
        e.preventDefault();
        setQuery((q) => q.slice(0, -1));
        return;
      }
      // Single printable characters add to filter. Space is treated
      // as a cancel signal — Notion does the same: type "/ a" and
      // the menu closes.
      if (e.key.length === 1) {
        if (e.key === " ") {
          e.preventDefault();
          onClose();
          return;
        }
        e.preventDefault();
        setQuery((q) => q + e.key.toLowerCase());
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [anchor, filtered, activeIndex, onClose, onSelect]);

  // Close on outside click. The anchor is the caret rect, but we
  // also want clicks inside the menu to NOT close — so we attach
  // mousedown to the document and only close if the target isn't
  // inside the menu.
  useEffect(() => {
    if (!anchor) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [anchor, onClose]);

  if (!anchor) return null;

  // Position: directly below the caret with an 8px gap. Clamp into
  // viewport so it's never offscreen.
  const menuWidth = 280;
  const menuMaxHeight = 320;
  const gap = 8;
  let top = anchor.bottom + gap;
  let left = anchor.left;
  if (left + menuWidth > window.innerWidth - 8)
    left = window.innerWidth - menuWidth - 8;
  if (left < 8) left = 8;
  // If menu would clip the bottom, flip above.
  if (top + menuMaxHeight > window.innerHeight - 8) {
    top = anchor.top - menuMaxHeight - gap;
    if (top < 8) top = 8;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 480, damping: 32 }}
        className="fixed z-[190] rounded-xl overflow-hidden"
        style={{
          top,
          left,
          width: menuWidth,
          maxHeight: menuMaxHeight,
          background:
            "linear-gradient(135deg, rgba(15,15,25,0.97), rgba(10,10,18,0.98))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.08)",
          backdropFilter: "blur(24px) saturate(160%)",
        }}
        role="listbox"
        aria-label="Insert block"
      >
        {/* Header — shows what the user is typing after the slash. */}
        <div
          className="flex items-center gap-2 px-3 py-2 text-[11px]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-indigo-400 font-mono">/</span>
          <span className="text-white font-mono">{query || "…"}</span>
          <span className="ml-auto text-zinc-500 text-[10px]">
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </span>
        </div>
        <div className="overflow-y-auto py-1" style={{ maxHeight: 260 }}>
          {filtered.length === 0 ? (
            <p className="text-center py-5 text-[12px] text-zinc-500">
              No blocks match{" "}
              <code className="font-mono text-zinc-400">/{query}</code>
            </p>
          ) : (
            filtered.map((m, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={m.type}
                  onClick={() => {
                    onSelect(m.type);
                    onClose();
                  }}
                  // Don't blur the host editable. mousedown selects
                  // and would steal focus.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(i)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
                  style={{
                    background: active
                      ? "rgba(99,102,241,0.14)"
                      : "transparent",
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      background: `${BLOCK_META[m.type].accent}1A`,
                      border: `1px solid ${BLOCK_META[m.type].accent}30`,
                    }}
                  >
                    {m.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">
                      {m.label}
                    </div>
                    <div className="text-[10.5px] text-zinc-500 truncate">
                      {m.hint}
                    </div>
                  </div>
                  {active && (
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300 shrink-0">
                      ↵
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
