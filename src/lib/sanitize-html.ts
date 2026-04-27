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
// kept every tag that appears in real content. The SVG cluster is for
// hero illustrations (e.g. Module 3 Topic 1's social-media diagram) —
// without it, every admin save would silently strip the diagram and
// students would only see the surrounding prose. Layout wrappers
// (<div>) are also allowed so the styled card chrome around an SVG
// (gradient background, rounded border) survives a PATCH.
const ALLOWED_TAGS = new Set([
  // Inline rich text
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
  // Layout wrappers used inside content blocks (typically the styled
  // card around a hero SVG).
  "div",
  "span",
  // SVG element vocabulary needed for hand-authored hero diagrams.
  "svg",
  "defs",
  "g",
  "circle",
  "rect",
  "path",
  "text",
  "tspan",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "marker",
  "radialgradient",
  "lineargradient",
  "stop",
  "use",
  "symbol",
  "title",
  "desc",
]);

// Attributes we allow per tag. Everything else — including on* handlers
// and unknown attributes — is stripped. Per-tag whitelisting is the
// belt; the regex parser below acts as braces (any attribute not on a
// list is dropped before it gets into the output).
//
// `style` is allowed only on the layout wrappers and the `<svg>` root
// because hand-authored hero blocks need linear-gradients and width/
// height hints. The sanitizeStyleValue helper below strips dangerous
// CSS (url(), expression(), javascript: schemes) so even on those tags
// the surface is narrow.
const SVG_PRESENTATION_ATTRS = new Set([
  "id",
  "class",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "transform",
  "filter",
  "clip-path",
  "mask",
]);
const SVG_TEXT_ATTRS = new Set([
  "x",
  "y",
  "dx",
  "dy",
  "text-anchor",
  "font-size",
  "font-family",
  "font-weight",
  "letter-spacing",
  "alignment-baseline",
  "dominant-baseline",
]);
const SVG_GEOM_ATTRS = new Set([
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "x2",
  "y1",
  "y2",
  "width",
  "height",
  "d",
  "points",
  "marker-start",
  "marker-mid",
  "marker-end",
  "viewbox",
  "preserveaspectratio",
  "orient",
  "refx",
  "refy",
  "markerwidth",
  "markerheight",
  "offset",
  "stop-color",
  "stop-opacity",
  "gradientunits",
  "spreadmethod",
]);
const SVG_META_ATTRS = new Set(["xmlns", "role", "aria-label", "aria-hidden"]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href"]),
  // Layout wrappers — `style` is sanitized via sanitizeStyleValue.
  div: new Set(["class", "style", "id", "role", "aria-label", "aria-hidden"]),
  span: new Set(["class", "style", "id", "role", "aria-label", "aria-hidden"]),
  // SVG root + every inner element gets a generous-but-bounded set.
  svg: new Set([
    ...SVG_META_ATTRS,
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_GEOM_ATTRS,
    "style",
  ]),
  defs: new Set([...SVG_META_ATTRS, ...SVG_PRESENTATION_ATTRS]),
  g: new Set([
    ...SVG_META_ATTRS,
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_TEXT_ATTRS,
  ]),
  circle: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  rect: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  ellipse: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  line: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  polyline: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  polygon: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  path: new Set([...SVG_PRESENTATION_ATTRS, ...SVG_GEOM_ATTRS]),
  text: new Set([
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_TEXT_ATTRS,
    ...SVG_GEOM_ATTRS,
  ]),
  tspan: new Set([
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_TEXT_ATTRS,
    ...SVG_GEOM_ATTRS,
  ]),
  marker: new Set([
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_GEOM_ATTRS,
    ...SVG_META_ATTRS,
  ]),
  radialgradient: new Set([
    ...SVG_GEOM_ATTRS,
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_META_ATTRS,
  ]),
  lineargradient: new Set([
    ...SVG_GEOM_ATTRS,
    ...SVG_PRESENTATION_ATTRS,
    ...SVG_META_ATTRS,
  ]),
  stop: new Set(["offset", "stop-color", "stop-opacity", "style"]),
  use: new Set([...SVG_GEOM_ATTRS, ...SVG_PRESENTATION_ATTRS, "href"]),
  symbol: new Set([...SVG_GEOM_ATTRS, ...SVG_PRESENTATION_ATTRS, ...SVG_META_ATTRS]),
  title: new Set([]),
  desc: new Set([]),
};

// URL schemes we accept on anchors. Blocks `javascript:`, `data:`,
// `vbscript:`, and anything else that could execute.
const SAFE_URL_SCHEMES = /^(https?:|mailto:|\/|#|\?)/i;

// Strip dangerous CSS from a `style` attribute value. We allow plain
// declarations (color, background, padding, gradients, etc.) but reject
// anything that could pull external code or escape the inline-style
// sandbox: `url(`, `expression(` (legacy IE), and any embedded `<` /
// `"` that would break out of the attribute.
function sanitizeStyleValue(raw: string): string {
  // Reject outright if it contains characters that could end the
  // attribute or open a tag.
  if (/[<>]/.test(raw)) return "";
  // Reject CSS escape sequences — some sneaky attacks use `\6a` for
  // `j` to obfuscate `javascript:`.
  if (/\\[0-9a-f]/i.test(raw)) return "";
  // Walk declarations and drop any whose value contains a forbidden
  // function call or scheme. This is conservative: a future need for
  // `url(...)` in an inline data: image would have to add an explicit
  // exception here.
  return raw
    .split(";")
    .map((decl) => decl.trim())
    .filter((decl) => decl.length > 0)
    .filter((decl) => {
      const value = decl.slice(decl.indexOf(":") + 1).toLowerCase();
      if (/url\s*\(/.test(value)) return false;
      if (/expression\s*\(/.test(value)) return false;
      if (/javascript\s*:/.test(value)) return false;
      if (/vbscript\s*:/.test(value)) return false;
      if (/@import/.test(value)) return false;
      return true;
    })
    .join("; ");
}

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

      // Detect self-closing form (`<circle ... />`). Important for
      // SVG primitives (circle/path/rect/line/marker/etc.) which the
      // browser parses differently outside of self-close form when
      // inside HTML — preserving the trailing slash keeps the markup
      // both well-formed and round-trippable through this sanitizer.
      const selfClose = /\/\s*$/.test(rawAttrs);
      const tail = selfClose ? "/>" : ">";

      const allowedAttrs = ALLOWED_ATTRS[name];
      if (!allowedAttrs) {
        // Tag is allowed but takes no attributes (e.g. <strong>, <br>)
        return name === "br" ? "<br>" : `<${name}${tail}`;
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
        let attrValue = m[2] ?? m[3] ?? m[4] ?? "";
        // URL attributes must pass the scheme check.
        if (attrName === "href") {
          if (!SAFE_URL_SCHEMES.test(attrValue.trim())) continue;
        }
        // Inline styles get a CSS-level sanitizer that strips url(),
        // expression(), and embedded scheme handlers. Drop the
        // attribute entirely if the result is empty.
        if (attrName === "style") {
          attrValue = sanitizeStyleValue(attrValue);
          if (!attrValue) continue;
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

      return `<${name}${kept.length ? " " + kept.join(" ") : ""}${tail}`;
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
