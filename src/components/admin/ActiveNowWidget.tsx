"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminFetch } from "@/lib/useAdminFetch";

// "Live now" widget for the admin home page.
//
// Polls /api/admin/active-now every 20s and renders the students whose
// last_active_at is within the last 10 minutes. Each row shows a green
// pulse, the student's name + section, and a relative timestamp ("now",
// "2m"). Hidden-section (test) accounts get an amber HIDDEN badge so
// the teacher can spot their own test session in the list.
//
// 20s poll is the sweet spot: the session-ping fires on every module
// page mount + every "Mark as done", so a student doing real work
// shows up within ~20s of their first interaction. Faster polling
// would generate noise; slower would feel laggy when the teacher's
// staring at the screen waiting to see "did my student start yet?".

interface ActiveStudent {
  email: string;
  name: string;
  section: string | null;
  hidden: boolean;
  lastActiveAt: string;
  ageSec: number;
  photoUrl: string | null;
  currentPath?: string | null;
}

interface PathDistributionEntry {
  path: string;
  label: string;
  count: number;
}

interface Response {
  windowMin: number;
  items: ActiveStudent[];
  distribution?: PathDistributionEntry[];
}

const POLL_INTERVAL_MS = 20_000;

interface Props {
  idToken: string | null;
  password: string;
}

export default function ActiveNowWidget({ idToken, password }: Props) {
  const credential = idToken ? { idToken } : password;
  const { data, isLoading, mutate } = useAdminFetch<Response>(
    "/api/admin/active-now?windowMin=10",
    credential
  );

  // Heartbeat that keeps the relative-time labels fresh between polls.
  // Updates every 10s — fast enough that "just now" graduates to "10s
  // ago" promptly, slow enough that we're not re-rendering 20 cards
  // every second. Previously this was a 1s tick that fired re-renders
  // but never actually updated the displayed labels (those were
  // computed from the server-snapshotted ageSec, not the live clock).
  const [nowMs, setNowMs] = useState<number>(() =>
    typeof window === "undefined" ? 0 : Date.now()
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setInterval(() => setNowMs(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  // Auto-refetch every 20s so the list stays fresh.
  useEffect(() => {
    const t = setInterval(() => mutate(), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [mutate]);

  const items = data?.items || [];
  const liveItems = items; // already filtered server-side

  // ─── "Class is waking up" notification ─────────────────────────
  // When the active count crosses thresholds (5, 10, 20+) UPWARD
  // between polls, fire a one-shot toast / banner. Tells the teacher
  // class is in session without them having to watch the widget.
  // Hidden-section students are excluded from the count so the
  // teacher's own test session doesn't trigger the alert.
  const realActiveCount = liveItems.filter((s) => !s.hidden).length;
  const prevCountRef = useRef<number>(0);
  const [classAlert, setClassAlert] = useState<{
    threshold: number;
    seenAt: number;
  } | null>(null);

  useEffect(() => {
    const prev = prevCountRef.current;
    const curr = realActiveCount;
    // Only fire when crossing UPWARD past a threshold. Thresholds are
    // 5, 10, 20 — picked to match meaningful classroom moments
    // (small group, full session, packed lab).
    const thresholds = [5, 10, 20];
    for (const t of thresholds) {
      if (prev < t && curr >= t) {
        setClassAlert({ threshold: t, seenAt: Date.now() });
        break; // one alert per render even if we crossed multiple
      }
    }
    prevCountRef.current = curr;
  }, [realActiveCount]);

  // Auto-dismiss the alert after 8s.
  useEffect(() => {
    if (!classAlert) return;
    const t = setTimeout(() => setClassAlert(null), 8000);
    return () => clearTimeout(t);
  }, [classAlert]);

  return (
    <>
      {/* Class-waking-up banner — fires when the live count crosses a
          threshold upward. Auto-dismisses after 8s. Pinned just above
          the widget so it's visually contiguous with the activity it
          describes. */}
      <AnimatePresence>
        {classAlert && (
          <motion.div
            key={`alert-${classAlert.threshold}-${classAlert.seenAt}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="mb-3 rounded-2xl px-5 py-3 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(34,197,94,0.10))",
              border: "1px solid rgba(16,185,129,0.35)",
              boxShadow: "0 0 24px rgba(16,185,129,0.15)",
            }}
          >
            <span className="text-xl" aria-hidden="true">
              📈
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-emerald-200">
                {classAlert.threshold === 5
                  ? "Class is waking up — 5 students active"
                  : classAlert.threshold === 10
                    ? "Class is in session — 10 students active"
                    : "Packed house — 20+ students active"}
              </div>
              <div className="text-[11px] text-emerald-300/70 mt-0.5">
                Live now in the last 10 min · {realActiveCount} active right
                now
              </div>
            </div>
            <button
              onClick={() => setClassAlert(null)}
              className="text-[11px] font-medium text-emerald-300/70 hover:text-emerald-200 px-2 py-1 rounded-md hover:bg-emerald-500/10 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
      className="mb-8 rounded-2xl p-5 card-glass"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
            Live now
          </h2>
          <span className="text-[11px] font-semibold text-emerald-400">
            {liveItems.length} active
          </span>
        </div>
        <span className="text-[10px] text-zinc-600">
          last 10 min · refreshes every 20s
        </span>
      </div>

      {/* Live class digest — shows where active students are right now,
          grouped by friendly path label (Module N / Connect / Home).
          Tiny horizontal bar chart so the teacher can see at a glance
          "everyone's on Module 3" without reading the student list.
          Only renders when the server returned distribution data
          (post-SQL-migration) AND there's at least one entry. */}
      {data?.distribution && data.distribution.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2">
            Where they are
          </div>
          <div className="space-y-1.5">
            {data.distribution.slice(0, 6).map((entry) => {
              const max = Math.max(
                1,
                ...data.distribution!.slice(0, 6).map((e) => e.count)
              );
              const widthPct = Math.max(8, (entry.count / max) * 100);
              return (
                <div
                  key={entry.path}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <span className="text-zinc-400 font-medium shrink-0 w-24 truncate">
                    {entry.label}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #6366F1, #8B5CF6)",
                      }}
                    />
                  </div>
                  <span className="text-zinc-300 font-bold tabular-nums shrink-0 w-6 text-right">
                    {entry.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && !data && (
        <div className="flex items-center justify-center py-6 text-[12px] text-zinc-500">
          Loading…
        </div>
      )}

      {!isLoading && liveItems.length === 0 && (
        <div className="text-center py-6">
          <div className="text-2xl mb-2">💤</div>
          <p className="text-[12px] text-zinc-500">
            Nobody&apos;s active right now. The widget refreshes every 20s.
          </p>
        </div>
      )}

      {liveItems.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <AnimatePresence initial={false}>
            {liveItems.map((s) => (
              <motion.div
                key={s.email}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.04)",
                  border: "1px solid rgba(16,185,129,0.12)",
                }}
              >
                <Avatar
                  name={s.name}
                  photoUrl={s.photoUrl}
                  ageSec={liveAgeSec(s.lastActiveAt, nowMs)}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                    {s.name}
                    {s.hidden && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold tracking-wider">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {s.section || "no section"} ·{" "}
                    <span className="text-emerald-400 font-medium">
                      {formatAge(liveAgeSec(s.lastActiveAt, nowMs))}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/people?focus=${encodeURIComponent(s.email)}`}
                  className="shrink-0 text-[10px] font-semibold text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.06] transition-colors"
                  title="Open this student in /admin/people"
                >
                  →
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
    </>
  );
}

function Avatar({
  name,
  photoUrl,
  ageSec,
}: {
  name: string;
  photoUrl: string | null;
  ageSec: number;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  // Ring intensity reflects recency — sharp green for "now", muted for
  // older entries within the 10-min window. Pure cosmetic.
  const isFresh = ageSec < 60;

  return (
    <div className="relative shrink-0">
      <div
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold text-white"
        style={{
          background: photoUrl
            ? "transparent"
            : "linear-gradient(135deg, #10B981, #059669)",
          border: `2px solid ${
            isFresh ? "rgba(16,185,129,0.7)" : "rgba(16,185,129,0.25)"
          }`,
          boxShadow: isFresh ? "0 0 12px rgba(16,185,129,0.4)" : "none",
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          initials || "?"
        )}
      </div>
    </div>
  );
}

function formatAge(sec: number): string {
  if (sec < 30) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min === 1) return "1m ago";
  return `${min}m ago`;
}

// Compute age against the React-state-tracked `nowMs` so the displayed
// label updates every 10s (the heartbeat above) instead of being frozen
// to whatever the server snapshotted at fetch time.
function liveAgeSec(lastActiveAt: string, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - new Date(lastActiveAt).getTime()) / 1000));
}
