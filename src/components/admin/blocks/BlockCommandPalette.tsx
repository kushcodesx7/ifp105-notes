"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BLOCK_MENU, BLOCK_META, type BlockType } from "./types";

// ⌘K-style palette for inserting a new block. Opens from the "+ Add
// block" trigger or the empty-state CTA in the BlockEditor wrapper.
// Filter-as-you-type input, arrow-key navigation, Enter to insert,
// Esc / outside-click to close. Matches the site's glass aesthetic.

export function BlockCommandPalette({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on open, focus the input. Whitelisted — canonical "sync to
  // controlled-open prop" pattern.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_MENU;
    return BLOCK_MENU.filter((m) => {
      const hay = `${m.label} ${m.keywords} ${m.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  // Keep the active index in bounds as the list filters. Whitelisted —
  // clamp pattern, see AdminCommandPalette for the same comment.
  useEffect(() => {
    if (activeIndex >= filtered.length)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      onSelect(filtered[activeIndex].type);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,15,25,0.97), rgba(10,10,18,0.98))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
              backdropFilter: "blur(24px) saturate(160%)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Insert block"
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span aria-hidden="true" className="text-zinc-500 text-sm">
                ⌘K
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type to filter — paragraph, callout, image…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                Esc
              </kbd>
            </div>
            <div className="max-h-[320px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-center py-6 text-[12px] text-zinc-500">
                  No block types match &quot;{query}&quot;
                </p>
              ) : (
                filtered.map((m, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={m.type}
                      onClick={() => onSelect(m.type)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        background: active
                          ? "rgba(99,102,241,0.12)"
                          : "transparent",
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{
                          background: `${BLOCK_META[m.type].accent}1A`,
                          border: `1px solid ${BLOCK_META[m.type].accent}30`,
                        }}
                      >
                        {m.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-white">
                          {m.label}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
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
            <div
              className="flex items-center justify-between px-4 py-2 text-[10px] text-zinc-500"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">↑↓</kbd>{" "}
                to navigate
              </span>
              <span>
                <kbd className="font-mono px-1 py-px rounded bg-white/[0.05]">↵</kbd>{" "}
                to insert
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
