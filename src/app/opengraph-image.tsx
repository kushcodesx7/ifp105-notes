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
// Design goals (v2, after teacher feedback Apr 22):
//   - The main title "Your Complete ICT Study Notes" was wrapping to
//     two lines on v1 because `${course.name} Study Notes` produced
//     "ICT Fundamentals Study Notes" (26 chars, overflowed). Fixed:
//     always use "ICT" as the short-form in the headline — the course
//     badge above already carries the full course name, so the
//     headline doesn't need to repeat it.
//   - Stronger hierarchy: drop the repeat supporting line, bump the
//     gradient title, add a feature-strip that actually tells a
//     passing student what's inside (quizzes + flashcards + thinking
//     profile), not a generic "interactive" tagline.
//   - Keep the layout centred + symmetric so it reads cleanly on
//     both square (iMessage) and wide (Telegram/LinkedIn) crops.
//
// NOTE ON PROPAGATION
//   Telegram caches OG data per-URL for ~24h. After a deploy, forward
//   the link to @WebpageBot once to force a refresh, or append
//   `?v=<something>` as a one-time cachebust.

export const runtime = "edge";
export const alt =
  "IFP105 — Your Complete ICT Study Notes · for IFS students at Amity Tashkent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The short-form used in the headline. Derived heuristically from the
// course code + name so renaming the course in the registry keeps the
// preview correct. Preference: first word of the name, unless the
// name is literally "ICT Fundamentals" (the current course), in which
// case "ICT" is the recognisable short form students use.
function shortForm(code: string, name: string): string {
  if (/ICT/i.test(name)) return "ICT";
  // Pull the first word ("Python", "Web") as the short form — keeps
  // the headline from wrapping on long descriptive names.
  const firstWord = name.split(/\s+/)[0];
  return firstWord || code;
}

export default async function OpengraphImage() {
  const course = getCurrentCourse();
  const short = shortForm(course.code, course.name);

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
          padding: "56px 72px",
          // Layered background: deep-violet glow behind the title
          // (matches the home hero's orb) + pure-black base so the
          // image survives Telegram's grey chat bubble framing.
          background:
            "radial-gradient(900px 500px at 50% 38%, rgba(99,102,241,0.28), rgba(139,92,246,0.10) 45%, transparent 70%), #08080F",
          position: "relative",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Ambient grid — very subtle so it reads as texture not
            pattern. Matches the site's home hero backdrop. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            display: "flex",
          }}
        />

        {/* Top-left wordmark pill — course code + name in the live-dot
            style that matches the home page hero badge. Left-anchored
            so the centred title has the whole width to breathe. */}
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
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 22,
            color: "#E4E4E7",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#34D399",
              boxShadow: "0 0 14px rgba(52,211,153,0.7)",
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

        {/* Headline block — centred, two lines. "Your Complete" sits
            smaller above the gradient headline to cue the promise
            without competing for attention. */}
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
                "linear-gradient(135deg, #A78BFA 0%, #818CF8 40%, #C4B5FD 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              marginBottom: 8,
              // Light drop-shadow under the gradient text so it feels
              // lifted off the grid rather than printed on it.
              filter: "drop-shadow(0 8px 24px rgba(139,92,246,0.18))",
            }}
          >
            {short} Study Notes
          </div>
        </div>

        {/* Feature strip — what students actually get. Four pills in
            a row, dot-separated, muted enough to sit below the
            headline without competing. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 36,
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

        {/* Byline + URL — bottom-anchored so the card survives being
            screenshot-reshared without context. */}
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
}
