"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared accordion for "Shipping & care", "Notes on vintage sizing", etc.
 * Reuses the underline-on-hover treatment from nav for consistency.
 */
export function Disclosure({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-rule py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-ui text-bone"
      >
        <span>{label}</span>
        <span aria-hidden className="font-display text-2xl leading-none">
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-[var(--ease-editorial)]",
          open ? "grid-rows-[1fr] mt-5" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="text-bone-deep leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
