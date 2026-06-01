import type { ReactNode } from "react";
import { Container } from "@/components/site/Container";

export function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Container width="narrow" className="py-20 md:py-32">
      <header className="mb-16">
        <p className="text-ui text-bone-deep mb-6">Legal</p>
        <h1 className="font-display font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] tracking-[-0.02em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-[length:var(--text-body-lg)] text-bone-deep">{subtitle}</p>
        )}
      </header>
      <article className="prose-legal space-y-6 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
        {children}
      </article>
    </Container>
  );
}
