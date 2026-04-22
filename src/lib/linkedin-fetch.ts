// src/lib/linkedin-fetch.ts
//
// LinkedIn URL shape check — nothing else.
//
// This module USED to contain a server-side OpenGraph fetcher that
// tried to pull a student's profile photo from the LinkedIn URL they
// pasted. That pipeline failed ~100% of the time in production because
// LinkedIn aggressively blocks cloud-IP GETs (Vercel, AWS, GCP) — og:
// image comes back empty or behind a login wall. The functions were
// removed Apr 2026 when we switched to syncing Google profile photos
// from the JWT's `picture` claim instead (see
// `/api/students/sync-google-photo`).
//
// Kept `isLinkedInUrl` because /api/students/profile + /api/admin/
// students/backfill-linkedin-photos still validate saved URLs before
// storing them.

const LINKEDIN_HOST_RE = /^([a-z]{2,3}\.)?linkedin\.com$/i;

/** Strict-ish shape check. Accepts: linkedin.com, www.linkedin.com,
 *  uk.linkedin.com, m.linkedin.com. Rejects bare "linkedin" strings
 *  or totally unrelated URLs. */
export function isLinkedInUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return LINKEDIN_HOST_RE.test(u.hostname);
  } catch {
    return false;
  }
}
