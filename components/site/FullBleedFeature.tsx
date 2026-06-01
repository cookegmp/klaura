import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Parallax } from "@/components/site/Parallax";
import type { Painting } from "@/types/sanity";
import { formatDimensions, formatPriceUSD } from "@/lib/utils";

/**
 * Edge-to-edge feature painting. The image is taller than the viewport;
 * the Parallax wrapper drifts it as the user scrolls past, giving a slow
 * cinematic reveal. A mono caption overlays the bottom-right.
 *
 * Sits between the hero and Selected Works on the home page — its job is
 * to make scroll do something visible.
 */
export function FullBleedFeature({ painting }: { painting: Painting }) {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-ink">
      <Parallax amount={0.25} className="absolute inset-0">
        <div className="relative w-full h-[140vh] -translate-y-[20vh]">
          <ProductImage
            image={painting.primaryImage}
            alt={painting.primaryImage?.alt ?? painting.title}
            seed={`feature-${painting._id}`}
            width={2400}
            height={3000}
            sizes="100vw"
            className="!h-full w-full object-cover"
          />
        </div>
      </Parallax>

      {/* Vignette + caption overlay — dark wash bottom + soft dark wash
          top so caption metadata stays legible on any cover. */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink/85 via-transparent to-ink/35" />

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 md:px-12 lg:px-20 pb-10 md:pb-16">
        <div className="flex flex-wrap items-end justify-between gap-y-4 gap-x-12 text-bone">
          <Link
            href={`/paintings/${painting.slug.current}`}
            className="font-display-italic font-normal text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.02em] max-w-3xl"
          >
            {painting.title}
          </Link>
          <div className="text-meta text-bone-deep flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <span>{painting.year}</span>
            <span>{painting.medium}</span>
            <span>{formatDimensions(painting.dimensions)}</span>
            <span className="text-bone">
              {painting.status === "sold" ? "Sold" : formatPriceUSD(painting.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Top tag */}
      <div className="absolute top-8 md:top-12 left-6 md:left-12 lg:left-20 z-10">
        <p className="text-meta text-bone-deep">
          § Now on the wall · {painting.year}
        </p>
      </div>
    </section>
  );
}
