import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@/types/sanity";

/**
 * Portable Text renderer scoped to the kellylaura look. Headings stay in
 * Fraunces, body in Inter Tight; the italic accent is reserved for the
 * `em` decorator (charter §pairing_rule).
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-[length:var(--text-display-md)] leading-[1.1] tracking-[-0.02em] font-light mt-12">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-2xl leading-snug font-light mt-8">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-ochre pl-6 italic text-bone-deep my-8">
        {children}
      </blockquote>
    ),
  },
  marks: {
    em: ({ children }) => <span className="font-display-italic text-ochre-deep">{children}</span>,
    strong: ({ children }) => <strong className="font-medium text-bone">{children}</strong>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bone underline decoration-ochre underline-offset-2 hover:text-ochre-deep transition-colors"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 space-y-2">{children}</ol>,
  },
};

export function PortableContent({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
