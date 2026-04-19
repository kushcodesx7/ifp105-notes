"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { progressKey, quizStateKey } from "@/lib/storage-keys";

// Centralised hook for everything that touches a student's per-module
// progress: localStorage cache, Supabase sync, silent-fail recovery,
// admin-reset detection, and the re-auth flag.
//
// Pulled out of ModulePage because the file had grown to 1000+ lines
// and the progress logic was the most tangled chunk — a single bug in
// the sync (e.g. PR #119) had to thread through 5 useEffects mixed
// in with confetti / scroll / keyboard handlers.
//
// Owns:
//   - `done: Set<number>`         (which topics are complete)
//   - `needsReauth: boolean`      (token missing → can't save)
//   - localStorage I/O (load on mount, save on change)
//   - Remote load (mount + tab-focus) with:
//       - silent-fail recovery (push local up to server when first sync
//         finds an empty server but localStorage has progress)
//       - admin-reset detection (empty server AFTER successful sync →
//         purge per-topic quiz state via the onReset callback)
//   - Remote save (`saveToSupabase`, `addDone`)
//
// Does NOT own:
//   - showLoginPrompt / confetti / scroll / MCQ state — UI concerns
//     stay in ModulePage. The hook fires an `onAuthRequired` callback
//     when save needs auth but the token is missing; ModulePage uses
//     that to surface the LoginPrompt.

export type BloomStats = Partial<
  Record<string, { correct: number; total: number }>
>;
export type ConfidenceStats = {
  rated: number;
  confidentWrong: number;
  humbleRight: number;
};

interface SaveData {
  topicId: number;
  completed?: boolean;
  mcqScore?: number;
  mcqTotal?: number;
  challengeAttempted?: boolean;
  bloomStats?: BloomStats;
  confidenceStats?: ConfidenceStats;
}

interface Options {
  courseSlug: string;
  moduleNumber: number;
  /** Called when the remote loader detects an admin reset (server empty
   *  AFTER a previous successful sync). Use this to clear per-topic
   *  state the hook doesn't own — currently MCQ answer counts. */
  onAdminResetDetected?: () => void;
  /** Called when a save was attempted but no auth token was available.
   *  ModulePage uses this to pop the LoginPrompt. The hook also flips
   *  needsReauth to true regardless of whether this callback is set. */
  onAuthRequired?: () => void;
}

export interface StudentProgressApi {
  done: Set<number>;
  needsReauth: boolean;
  setNeedsReauth: (v: boolean) => void;
  /** Add a topic to the local done set AND save to Supabase. */
  addDone: (topicId: number) => void;
  /** Save quiz outcome for a topic. Doesn't touch `done` (the student
   *  marks done separately by clicking the button). */
  recordQuiz: (
    topicId: number,
    score: number,
    total: number,
    bloomStats?: BloomStats,
    confidenceStats?: ConfidenceStats
  ) => void;
  /** Low-level save passthrough. Prefer addDone / recordQuiz. */
  saveToSupabase: (data: SaveData) => void;
}

export function useStudentProgress({
  courseSlug,
  moduleNumber,
  onAdminResetDetected,
  onAuthRequired,
}: Options): StudentProgressApi {
  const { user, isLoggedIn, getIdToken } = useAuth();
  const LS_KEY = progressKey(courseSlug, moduleNumber);

  // `done` initialised from localStorage in the lazy useState so we
  // don't need a separate "load on mount" effect.
  const [done, setDone] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (!saved) return new Set();
      const parsed = JSON.parse(saved) as number[];
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch {
      return new Set();
    }
  });

  const [needsReauth, setNeedsReauth] = useState(false);
  // Tracks whether we've successfully loaded from Supabase at least
  // once this session. Drives silent-fail-recovery vs admin-reset
  // detection (see loadProgress below).
  const supabaseLoaded = useRef(false);

  // Persist `done` to localStorage on every change, including empty.
  // Empty is meaningful: it's the "admin reset cleared everything"
  // state and we don't want the stale "[1,2,3]" blob to outlive it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (done.size > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify([...done]));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [done, LS_KEY]);

  // ── saveToSupabase: low-level save ──────────────────────────────
  const saveToSupabase = useCallback(
    (data: SaveData) => {
      if (!isLoggedIn || !user) return;
      const token = getIdToken();
      // No token this session → user object was restored from
      // localStorage but the in-memory token is gone (tokens are
      // never persisted). Flip the banner state so the student knows
      // saves aren't reaching the server, and let ModulePage decide
      // whether to also pop the LoginPrompt.
      if (!token) {
        setNeedsReauth(true);
        onAuthRequired?.();
        return;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-id-token": token,
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          moduleNumber,
          courseSlug,
          ...data,
        }),
        signal: controller.signal,
      })
        .catch(() => {})
        .finally(() => clearTimeout(timeout));
    },
    [isLoggedIn, user, getIdToken, moduleNumber, courseSlug, onAuthRequired]
  );

  // ── Remote load (mount + tab focus) with recovery logic ─────────
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    async function loadProgress() {
      try {
        const token = getIdToken();
        if (!token) return;
        const res = await fetch(
          `/api/progress?email=${encodeURIComponent(user!.email)}&module=${moduleNumber}&course=${encodeURIComponent(courseSlug)}`,
          {
            headers: { "x-id-token": token },
            // Skip caches so a stale empty doesn't pin a just-reset
            // student into a still-done state.
            cache: "no-store",
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const wasFirstLoad = !supabaseLoaded.current;
        supabaseLoaded.current = true;

        const remoteProgress = (data.progress ?? {}) as Record<
          number,
          { completed: boolean; mcqScore: number | null; mcqTotal: number | null }
        >;
        const remoteCount = Object.keys(remoteProgress).length;

        const remoteDone = new Set<number>();
        for (const [topicIdStr, tp] of Object.entries(remoteProgress)) {
          if (tp.completed) remoteDone.add(Number(topicIdStr));
        }

        // ──── Silent-fail recovery ────
        // First sync this session + empty server + localStorage has
        // progress → almost certainly the saveToSupabase silent-fail
        // bug (#118). Push local UP instead of wiping. Read from
        // localStorage directly to dodge any state-timing surprise.
        let localDoneFromLs = new Set<number>();
        try {
          const saved = localStorage.getItem(LS_KEY);
          if (saved) {
            const parsed = JSON.parse(saved) as number[];
            if (Array.isArray(parsed)) localDoneFromLs = new Set(parsed);
          }
        } catch {}
        const isLikelySilentFailRecovery =
          wasFirstLoad && remoteCount === 0 && localDoneFromLs.size > 0;

        if (isLikelySilentFailRecovery) {
          for (const topicId of localDoneFromLs) {
            saveToSupabase({ topicId, completed: true });
          }
          // Make sure React state reflects what's in localStorage.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDone(localDoneFromLs);
          return;
        }

        // Normal path: server is the source of truth.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDone(remoteDone);

        // Empty AFTER a previous successful sync → real admin reset.
        // Purge per-topic quiz state and let the parent clear its
        // own MCQ counters via the callback.
        if (remoteCount === 0 && !wasFirstLoad) {
          try {
            const quizPrefix = quizStateKey(
              courseSlug,
              moduleNumber,
              0
            ).replace(/0$/, "");
            const keysToClear: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(quizPrefix)) keysToClear.push(key);
            }
            keysToClear.forEach((k) => localStorage.removeItem(k));
          } catch {}
          onAdminResetDetected?.();
        }
      } catch {}
    }

    loadProgress();

    // Auto-sync when the tab regains focus.
    const onFocus = () => {
      if (document.visibilityState === "visible") loadProgress();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
    // saveToSupabase + onAdminResetDetected intentionally omitted —
    // their identities change every render, including them would
    // refire this loader (and clobber state) on every parent update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user, moduleNumber, courseSlug, getIdToken, LS_KEY]);

  // ── High-level helpers exposed to callers ───────────────────────
  const addDone = useCallback(
    (topicId: number) => {
      setDone((prev) => new Set([...prev, topicId]));
      if (isLoggedIn) saveToSupabase({ topicId, completed: true });
    },
    [isLoggedIn, saveToSupabase]
  );

  const recordQuiz = useCallback(
    (
      topicId: number,
      score: number,
      total: number,
      bloomStats?: BloomStats,
      confidenceStats?: ConfidenceStats
    ) => {
      if (!isLoggedIn) return; // not logged in → no remote save (UI handles prompt)
      saveToSupabase({
        topicId,
        mcqScore: score,
        mcqTotal: total,
        bloomStats,
        confidenceStats,
      });
    },
    [isLoggedIn, saveToSupabase]
  );

  return {
    done,
    needsReauth,
    setNeedsReauth,
    addDone,
    recordQuiz,
    saveToSupabase,
  };
}
