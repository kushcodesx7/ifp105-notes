import { ImageResponse } from "next/og";
import { getCurrentCourse } from "@/lib/course-registry";

// Dynamic OpenGraph card rendered at request time by Next.js's
// opengraph-image file convention. Telegram / LinkedIn / X / iMessage
// all fetch this whenever someone shares the site URL.
//
// IMPORTANT — SATORI COMPATIBILITY
//   @vercel/og uses Satori under the hood. Satori supports a SUBSET
//   of CSS. Properties known to crash the render silently (endpoint
//   returns 200 with 0-byte body):
//     · `filter: drop-shadow(...)` — NOT supported
//     · `text-shadow` — partial support; avoid if unsure
//     · `backdrop-filter` — NOT supported
//     · any animation / transition / transform that isn't a
//       static translate/rotate/scale string
//   The v2 redesign (PR #146) used `filter: drop-shadow(...)` on the
//   gradient headline and the whole endpoint started returning 0
//   bytes in production. This v3 strips all unsafe properties and
//   sticks to Satori's verified-safe surface: flex layout, linear +
//   radial gradients, background-clip:text, border, border-radius,
//   letter-spacing, line-height, font-weight, and plain color/bg.
//
// Propagation note: Telegram/LinkedIn cache OG per-URL for ~24h.
// Forward to @WebpageBot once after a deploy to force-refresh, or
// append ?v=<n> as a one-time cachebust.

export const runtime = "edge";
export const alt =
  "IFP105 — Your Complete ICT Study Notes · for IFS students at Amity Tashkent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Short-form for the headline so renaming the course in the registry
// doesn't blow past the canvas width. Preference: "ICT" for ICT
// Fundamentals, first word otherwise, course code as final fallback.
function shortForm(code: string, name: string): string {
  if (/ICT/i.test(name)) return "ICT";
  const firstWord = name.split(/\s+/)[0];
  return firstWord || code;
}

// Minimal fallback card — used if the main ImageResponse throws
// anywhere in its JSX tree (some Satori errors surface as a 200 with
// a 0-byte body, which is exactly the v2 symptom we hit). Stripped to
// Satori's safest properties: flat background, single-line title,
// plain text. Never breaks.
function FallbackCard({ code, name }: { code: string; name: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A12",
        fontFamily: "system-ui, sans-serif",
        color: "#ffffff",
      }}
    >
      <div style={{ fontSize: 36, color: "#A1A1AA", marginBottom: 24 }}>
        {/* Single string child — Satori rejects {code} · {name} as
            "more than one child node". */}
        {`${code} · ${name}`}
      </div>
      <div
        style={{
          fontSize: 112,
          fontWeight: 900,
          color: "#A78BFA",
          letterSpacing: "-0.035em",
        }}
      >
        Study Notes
      </div>
      <div style={{ fontSize: 24, color: "#71717A", marginTop: 40 }}>
        ifp105-notes.vercel.app
      </div>
    </div>
  );
}

export default async function OpengraphImage() {
  const course = getCurrentCourse();
  const short = shortForm(course.code, course.name);

  try {
    return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Single background declaration. Satori parses stacked
          // backgrounds (gradient over base colour) correctly, but
          // keeping it to one layer + a solid fallback is the safest
          // form across Satori versions.
          backgroundColor: "#08080F",
          backgroundImage:
            "radial-gradient(900px 500px at 50% 36%, rgba(99,102,241,0.32), rgba(139,92,246,0.10) 45%, transparent 72%)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Top-left course pill — live-dot style that matches the
            home page badge. */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 24px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            fontSize: 22,
            color: "#E4E4E7",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#34D399",
              // boxShadow IS supported by Satori.
              boxShadow: "0 0 14px rgba(52,211,153,0.8)",
            }}
          />
          <span style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>
            {course.code}
          </span>
          <span style={{ color: "#A1A1AA" }}>·</span>
          <span style={{ fontWeight: 400, color: "#D4D4D8" }}>
            {course.name}
          </span>
        </div>

        {/* Headline block — two lines, centred. The gradient is
            applied via backgroundImage + WebkitBackgroundClip:text,
            which Satori supports. NO filter:drop-shadow (that was
            the v2 crash). */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 600,
              color: "#E4E4E7",
              letterSpacing: "-0.025em",
              lineHeight: 1,
              marginBottom: 14,
            }}
          >
            Your Complete
          </div>

          <div
            style={{
              fontSize: 148,
              fontWeight: 900,
              backgroundImage:
                "linear-gradient(135deg, #A78BFA, #818CF8 45%, #C4B5FD)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
            }}
          >
            {/* Template literal so this div has exactly ONE child
                node. Satori throws "Expected <div> to have explicit
                display: flex if it has more than one child" when
                you mix an expression with a literal string like
                `{short} Study Notes`. One string child = safe. */}
            {`${short} Study Notes`}
          </div>
        </div>

        {/* Feature strip — what's actually inside the site. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 44,
            fontSize: 26,
            color: "#A1A1AA",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          <span>5 modules</span>
          <span style={{ color: "#52525B" }}>·</span>
          <span>100+ quizzes</span>
          <span style={{ color: "#52525B" }}>·</span>
          <span>Flashcards</span>
          <span style={{ color: "#52525B" }}>·</span>
          <span style={{ color: "#C4B5FD" }}>Thinking profile</span>
        </div>

        {/* Byline + URL footer */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            left: 56,
            right: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#71717A",
          }}
        >
          <span>Built for IFS students · Amity University Tashkent</span>
          <span style={{ color: "#A78BFA", fontWeight: 500 }}>
            ifp105-notes.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
  } catch (err) {
    // Log so Vercel function logs show what broke, and serve a
    // minimal card instead of the 0-byte body Satori emits on an
    // unhandled throw.
    console.error("[opengraph-image] render failed, serving fallback:", err);
    return new ImageResponse(
      <FallbackCard code={course.code} name={course.name} />,
      { ...size }
    );
  }
}
