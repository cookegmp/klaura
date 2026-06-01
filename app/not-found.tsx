import Link from "next/link";
import { Container } from "@/components/site/Container";

export default function NotFound() {
  return (
    <Container width="narrow" className="py-32 md:py-48 text-center">
      <p className="text-meta mb-6">404</p>
      <h1 className="font-display font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] tracking-[-0.02em]">
        Lost in the <span className="font-display-italic">trees</span>.
      </h1>
      <p className="mt-8 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
        We couldn&apos;t find what you were looking for. Maybe the piece sold, or the link
        wandered off.
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link
          href="/paintings"
          className="text-ui px-7 py-4 bg-bone text-ink hover:bg-bone-deep transition-colors"
        >
          See the paintings
        </Link>
        <Link
          href="/"
          className="text-ui px-7 py-4 border border-bone hover:bg-bone hover:text-ink transition-colors"
        >
          Home
        </Link>
      </div>
    </Container>
  );
}
