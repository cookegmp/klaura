"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  currentStatus?: string;
  availableCount: number;
  soldCount: number;
}

export function PaintingsFilters({ currentStatus, availableCount, soldCount }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  function hrefFor(status: string | null): string {
    const next = new URLSearchParams(params.toString());
    if (status) next.set("status", status);
    else next.delete("status");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const total = availableCount + soldCount;
  const buttons: { value: string | null; label: string; count: number }[] = [
    { value: null, label: "All", count: total },
    { value: "available", label: "Available", count: availableCount },
    { value: "sold", label: "Sold", count: soldCount },
  ];

  return (
    <nav aria-label="Filter paintings" className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
      {buttons.map((b) => {
        const active = currentStatus === b.value || (currentStatus == null && b.value == null);
        return (
          <Link
            key={b.label}
            href={hrefFor(b.value)}
            className={cn(
              "text-ui inline-flex items-baseline gap-2 py-3 min-h-11 border-b transition-colors",
              active
                ? "border-ochre-deep text-ink"
                : "border-transparent text-ink-soft hover:text-ink hover:border-rule"
            )}
          >
            <span>{b.label}</span>
            <span className="text-caption text-ink-soft/70 not-italic">({b.count})</span>
          </Link>
        );
      })}
    </nav>
  );
}
