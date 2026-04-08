import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: "IFP105 — ICT Study Notes",
  description: "Interactive study notes for Information & Communication Technology. Built for IFP students at Amity Tashkent.",
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
        {children}
      </body>
    </html>
  );
}
