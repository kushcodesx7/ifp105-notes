// IFP105 service worker — v4
//
// Strategy:
//   • stale-while-revalidate for HTML navigations and cached static assets
//     (cache first, refresh in background) — gives instant loads on flaky
//     mobile networks while still picking up new builds within one visit.
//   • network-only for /api, /admin, /connect, and auth-sensitive URLs.
//     These routes contain personalized / PII data that must never be
//     served to the wrong user from a shared cache.
//   • skip anything that isn't http(s) GET on our own origin.
//
// Bump CACHE_NAME on every cache-shape change so old clients purge cleanly.

const CACHE_NAME = "ifp105-v4";
const STATIC_ASSETS = [
  "/",
  "/module/1",
  "/module/2",
  "/module/3",
  "/module/4",
  "/module/5",
];

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

// Install — pre-cache essential pages.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — drop old cache names.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — SWR for public GETs, network-only for the rest.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (isAuthSensitive(request.url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkPromise = fetch(request)
        .then((response) => {
          // Only cache successful, non-opaque responses.
          if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        // Fire and forget network refresh; users see cache instantly.
        event.waitUntil(networkPromise);
        return cached;
      }

      // No cache entry yet — await the network, fall back to offline shell.
      const net = await networkPromise;
      if (net) return net;
      if (request.mode === "navigate") {
        const home = await cache.match("/");
        if (home) return home;
      }
      return new Response("Offline", { status: 503 });
    })
  );
});
