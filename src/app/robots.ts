import type { MetadataRoute } from "next";

// Public-facing robots policy.
//
// Allow indexing of the main learning pages but keep /admin, /profile,
// and internal /api routes out of search engines. The Bloom's profile
// radar page is user-specific — no point indexing.
export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ifp105-notes.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/module/", "/connect", "/batches/"],
        disallow: ["/admin", "/profile/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
