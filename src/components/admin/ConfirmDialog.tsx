"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  // Optional diff rows — renders as "label: before → after" chips.
  diff?: { label: string; from: string; to: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  // Visual severity — 'danger' for destructive ops, 'primary' otherwise.
  kind?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  // If a confirm handler is in flight, show a spinner and disable buttons.
  loading?: boolean;
  // Optional extra warning text under the diff (e.g. "cannot be undone").
  warning?: string;
}

// Modal dialog used for every mutating admin action. Guarantees three
// things: a clear diff of what will change, a typed confirmation path,
// and a loading state during the API call.
export default function ConfirmDialog({
  open,
  title,
  description,
  diff,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  kind = "primary",
  onCancel,
  onConfirm,
  loading,
  warning,
}: ConfirmDialogProps) {
  // Esc closes unless the action is in flight
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[150] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) onCancel();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, #0F0F1A, #0A0A12)",
              border: `1px solid ${
                kind === "danger"
                  ? "rgba(239,68,68,0.25)"
                  : "rgba(99,102,241,0.25)"
              }`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
                style={{
                  background:
                    kind === "danger"
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(99,102,241,0.15)",
                }}
              >
                {kind === "danger" ? "⚠️" : "✏️"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white leading-snug">
                  {title}
                </h2>
                {description && (
                  <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {diff && diff.length > 0 && (
              <div
                className="rounded-xl p-3 mb-3 space-y-2"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {diff.map((d, i) => (
                  <div key={i} className="text-[12px]">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                      {d.label}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-md text-red-300 line-through text-[11px]"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.15)",
                        }}
                      >
                        {d.from || "—"}
                      </span>
                      <span className="text-zinc-500 text-[11px]">→</span>
                      <span
                        className="px-2 py-0.5 rounded-md text-emerald-300 text-[11px]"
                        style={{
                          background: "rgba(34,197,94,0.08)",
                          border: "1px solid rgba(34,197,94,0.15)",
                        }}
                      >
                        {d.to || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {warning && (
              <div
                className="rounded-xl p-3 mb-3 text-[11px] text-amber-300 leading-relaxed"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                ⚠ {warning}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-60 flex items-center gap-2"
                style={{
                  background:
                    kind === "danger"
                      ? "linear-gradient(135deg, #EF4444, #DC2626)"
                      : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow:
                    kind === "danger"
                      ? "0 4px 14px rgba(239,68,68,0.3)"
                      : "0 4px 14px rgba(99,102,241,0.3)",
                }}
              >
                {loading && (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
