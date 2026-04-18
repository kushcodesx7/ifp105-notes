"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Reveal-on-scroll wrapper. Wraps any content; applies the
// `revealed` class when the element enters the viewport, triggering
// the CSS transition defined in globals.css (`.reveal-on-scroll`).
//
// Uses IntersectionObserver (zero-JS for animation, tiny JS for the
// toggle). One-shot — once revealed, the observer disconnects so we
// don't waste work as the user scrolls back up.
//
// Respects `prefers-reduced-motion` via the CSS media query, so we
// don't need a JS check here.

interface RevealProps {
  children: ReactNode;
  /** Extra classes on the wrapper. */
  className?: string;
  /** Delay in ms before the reveal fires after intersection. */
  delay?: number;
  /**
   * Root margin — how far from the viewport edge the observer fires.
   * Negative top pulls the trigger BELOW the fold, so headings fade
   * in as they're just about to be read. Default: "-80px".
   */
  rootMargin?: string;
  /** When true, also attaches the section-sweep underline class. */
  sweep?: boolean;
  /** HTML tag to render (default div). */
  as?: "div" | "section" | "h1" | "h2" | "h3" | "p";
}

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  rootMargin = "-80px",
  sweep = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Graceful fallback: if the browser doesn't support
    // IntersectionObserver (Safari < 12, very old Android), reveal
    // immediately so the content is always visible.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => el.classList.add("revealed"), delay);
            } else {
              el.classList.add("revealed");
            }
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, rootMargin]);

  const classes = [
    "reveal-on-scroll",
    sweep ? "section-sweep" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Cast ref to the generic HTMLElement the union permits. Tag is
  // constrained above so this is sound.
  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      className={classes}
    >
      {children}
    </Tag>
  );
}
