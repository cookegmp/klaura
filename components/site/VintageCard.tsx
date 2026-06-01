import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { formatPriceUSD } from "@/lib/utils";
import type { VintageItem } from "@/types/sanity";

interface VintageCardProps {
  item: VintageItem;
  index?: number;
}

export function VintageCard({ item, index = 0 }: VintageCardProps) {
  const sold = item.status === "sold";

  return (
    <Link
      href={`/vintage/${item.slug.current}`}
      className="group block"
      style={{ transform: index % 3 === 2 ? "translateY(2rem)" : undefined }}
    >
      <div className={`relative overflow-hidden aspect-[4/5] ${sold ? "sold-overlay" : ""}`}>
        <ProductImage
          image={item.primaryImage}
          alt={item.primaryImage?.alt ?? item.title}
          seed={item._id}
          width={800}
          height={1000}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
        />
        {sold && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-ink bg-bone/85 px-4 py-2">
            Sold
          </span>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="font-display text-lg leading-tight">{item.title}</p>
          <p className="text-caption text-bone-deep capitalize">
            {item.era ?? "—"} · {item.category} · {item.condition.replace("-", " ")}
          </p>
        </div>
        {!sold && (
          <p className="text-ui text-bone shrink-0">{formatPriceUSD(item.price)}</p>
        )}
      </div>
    </Link>
  );
}
