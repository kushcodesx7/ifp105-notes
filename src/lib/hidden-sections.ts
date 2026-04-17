// Sections that exist in the DB for testing but should never appear in
// public-facing views (IFS Connect page, home glimpse, section leader etc.).
// Admin dashboards (/admin/*) still see everything.
export const HIDDEN_SECTIONS: string[] = ["Test Section"];

export function isHiddenSection(section: string | null | undefined): boolean {
  if (!section) return false;
  return HIDDEN_SECTIONS.includes(section);
}
