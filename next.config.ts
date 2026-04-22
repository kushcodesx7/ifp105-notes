import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,
  poweredByHeader: false,

  // Tree-shake deep imports from framer-motion + the OAuth libs. Saves
  // ~20% of framer's transferred bytes and trims the initial bundle.
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@react-oauth/google",
      "swr",
    ],
  },

  // Allow `<Image>` to render course-content bucket URLs that Phase 5's
  // block editor writes into topic content_json. The hostname pattern
  // is any *.supabase.co — matching the project subdomain and the
  // forwarded `/storage/v1/object/public/...` path. Without this,
  // next/image bails with "hostname not configured" and the student
  // sees a broken image.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Security + caching headers. The /(.*) block is the site-wide
  // baseline — browsers get these on every response (HTML, API,
  // everything under the origin). Asset-specific cache headers follow.
  //
  // CSP rationale (2026-04-22 lockdown):
  //   - default-src 'self': block any resource we haven't explicitly
  //     allowed. Hard failure mode, not report-only, because we have
  //     no way to collect violation reports from the user's class
  //     network.
  //   - script-src: 'self' + Google OAuth + Google APIs for the GIS
  //     library that powers sign-in. 'unsafe-inline' is required by
  //     Next.js 16's client manifest and Framer Motion; removing it
  //     breaks the app. That's acceptable because our sanitize-html
  //     layer strips script tags + on* handlers on write, so there
  //     is no DB path that would render attacker-controlled inline JS.
  //   - style-src 'unsafe-inline': Framer Motion writes per-frame
  //     inline styles. Can't ship without it.
  //   - img-src: 'self' + data: (SVG icons) + blob: (photo uploads
  //     preview) + https: (Google avatars, LinkedIn photos). The
  //     https: wildcard is intentional — avatars come from many
  //     third-party hosts and allow-listing each one would break
  //     students whose LinkedIn moved CDNs.
  //   - connect-src: API + Supabase + Google OAuth. No analytics host.
  //   - frame-src: just Google OAuth (the sign-in popup).
  //   - frame-ancestors 'none': supersedes X-Frame-Options DENY.
  //   - object-src 'none': blocks <object>, <embed> Flash-era holes.
  //   - base-uri 'self': stops <base href> injection redirecting
  //     relative URLs.
  //   - form-action 'self': forms can only POST to our origin.
  //   - upgrade-insecure-requests: forces http→https for any
  //     accidental mixed-content URL in DB content_json.
  //
  // If a legitimate feature stops working after this ships, widen the
  // matching directive — do NOT remove CSP entirely.
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          // Forces HTTPS for a full year on this host + subdomains.
          // Vercel terminates TLS so this is safe. `preload` is
          // intentionally omitted — opting into the HSTS preload
          // list is a one-way ticket and we don't want to block the
          // project switching to a custom apex domain in the future.
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          // Deny access to sensors + payment/USB APIs the app never
          // uses. Reduces the blast radius of a compromised script
          // tag before CSP catches it.
          key: "Permissions-Policy",
          value:
            "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), fullscreen=(self)",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co https://accounts.google.com https://oauth2.googleapis.com",
            "frame-src https://accounts.google.com",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
          ].join("; "),
        },
      ],
    },
    {
      // Cache images for 1 year
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache fonts for 1 year
      source: "/:path*.woff2",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Never let the service worker file itself be HTTP-cached. Browsers
      // bypass the HTTP cache for /sw.js on update checks by default, but
      // only after a 24-hour window — which means a stale v5 SW could
      // keep serving broken HTML for a full day post-deploy. Setting
      // no-cache on the file ensures the very next visit picks up a new
      // SW version and triggers the install → activate → cache-purge
      // flow immediately.
      source: "/sw.js",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
  ],
};

export default nextConfig;
