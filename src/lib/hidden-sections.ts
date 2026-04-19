// Sections that exist in the DB for testing but should never appear in
// public-facing views (IFS Connect page, home glimpse, section leader etc.).
// Admin dashboards (/admin/*) still see everything.
//
// Configurable via the HIDDEN_SECTIONS env var (server-only) — comma-
// separated section names. Defaults to "Test Section" when unset so
// existing deployments don't change behaviour. Hot-reloads with the
// rest of the env on Vercel; no rebuild needed to add a "Test 2".
//
// Read at module load (env is stable for the process lifetime) so the
// per-call helper stays cheap.

function parseHiddenList(): string[] {
  const raw = process.env.HIDDEN_SECTIONS;
  if (!raw || !raw.trim()) return ["Test Section"]; // default
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const HIDDEN_SECTIONS: string[] = parseHiddenList();

export function isHiddenSection(section: string | null | undefined): boolean {
  if (!section) return false;
  return HIDDEN_SECTIONS.includes(section);
}
