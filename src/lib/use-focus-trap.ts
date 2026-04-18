"use client";

import { useEffect, RefObject } from "react";

// Minimal focus trap for dialog wrappers. When `active` is true and the
// element under `ref` is mounted, Tab and Shift+Tab cycle only among the
// focusable descendants instead of escaping to page content behind the
// backdrop. Release happens automatically when `active` flips false or
// the component unmounts.
//
// We deliberately DO NOT auto-focus the first element here — the caller
// decides whether to focus the dialog heading, the first input, or the
// close button depending on the modal's intent.
//
// Inspired by but intentionally simpler than focus-trap-react: no
// layered instances, no click-outside tracking — Esc handling and
// backdrop-close stay in the caller's responsibility.
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab" || !el) return;
      const nodes = Array.from(
        el.querySelectorAll<HTMLElement>(selector)
      ).filter((n) => !n.hasAttribute("aria-hidden") && n.offsetParent !== null);
      if (nodes.length === 0) {
        // Nothing focusable inside — trap focus on the dialog itself.
        e.preventDefault();
        el.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (activeEl === first || !el.contains(activeEl))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [active, ref]);
}
