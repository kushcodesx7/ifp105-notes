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

  // Cache static assets aggressively
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
