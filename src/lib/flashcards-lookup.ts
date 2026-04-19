// Single source of truth for looking up bundled (TS-defined) flashcard
// decks. Replaces the duplicated `flashcardData[moduleNumber]?.[topicId]`
// pattern that lived in 3+ files (api routes + Flashcards component).
//
// Centralising this matters because:
//   1. The shape of `flashcardData` is an implementation detail that
//      may change (per-course namespacing, lazy-load chunks, etc).
//   2. Future courses won't have a TS file — the helper returns []
//      gracefully instead of every caller threading null-checks.
//   3. Test fakes / Storybook stubs only need to mock one helper.

import { flashcardData, type Flashcard } from "@/data/flashcards";

/**
 * Resolve the TS-bundled flashcard deck for a (moduleNumber, topicNumber)
 * pair. Returns an empty array when no deck exists at that key. The
 * helper is sync because the data is statically imported — callers in
 * server routes that prefer dynamic import for bundle splitting can
 * still do `await import("@/data/flashcards")` directly.
 */
export function getTsFlashcardDeck(
  moduleNumber: number,
  topicNumber: number
): Flashcard[] {
  return flashcardData[moduleNumber]?.[topicNumber] ?? [];
}

/**
 * All TS decks for a module, keyed by topic number. Useful for
 * batch-migrate or admin overviews. Returns {} when the module has no
 * decks.
 */
export function getTsFlashcardModule(
  moduleNumber: number
): Record<number, Flashcard[]> {
  return flashcardData[moduleNumber] ?? {};
}
