import { ImageResponse } from "next/og";
import { getCurrentCourse } from "@/lib/course-registry";

// Dynamic OpenGraph card rendered at request time by Next.js's
// opengraph-image file convention. Telegram / LinkedIn / X / iMessage
// all fetch /opengraph-image whenever someone shares the site URL,
// and each platform caches the PNG for days — so the visual has to
// be impossible to miss and consistent with the live home page
// (dark bg + indigo→violet title gradient + the current course
// code + name from the registry).
//
// Why file-based (vs. a static /public/og-cover.png):
//   - Pulls course code + name live from course-registry so when
//     the course ever renames ("IFP105 → IFP106", "ICT → Python101")
//     the preview updates without anyone remembering to re-export
//     a PNG in Figma.
//   - No binary asset to keep in the repo or lose track of.
//
// Runs on Vercel's edge runtime (satori-based renderer). Uses only
// CSS that Satori supports — no Tailwind, no CSS vars, no @font-face.
//
// NOTE ON PROPAGATION
//   Telegram caches OG data per-URL for ~24h. After this deploy lands
//   on prod, the old preview will persist on any chat that already
//   generated it. Fastest unstick: forward the link to @WebpageBot on
//   Telegram and it refreshes the cache. Or append `?v=2` to the URL
//   once to force a re-fetch.

export const runtime = "edge";
export const alt = "IFP105 — ICT Study Notes · Interactive notes for IFS students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const course = getCurrentCourse();

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
          // Match the home page's body background (#09090F) with a
          // subtle radial highlight at the top so the preview has
          // depth rather than looking like a flat screenshot.
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(99,102,241,0.22), transparent 60%), #09090F",
          position: "relative",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Subtle grid overlay matching the site's ambient grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            display: "flex",
          }}
        />

        {/* Course badge — pill with green live dot, mirrors the
            "IFP105 · Information & Communication Technology" pill
            on the home page hero. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 28px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 24,
            color: "#D4D4D8",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#34D399",
              boxShadow: "0 0 12px rgba(52,211,153,0.6)",
            }}
          />
          <span style={{ fontWeight: 500 }}>
            {course.code} · {course.name}
          </span>
        </div>

        {/* Headline line 1 — white, tight tracking, heavy weight */}
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.035em",
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          Your Complete
        </div>

        {/* Headline line 2 — indigo→violet gradient, same tracking.
            Satori renders background-clip:text correctly as long as
            the background is a linear-gradient string. */}
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            backgroundImage: "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.035em",
            lineHeight: 1,
            marginBottom: 40,
          }}
        >
          {course.name.includes("Information")
            ? "ICT Study Notes"
            : `${course.name} Study Notes`}
        </div>

        {/* Supporting line — what the site actually offers */}
        <div
          style={{
            fontSize: 30,
            color: "#A1A1AA",
            marginBottom: 10,
            letterSpacing: "-0.01em",
          }}
        >
          Interactive modules · Quizzes · Bloom&apos;s thinking profile
        </div>

        {/* Byline — keeps the audience clear for a random Telegram
            recipient who sees the card out of context. */}
        <div style={{ fontSize: 22, color: "#71717A" }}>
          Built for IFS students at Amity Tashkent
        </div>

        {/* Corner URL watermark so the card survives being screen-
            shotted and reshared without context. */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 44,
            fontSize: 18,
            color: "#52525B",
            fontWeight: 500,
          }}
        >
          ifp105-notes.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
