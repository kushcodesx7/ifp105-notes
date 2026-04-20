"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Flashcards data (~42KB) lands in this lazy chunk, not in the main
// module bundle. ModulePage wraps this component in next/dynamic so the
// data only loads when a student actually scrolls into a topic.
import { getTsFlashcardDeck } from "@/lib/flashcards-lookup";
import { CURRENT_COURSE_SLUG } from "@/lib/course-registry";
import { flashcardStateKey } from "@/lib/storage-keys";

interface FlashcardData {
  front: string;
  back: string;
}

interface FlashcardsProps {
  // Legacy direct prop.
  cards?: FlashcardData[];
  // Preferred: let the component resolve its own cards from module+topic id.
  moduleNumber?: number;
  topicId?: number;
  title?: string;
  // Course slug — used by the DB override fetch. Defaults to the
  // current course (ICT today). Callers authoring a second course
  // can pass it explicitly.
  courseSlug?: string;
}

export default function Flashcards({
  cards: cardsProp,
  moduleNumber,
  topicId,
  title = "Quick Review Flashcards",
  courseSlug,
}: FlashcardsProps) {
  // Fallback deck — either supplied directly by the caller or resolved
  // from the bundled TS data keyed by (moduleNumber, topicId).
  const tsFallback =
    cardsProp ??
    (moduleNumber != null && topicId != null
      ? getTsFlashcardDeck(moduleNumber, topicId)
      : undefined);

  // DB override. Null = not fetched yet; empty array = fetched but
  // DB had nothing (→ fall back to TS). Non-empty = use DB cards.
  //
  // Fetching only fires when the caller didn't already pass `cards`
  // directly (that path is used by tests / legacy). Lets admin edits
  // to topics.flashcards_json propagate to the student without any
  // code change — empty DB keeps existing TS behavior identical.
  const [dbCards, setDbCards] = useState<FlashcardData[] | null>(null);
  const [dbFetched, setDbFetched] = useState(false);

  useEffect(() => {
    if (cardsProp) return; // caller is authoritative
    if (moduleNumber == null || topicId == null) return;
    let alive = true;
    const slug = courseSlug ?? CURRENT_COURSE_SLUG;

    // Fetch flashcards from the DB-override endpoint. Called on mount,
    // every 15s thereafter, and on every tab/window focus — so an
    // admin deleting a card in the studio propagates to every open
    // student tab within at most 15s (or instantly on tab focus) WITHOUT
    // the student needing to refresh. Cache is set to "no-store" so the
    // browser + CDN can't serve a stale copy.
    async function load() {
      try {
        const r = await fetch(
          `/api/public/flashcards/${moduleNumber}/${topicId}?course=${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );
        const json: { cards: FlashcardData[] | null } = r.ok
          ? await r.json()
          : { cards: null };
        if (!alive) return;
        setDbCards(json.cards);
        setDbFetched(true);
      } catch {
        if (!alive) return;
        // Network failure → leave the last-known cards in place;
        // next tick will retry. Don't wipe dbCards to null mid-session
        // just because the server blipped.
        setDbFetched(true);
      }
    }

    load();

    // Poll every 15s. Short enough that a teacher deleting cards live
    // in class sees students' decks converge fast; long enough that
    // 200 tabs open on Monday morning don't hammer the endpoint
    // (+ the 30s CDN cache absorbs most of it anyway).
    const tick = setInterval(load, 15_000);

    // Refetch the instant the student switches back to this tab —
    // common pattern: teacher edits in one tab, flips to the student
    // projector tab, and expects to see the change immediately.
    const onFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      load();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onFocus);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onFocus);
    }

    return () => {
      alive = false;
      clearInterval(tick);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onFocus);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onFocus);
      }
    };
  }, [cardsProp, moduleNumber, topicId, courseSlug]);

  // Final card list:
  //   - DB cards if the fetch returned any
  //   - otherwise TS fallback
  //   - if caller passed `cards` directly, those always win
  const resolved = cardsProp ?? (dbCards && dbCards.length > 0 ? dbCards : tsFallback);

  // Persist the per-topic deck session so a refresh keeps the student
  // on the card they were on with their "known" set intact. Key is
  // (course, module, topic). State is read once at mount via the lazy
  // useState initializer; subsequent saves happen in the effect below.
  const lsKey =
    moduleNumber != null && topicId != null
      ? flashcardStateKey(courseSlug ?? CURRENT_COURSE_SLUG, moduleNumber, topicId)
      : null;

  // Spaced-repetition window — cards marked "known" more than this many
  // days ago resurface as a refresher. Per cognitive-load research, 3 days
  // is a sweet spot for low-effort retention review (Ebbinghaus +
  // SuperMemo's first interval). Tunable; longer = more retention but more
  // forgetting between exposures.
  const REFRESHER_AFTER_DAYS = 3;

  function loadInitial(): {
    current: number;
    known: number[];
    knownAt: Record<number, number>;
    refreshedCount: number;
  } {
    if (typeof window === "undefined" || !lsKey) {
      return { current: 0, known: [], knownAt: {}, refreshedCount: 0 };
    }
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) return { current: 0, known: [], knownAt: {}, refreshedCount: 0 };
      const parsed = JSON.parse(raw) as {
        current?: number;
        known?: number[];
        knownAt?: Record<number, number>;
      };
      const allKnown = Array.isArray(parsed.known) ? parsed.known : [];
      const knownAt: Record<number, number> =
        parsed.knownAt && typeof parsed.knownAt === "object"
          ? parsed.knownAt
          : {};
      // Spaced-repetition: any card marked >REFRESHER_AFTER_DAYS ago
      // gets popped back out of the known set so it shows up again
      // for review. Carries its old timestamp away too — next time
      // it's marked known, that's a fresh interval.
      const cutoff = Date.now() - REFRESHER_AFTER_DAYS * 86_400_000;
      const survivors: number[] = [];
      const refreshedKnownAt: Record<number, number> = {};
      let refreshedCount = 0;
      for (const idx of allKnown) {
        const ts = knownAt[idx];
        if (ts && ts >= cutoff) {
          survivors.push(idx);
          refreshedKnownAt[idx] = ts;
        } else {
          // Fell out of the spaced-repetition window — surface again.
          refreshedCount += 1;
        }
      }
      return {
        current: typeof parsed.current === "number" ? parsed.current : 0,
        known: survivors,
        knownAt: refreshedKnownAt,
        refreshedCount,
      };
    } catch {
      return { current: 0, known: [], knownAt: {}, refreshedCount: 0 };
    }
  }

  const initial = useState(loadInitial)[0];
  const [current, setCurrent] = useState(initial.current);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set(initial.known));
  // Per-card knownAt timestamp (epoch ms). Driven by markKnown();
  // persisted alongside the known set so spaced-repetition survives
  // tab close.
  const [knownAt, setKnownAt] = useState<Record<number, number>>(
    initial.knownAt
  );
  // Banner state — non-zero when cards just resurfaced from the
  // spaced-repetition cutoff. Cleared after the student dismisses.
  const [refresherCount, setRefresherCount] = useState<number>(
    initial.refreshedCount
  );

  // Topic switched → reload the saved state for the new (module, topic)
  // pair. Re-runs the same spaced-repetition cutoff logic as the
  // initial loader so a student returning across days picks up
  // refresher cards consistently.
  useEffect(() => {
    if (!lsKey || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          current?: number;
          known?: number[];
          knownAt?: Record<number, number>;
        };
        const allKnown = Array.isArray(parsed.known) ? parsed.known : [];
        const ka: Record<number, number> =
          parsed.knownAt && typeof parsed.knownAt === "object"
            ? parsed.knownAt
            : {};
        const cutoff = Date.now() - REFRESHER_AFTER_DAYS * 86_400_000;
        const survivors: number[] = [];
        const survivorAt: Record<number, number> = {};
        let resurfaced = 0;
        for (const idx of allKnown) {
          if (ka[idx] && ka[idx] >= cutoff) {
            survivors.push(idx);
            survivorAt[idx] = ka[idx];
          } else {
            resurfaced += 1;
          }
        }
        setCurrent(typeof parsed.current === "number" ? parsed.current : 0);
        setKnown(new Set(survivors));
        setKnownAt(survivorAt);
        setRefresherCount(resurfaced);
      } else {
        setCurrent(0);
        setKnown(new Set());
        setKnownAt({});
        setRefresherCount(0);
      }
      setFlipped(false);
    } catch {
      setCurrent(0);
      setKnown(new Set());
      setKnownAt({});
      setRefresherCount(0);
      setFlipped(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleNumber, topicId]);

  // Save on every state change. Debounce isn't needed — the UI fires
  // at most one update per click, and localStorage writes are cheap.
  useEffect(() => {
    if (!lsKey || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        lsKey,
        JSON.stringify({ current, known: [...known], knownAt })
      );
    } catch {}
  }, [lsKey, current, known, knownAt]);

  // Card count changed (DB override landed, or admin edited cards)
  // but the topic is the same — keep the student's progress and just
  // clamp indices into the new range. Known cards that were deleted
  // silently fall off; survivors keep their "known" flag.
  const resolvedLen = resolved?.length ?? 0;
  useEffect(() => {
    if (resolvedLen === 0) return;
    setKnown((prev) => new Set([...prev].filter((i) => i < resolvedLen)));
    setCurrent((c) => Math.min(c, resolvedLen - 1));
    // Flipped state is meaningless if the underlying card changed —
    // safest to unflip.
    setFlipped(false);
  }, [resolvedLen]);

  // While the DB fetch is in flight AND we have no TS fallback to show
  // meanwhile, render nothing (avoids a flash of the TS deck that then
  // gets swapped for DB cards). If we have a TS fallback, show it
  // immediately — the DB override lands as soon as it arrives.
  if (!dbFetched && !tsFallback && !cardsProp) return null;
  if (!resolved || resolved.length === 0) return null;
  const cards = resolved;

  // Clamp the current-card index inline. The useEffect above ALSO
  // clamps `current`, but effects run AFTER render, so on the first
  // render following a deck shrink (admin deleted cards, or DB
  // override landed with fewer cards than the TS fallback) `current`
  // could still point past the end — and `cards[current].front`
  // throws "Cannot read properties of undefined (reading 'front')".
  // Production bug seen Apr 20 during live class: saved current=6
  // on a deck that's now 4 long. Defensive clamp here avoids the
  // error-boundary fallback while the effect catches up on the
  // next render.
  const safeIdx = Math.min(Math.max(0, current), cards.length - 1);
  const card = cards[safeIdx];
  if (!card) return null;

  function flip() { setFlipped(!flipped); }

  function next(didKnow: boolean) {
    const newKnown = didKnow ? new Set([...known, current]) : known;
    if (didKnow) {
      setKnown(newKnown);
      // Stamp the timestamp so the spaced-repetition cutoff knows
      // when to resurface this card. "Still learning" doesn't get a
      // timestamp — it stays in the active rotation until known.
      setKnownAt((prev) => ({ ...prev, [current]: Date.now() }));
    }
    setFlipped(false);

    // If all cards known, show completion
    if (newKnown.size >= cards.length) {
      return;
    }

    setTimeout(() => {
      // Find next unreviewed card
      let nextIdx = (current + 1) % cards.length;
      let attempts = 0;
      while (newKnown.has(nextIdx) && attempts < cards.length) {
        nextIdx = (nextIdx + 1) % cards.length;
        attempts++;
      }
      setCurrent(nextIdx);
    }, 150);
  }

  function reset() {
    setKnown(new Set());
    setKnownAt({});
    setCurrent(0);
    setFlipped(false);
  }

  const allDone = known.size === cards.length;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🃏</span>
        <h3 className="text-sm font-bold text-zinc-300">{title}</h3>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
          {known.size}/{cards.length} known
        </span>
      </div>

      {/* Spaced-repetition refresher banner — surfaces when one or
          more "known" cards aged past REFRESHER_AFTER_DAYS and were
          popped back into the active rotation. The student sees this
          on first interaction with the deck per session, then it
          dismisses on click. Pure client-side; no DB needed. */}
      {refresherCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-xl px-3 py-2 flex items-center gap-2 text-[12px]"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(249,115,22,0.06))",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <span aria-hidden="true">🔄</span>
          <span className="text-amber-200 font-medium flex-1">
            <strong className="text-amber-100">{refresherCount}</strong>{" "}
            card{refresherCount === 1 ? "" : "s"} back for refresher (last
            seen 3+ days ago)
          </span>
          <button
            onClick={() => setRefresherCount(0)}
            className="text-[10px] font-medium text-amber-300/70 hover:text-amber-200 px-1.5 py-0.5 rounded hover:bg-amber-500/10 transition-colors"
            aria-label="Dismiss refresher notice"
          >
            ✕
          </button>
        </motion.div>
      )}

      {allDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 rounded-2xl card-glass"
        >
          <div className="text-4xl mb-3">🎉</div>
          <h4 className="text-lg font-bold text-zinc-200 mb-1">All cards reviewed!</h4>
          <p className="text-sm text-zinc-500 mb-5">You knew all {cards.length} cards.</p>
          <button onClick={reset}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white focus-glow"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Shuffle &amp; Restart
          </button>
        </motion.div>
      ) : (
        <>
          {/* Card */}
          <div
            className="relative cursor-pointer select-none"
            onClick={flip}
            style={{ perspective: "1000px", minHeight: "200px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                style={{
                  minHeight: "200px",
                  background: flipped
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))'
                    : '#151518',
                  border: `1px solid ${flipped ? 'rgba(99,102,241,0.2)' : '#2a2a33'}`,
                }}
              >
                <div className="text-[9px] font-bold tracking-widest uppercase mb-3"
                  style={{ color: flipped ? '#818CF8' : '#71717a' }}>
                  {flipped ? "Answer" : "Question"} · {safeIdx + 1}/{cards.length}
                </div>
                <div className={`text-base font-semibold leading-relaxed max-w-md ${
                  flipped ? 'text-indigo-200' : 'text-zinc-200'
                }`}>
                  {flipped ? card.back : card.front}
                </div>
                <div className="text-[10px] text-zinc-600 mt-4">
                  {flipped ? "" : "Tap to reveal answer"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mt-3"
            >
              <button
                onClick={() => next(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                ❌ Still learning
              </button>
              <button
                onClick={() => next(true)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
              >
                ✅ Got it!
              </button>
            </motion.div>
          )}

          {/* Progress dots */}
          <div className="flex gap-1 justify-center mt-4">
            {cards.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: known.has(i) ? '#22c55e' : i === current ? '#6366F1' : '#2a2a33',
                  boxShadow: i === current ? '0 0 6px rgba(99,102,241,0.4)' : 'none',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
