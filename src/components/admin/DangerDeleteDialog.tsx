"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Two-step destructive-action dialog. Used for cascading deletes (module,
// topic, course) where a misclick could wipe real student-facing content.
//
// Flow:
//   1. Dialog opens showing what will be deleted + the cascade summary
//      ("X topics", "Y questions", etc.). The Confirm button stays
//      disabled until the admin retypes `confirmPhrase` exactly —
//      usually the target's name/slug. Cognitive friction to prevent
//      misclicks; Google sign-in already handles authentication.
//   2. On Confirm, we call onConfirm() and let the caller fire the
//      DELETE request with the admin's x-id-token. Errors surface
//      inline; dialog stays open so the teacher can retry without
//      losing context.
//
// Design note: this used to collect a fresh admin password as a second
// factor. When the shared-password admin path was removed (Google
// sign-in only), the password prompt broke — it sent a header the
// server no longer honours. Replaced with the GitHub-style "type the
// target name to confirm" pattern. It's still deliberate friction;
// it just isn't a credential check anymore.

export interface DangerDeleteDialogProps {
  open: boolean;
  title: string;
  /** What's being deleted — shown as a bold summary line. */
  target: string;
  /** Bullet-list of cascade consequences. */
  consequences: string[];
  /**
   * Exact phrase the admin must type to enable Confirm. Usually the
   * target's slug or name — something short, case-sensitive, and
   * visible in the dialog so they can read then type.
   */
  confirmPhrase: string;
  confirmLabel?: string;
  onCancel: () => void;
  /** Called on final confirm. Throw to surface errors inline. */
  onConfirm: () => Promise<void>;
}

export default function DangerDeleteDialog({
  open,
  title,
  target,
  consequences,
  confirmPhrase,
  confirmLabel = "Delete permanently",
  onCancel,
  onConfirm,
}: DangerDeleteDialogProps) {
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset state whenever the dialog opens so a previous failed attempt
  // doesn't leak into the next invocation. Whitelisted: this is the
  // canonical "sync state to a controlled-open prop" pattern. The
  // alternative (force remount via `key={open}`) would also tear down
  // the focus trap and trigger the open animation twice.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped("");
      setErr(null);
      setLoading(false);
    }
  }, [open]);

  // Esc closes unless the action is in flight
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  const matches = typed === confirmPhrase;

  async function handleConfirm() {
    if (!matches || loading) return;
    setErr(null);
    setLoading(true);
    try {
      await onConfirm();
      // onConfirm success → parent closes the dialog. If it stays open
      // (caller forgot), at least clear the loading state.
      setLoading(false);
    } catch (e) {
      const msg = (e as Error).message || "Delete failed";
      // Friendly rewrite for the auth-failure case — shouldn't happen
      // under Google-only auth but keeps the UI sensible if it does.
      if (/401|unauthor/i.test(msg)) {
        setErr("Not signed in as an admin. Refresh and sign in again.");
      } else {
        setErr(msg);
      }
      setLoading(false);
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
          className="fixed inset-0 z-[150] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
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
              background: "linear-gradient(135deg, #1a0f0f, #0A0A12)",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="danger-dialog-title"
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                style={{ background: "rgba(239,68,68,0.18)" }}
              >
                ⚠️
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  id="danger-dialog-title"
                  className="text-base font-bold text-white leading-snug"
                >
                  {title}
                </h2>
                <p className="text-[13px] text-zinc-300 mt-1 font-semibold">
                  {target}
                </p>
              </div>
            </div>

            {consequences.length > 0 && (
              <div
                className="rounded-xl p-3 mb-4"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.18)",
                }}
              >
                <div className="text-[10px] font-bold text-red-300 uppercase tracking-wider mb-2">
                  This will also delete
                </div>
                <ul className="space-y-1 text-[12px] text-red-200/90">
                  {consequences.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 shrink-0">×</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-red-300/70 mt-3 italic">
                  This cannot be undone.
                </p>
              </div>
            )}

            <div className="mb-3">
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                Type{" "}
                <span className="font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">
                  {confirmPhrase}
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                  if (err) setErr(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches && !loading) {
                    handleConfirm();
                  }
                }}
                placeholder={confirmPhrase}
                autoFocus
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-red-500/50 disabled:opacity-50"
              />
              {err && (
                <p className="text-[12px] text-red-400 mt-2">{err}</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !matches}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-40 flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                }}
              >
                {loading && (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Deleting…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
