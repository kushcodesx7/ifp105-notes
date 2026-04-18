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
  ],
};

export default nextConfig;
