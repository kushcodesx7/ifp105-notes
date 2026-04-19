"use client";

import { useEffect } from "react";
import Link from "next/link";

// App Router root error boundary. Without this, an uncaught render
// error anywhere in the tree shows Next's default error overlay (in
// dev) or a blank white page (in prod). This file catches any
// unhandled error from a server or client component, logs it to the
// console (so admins can find it in Vercel logs), and gives the
// student a friendly recovery path instead of a blank screen.
//
// Note: this is the runtime-error counterpart to not-found.tsx (which
// catches missing routes). Both must live at the SAME segment level
// to be picked up — that's why this sits next to not-found.tsx.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to Vercel logs so the teacher can grep for student-side
    // crashes during the day. The `digest` is the hash Next generates
    // when masking error messages in production — useful for matching
    // a student report back to a specific build. Routes through the
    // central logError so future Sentry/Logflare wiring is a one-file
    // change.
    import("@/lib/log-error").then(({ logError }) => {
      logError("GlobalError", error, { digest: error.digest });
    });
  }, [error]);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-md">
        <div className="text-7xl mb-6" aria-hidden="true">
          😵
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Something broke
        </h1>
        <p className="text-sm text-zinc-400 mb-2">
          An unexpected error popped up while loading this page. Try once more
          or head back home — your progress is safe.
        </p>
        {error.digest && (
          <p className="text-[11px] text-zinc-600 font-mono mb-6">
            Reference: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap mt-6">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] focus-glow"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}
          >
            ↻ Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-zinc-300 transition-all hover:text-white hover:bg-white/[0.06]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
