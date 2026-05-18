import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false },
};

export default function CheckoutCancelPage() {
  return (
    <Container width="narrow" className="py-32 md:py-48 text-center">
      <p className="text-ui text-ink-soft mb-6">No worries</p>
      <h1 className="font-display font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] tracking-[-0.02em]">
        Checkout <span className="font-display-italic">paused</span>.
      </h1>
      <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
        Your piece is held for the next 30 minutes — pick up where you left off, or
        keep looking.
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link
          href="/paintings"
          className="text-ui px-7 py-4 bg-ink text-bone hover:bg-ochre-deep transition-colors"
        >
          Back to the gallery
        </Link>
        <Link
          href="/"
          className="text-ui px-7 py-4 border border-ink hover:bg-ink hover:text-bone transition-colors"
        >
          Home
        </Link>
      </div>
    </Container>
  );
}
