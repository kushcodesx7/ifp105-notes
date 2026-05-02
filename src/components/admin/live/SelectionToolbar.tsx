"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// SelectionToolbar — a floating pill that follows the user's text
// selection inside any contenteditable surface marked with the
// `data-live-editable` attribute.
//
// Why a global, document-level listener instead of per-editor wiring?
// Because there are many EditableHtml instances on a topic (one per
// text/callout/analogy block, plus title and hook). A single listener
// wins on simplicity AND lets the toolbar work for selections that
// span across paragraphs within the same editable.
//
// Buttons:
//   B → document.execCommand("bold")
//   I → document.execCommand("italic")
//   H → toggleMark() → wraps selection in <mark> (matches student
//       render's violet-pill highlight in TopicRenderer.tsx)
//
// Positioning: absolutely positioned in the viewport using
// position:fixed + the selection's getBoundingClientRect(). Always
// rendered above the selection with a 6px gap; if it would clip the
// top of the viewport, flips below.
//
// Lifecycle: appears on selectionchange when there's a non-collapsed
// range inside an editable; hides on empty/outside selection. Uses
// pointer-events:none on the wrapper while invisible so it can never
// block clicks.

const EDITABLE_SELECTOR = "[data-live-editable='true']";

interface ToolbarRect {
  top: number;
  left: number;
  width: number;
  flipped: boolean;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  highlight: boolean;
}

function readActiveFormats(): ActiveFormats {
  // execCommand-state is the cheapest way to read the bold/italic
  // status of the current selection. queryCommandState is also
  // deprecated, but in lockstep with execCommand: if execCommand
  // ever stops working we lose B/I anyway. For highlight, we walk
  // up from the selection's anchorNode looking for a <mark>.
  let bold = false;
  let italic = false;
  try {
    bold = document.queryCommandState("bold");
    italic = document.queryCommandState("italic");
  } catch {
    // queryCommandState can throw in some browsers without an
    // active selection — fall through with defaults.
  }
  let highlight = false;
  const sel = window.getSelection();
  if (sel && sel.anchorNode) {
    let node: Node | null = sel.anchorNode;
    while (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode;
    highlight = !!(node && (node as HTMLElement).closest("mark"));
  }
  return { bold, italic, highlight };
}

function getEditableAncestor(node: Node | null): HTMLElement | null {
  let cur: Node | null = node;
  while (cur && cur.nodeType !== Node.ELEMENT_NODE) cur = cur.parentNode;
  return (cur as HTMLElement | null)?.closest(EDITABLE_SELECTOR) ?? null;
}

export default function SelectionToolbar() {
  const [rect, setRect] = useState<ToolbarRect | null>(null);
  const [active, setActive] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    highlight: false,
  });
  // We re-read selection state on every selectionchange. To avoid
  // stale closures, we use a ref for the bar element so handlers can
  // measure its width without the toolbar mounting causing a state
  // update loop.
  const barRef = useRef<HTMLDivElement | null>(null);
  // Tracks the most recent active editable so format buttons can
  // re-focus it after click (otherwise execCommand has no target).
  const lastEditable = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function update() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setRect(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const editable = getEditableAncestor(range.commonAncestorContainer);
      if (!editable) {
        setRect(null);
        return;
      }
      lastEditable.current = editable;

      const r = range.getBoundingClientRect();
      // selection inside an empty inline element can have 0 width —
      // ignore those degenerate rects so the toolbar doesn't snap to
      // (0, 0).
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }
      const barWidth = barRef.current?.offsetWidth ?? 168;
      const barHeight = barRef.current?.offsetHeight ?? 36;
      const gap = 8;

      let top = r.top - barHeight - gap;
      let flipped = false;
      if (top < 8) {
        top = r.bottom + gap;
        flipped = true;
      }
      let left = r.left + r.width / 2 - barWidth / 2;
      // Clamp to viewport with an 8px gutter.
      left = Math.max(8, Math.min(left, window.innerWidth - barWidth - 8));

      setRect({ top, left, width: barWidth, flipped });
      setActive(readActiveFormats());
    }

    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    // visualViewport reports the area NOT covered by the on-screen
    // keyboard on iOS (and Android). Without listening to its
    // resize/scroll, the toolbar can end up under the keyboard when
    // the admin starts typing on mobile. Best-effort — older browsers
    // don't expose visualViewport.
    const vv =
      typeof window !== "undefined" && "visualViewport" in window
        ? window.visualViewport
        : null;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, []);

  function withSelection(fn: () => void) {
    return (e: React.MouseEvent) => {
      // Mousedown on the toolbar button would steal focus from the
      // editable and collapse the selection. Prevent that.
      e.preventDefault();
      const ed = lastEditable.current;
      if (!ed) return;
      // Make sure the editable still owns selection.
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode || !ed.contains(sel.anchorNode)) return;
      fn();
      // Trigger blur+commit on the host EditableHtml without losing
      // selection visually (execCommand keeps selection intact).
      // We dispatch a synthetic input event so any listeners (none
      // today) fire, plus call the public commit by blurring then
      // restoring focus is too heavy. Instead we just leave the
      // editable focused; the parent autosave fires on next blur.
    };
  }

  function bold() {
    document.execCommand("bold");
  }
  function italic() {
    document.execCommand("italic");
  }
  function highlight() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);

    // Detect if entire selection is already inside a single <mark>.
    // If yes — unwrap. If not — wrap a fresh <mark> around the range.
    const ancestor = range.commonAncestorContainer;
    const markEl =
      ancestor.nodeType === Node.ELEMENT_NODE
        ? (ancestor as HTMLElement).closest("mark")
        : ancestor.parentElement?.closest("mark");

    if (markEl && markEl.contains(range.endContainer)) {
      // Unwrap — preserve the children's positions.
      const parent = markEl.parentNode;
      if (!parent) return;
      while (markEl.firstChild) parent.insertBefore(markEl.firstChild, markEl);
      parent.removeChild(markEl);
    } else {
      const mark = document.createElement("mark");
      try {
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
        // Restore selection over the new mark.
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(mark);
        sel.addRange(r);
      } catch {
        // surroundContents fails on partial-element ranges — fall
        // back to nothing rather than leave a corrupt DOM.
      }
    }
  }

  return (
    <AnimatePresence>
      {rect && (
        <motion.div
          ref={barRef}
          initial={{ opacity: 0, y: rect.flipped ? -4 : 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: rect.flipped ? -4 : 4, scale: 0.96 }}
          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[180] flex items-center gap-0.5 rounded-full px-1 py-1 select-none"
          style={{
            top: rect.top,
            left: rect.left,
            background:
              "linear-gradient(135deg, rgba(15,15,25,0.96), rgba(10,10,18,0.98))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 12px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.12)",
            backdropFilter: "blur(20px) saturate(160%)",
          }}
          // Don't steal selection on mouse-down inside the toolbar.
          onMouseDown={(e) => e.preventDefault()}
          role="toolbar"
          aria-label="Text formatting"
        >
          <ToolbarBtn
            label="Bold (⌘B)"
            onClick={withSelection(bold)}
            className="font-bold"
            active={active.bold}
          >
            B
          </ToolbarBtn>
          <ToolbarBtn
            label="Italic (⌘I)"
            onClick={withSelection(italic)}
            className="italic font-serif"
            active={active.italic}
          >
            I
          </ToolbarBtn>
          <span
            className="mx-0.5 w-px h-4 self-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-hidden
          />
          <ToolbarBtn
            label="Highlight (⌘E)"
            onClick={withSelection(highlight)}
            accent
            active={active.highlight}
          >
            <span
              style={{
                background:
                  "linear-gradient(90deg, rgba(139,92,246,0.4), rgba(99,102,241,0.4))",
                padding: "1px 5px",
                borderRadius: 4,
                color: "white",
                fontWeight: 700,
              }}
            >
              H
            </span>
          </ToolbarBtn>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolbarBtn({
  children,
  onClick,
  label,
  className,
  active,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  className?: string;
  /** When true, button renders in "pressed" state — selection is
   *  already inside the format this button would toggle. */
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      // touchstart preventDefault prevents iOS from collapsing the
      // selection when the admin taps a toolbar button on mobile.
      // Without this the touch sequence runs blur → selection loss
      // before the click handler fires.
      onTouchStart={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      // 2026-05-02 mobile audit: bumped the tap target from 28×28 to
      // 36×36 (with px-2.5 horizontal padding for labels). 44px is the
      // iOS HIG ideal but the toolbar is constrained — 36px is the
      // pragmatic compromise that keeps the floating pill compact and
      // gives mobile thumbs a reachable target.
      className={`min-w-[36px] h-9 px-2.5 text-[13px] rounded-full transition-colors ${
        active ? "text-white" : "text-zinc-200 hover:text-white"
      } ${className ?? ""}`}
      style={{
        background: active ? "rgba(99,102,241,0.28)" : "transparent",
        boxShadow: active
          ? "inset 0 0 0 1px rgba(99,102,241,0.4)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(99,102,241,0.18)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}
