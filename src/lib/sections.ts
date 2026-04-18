// Canonical section names used across the app.
// Kept in one place so APIs, dropdowns, colour maps, and analytics stay in sync.
//
// Rationale: the roll_list table in Supabase may not have entries for every
// section yet (e.g., teacher uploaded Section 2 but not Sections 1, 3-6). The
// registration dropdown must still show every section so students can pick
// their own — otherwise they get stuck staring at a dropdown that only lists
// whichever section the teacher happened to import first.
//
// This list represents every section that CAN exist in a batch. Sections that
// have zero roll_list entries appear with count=0 and a "roll list pending"
// hint in the UI.

export const CANONICAL_SECTIONS: string[] = [
  "Section 1",
  "Section 2",
  "Section 3",
  "Section 4",
  "Section 5",
  "Section 6",
];

/**
 * Natural sort comparator so "Section 10" sorts after "Section 2".
 */
export function compareSections(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}
