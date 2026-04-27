"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

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
// Wall-clock timestamp of the last successful save. Used by
// useLastSavedAgo() to show a "Saved 12s ago" indicator in the admin
// bar so authors have continuous confidence the system is working —
// the brief "Saved" flash alone disappears too quickly to reassure
// during a long editing session.
let lastSavedAt: number | null = null;
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

function formatAgo(at: number, now: number): string {
  const sec = Math.max(0, Math.round((now - at) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}

/**
 * Reactive "X seconds/minutes ago" string for the most recent save.
 * Returns null when no save has happened yet (or the editor isn't
 * mounted). Self-ticks at 1Hz so the relative time updates without
 * callers needing their own setInterval.
 *
 * The `Date.now()` read lives in an effect (not render) so the hook
 * stays pure under react-hooks/purity. The rendered string is stored
 * in local state and refreshed by the same effect each tick.
 */
export function useLastSavedAgo(): string | null {
  const at = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => lastSavedAt,
    () => null
  );
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    if (at == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLabel(null);
      return;
    }
    // Initial label, then refresh every second. The setLabel calls
    // are whitelisted: `at` is the only meaningful input to the
    // formatter and it's already in deps; `Date.now()` is the
    // unavoidable side-channel that motivates the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(formatAgo(at, Date.now()));
    const id = setInterval(() => {
      setLabel(formatAgo(at, Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [at]);
  return label;
}

// Convenience: auto-demote "saved" back to "idle" after a moment so
// the chip doesn't linger forever. Editors call this instead of
// setEditSaveStatus("saved") directly. Also stamps `lastSavedAt` for
// the "Saved Xs ago" indicator.
export function markSaved(): void {
  setEditSaveStatus("saved");
  lastSavedAt = Date.now();
  emit();
  if (typeof window !== "undefined") {
    setTimeout(() => {
      if (currentStatus === "saved") setEditSaveStatus("idle");
    }, 2000);
  }
}
