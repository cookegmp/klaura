import type { Metadata } from "next";
import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Vintage",
  description: "One-of-a-kind vintage clothing, curated by Kelly Laaura.",
};

export default function VintageIndexPage() {
  return (
    <Container width="wide" className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">The rack</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          Vintage, <span className="font-display-italic text-ochre-deep">found slowly</span>.
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
          Catalog loads from Sanity in Phase 2. Each piece is sold once.
        </p>
      </header>
    </Container>
  );
}
