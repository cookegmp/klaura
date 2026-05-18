import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Studio is desktop-first; let it manage its own viewport sizing.
  width: "device-width",
  initialScale: 1,
};

export default function StudioCatchallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
