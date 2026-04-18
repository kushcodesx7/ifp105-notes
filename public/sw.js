// IFP105 service worker — v6
//
// Strategy:
//   • HTML navigations: NETWORK-FIRST with cache fallback for offline only.
//     HTML is effectively uncached on good connections — this guarantees
//     returning students always get markup that references the CURRENT
//     `_next/static/chunks/*` hashes. SWR on HTML was the v5 bug: after a
//     deploy, cached HTML pointed at chunks Vercel had already replaced,
//     hydration 404'd, and the browser showed "This page couldn't load".
//   • Static assets (fonts, images, chunks when they ARE cached): SWR.
//     These are immutable at their hashed URLs so caching is always safe.
//   • Network-only for /api, /admin, /connect, and auth-sensitive URLs.
//
// v5 → v6: bumped cache name to purge the stale module HTML from every
// returning student's disk. `activate` below cascades the delete.

const CACHE_NAME = "ifp105-v6";

// The offline shell — ONE page we fall back to when the user is fully
// offline and hitting a route we haven't seen yet. Module routes are NOT
// pre-cached anymore (that's what broke v5 after the Phase 3 deploy).
const OFFLINE_SHELL = ["/"];

// Routes the SW must NEVER serve from cache — either because they return
// per-user data or because stale HTML would break admin flows.
const NO_CACHE_PATH_PREFIXES = [
  "/api/",
  "/admin",
  "/connect",
  "/profile/edit",
  "/batches/", // individual batch pages include personalized CTAs
];

function isAuthSensitive(url) {
  try {
    const u = new URL(url);
    return NO_CACHE_PATH_PREFIXES.some((p) => u.pathname.startsWith(p));
  } catch {
    return true; // fail closed
  }
}

// Is this a top-level HTML navigation? We detect via `mode === "navigate"`
// on the Request (set by the browser for page loads) OR via Accept header
// including "text/html" as a fallback for cases mode isn't populated.
function isHtmlNavigation(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

// Install — pre-cache the offline shell only.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_SHELL))
  );
  self.skipWaiting();
});

// Activate — drop every non-current cache. Bumping CACHE_NAME above is
// what forces this path on returning students, wiping the broken v5
// HTML entries that pointed at dead chunk URLs.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch handler. Two distinct strategies: network-first for HTML,
// stale-while-revalidate for cacheable static assets.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (isAuthSensitive(request.url)) return;

  // ─── HTML navigations: network-first ───────────────────────────
  // Returning the freshest HTML means every hydration always resolves
  // against the current chunk bundle. The cache is only touched as an
  // offline fallback.
  if (isHtmlNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(request);
          // Refresh the offline shell in the background so we have
          // something to show on true network failures.
          if (net && net.ok && net.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            cache.put("/", net.clone()).catch(() => {});
          }
          return net;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const shell = await cache.match("/");
          if (shell) return shell;
          return new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // ─── Static assets: stale-while-revalidate ─────────────────────
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkPromise = fetch(request)
        .then((response) => {
          // Only cache successful, non-opaque responses. 4xx/5xx are
          // skipped so a transient server hiccup doesn't pin a broken
          // asset into cache.
          if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkPromise);
        return cached;
      }

      const net = await networkPromise;
      if (net) return net;
      return new Response("Offline", { status: 503 });
    })
  );
});
