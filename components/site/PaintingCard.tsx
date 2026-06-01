import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { formatPriceUSD } from "@/lib/utils";
import type { Painting } from "@/types/sanity";

interface PaintingCardProps {
  painting: Painting;
  /** Index in the grid — drives vertical offset for the editorial layout. */
  index?: number;
  sizes?: string;
}

export function PaintingCard({ painting, index = 0, sizes }: PaintingCardProps) {
  const sold = painting.status === "sold";
  const aspect =
    painting.dimensions.widthInches / painting.dimensions.heightInches;

  // index kept in the signature so callers can still pass it for future use
  // (e.g., LCP priority); the editorial vertical offset was removed when
  // the grid moved to a uniform 2-col dense layout matching the reference.
  void index;

  return (
    <Link
      href={`/paintings/${painting.slug.current}`}
      className="group block"
    >
      <div
        className={`relative overflow-hidden ${sold ? "sold-overlay" : ""}`}
        style={{ aspectRatio: aspect }}
      >
        <ProductImage
          image={painting.primaryImage}
          alt={painting.primaryImage?.alt ?? painting.title}
          seed={painting._id}
          width={800}
          height={Math.round(800 / aspect)}
          sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
        />
        {sold && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-ink bg-bone/85 px-4 py-2">
            Sold
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div className="flex flex-col gap-0.5">
          <p className="font-display-italic text-bone text-xl leading-tight">
            {painting.title}
          </p>
          <p className="text-meta">
            {painting.medium} · {painting.dimensions.heightInches} ×{" "}
            {painting.dimensions.widthInches} in
          </p>
        </div>
        {!sold && (
          <p className="text-meta text-bone shrink-0">
            {formatPriceUSD(painting.price)}
          </p>
        )}
      </div>
    </Link>
  );
}
