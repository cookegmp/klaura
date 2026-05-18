import type { Metadata } from "next";
import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Studio",
  description: "About Kelly Laaura — practice, place, and process.",
};

export default function StudioPage() {
  return (
    <Container className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">About</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          The <span className="font-display-italic text-ochre-deep">studio</span>.
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
          Editorial long-form pulled from the Sanity About singleton in Phase 2.
        </p>
      </header>
    </Container>
  );
}
