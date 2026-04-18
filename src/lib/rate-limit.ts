import "server-only";
import type { NextRequest } from "next/server";
import { getRedis } from "@/lib/redis";

// Simple fixed-window rate limiter backed by the Vercel marketplace
// Redis. Tracks a counter per (bucket, identifier) pair with a TTL
// equal to the window size. First increment sets the TTL; subsequent
// increments land in the same window.
//
// Fixed window (not sliding) is a deliberate pragma:
//   - 1 round-trip per check (INCR + conditional EXPIRE)
//   - No sorted-set bookkeeping
//   - The worst-case burst at a window boundary is 2× the limit — fine
//     for our scale. A dedicated library (rate-limiter-flexible) can
//     replace this later if we ever need true sliding.
//
// Fail-open: if Redis is unavailable (env missing, connection dropped)
// the limiter returns `ok: true`. A degraded cache is not a reason to
// take the site offline. Downside: during an outage, rate limits stop
// enforcing. We accept that trade-off.

export interface RateLimitResult {
  ok: boolean;
  /** Requests remaining in the current window. 0 when blocked. */
  remaining: number;
  /** Seconds until the window resets (for Retry-After header). */
  resetSec: number;
  /** The hit count that triggered this decision (for logging). */
  count: number;
}

interface RateLimitOptions {
  /** Logical bucket name, e.g. "batches:get". Part of the Redis key. */
  bucket: string;
  /** The identifier — typically IP address or email. */
  id: string;
  /** Max requests allowed per window. */
  limit: number;
  /** Window size in seconds. */
  windowSec: number;
}

export async function rateLimit(
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = await getRedis();
  // Fail-open when Redis isn't available — see module comment.
  if (!redis) {
    return { ok: true, remaining: opts.limit, resetSec: opts.windowSec, count: 0 };
  }

  const key = `rl:${opts.bucket}:${opts.id}`;
  try {
    const count = await redis.incr(key);
    // Set TTL only on first increment of a new window — avoids
    // resetting the window on every hit.
    if (count === 1) {
      await redis.expire(key, opts.windowSec);
    }
    const ttl = await redis.ttl(key);
    // Guard against a missing TTL (can happen if EXPIRE silently
    // failed). Treat the window as fresh if Redis reports -1 / -2.
    const resetSec = ttl > 0 ? ttl : opts.windowSec;

    if (count > opts.limit) {
      return { ok: false, remaining: 0, resetSec, count };
    }
    return { ok: true, remaining: opts.limit - count, resetSec, count };
  } catch (e) {
    console.warn("[rate-limit] redis op failed:", (e as Error).message);
    return { ok: true, remaining: opts.limit, resetSec: opts.windowSec, count: 0 };
  }
}

// ─── Identifier helpers ────────────────────────────────────

/**
 * Best-effort client IP extraction. Vercel always sets
 * `x-forwarded-for` — the first entry is the original client. Falls
 * back to a stable "unknown" string when the header is missing so the
 * limiter still enforces some ceiling across anonymous sources.
 */
export function ipFromRequest(req: NextRequest | Request): string {
  const h = "headers" in req ? req.headers : new Headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") || "unknown";
}

// ─── Response helper ───────────────────────────────────────

/**
 * Build a 429 Response with Retry-After + standard X-RateLimit headers.
 * Use from the API route when rateLimit(...) returns `ok: false`.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  limit: number
): Response {
  return Response.json(
    {
      error: "Too many requests. Please slow down.",
      retryAfterSec: result.resetSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.resetSec),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.resetSec),
      },
    }
  );
}
