"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Attention banner that surfaces the latest teacher broadcast at the
// top of every page for every signed-in student.
//
// Data flow:
//   · On mount + every 15s, GETs /api/broadcasts/latest.
//   · If `broadcast` is non-null AND its id isn't in the "dismissed"
//     localStorage set, renders the pinned banner.
//   · Dismiss (✕) writes the id into the dismissed set so the same
//     broadcast never re-appears for this student on a future poll.
//   · If the broadcast carries a moduleNumber (+ optional topicId),
//     a "Open Module N" button deep-links students there with the
//     existing /module/N?topic=M query-param resume flow.
//
// Rendering rules:
//   · Does NOT render on /admin* pages (the teacher composing the
//     broadcast doesn't need to also see their own banner).
//   · Does NOT render during SSR — localStorage-gated + polls fire
//     only client-side.
//   · Positioned `fixed top-0` with `z-[95]` so it stays below
//     admin-overlay modals (z-100+) but above every normal page
//     surface, including the sticky Navbar. A `body { padding-top: }`
//     adjustment isn't necessary because the banner is transparent
//     when nothing is live and only 40-56px tall when a broadcast is
//     present — the sticky navbar's own shadow absorbs the overlap
//     visually.

interface Broadcast {
  id: number;
  message: string;
  moduleNumber: number | null;
  topicId: number | null;
  createdAt: string;
  expiresAt: string;
}

// LocalStorage key for dismissed broadcast ids. Shared across all
// courses the student might have — dismissal is per-student-device,
// not per-course.
const DISMISSED_KEY = "ifp105_dismissed_broadcasts";

function readDismissed(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is number => typeof x === "number"));
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    // Cap at the most recent 50 ids so the list can't grow forever.
    // Broadcast ids are monotonic (serial admin_actions.id), so
    // sorting descending + slicing gives us "the most recent 50".
    const arr = Array.from(ids).sort((a, b) => b - a).slice(0, 50);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
  } catch {}
}

export default function BroadcastBanner() {
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(() => readDismissed());
  // `suppressedByPath` gates the banner on routes where it would be
  // noise (any /admin* page). Checked at render-time against
  // window.location.pathname so we avoid pulling in next/navigation.
  const [suppressedByPath, setSuppressedByPath] = useState(false);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/broadcasts/latest", {
        // Always use a fresh check on a manual trigger (visibility
        // change, first mount). The CDN handles the 15s poll cadence
        // so "no-store" here isn't wasteful — the server response is
        // already cached.
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { broadcast: Broadcast | null };
      setBroadcast(data.broadcast);
    } catch {
      // Offline / network blip — leave current banner state alone
      // until the next poll tick.
    }
  }, []);

  // Path-aware suppression: admin pages + the broadcast compose
  // surface shouldn't show the banner (teacher doesn't need to see
  // their own broadcast).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const p = window.location.pathname;
      setSuppressedByPath(p.startsWith("/admin"));
    };
    check();
    // Re-check on every route change — Next's router doesn't fire a
    // DOM event for client-side nav, but `popstate` covers back/forward
    // and we also listen for a custom ping (below).
    window.addEventListener("popstate", check);
    return () => window.removeEventListener("popstate", check);
  }, []);

  // Initial fetch + 15s poll while visible + refetch on tab focus.
  useEffect(() => {
    fetchLatest();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchLatest();
    }, 15_000);
    const onVis = () => {
      if (document.visibilityState === "visible") fetchLatest();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchLatest]);

  // Client-side auto-expiry: if the broadcast's expiresAt falls
  // BEFORE the next poll fires, we'd otherwise keep showing it for
  // up to 15s past expiry. Set a one-shot timer to clear it early.
  useEffect(() => {
    if (!broadcast) return;
    const msUntilExpiry = Date.parse(broadcast.expiresAt) - Date.now();
    if (msUntilExpiry <= 0) {
      setBroadcast(null);
      return;
    }
    const timer = setTimeout(
      () => setBroadcast(null),
      // Cap at 15 min to avoid bizarre timer values on a 4-hour TTL.
      Math.min(msUntilExpiry, 15 * 60_000)
    );
    return () => clearTimeout(timer);
  }, [broadcast]);

  function dismiss() {
    if (!broadcast) return;
    const next = new Set(dismissed);
    next.add(broadcast.id);
    setDismissed(next);
    writeDismissed(next);
  }

  // Nothing to render if: admin page, no broadcast, or already
  // dismissed.
  const show =
    !suppressedByPath && broadcast && !dismissed.has(broadcast.id);

  // Compute the deep-link when the broadcast has a module target.
  const deepLink = broadcast?.moduleNumber
    ? broadcast.topicId
      ? `/module/${broadcast.moduleNumber}?topic=${broadcast.topicId}`
      : `/module/${broadcast.moduleNumber}`
    : null;
  const deepLinkLabel = broadcast?.moduleNumber
    ? broadcast.topicId
      ? `Open Module ${broadcast.moduleNumber} · Topic ${broadcast.topicId}`
      : `Open Module ${broadcast.moduleNumber}`
    : null;

  return (
    <AnimatePresence>
      {show && broadcast && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed left-0 right-0 top-0 z-[95]"
          style={{
            // Indigo→violet gradient matches the site's primary
            // accent but with enough saturation to read as "important
            // message from the teacher, not a generic promo bar."
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(139,92,246,0.95))",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 6px 24px rgba(99,102,241,0.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-start sm:items-center gap-3 flex-wrap">
            <span className="shrink-0 text-lg leading-none" aria-hidden="true">
              📣
            </span>
            <p className="flex-1 min-w-[180px] text-[13px] sm:text-sm text-white leading-relaxed font-medium">
              <span className="opacity-80 mr-1.5 text-[10px] font-bold uppercase tracking-wider">
                Teacher
              </span>
              {broadcast.message}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {deepLink && (
                <a
                  href={deepLink}
                  onClick={() => {
                    // Auto-dismiss once the student acts on the
                    // deep link — otherwise they'd land on the
                    // target page still seeing "go to this target"
                    // pinned at the top.
                    dismiss();
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-bold px-3 py-1.5 rounded-full text-indigo-700 bg-white hover:bg-zinc-100 active:scale-95 transition-all whitespace-nowrap"
                >
                  {deepLinkLabel} →
                </a>
              )}
              <button
                onClick={dismiss}
                aria-label="Dismiss teacher broadcast"
                className="shrink-0 w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
