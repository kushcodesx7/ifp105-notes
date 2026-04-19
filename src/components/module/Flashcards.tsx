"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Flashcards data (~42KB) lands in this lazy chunk, not in the main
// module bundle. ModulePage wraps this component in next/dynamic so the
// data only loads when a student actually scrolls into a topic.
import { flashcardData } from "@/data/flashcards";
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
      ? flashcardData[moduleNumber]?.[topicId]
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
    fetch(
      `/api/public/flashcards/${moduleNumber}/${topicId}?course=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    )
      .then((r) => (r.ok ? r.json() : { cards: null }))
      .then((json: { cards: FlashcardData[] | null }) => {
        if (!alive) return;
        setDbCards(json.cards);
        setDbFetched(true);
      })
      .catch(() => {
        if (!alive) return;
        // On network error, fall through silently to TS fallback.
        setDbCards(null);
        setDbFetched(true);
      });
    return () => {
      alive = false;
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

  function loadInitial(): { current: number; known: number[] } {
    if (typeof window === "undefined" || !lsKey) {
      return { current: 0, known: [] };
    }
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) return { current: 0, known: [] };
      const parsed = JSON.parse(raw) as {
        current?: number;
        known?: number[];
      };
      return {
        current: typeof parsed.current === "number" ? parsed.current : 0,
        known: Array.isArray(parsed.known) ? parsed.known : [],
      };
    } catch {
      return { current: 0, known: [] };
    }
  }

  const initial = useState(loadInitial)[0];
  const [current, setCurrent] = useState(initial.current);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set(initial.known));

  // Topic switched → reload the saved state for the new (module, topic)
  // pair. We don't wipe — a student returning to a topic they reviewed
  // last week should still see their "known" marks. The clamp effect
  // below handles the case where the deck changed since last visit.
  useEffect(() => {
    if (!lsKey || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { current?: number; known?: number[] };
        setCurrent(typeof parsed.current === "number" ? parsed.current : 0);
        setKnown(new Set(Array.isArray(parsed.known) ? parsed.known : []));
      } else {
        setCurrent(0);
        setKnown(new Set());
      }
      setFlipped(false);
    } catch {
      setCurrent(0);
      setKnown(new Set());
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
        JSON.stringify({ current, known: [...known] })
      );
    } catch {}
  }, [lsKey, current, known]);

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

  const card = cards[current];

  function flip() { setFlipped(!flipped); }

  function next(didKnow: boolean) {
    const newKnown = didKnow ? new Set([...known, current]) : known;
    if (didKnow) setKnown(newKnown);
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
                  {flipped ? "Answer" : "Question"} · {current + 1}/{cards.length}
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
