"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

// EditableHtml — a contentEditable div that:
//   · Initialises from `value` on mount (and only re-syncs when `value`
//     differs from current innerHTML AND the editor is not focused).
//     This is the cursor-preservation trick: if we always synced from
//     props, every keystroke would wipe the caret.
//   · Calls onChange(html) on blur (and on Enter when `singleLine`).
//   · Supports a tiny rich-text vocabulary via keyboard:
//        cmd/ctrl + B → wrap selection in <strong>
//        cmd/ctrl + I → wrap in <em>
//        cmd/ctrl + E → wrap in <mark>      (matches student "highlight")
//   · Detects complex HTML on mount (inline SVG, <iframe>, <div style>,
//     <script>, <style>) — if found, the editor is rendered as a
//     read-only preview with a "Edit raw HTML" button so the inline
//     SVG hero on Topic 3 doesn't get destroyed by a stray keystroke.
//
// This is intentionally NOT a full rich-text editor — Notion uses
// ProseMirror and a plugin tree. We need ~15% of that surface area
// (bold/italic/highlight + plain paragraphs + line breaks) and the
// existing inline-HTML escape hatch is already what authors use today.

// Tags that contentEditable genuinely cannot handle: SVG / iframe /
// scriptable embeds. Editing these as text destroys their structure
// (SVG path data turns to garbage, iframes lose their src attribute
// after a Backspace, etc.). When any of these are present the editor
// renders a locked preview with an "Edit raw HTML" escape hatch.
const COMPLEX_HTML_PATTERN =
  /<(svg|iframe|script|style|video|audio|canvas|math|object|embed)\b/i;
// Inline-style wrappers signal a hand-tuned layout that contentEditable
// will mangle by collapsing whitespace and re-parenting children. The
// pre-2026-04-27 version of this regex also caught any element with a
// `class=` attribute, which over-locked nearly every prose block (every
// data-driven block has Tailwind classes). Now we only lock when an
// inline `style=` attribute is present — that's the genuine signal of
// a custom layout the author wants preserved byte-for-byte.
const COMPLEX_LAYOUT_PATTERN =
  /<(div|span|figure|table|ul|ol)\b[^>]*\bstyle=/i;

export function isComplexHtml(html: string): boolean {
  if (!html) return false;
  return (
    COMPLEX_HTML_PATTERN.test(html) || COMPLEX_LAYOUT_PATTERN.test(html)
  );
}

export interface EditableHtmlHandle {
  /** Programmatic focus → places cursor at end of contents. */
  focus(): void;
  /** Read current innerHTML without waiting for blur. */
  read(): string;
}

interface EditableHtmlProps {
  value: string;
  onChange: (next: string) => void;
  /** Plain placeholder shown when contents are empty. */
  placeholder?: string;
  /** Tailwind classes applied to the contenteditable surface. */
  className?: string;
  style?: CSSProperties;
  /** When true, Enter blurs (no <br> insertion). For titles. */
  singleLine?: boolean;
  /** Called when user presses '/' at start of an empty line.
   *  Receives the (left,bottom) DOMRect of the caret so the menu
   *  can be positioned. */
  onSlash?: (caretRect: DOMRect) => void;
  /** Override: skip complex-HTML detection (callers that know the
   *  content is plain — e.g. a card's title). */
  forceEditable?: boolean;
  /** Strip HTML on paste — for fields where rich text would be wrong
   *  (e.g. titles). */
  plainTextPaste?: boolean;
  ariaLabel?: string;
}

const EditableHtml = forwardRef<EditableHtmlHandle, EditableHtmlProps>(
  function EditableHtml(
    {
      value,
      onChange,
      placeholder,
      className,
      style,
      singleLine,
      onSlash,
      forceEditable,
      plainTextPaste,
      ariaLabel,
    },
    handle
  ) {
    const ref = useRef<HTMLDivElement | null>(null);
    const focused = useRef(false);
    // Tracks the last value we wrote to the DOM so React re-renders
    // with the same `value` don't trigger a redundant innerHTML wipe.
    const lastWritten = useRef<string>("");
    // Debounce timer for typing-time commits. We fire onChange ~500ms
    // after the user stops typing so the parent autosave (2s further
    // debounce in InlineModuleEditor) actually starts before the user
    // clicks away. Without this, autosave only happened on blur — an
    // admin who typed for three minutes and never blurred saw nothing
    // saved despite the "Saved within ~30s" copy.
    const inputDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const complex = !forceEditable && isComplexHtml(value);

    useImperativeHandle(handle, () => ({
      focus() {
        const el = ref.current;
        if (!el) return;
        el.focus();
        // Caret to end:
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      },
      read() {
        return ref.current?.innerHTML ?? value;
      },
    }));

    // Sync value → DOM when:
    //   · first mount (lastWritten.current === "")
    //   · prop changes AND editor isn't focused (parent forced a reset)
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (focused.current) return;
      if (el.innerHTML === value) return;
      el.innerHTML = value || "";
      lastWritten.current = value || "";
    }, [value]);

    // Cancel any pending typing-time commit on unmount so a stale
    // setTimeout doesn't fire onChange after the host has been torn
    // down (would no-op but creates a console warning under strict
    // mode).
    useEffect(
      () => () => {
        if (inputDebounce.current) {
          clearTimeout(inputDebounce.current);
          inputDebounce.current = null;
        }
      },
      []
    );

    function commit() {
      const el = ref.current;
      if (!el) return;
      const html = el.innerHTML;
      if (html === lastWritten.current) return;
      lastWritten.current = html;
      onChange(html);
    }

    function handleKey(e: ReactKeyboardEvent<HTMLDivElement>) {
      // Slash command — only fire when the line is empty (or selection
      // is at the start of an otherwise-empty line). Avoids hijacking
      // every '/' the author types inside a sentence.
      if (e.key === "/" && onSlash) {
        const sel = window.getSelection();
        const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
        const node = range?.startContainer;
        const text = node?.textContent ?? "";
        const lineEmpty = text.trim() === "";
        if (lineEmpty) {
          e.preventDefault();
          // Use the caret rect for menu positioning. If empty line,
          // anchor on the editor's bounding rect instead.
          const rect = range && !range.collapsed
            ? range.getBoundingClientRect()
            : ref.current?.getBoundingClientRect();
          if (rect) onSlash(rect as DOMRect);
          return;
        }
      }

      if (singleLine && e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
        return;
      }

      // Rich-text shortcuts. document.execCommand is deprecated but
      // still works in every browser and is by far the simplest way
      // to wrap a selection in a tag while preserving cursor position.
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        document.execCommand("bold");
        commit();
      } else if (k === "i") {
        e.preventDefault();
        document.execCommand("italic");
        commit();
      } else if (k === "e") {
        // Highlight = wrap in <mark>. execCommand has no native
        // highlight; we use a tiny custom implementation.
        e.preventDefault();
        toggleMark();
        commit();
      }
    }

    function toggleMark() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      const markEl =
        ancestor.nodeType === Node.ELEMENT_NODE
          ? (ancestor as HTMLElement).closest("mark")
          : ancestor.parentElement?.closest("mark");
      if (markEl) {
        // Unwrap
        const parent = markEl.parentNode;
        while (markEl.firstChild) parent?.insertBefore(markEl.firstChild, markEl);
        parent?.removeChild(markEl);
      } else {
        const mark = document.createElement("mark");
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
        // Restore selection over the new mark
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(mark);
        sel.addRange(r);
      }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
      if (!plainTextPaste) return;
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    }

    if (complex) {
      // Locked preview — render the markup but block contentEditable so
      // inline SVG / iframe / styled wrappers stay intact. The wrapping
      // component is responsible for surfacing an "Edit raw HTML"
      // button (and rendering the existing TextEditor) when the author
      // clicks the badge.
      return (
        <div
          className={className}
          style={style}
          aria-label={ariaLabel}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }

    const empty = !value || value === "<br>" || value.trim() === "";

    return (
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline={!singleLine}
          aria-label={ariaLabel}
          spellCheck
          className={`${className ?? ""} outline-none focus:outline-none whitespace-pre-wrap break-words`}
          style={style}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
            // Cancel any pending typing-time commit; the blur commit
            // covers it and writes through immediately.
            if (inputDebounce.current) {
              clearTimeout(inputDebounce.current);
              inputDebounce.current = null;
            }
            commit();
          }}
          onInput={() => {
            // Debounced typing-time commit. The cursor-preservation
            // useEffect above bails when `focused.current === true`,
            // so even though the parent will re-render with a new
            // `value` prop after we call onChange, the DOM is never
            // reset → caret stays put. The 500ms here is short enough
            // that students see edits propagate quickly via the
            // parent's 2s save debounce, but long enough to coalesce
            // a normal typing burst into one onChange fire.
            if (inputDebounce.current) clearTimeout(inputDebounce.current);
            inputDebounce.current = setTimeout(() => {
              inputDebounce.current = null;
              commit();
            }, 500);
          }}
          onKeyDown={handleKey}
          onPaste={handlePaste}
        />
        {empty && placeholder && (
          <div
            className="pointer-events-none absolute inset-0 text-zinc-600 select-none"
            style={style}
            aria-hidden
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }
);

export default EditableHtml;
