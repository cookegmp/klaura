import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { formatPriceUSD } from "@/lib/utils";
import type { VintageItem } from "@/types/sanity";

interface VintageCardProps {
  item: VintageItem;
  index?: number;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function VintageCard({ item, index = 0 }: VintageCardProps) {
  const sold = item.status === "sold";
  const numeral = ROMAN[index] ?? `${index + 1}`;

  return (
    <Link
      href={`/vintage/${item.slug.current}`}
      className="group block border border-rule p-3 hover:border-bone transition-colors"
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-tag">no. {String(index + 1).padStart(2, "0")}</span>
        <span className="text-roman" aria-hidden>{numeral}</span>
      </div>

      <div className={`relative w-full aspect-square overflow-hidden bg-ink ${sold ? "sold-overlay" : ""}`}>
        <ProductImage
          image={item.primaryImage}
          alt={item.primaryImage?.alt ?? item.title}
          seed={item._id}
          width={600}
          height={600}
          sizes="(min-width: 768px) 18rem, 45vw"
          className="transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
        />
        {sold && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-tag bg-bone text-ink px-3 py-1">
            sold
          </span>
        )}
      </div>

      <hr className="my-3 border-0 border-t border-rule" aria-hidden />

      <div className="text-center pb-1">
        <h3 className="font-display-italic text-bone text-base md:text-lg leading-tight capitalize">
          {item.title}
        </h3>
        <p className="text-tag mt-1.5 capitalize">
          {item.era ?? "—"} · {item.condition.replace("-", " ")}
        </p>
        {!sold && (
          <p className="text-meta mt-1.5">{formatPriceUSD(item.price)}</p>
        )}
      </div>
    </Link>
  );
}
