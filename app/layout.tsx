import type { Metadata } from "next";
import { Cormorant_Garamond, Inter_Tight, Space_Mono } from "next/font/google";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

// Cormorant Garamond — elegant Garamond revival driving the dark editorial
// feel. Its true italic is the cursive accent the design system depends on.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

// Space Mono — used sparingly as the index/label treatment under the
// home page section tiles (charter §design_system permits a deliberate
// monospace accent for the editorial tile composition).
const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${interTight.variable} ${spaceMono.variable}`}
    >
      <body className="bg-ink text-bone antialiased flex min-h-dvh flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
