import "server-only";
import { createClient, type RedisClientType } from "redis";

// Lazy singleton Redis client. Vercel's marketplace Redis integration
// (actually Upstash under the hood) exposes a standard Redis URL in
// `KV_REDIS_URL`. We use `node-redis` over TCP rather than the Upstash
// REST API because the project we created was the "Redis" SKU (URL
// only) not the "Upstash" SKU (REST + URL). Same storage backend.
//
// Node runtime only. API routes in this project don't use the Edge
// runtime, so this is fine. If we ever need Edge, we'd switch to the
// Upstash REST SDK.
//
// Missing env var behaviour: returns null. Every caller treats that
// as "rate-limiting unavailable — let the request through" so a
// Redis outage doesn't break the site. Fail-open by design.

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

export async function getRedis(): Promise<RedisClientType | null> {
  const url = process.env.KV_REDIS_URL || process.env.REDIS_URL || process.env.KV_URL;
  if (!url) return null;

  // Reuse an in-flight connection attempt across concurrent callers.
  if (client && client.isOpen) return client;
  if (connecting) return connecting;

  connecting = (async () => {
    const c: RedisClientType = createClient({ url });
    // Listen for errors — node-redis otherwise emits unhandled promise
    // rejections on transient network blips. We log + swallow.
    c.on("error", (err) => {
      console.warn("[redis] client error:", err?.message || err);
    });
    await c.connect();
    client = c;
    connecting = null;
    return c;
  })();

  try {
    return await connecting;
  } catch (e) {
    // Connection failure → null, fail-open. Reset the in-flight promise
    // so the next caller gets a fresh attempt.
    console.warn("[redis] connect failed:", (e as Error).message);
    connecting = null;
    client = null;
    return null;
  }
}
