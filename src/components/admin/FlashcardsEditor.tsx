"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// Admin editor for the per-topic flashcard deck.
//
// Persists to topics.flashcards_json via the topic PATCH endpoint
// (same route that holds title / hook / content blocks). Mirrors the
// BlockEditor's auto-save pattern: change a field → ~1s debounce →
// save quietly in the background. Manual "Save" button is still
// surfaced for the impatient and to let the admin see dirty/saved
// status.
//
// Shape in DB: [{ front: string, back: string, deletedAt?: string }, ...]
//
// `deletedAt` (ISO string) marks a card as trashed. The editor surfaces
// only LIVE cards (deletedAt undefined/null); the trash page surfaces
// only TRASHED cards. Layer-2 trash uses an in-array flag instead of a
// separate column so it ships without a DB migration — `flashcards_json`
// already accepts arbitrary JSON.
//
// Operations exposed: add card, delete card (→ trash), edit front, edit
// back, move up, move down. Reordering is a keyboard-friendly up/down
// arrow pair — no drag-and-drop because the list is short (typically
// 5-8) and drag-drop would drag in another dependency.

export interface Flashcard {
  front: string;
  back: string;
  /** ISO timestamp when the card was moved to the per-topic trash.
   *  Undefined / null = live. Saves keep the card so it can be restored
   *  via /admin/tools/trash without losing its content. */
  deletedAt?: string | null;
}

// Helpers — split the parent-supplied `value` array into the two views
// the editor needs to manage. Trash retains original insertion order so
// a restore brings it back in the same slot.
function isLive(c: Flashcard): boolean {
  return !c.deletedAt;
}
function liveOf(all: Flashcard[]): Flashcard[] {
  return all.filter(isLive);
}
function trashOf(all: Flashcard[]): Flashcard[] {
  return all.filter((c) => !!c.deletedAt);
}
// Rebuild the full storage array: live cards (in their new display
// order) followed by trashed cards (preserved as-is). Saving this back
// to the server keeps trash intact so /admin/tools/trash can list it.
function compose(newLive: Flashcard[], originalAll: Flashcard[]): Flashcard[] {
  return [...newLive, ...trashOf(originalAll)];
}

interface Props {
  value: Flashcard[];
  onChange: (next: Flashcard[]) => void;
  /** Called when the parent should flush changes to the server. */
  onSave: () => Promise<void> | void;
  /** True while a save is in flight — disables the Save button. */
  saving: boolean;
  /** True when `value` differs from what the server last confirmed. */
  dirty: boolean;
}

export default function FlashcardsEditor({
  value,
  onChange,
  onSave,
  saving,
  dirty,
}: Props) {
  const [justAddedIdx, setJustAddedIdx] = useState<number | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const frontRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  // Editor always operates on the LIVE subset — trashed cards stay in
  // `value` but are invisible in the UI. Mutations write back via
  // `compose(newLive, value)` which preserves the trash array.
  const live = liveOf(value);

  // Auto-focus the front textarea of a freshly added card so the admin
  // can start typing immediately instead of hunting for the field.
  useEffect(() => {
    if (justAddedIdx == null) return;
    const el = frontRefs.current[justAddedIdx];
    if (el) el.focus();
    setJustAddedIdx(null);
  }, [justAddedIdx]);

  function setCard(i: number, patch: Partial<Flashcard>) {
    const newLive = live.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    onChange(compose(newLive, value));
  }

  function addCard() {
    const newLive = [...live, { front: "", back: "" } as Flashcard];
    onChange(compose(newLive, value));
    setJustAddedIdx(newLive.length - 1);
  }

  function requestDelete(i: number) {
    setConfirmDeleteIdx(i);
  }

  function confirmDelete() {
    if (confirmDeleteIdx == null) return;
    // Move the card to trash by stamping deletedAt. The card's content
    // is preserved so /admin/tools/trash can restore it byte-for-byte.
    const cardToTrash = live[confirmDeleteIdx];
    const trashedCard: Flashcard = {
      ...cardToTrash,
      deletedAt: new Date().toISOString(),
    };
    const newLive = live.filter((_, idx) => idx !== confirmDeleteIdx);
    // Append the trashed card to the existing trash list (newest last)
    // so /admin/tools/trash can sort by deletedAt DESC.
    onChange([...newLive, ...trashOf(value), trashedCard]);
    setConfirmDeleteIdx(null);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= live.length) return;
    const newLive = [...live];
    [newLive[i], newLive[j]] = [newLive[j], newLive[i]];
    onChange(compose(newLive, value));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🃏</span>
          <div>
            <h3 className="text-[13px] font-bold">
              Flashcards{" "}
              <span className="text-[11px] font-semibold text-indigo-400 ml-1">
                {live.length} card{live.length === 1 ? "" : "s"}
              </span>
              {trashOf(value).length > 0 && (
                <span
                  className="text-[10px] font-semibold ml-1.5 px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#FBBF24",
                  }}
                  title={`${trashOf(value).length} card(s) in trash — restore from /admin/tools/trash`}
                >
                  {trashOf(value).length} in trash
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-500">
              Quick-review cards shown below the topic body. Empty deck → the
              Flashcards section hides on the student page.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={!dirty || saving}
            className="text-[11px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-50 px-2.5 py-1 rounded"
          >
            {saving ? "Saving…" : dirty ? "Save cards" : "Saved"}
          </button>
        </div>
      </div>

      {live.length === 0 && (
        <div
          className="rounded-lg px-4 py-6 text-center text-[12px] text-zinc-500 italic mb-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          No flashcards yet. Click &ldquo;Add card&rdquo; to create the first one.
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {live.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
              className="rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start gap-2">
                <div
                  className="shrink-0 w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "#A5B4FC",
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
                      Front (question)
                    </label>
                    <textarea
                      ref={(el) => {
                        frontRefs.current[i] = el;
                      }}
                      value={card.front}
                      onChange={(e) => setCard(i, { front: e.target.value })}
                      rows={2}
                      placeholder="What does CPU stand for?"
                      className="w-full text-[13px] rounded-lg px-3 py-2 resize-y min-h-[44px] outline-none"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e4e4e7",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">
                      Back (answer)
                    </label>
                    <textarea
                      value={card.back}
                      onChange={(e) => setCard(i, { back: e.target.value })}
                      rows={2}
                      placeholder="Central Processing Unit — the brain of the computer."
                      className="w-full text-[13px] rounded-lg px-3 py-2 resize-y min-h-[44px] outline-none"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e4e4e7",
                      }}
                    />
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                    aria-label="Move card up"
                    className="w-7 h-7 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === live.length - 1}
                    title="Move down"
                    aria-label="Move card down"
                    className="w-7 h-7 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => requestDelete(i)}
                    title="Delete card"
                    aria-label={`Delete card ${i + 1}`}
                    className="w-7 h-7 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center justify-center mt-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={addCard}
        className="mt-3 w-full py-2.5 rounded-xl text-[12px] font-semibold text-zinc-300 transition-colors hover:text-white"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
        }}
      >
        + Add card
      </button>

      {/* Flashcards trash (layer 2) — delete now stamps the card with
          deletedAt instead of dropping it from the array. The card
          stays in flashcards_json so it can be restored from
          /admin/tools/trash. Permanent removal happens via Purge in
          the trash page. */}
      <ConfirmDialog
        open={confirmDeleteIdx !== null}
        title="Move this flashcard to trash?"
        description={
          confirmDeleteIdx != null && live[confirmDeleteIdx]
            ? `"${live[confirmDeleteIdx].front.slice(0, 120) || "(empty card)"}"`
            : ""
        }
        warning="The card moves to /admin/tools/trash and can be restored anytime — students stop seeing it as soon as you Save."
        confirmLabel="Move to trash"
        cancelLabel="Keep"
        kind="danger"
        onCancel={() => setConfirmDeleteIdx(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
