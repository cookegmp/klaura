import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import type { Painting } from "@/types/sanity";

interface PaintingCardProps {
  painting: Painting;
  index?: number;
  sizes?: string;
}

/**
 * Framed plate. Image inside a thin beige border, a hairline rule, then the
 * italic title — and nothing else. Medium, dimensions and price are kept off
 * the card; they live on the painting detail page.
 */
export function PaintingCard({ painting, sizes }: PaintingCardProps) {
  const sold = painting.status === "sold";

  return (
    <Link
      href={`/paintings/${painting.slug.current}`}
      className="group block border border-rule p-3 hover:border-bone transition-colors"
    >
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
      </div>
    </Link>
  );
}
