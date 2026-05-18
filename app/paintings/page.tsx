import type { Metadata } from "next";
import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Paintings",
  description: "Original paintings by Kelly Laaura. Each work is one of one.",
};

export default function PaintingsIndexPage() {
  return (
    <Container width="wide" className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">The gallery</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          Paintings <span className="font-display-italic text-ochre-deep">in progress</span>.
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
          Wired in Phase 2 — the editorial grid renders from Sanity once content is loaded.
        </p>
      </header>
    </Container>
  );
}
