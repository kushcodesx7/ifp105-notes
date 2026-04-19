// Centralised error reporting helper.
//
// Replace ad-hoc `console.error(...)` calls with `logError(context, err)`
// so we have ONE place to wire up Sentry / Logflare / Better Stack later
// without touching every call site. For now it just goes to console.error
// (server) or a no-op (client by default — opt in via window.__IFP_LOG_CLIENT_ERRORS__).
//
// The shape is structured so log aggregators can group by `context` and
// surface error frequency without per-message regex tricks.
//
// Usage:
//   import { logError } from "@/lib/log-error";
//   try { ... } catch (e) { logError("api/progress.upsert", e); throw e; }

export interface ErrorContext {
  /** Where the error happened. Use kebab-case route + verb,
   *  e.g. "api/admin/courses.delete" or "ModulePage.saveToSupabase" */
  context: string;
  /** Anything else useful — student email, course slug, module number,
   *  whatever helps locate it in user-reported bug repros. Avoid PII
   *  beyond email. */
  meta?: Record<string, unknown>;
}

function shouldLogClientSide(): boolean {
  if (typeof window === "undefined") return true; // server: always log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Boolean((window as any).__IFP_LOG_CLIENT_ERRORS__);
}

/**
 * Log an error with structured context. Safe to call from both server
 * and client. Server-side always writes to stderr (Vercel logs picks it
 * up); client-side only writes when the opt-in window flag is set, so
 * regular students don't see a noisy console in production.
 */
export function logError(
  contextOrInput: string | ErrorContext,
  error: unknown,
  meta?: Record<string, unknown>
): void {
  if (!shouldLogClientSide()) return;

  const ctx: ErrorContext =
    typeof contextOrInput === "string"
      ? { context: contextOrInput, meta }
      : contextOrInput;

  const err =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : { message: String(error) };

  // Single-line JSON makes log aggregators happy. Vercel's log viewer
  // already pretty-prints JSON, so this is human-readable too.
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      tag: "[ifp-error]",
      context: ctx.context,
      ...(ctx.meta ? { meta: ctx.meta } : {}),
      err,
      ts: new Date().toISOString(),
    })
  );
}
