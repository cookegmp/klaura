"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  currentCategory?: string;
  currentEra?: string;
  categories: string[];
  eras: string[];
}

export function VintageFilters({
  currentCategory,
  currentEra,
  categories,
  eras,
}: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  function hrefFor(key: "category" | "era", value: string | null): string {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterRow
        label="Category"
        items={categories}
        current={currentCategory}
        hrefFor={(v) => hrefFor("category", v)}
      />
      {eras.length > 0 && (
        <FilterRow
          label="Era"
          items={eras}
          current={currentEra}
          hrefFor={(v) => hrefFor("era", v)}
        />
      )}
    </div>
  );
}

function FilterRow({
  label,
  items,
  current,
  hrefFor,
}: {
  label: string;
  items: string[];
  current?: string;
  hrefFor: (value: string | null) => string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
      <span className="text-caption text-ink-soft min-w-20">{label}</span>
      <Link
        href={hrefFor(null)}
        className={cn(
          "text-ui pb-1 border-b transition-colors capitalize",
          !current ? "border-ochre text-ink" : "border-transparent text-ink-soft hover:text-ink"
        )}
      >
        All
      </Link>
      {items.map((item) => (
        <Link
          key={item}
          href={hrefFor(item)}
          className={cn(
            "text-ui pb-1 border-b transition-colors capitalize",
            current === item
              ? "border-ochre text-ink"
              : "border-transparent text-ink-soft hover:text-ink"
          )}
        >
          {item.replace(/-/g, " ")}
        </Link>
      ))}
    </div>
  );
}
