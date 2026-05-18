import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Exam-window lockout. After this epoch (seconds), all traffic flows normally
// and the proxy becomes a no-op — safe to leave in place; will be removed
// in a follow-up cleanup commit.
//   Locked from: 2026-05-18 09:23 +05
//   Unlocks at:  2026-05-18 11:53 +05  (2h 30m exam window)
const UNLOCK_EPOCH_SECONDS = 1779087207;

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Site temporarily offline</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; height: 100%; background: #0b0f17; color: #e7ecf3; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { min-height: 100%; display: grid; place-items: center; padding: 24px; }
  .card { max-width: 520px; text-align: center; background: #121826; border: 1px solid #1f2a3d; border-radius: 16px; padding: 32px 28px; box-shadow: 0 10px 40px rgba(0,0,0,.35); }
  h1 { font-size: 22px; margin: 0 0 8px; letter-spacing: .2px; }
  p  { font-size: 15px; line-height: 1.55; margin: 8px 0; color: #b8c2d1; }
  .badge { display: inline-block; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #ffb454; background: rgba(255,180,84,.08); border: 1px solid rgba(255,180,84,.25); padding: 4px 10px; border-radius: 999px; margin-bottom: 14px; }
  .foot { margin-top: 18px; font-size: 12px; color: #6f7c92; }
</style>
</head>
<body>
<main>
  <section class="card" role="alert" aria-live="polite">
    <h1>Site is offline</h1>
    <p>All the best for your exam.</p>
  </section>
</main>
</body>
</html>`;

function isUnlocked(): boolean {
  return Math.floor(Date.now() / 1000) >= UNLOCK_EPOCH_SECONDS;
}

export function proxy(_request: NextRequest) {
  if (isUnlocked()) {
    return NextResponse.next();
  }
  const remaining = Math.max(0, UNLOCK_EPOCH_SECONDS - Math.floor(Date.now() / 1000));
  return new NextResponse(OFFLINE_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
      "retry-after": String(remaining),
    },
  });
}

// Run on every request except Next's internal static assets — the offline
// page is fully self-contained so we don't strictly need these, but keeping
// them excluded avoids needlessly intercepting build-time asset traffic.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
