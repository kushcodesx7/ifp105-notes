// src/lib/linkedin-fetch.ts
//
// Best-effort public-profile metadata fetcher for LinkedIn URLs.
//
// What it does: GETs the LinkedIn profile URL the student provided,
// parses the OpenGraph tags from the HTML, and returns { imageUrl,
// name, description }. The `imageUrl` is the profile photo; `name` is
// the student's display name (LinkedIn format: "First Last · Headline |
// LinkedIn"); `description` is the headline or first-line summary.
//
// What it does NOT do: talk to the LinkedIn API. No OAuth. No API key.
// No paid service. Just a plain HTTPS GET with a well-behaved UA, a
// regex on the OG meta tags, and a timeout. LinkedIn allows OG fetching
// on public profile URLs — it's how link previews work in Slack / iMessage
// / Telegram. If the profile is private or LinkedIn blocks us, the call
// returns `null` and the caller must handle the fallback.
//
// Used by:
//   - /api/students/profile (POST) — auto-fill photo_url on save when the
//     student provides a LinkedIn URL and doesn't yet have a photo
//   - /api/admin/students/backfill-linkedin-photos — one-shot sync for
//     every student who already has linkedin_url but no photo_url

export interface LinkedInMeta {
  /** The og:image URL (profile photo). Might be a signed CDN URL that
   *  rotates — caller should download + rehost rather than storing this
   *  URL directly. */
  imageUrl: string | null;
  /** og:title value. LinkedIn formats it as "Name · Headline | LinkedIn" —
   *  parse with {@link parseLinkedInTitle} if you want just the name. */
  title: string | null;
  /** og:description — usually the headline or first-line summary. */
  description: string | null;
}

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

/**
 * Fetch OpenGraph metadata from a LinkedIn public profile URL.
 *
 * Returns `null` on any failure (bad URL, timeout, non-2xx, LinkedIn
 * serving a login wall, missing OG tags). Caller should treat a null
 * result as "skip this" — do NOT crash, do NOT block the save.
 */
export async function fetchLinkedInMeta(
  rawUrl: string
): Promise<LinkedInMeta | null> {
  if (!isLinkedInUrl(rawUrl)) return null;

  try {
    const res = await fetch(rawUrl, {
      // LinkedIn serves OG tags to most UAs. A generic bot UA gets 999'd
      // sometimes; a browser-ish UA fares better. This is an
      // intentionally-honest UA string.
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IFP105StudyNotes/1.0; +https://ifp105-notes.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // 8s ceiling. Save path shouldn't block on slow LinkedIn responses.
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Parse both meta-tag orderings: LinkedIn sometimes emits
    // `<meta property="og:image" content="...">` and sometimes
    // `<meta content="..." property="og:image">`. Two passes, pick first
    // non-empty hit.
    const pickPropFirst = (prop: string): string | null => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${escapeRe(prop)}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      const m = re.exec(html);
      return m ? decodeHtmlEntities(m[1]) : null;
    };
    const pickContentFirst = (prop: string): string | null => {
      const re = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRe(prop)}["']`,
        "i"
      );
      const m = re.exec(html);
      return m ? decodeHtmlEntities(m[1]) : null;
    };
    const pick = (prop: string) =>
      pickPropFirst(prop) || pickContentFirst(prop);

    return {
      imageUrl: pick("og:image"),
      title: pick("og:title"),
      description: pick("og:description"),
    };
  } catch {
    return null;
  }
}

/**
 * LinkedIn's og:title is formatted like
 *   "Oysha Abdullayeva - Student at Amity University Tashkent | LinkedIn"
 * Split on the first " - " (separator between name and headline) and the
 * trailing " | LinkedIn". Returns just the name portion, or null if the
 * title doesn't match the expected shape.
 */
export function parseLinkedInTitle(title: string | null): {
  name: string | null;
  headline: string | null;
} {
  if (!title) return { name: null, headline: null };
  // Strip trailing " | LinkedIn" (the site brand suffix)
  const noBrand = title.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
  // Split on first " - " (en-dash variants included)
  const m = noBrand.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (m) return { name: m[1].trim(), headline: m[2].trim() };
  return { name: noBrand || null, headline: null };
}

/**
 * Fetch the image bytes at the given URL. Used to re-host a LinkedIn
 * og:image on our Supabase storage instead of storing the LinkedIn CDN
 * URL (those URLs can rotate with expiry tokens).
 *
 * Returns { bytes, contentType } on success, null on any failure.
 */
export async function fetchImageBytes(
  url: string
): Promise<{ bytes: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IFP105StudyNotes/1.0; +https://ifp105-notes.vercel.app)",
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return null;
    const ab = await res.arrayBuffer();
    if (ab.byteLength === 0) return null;
    // Safety cap: refuse anything over 5MB. A profile photo shouldn't
    // exceed a few hundred KB; 5MB is already an attack budget.
    if (ab.byteLength > 5 * 1024 * 1024) return null;
    return { bytes: Buffer.from(ab), contentType };
  } catch {
    return null;
  }
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
