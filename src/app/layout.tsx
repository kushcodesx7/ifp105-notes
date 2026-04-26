import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AdminBarMount from "@/components/admin/AdminBarMount";
import BroadcastBanner from "@/components/BroadcastBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getCurrentCourse } from "@/lib/course-registry";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

// metadataBase silences Next 16 warnings and makes absolute URLs work for
// OG cards on LinkedIn/Telegram/etc. Override via NEXT_PUBLIC_SITE_URL
// if we ever move off Vercel.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ifp105-notes.vercel.app";

// SEO / OG / Twitter metadata derived from the course registry so the
// moment the teacher renames "IFP105 — ICT Fundamentals" → "Python101
// — Intro to Python" in the registry, every social preview follows.
// `pageTitle` stays in the `<code> — <name>` format matching the
// previous hardcoded string.
const currentCourse = getCurrentCourse();
const pageTitle = `${currentCourse.code} — ${currentCourse.name}`;
const pageDescription = `Interactive study notes for ${currentCourse.name}. Built for IFS students at Amity Tashkent.`;
const ogDescription = `Interactive modules with quizzes, analogies, cheat sheets, and progress tracking. Built for IFS students at Amity Tashkent.`;
const twitterDescription = `Interactive modules with quizzes, cheat sheets, and a Bloom's Taxonomy thinking profile.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: ogDescription,
    type: "website",
    siteName: currentCourse.code,
    url: SITE_URL,
    // OG image is generated at request time by src/app/opengraph-image.tsx
    // (Next.js file convention) — pulls live course code + name from
    // the course-registry. No static /public/og-cover.png to maintain.
    // The file convention adds itself to openGraph.images automatically,
    // so we don't declare `images` here.
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: twitterDescription,
    // `twitter-image.tsx` convention would mirror this, but Twitter +
    // Telegram both fall back to openGraph.images when
    // twitter.images is absent, so we let the OG generator serve both.
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="bg-[#09090F] text-white overflow-x-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
          Skip to content
        </a>
        <AuthProvider>
          <ServiceWorkerRegister />
          {/* Phase 6: floating admin bar. Dynamically imported so
              non-admin users never download the chunk. Must sit inside
              AuthProvider since it reads the signed-in user. */}
          <AdminBarMount />
          {/* Live-class broadcast banner. Renders a fixed-top
              attention pill on every page when the teacher pushes a
              message via /admin. Self-suppresses on /admin routes so
              the teacher doesn't see their own broadcast. */}
          <BroadcastBanner />
          {children}
          {/* Vercel Speed Insights — sends anonymous Core Web Vitals
              (LCP / CLS / INP / TTFB) from real student devices to
              the Vercel dashboard at /speed-insights. ~3KB chunk,
              one beacon per pageview, no PII. Lets us see actual
              perf in Tashkent's network conditions vs. synthetic
              Lighthouse scores.

              Skipped in development: Vercel's debug script lives at
              va.vercel-scripts.com which most ad-blockers (and
              Next.js dev's CSP) reject — that triggers a red "1 Issue"
              badge in the dev overlay every page load. Production
              behaviour is unaffected. */}
          {process.env.NODE_ENV === "production" && <SpeedInsights />}
        </AuthProvider>
      </body>
    </html>
  );
}
