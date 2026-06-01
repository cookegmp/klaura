import type { Metadata } from "next";
import { Bodoni_Moda, Inter_Tight, Pinyon_Script } from "next/font/google";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

// Bodoni Moda — the high-contrast Didone serif the reference design
// (documentation/samples/Screenshot.png) is built on. Hairline thin
// strokes against thick verticals, dramatic italic — the actual font
// family of "MZIA" / "Our Fragrances" / "Leather & Patchouli" voice.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

// Pinyon Script — copperplate cursive used only for the artist's name on
// the intro hero. Romantic, slightly gothic in spirit. Never used for
// body or section copy.
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pinyon",
  weight: ["400"],
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
      className={`${bodoni.variable} ${interTight.variable} ${pinyon.variable}`}
    >
      <body className="bg-ink text-bone antialiased flex min-h-dvh flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
