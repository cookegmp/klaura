import type { Metadata } from "next";
import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Commissions",
  description: "Commission a painting from Kelly Laaura.",
};

export default function CommissionsPage() {
  return (
    <Container className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">Commissions</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          A painting <span className="font-display-italic text-ochre-deep">for your place</span>.
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
          Inquiry form, process, and examples wired in Phase 4.
        </p>
      </header>
    </Container>
  );
}
