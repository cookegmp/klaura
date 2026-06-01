import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { formatPriceUSD } from "@/lib/utils";
import type { Painting } from "@/types/sanity";

interface PaintingCardProps {
  painting: Painting;
  index?: number;
  sizes?: string;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Framed plate. Image inside a thin beige border, hairline rule, italic
 * title centered with a Roman numeral, tiny meta caption below. Matches
 * the archival-scrapbook fragrance-card pattern in the reference design.
 */
export function PaintingCard({ painting, index = 0, sizes }: PaintingCardProps) {
  const sold = painting.status === "sold";
  const numeral = ROMAN[index] ?? `${index + 1}`;

  return (
    <Link
      href={`/paintings/${painting.slug.current}`}
      className="group block border border-rule p-3 hover:border-bone transition-colors"
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-tag">no. {String(index + 1).padStart(2, "0")}</span>
        <span className="text-roman" aria-hidden>{numeral}</span>
      </div>

      <div
        className={`relative w-full aspect-square overflow-hidden bg-ink ${sold ? "sold-overlay" : ""}`}
      >
        <ProductImage
          image={painting.primaryImage}
          alt={painting.primaryImage?.alt ?? painting.title}
          seed={painting._id}
          width={600}
          height={600}
          sizes={sizes ?? "(min-width: 768px) 18rem, 45vw"}
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
        <h3 className="font-display-italic text-bone text-base md:text-lg leading-tight">
          {painting.title}
        </h3>
        <p className="text-tag mt-1.5">
          {painting.medium} · {painting.dimensions.heightInches}×{painting.dimensions.widthInches} in
        </p>
        {!sold && (
          <p className="text-meta mt-1.5">{formatPriceUSD(painting.price)}</p>
        )}
      </div>
    </Link>
  );
}
