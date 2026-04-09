export interface Flashcard {
  front: string;
  back: string;
}

// Placeholder — will be populated by agent
export const flashcardData: Record<number, Record<number, Flashcard[]>> = {};
