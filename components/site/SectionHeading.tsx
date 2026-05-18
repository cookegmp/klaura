import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  italicWord,
  align = "left",
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  /** A single word/phrase inside `title` to render italic Fraunces. */
  italicWord?: string;
  align?: "left" | "right";
  description?: ReactNode;
  className?: string;
}) {
  const renderedTitle = italicWord ? renderWithItalic(title, italicWord) : title;

  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        align === "right" && "items-end text-right",
        className
      )}
    >
      {eyebrow && (
        <span className="text-ui text-ink-soft">{eyebrow}</span>
      )}
      <h2 className="font-display text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em] font-light">
        {renderedTitle}
      </h2>
      {description && (
        <p className="max-w-xl text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}

function renderWithItalic(title: string, word: string): ReactNode {
  const idx = title.indexOf(word);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="font-display-italic">{word}</span>
      {title.slice(idx + word.length)}
    </>
  );
}
