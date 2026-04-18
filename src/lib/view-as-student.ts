"use client";

import { useEffect, useSyncExternalStore } from "react";

// "View as student" toggle — when enabled, admin-only UI (the floating
// admin bar, any edit-mode styling) hides so the admin sees exactly
// what a student sees. Backed by localStorage so the preference
// persists across navigations and page reloads in the same tab.
//
// Why a manual store instead of React context: the toggle needs to be
// readable from components mounted anywhere in the tree (AdminBar,
// inline editor entry point, etc.) without threading a provider
// through. A tiny pub-sub over localStorage fits cleanly.

const KEY = "admin_view_as_student";

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  // Manual-change channel — storage events only fire cross-tab, so we
  // dispatch a custom event after the writer updates localStorage.
  window.addEventListener("admin-view-mode-change", cb);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("admin-view-mode-change", cb);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns whether the admin has toggled "view as student" on. Always
 * false for non-admin users (they never touch the toggle).
 */
export function useViewAsStudent(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Set the view-as-student flag. Dispatches `admin-view-mode-change`
 * so listeners in the same tab re-read immediately.
 */
export function setViewAsStudent(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(KEY, "1");
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("admin-view-mode-change"));
}

// Small singleton that can be imported inside hooks to avoid re-declaring
// the subscribe/snapshot functions.
export const viewAsStudentStore = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
};

// Re-export under the unused-var-silenced alias for JSX consumers who
// want the effect without reading the bool (e.g. AdminBar itself).
export function useInitViewAsStudent(): void {
  // Using the store forces a subscribe — cheap way to ensure the
  // component re-renders when another part of the app flips the flag.
  useViewAsStudent();
  useEffect(() => {
    // No-op. Just anchors the subscription to the component lifecycle.
  }, []);
}
