// Shared helper: parse a Supabase/ISO timestamp as UTC, even when the
// incoming string lacks a timezone marker.
//
// The bug it fixes:
//   Postgres TIMESTAMPTZ columns normally serialize as
//   "2026-04-20T07:00:00.000+00:00" or "...Z". But some Supabase paths
//   (and plain TIMESTAMP columns) serialize the naive form
//   "2026-04-20T07:00:00.000". Per the ECMAScript spec, a naive ISO
//   string is parsed as LOCAL time — so for a Tashkent user (UTC+5) an
//   event that happened 1 minute ago appears 5 h + 1 m ago.
//
// The fix:
//   Check whether the string already has a timezone suffix; if not,
//   append "Z" so the parse is unambiguously UTC.
//
// Every client-side component that reads timestamps from our API MUST
// use this helper. Server-side (Node on Vercel) runs in UTC so the
// local-time trap is invisible in dev and only surfaces in production
// for users in non-UTC timezones (which is all of our students).

/**
 * Parse an ISO-ish timestamp, forcing UTC when the input has no
 * timezone marker. Returns NaN for falsy inputs so callers can guard
 * with `if (Number.isNaN(ts))`.
 */
export function parseUtcIso(iso: string | null | undefined): number {
  if (!iso) return NaN;
  const hasTz = /[Zz]|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasTz ? iso : iso + "Z").getTime();
}
