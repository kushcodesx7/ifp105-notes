import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ifp105-notes.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/connect`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/batches`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const moduleRoutes: MetadataRoute.Sitemap = [1, 2, 3, 4, 5].map((n) => ({
    url: `${base}/module/${n}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...moduleRoutes];
}
