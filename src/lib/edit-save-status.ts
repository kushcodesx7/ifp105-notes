"use client";

import { useSyncExternalStore } from "react";

// Global save-status ticker — a tiny pub-sub so the AdminBar (mounted
// at root) can show the live status of saves happening inside the
// inline module editor (which renders as a descendant of the same
// page but doesn't have a direct parent-child wire to the bar).
//
// Not a React context because the bar and the editor share no common
// ancestor other than the root layout, and a context would force the
// whole tree to re-render on every status change.

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

let currentStatus: SaveStatus = "idle";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setEditSaveStatus(status: SaveStatus) {
  if (currentStatus === status) return;
  currentStatus = status;
  emit();
}

export function useEditSaveStatus(): SaveStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => currentStatus,
    () => "idle"
  );
}

// Convenience: auto-demote "saved" back to "idle" after a moment so
// the chip doesn't linger forever. Editors call this instead of
// setEditSaveStatus("saved") directly.
export function markSaved(): void {
  setEditSaveStatus("saved");
  if (typeof window !== "undefined") {
    setTimeout(() => {
      if (currentStatus === "saved") setEditSaveStatus("idle");
    }, 2000);
  }
}
