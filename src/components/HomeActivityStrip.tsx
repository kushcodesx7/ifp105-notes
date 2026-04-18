"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sizedAvatar } from "@/lib/avatar";

interface ActivityEvent {
  id: string;
  type: "completed" | "joined";
  who: string;
  section: string;
  photoUrl: string | null;
  moduleNumber?: number;
  moduleName?: string;
  topicId?: number;
  at: string;
}

// Section accent palette — same as connect page
const SECTION_DOT: Record<string, string> = {
  "Section 1": "#6366F1",
  "Section 2": "#10B981",
  "Section 3": "#3B82F6",
  "Section 4": "#06B6D4",
  "Section 5": "#8B5CF6",
  "Section 6": "#F59E0B",
};

function sectionColor(s: string): string {
  return SECTION_DOT[s] || "#71717a";
}

function prettyName(raw: string): string {
  if (!raw) return "Someone";
  const parts = raw.split("_").filter(Boolean);
  const nameParts = parts.filter((p) => !/^\d+$/.test(p) && !/^IFS\d*$/i.test(p));
  return nameParts.length > 0 ? nameParts[0] : raw;
}

function initials(name: string): string {
  const pretty = prettyName(name);
  return pretty
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!then || Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 30) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HomeActivityStrip() {
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const [pulseNew, setPulseNew] = useState(false);

  // Fetch + auto-refresh every 60s (no subscription, no websocket)
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/connect/activity");
        if (!r.ok) return;
        const data = await r.json();
        if (!alive) return;
        const next: ActivityEvent[] = data.events || [];

        // Detect genuinely new events to trigger a pulse animation
        const prev = prevIdsRef.current;
        const hasNew = next.some((e) => !prev.has(e.id));
        if (hasNew && prev.size > 0) {
          setPulseNew(true);
          setTimeout(() => setPulseNew(false), 1500);
        }
        prevIdsRef.current = new Set(next.map((e) => e.id));
        setEvents(next);
      } catch {}
    }
    load();
    const tick = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(tick);
    };
  }, []);

  // Rotate the visible event every 4s (only if >1 events)
  useEffect(() => {
    if (!events || events.length <= 1) return;
    const tick = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % events.length);
    }, 4000);
    return () => clearInterval(tick);
  }, [events]);

  // Re-render every 30s so "3m ago" ticks forward. Using a dedicated
  // state so we don't rebuild the whole events array (which would cause
  // parent components to see a new reference and re-render too).
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (events === null) {
    // Skeleton shim — same footprint so no layout shift
    return (
      <div className="h-8 mb-4 px-3 rounded-full animate-pulse"
        style={{ background: "rgba(255,255,255,0.03)" }}
      />
    );
  }
  if (events.length === 0) return null;

  const evt = events[currentIdx % events.length];
  const col = sectionColor(evt.section);

  const message =
    evt.type === "completed"
      ? `finished ${evt.moduleName ? `Module ${evt.moduleNumber}` : ""}`
      : `joined IFS Connect`;

  return (
    <div
      className="mb-4 h-9 px-3 rounded-full overflow-hidden relative inline-flex items-center gap-2.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${pulseNew ? col + "80" : "rgba(255,255,255,0.06)"}`,
        boxShadow: pulseNew ? `0 0 16px ${col}40` : "none",
        transition: "box-shadow 0.6s, border-color 0.6s",
      }}
    >
      {/* Tiny live dot */}
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: col, boxShadow: `0 0 6px ${col}` }}
      />

      {/* Rotating event */}
      <AnimatePresence mode="wait">
        <motion.div
          key={evt.id}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2 min-w-0"
        >
          {evt.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sizedAvatar(evt.photoUrl, 40)}
              alt={prettyName(evt.who)}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ background: col }}
            >
              {initials(evt.who)}
            </span>
          )}
          <span className="text-[11px] text-zinc-300 truncate">
            <span className="font-semibold text-white">{prettyName(evt.who)}</span>{" "}
            <span className="text-zinc-500">{message}</span>
          </span>
          <span className="text-[10px] text-zinc-600 shrink-0">{timeAgo(evt.at)}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
