import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import type { Painting, VintageItem, CommissionExample } from "@/types/sanity";

interface SectionTilesProps {
  /** First image is used for the Commissions tile. */
  commissionsExample?: CommissionExample | null;
  /** Used for the Gallery tile — the hero painting. */
  galleryHero?: Painting | null;
  /** Used for the Shop tile. May be a placeholder when no vintage photo exists. */
  shopHero?: VintageItem | Painting | null;
}

interface Tile {
  index: string;
  label: string;
  href: string;
  description: string;
  cta: string;
  image: Painting["primaryImage"] | VintageItem["primaryImage"] | CommissionExample["image"] | undefined;
  alt: string;
  seed: string;
  /** y-offset in rem applied via translate-y; creates the editorial cascade. */
  offset?: number;
}

/**
 * Three-tile editorial grid replacing the previous two-section split.
 * Layout cribbed from the reference image: large rounded landscape tiles
 * with vertical offsets between columns, small monospaced index + label
 * sitting directly below the image. Bone palette per Kelly's direction.
 *
 * Section URLs are unchanged — these tiles only relabel the destinations
 * for the editorial composition (Paintings → Gallery, Vintage → Shop).
 */
export function SectionTiles({
  commissionsExample,
  galleryHero,
  shopHero,
}: SectionTilesProps) {
  const tiles: Tile[] = [
    {
      index: "001",
      label: "Commissions",
      href: "/commissions",
      description:
        "A painting of your place — quiet hours of looking, made for you.",
      cta: "Begin an inquiry",
      image: commissionsExample?.image,
      alt:
        commissionsExample?.title
          ? `Past commission — ${commissionsExample.title}`
          : "Past commission",
      seed: commissionsExample?._id ?? "tile-commissions",
      offset: 0,
    },
    {
      index: "002",
      label: "Gallery",
      href: "/paintings",
      description:
        "Original paintings, sold once. Studio practice & finished work.",
      cta: "Enter the gallery",
      image: galleryHero?.primaryImage,
      alt:
        galleryHero?.primaryImage?.alt ??
        galleryHero?.title ??
        "Featured painting",
      seed: galleryHero?._id ?? "tile-gallery",
      offset: 5, // drop the middle column slightly — editorial cascade
    },
    {
      index: "003",
      label: "Shop",
      href: "/vintage",
      description:
        "One-of-a-kind vintage clothing, refreshed slowly through the year.",
      cta: "Browse the rack",
      image: shopHero?.primaryImage,
      alt:
        shopHero?.primaryImage?.alt ??
        shopHero?.title ??
        "Vintage piece",
      seed: shopHero?._id ?? "tile-shop",
      offset: 10,
    },
  ];

  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-8 lg:gap-x-12">
      {tiles.map((t) => (
        <li
          key={t.index}
          className="group"
          style={{ transform: `translateY(${t.offset ?? 0}rem)` }}
        >
          <Link href={t.href} className="block">
            {/* Image — rounded, hover scale, landscape aspect like the reference */}
            <div className="relative overflow-hidden rounded-2xl aspect-[5/4] md:aspect-[4/3] bg-bone-deep">
              <ProductImage
                image={t.image}
                alt={t.alt}
                seed={t.seed}
                width={1200}
                height={900}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="transition-transform duration-[800ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
              />
            </div>

            {/* Index + label line — reference image typography */}
            <div className="mt-5 flex items-baseline justify-between font-[family-name:var(--font-mono)] text-[0.78rem] tracking-[0.04em] uppercase text-ink-soft">
              <span className="text-ink">{t.label}</span>
              <span>{t.index}</span>
            </div>

            {/* Description — Fraunces, sized for readability */}
            <p className="mt-3 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed max-w-xs">
              {t.description}
            </p>

            {/* CTA — small underlined link with the existing ochre-deep hover */}
            <span className="mt-5 inline-block text-ui border-b border-ink pb-1 group-hover:text-ochre-deep group-hover:border-ochre-deep transition-colors">
              {t.cta} →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
