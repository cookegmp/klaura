import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import type { Painting } from "@/types/sanity";
import { formatDimensions, formatPriceUSD } from "@/lib/utils";

/**
 * Curated showcase of selected paintings. Takes the first painting as the
 * featured hero (wide tile, full visual weight) and lays out the remaining
 * four in a varied grid below, with cascading vertical offsets so the
 * composition reads as deliberate rather than templated.
 *
 * Mirrors the Galleria template's "Selected Works" section — one
 * dominant work, several supporting works, all clickable through to the
 * detail page.
 */
export function SelectedWorks({ paintings }: { paintings: Painting[] }) {
  if (paintings.length === 0) return null;
  const [feature, ...rest] = paintings;
  if (!feature) return null;

  return (
    <div className="space-y-20 md:space-y-32">
      {/* Featured work — large, full-bleed-feeling */}
      <Reveal rise={48}>
        <Link
          href={`/paintings/${feature.slug.current}`}
          className="group block"
        >
          <div className="relative w-full overflow-hidden aspect-[16/10]">
            <ProductImage
              image={feature.primaryImage}
              alt={feature.primaryImage?.alt ?? feature.title}
              seed={feature._id}
              width={2000}
              height={1250}
              sizes="(min-width: 1024px) 90vw, 100vw"
              className="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.02]"
            />
          </div>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 md:gap-12">
            <h3 className="font-display text-3xl md:text-5xl font-light leading-[1.05] tracking-[-0.02em]">
              {feature.title}
            </h3>
            <div className="flex items-baseline gap-6 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.06em] text-ink-soft">
              <span>{feature.year}</span>
              <span>{feature.medium}</span>
              <span>{formatDimensions(feature.dimensions)}</span>
              {feature.status === "sold" ? (
                <span className="text-ink">Sold</span>
              ) : (
                <span className="text-ink">{formatPriceUSD(feature.price)}</span>
              )}
            </div>
          </div>
        </Link>
      </Reveal>

      {/* Supporting works — 2-up grid with deliberate vertical offsets */}
      {rest.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-20 md:gap-x-20 md:gap-y-32">
          {rest.map((p, i) => (
            <Reveal
              key={p._id}
              as="li"
              delay={i * 80}
              rise={48}
              className={i % 2 === 1 ? "md:translate-y-24" : ""}
            >
              <Link
                href={`/paintings/${p.slug.current}`}
                className="group block"
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{
                    aspectRatio:
                      p.dimensions.widthInches / p.dimensions.heightInches,
                  }}
                >
                  <ProductImage
                    image={p.primaryImage}
                    alt={p.primaryImage?.alt ?? p.title}
                    seed={p._id}
                    width={1100}
                    height={Math.round(
                      1100 *
                        (p.dimensions.heightInches / p.dimensions.widthInches)
                    )}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="transition-transform duration-[1000ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                  />
                  {p.status === "sold" && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-bone bg-ink/85 px-5 py-3">
                      Sold
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
                  <h4 className="font-display text-2xl md:text-3xl font-light leading-tight">
                    {p.title}
                  </h4>
                  <span className="font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.06em] text-ink-soft">
                    {p.year}
                  </span>
                </div>
                <p className="mt-2 text-caption text-ink-soft">
                  {p.medium} · {formatDimensions(p.dimensions)}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
