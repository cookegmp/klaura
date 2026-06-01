"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/site/Container";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry will pick this up via the global handler when DSN is set.
    console.error("[route-error]", error);
  }, [error]);

  return (
    <Container width="narrow" className="py-32 md:py-48 text-center">
      <p className="text-ui text-bone-deep mb-6">500</p>
      <h1 className="font-display font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] tracking-[-0.02em]">
        Something <span className="font-display-italic text-ochre-deep">slipped</span>.
      </h1>
      <p className="mt-8 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
        Sorry — the page didn&apos;t load. Try again, and if it keeps happening, write to
        Kelly directly.
      </p>
      {error.digest && (
        <p className="text-caption text-bone-deep/70 mt-6">Reference: {error.digest}</p>
      )}
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="text-ui px-7 py-4 bg-bone text-ink hover:bg-ochre-deep transition-colors"
        >
          Try again
        </button>
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
