"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// BlockModal — generic modal shell used by LiveBlockEditor for the
// structural blocks (cards, era-cards, table, steps, image) where the
// inline-editing affordance isn't there yet (PR 2). It hosts the
// existing form sub-editor (CardsEditor, TableEditor, …) inside a
// glass card and gives the admin a "Done" button so the focus story
// is clear: open modal → tweak → close.
//
// Why a modal and not just an inline form below the rendered block?
// Because the rendered block IS the live preview — putting a form
// directly underneath would mean two visualisations of the same
// content side-by-side, which is exactly what we set out to remove
// in this rewrite. A modal keeps the page reading like the student
// view until you opt-in to edit.
//
// The modal is a controlled component: parent manages `open`, passes
// children (the actual sub-editor instance), and listens for close
// via `onClose`. Save lives at the parent level — the sub-editor's
// onChange flows up to LiveBlockEditor → InlineModuleEditor's 2s
// autosave, identical to the classic editor's save model.

interface BlockModalProps {
  open: boolean;
  onClose: () => void;
  /** Title at the top of the modal — usually the block-type label. */
  title: string;
  /** Small icon next to the title (matches BLOCK_META.icon). */
  icon?: string;
  /** Optional accent colour from BLOCK_META so the modal frame
   *  matches the block-type identity. */
  accent?: string;
  children: React.ReactNode;
}

export default function BlockModal({
  open,
  onClose,
  title,
  icon,
  accent,
  children,
}: BlockModalProps) {
  // Close on Escape — global for the lifetime of `open`.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open so the page underneath doesn't drift.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[210] flex items-start justify-center px-4 py-[8vh] overflow-y-auto"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="w-full max-w-2xl rounded-2xl my-auto overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,15,25,0.97), rgba(10,10,18,0.98))",
              border: `1px solid ${accent ? `${accent}40` : "rgba(255,255,255,0.1)"}`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accent ? `${accent}20` : "rgba(99,102,241,0.08)"}`,
              backdropFilter: "blur(24px) saturate(160%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: accent ? `${accent}0A` : undefined,
              }}
            >
              {icon && (
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{
                    background: accent ? `${accent}1A` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${accent ? `${accent}30` : "rgba(255,255,255,0.08)"}`,
                  }}
                  aria-hidden
                >
                  {icon}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Editing
                </div>
                <div className="text-[14px] font-bold text-white truncate">
                  {title}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close editor"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body — sub-editor renders here. We constrain max-height
                 to viewport-minus-padding so long forms (multi-row
                 tables, big card grids) get an internal scroll instead
                 of pushing the modal off the page. */}
            <div
              className="p-5 overflow-y-auto"
              style={{ maxHeight: "calc(84vh - 60px)" }}
            >
              {children}
            </div>

            {/* Footer — single Done button. The sub-editor saves via
                 onChange on every keystroke (autosave handled at the
                 InlineModuleEditor level), so "Done" is purely a way
                 to dismiss the modal. */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span className="text-[11px] text-zinc-500">
                Auto-saving as you type · press{" "}
                <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                  Esc
                </kbd>{" "}
                to close
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] font-semibold text-white px-4 py-1.5 rounded-full transition-all"
                style={{
                  background: accent
                    ? `linear-gradient(135deg, ${accent}, ${accent}CC)`
                    : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow: `0 4px 16px ${accent ? `${accent}55` : "rgba(99,102,241,0.4)"}`,
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
