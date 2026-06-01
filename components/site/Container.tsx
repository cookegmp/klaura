import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "default" | "wide" | "bleed";

// Narrow archival-scrapbook column. The reference design is built around
// a single tight column even on desktop — wide layouts break the magazine
// feel. "default" is the page column; "wide" reserved for grid sections.
const widthClass: Record<Width, string> = {
  narrow: "max-w-[34rem]",
  default: "max-w-[40rem]",
  wide: "max-w-[64rem]",
  bleed: "max-w-none",
};

export function Container({
  children,
  width = "default",
  className,
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full px-5 md:px-8", widthClass[width], className)}>
      {children}
    </div>
  );
}
