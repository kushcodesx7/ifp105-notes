import "server-only";

// Tiny allowlist HTML sanitizer. Used when admins save content block
// HTML to the database. Keeps the rich-text formatting we actually use
// (strong/em/mark/code/sup/sub/br/a) and strips everything else —
// including <script>, on* attributes, javascript: URLs, style="".
//
// Why not DOMPurify: adds ~22KB to the server bundle for one endpoint
// that handles small strings (<10KB per block). Our tag surface is tiny
// and the regex approach is tractable for this scope. If we ever allow
// freeform HTML uploads, swap to DOMPurify.
//
// Threat model: a compromised admin account could otherwise store
// `<img src=x onerror=alert(1)>` and hit every student who opens that
// topic. This function runs on the PATCH endpoint so stored content
// is already clean; the student renderer can keep using
// dangerouslySetInnerHTML without the runtime cost of double-purifying.

// Tags we allow through. Scanned /src/data for historical HTML and
// kept every tag that appears in real content.
const ALLOWED_TAGS = new Set([
  "strong",
  "b",
  "em",
  "i",
  "u",
  "mark",
  "code",
  "br",
  "sup",
  "sub",
  "a",
]);

// Attributes we allow per tag. Everything else — including on* handlers,
// style, class — is stripped.
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href"]),
};

// URL schemes we accept on anchors. Blocks `javascript:`, `data:`,
// `vbscript:`, and anything else that could execute.
const SAFE_URL_SCHEMES = /^(https?:|mailto:|\/|#|\?)/i;

/**
 * Sanitize an HTML string for storage + re-render. Returns a cleaned
 * string that only contains allowlisted tags + attributes. Text
 * content is left as-is (React renders innerHTML for us; the renderer
 * always escapes unknown entities).
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";

  // Step 1: strip full <script>…</script> and <style>…</style> blocks,
  // including their contents. A later pass that only drops tags would
  // leave the script body as visible text, which is ugly.
  let out = input.replace(
    /<(script|style)[\s\S]*?<\/\1\s*>/gi,
    ""
  );
  // Step 2: strip any remaining self-closing or stray script/style
  // openers (e.g. `<script src=…>` with no closer).
  out = out.replace(/<\/?(script|style)\b[^>]*>/gi, "");

  // Step 3: walk every tag and decide per-tag what to do.
  out = out.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (_match, rawName: string, rawAttrs: string) => {
      const name = rawName.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";

      // Closing tag — no attributes possible.
      if (_match.startsWith("</")) return `</${name}>`;

      const allowedAttrs = ALLOWED_ATTRS[name];
      if (!allowedAttrs) {
        // Tag is allowed but takes no attributes (e.g. <strong>, <br>)
        return name === "br" ? "<br>" : `<${name}>`;
      }

      // Pull allowed attributes out of rawAttrs. Using a simple regex
      // that accepts "name", name='v', or name="v". Good enough for
      // the small surface we emit.
      const kept: string[] = [];
      const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let m: RegExpExecArray | null;
      while ((m = attrRe.exec(rawAttrs)) !== null) {
        const attrName = m[1].toLowerCase();
        if (!allowedAttrs.has(attrName)) continue;
        const attrValue = m[2] ?? m[3] ?? m[4] ?? "";
        // URL attributes must pass the scheme check.
        if (attrName === "href") {
          if (!SAFE_URL_SCHEMES.test(attrValue.trim())) continue;
        }
        // Strip any remaining quotes and re-quote with " to normalize.
        const safe = attrValue.replace(/"/g, "&quot;");
        kept.push(`${attrName}="${safe}"`);
      }

      // For anchors, inject target="_blank" + rel="noopener noreferrer"
      // so external links open in a new tab without document.opener
      // access back to our page.
      if (name === "a") {
        kept.push('target="_blank"');
        kept.push('rel="noopener noreferrer"');
      }

      return `<${name}${kept.length ? " " + kept.join(" ") : ""}>`;
    }
  );

  return out;
}

/**
 * Walk a ContentBlock array and sanitize every `html` field in place
 * (returns a new array, doesn't mutate). Use on PATCH endpoints that
 * accept arbitrary block JSON from admins. Unknown block shapes pass
 * through untouched — the renderer will skip fields it doesn't know.
 */
export function sanitizeContentBlocks<T>(blocks: T): T {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((b) => {
    if (b && typeof b === "object") {
      const obj = { ...(b as Record<string, unknown>) };
      // Sanitize every string field named exactly `html` at the top
      // level + inside nested `rows`/`cells` (tables).
      if (typeof obj.html === "string") {
        obj.html = sanitizeHtml(obj.html);
      }
      if (Array.isArray(obj.rows)) {
        obj.rows = (obj.rows as unknown[]).map((row) => {
          if (Array.isArray(row)) {
            return (row as unknown[]).map((cell) =>
              typeof cell === "string" ? sanitizeHtml(cell) : cell
            );
          }
          return row;
        });
      }
      if (Array.isArray(obj.items)) {
        obj.items = (obj.items as unknown[]).map((item) => {
          if (item && typeof item === "object") {
            const it = { ...(item as Record<string, unknown>) };
            if (typeof it.html === "string") it.html = sanitizeHtml(it.html);
            return it;
          }
          return item;
        });
      }
      return obj;
    }
    return b;
  }) as T;
}
