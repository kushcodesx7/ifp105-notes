import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "IFP105 — ICT Study Notes",
  description:
    "Interactive study notes for Information & Communication Technology. Built for IFS students at Amity Tashkent.",
  openGraph: {
    title: "IFP105 — ICT Study Notes",
    description:
      "Interactive modules with quizzes, analogies, cheat sheets, and progress tracking. Built for IFS students at Amity Tashkent.",
    type: "website",
    siteName: "IFP105",
    url: SITE_URL,
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "IFP105 — ICT Study Notes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IFP105 — ICT Study Notes",
    description:
      "Interactive modules with quizzes, cheat sheets, and a Bloom's Taxonomy thinking profile.",
    images: ["/og-cover.png"],
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
