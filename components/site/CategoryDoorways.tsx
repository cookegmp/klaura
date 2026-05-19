import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import type { CategorySummary } from "@/lib/sanity/read";

interface CategoryDoorwaysProps {
  summaries: CategorySummary[];
}

/**
 * The five gallery doorways. Editorial, asymmetric — every tile sits at a
 * deliberately different vertical baseline so the page reads as a layout,
 * not a uniform grid. 18+ gets a tonal veil instead of a fully-revealed
 * image; the age gate lives behind the click, not in front of it.
 *
 * Used on the home page and on /gallery.
 */
export function CategoryDoorways({ summaries }: CategoryDoorwaysProps) {
  // Hand-tuned vertical offsets — five tiles, five baselines.
  const offsets: Record<string, string> = {
    landscapes: "md:mt-0",
    houses: "md:mt-32",
    animals: "md:mt-16",
    "eighteen-plus": "md:mt-40",
    miscellaneous: "md:mt-8",
  };
  // Column spans on the 12-col desktop grid.
  const spans: Record<string, string> = {
    landscapes: "md:col-span-7",
    houses: "md:col-span-5",
    animals: "md:col-span-5",
    "eighteen-plus": "md:col-span-4",
    miscellaneous: "md:col-span-3",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-20 md:gap-x-10 md:gap-y-32">
      {summaries.map((cat, i) => (
        <Reveal
          key={cat.slug}
          delay={i * 90}
          rise={64}
          className={`${spans[cat.slug] ?? "md:col-span-6"} ${offsets[cat.slug] ?? ""}`}
        >
          <DoorwayTile summary={cat} index={i} />
        </Reveal>
      ))}
    </div>
  );
}

function DoorwayTile({
  summary,
  index,
}: {
  summary: CategorySummary;
  index: number;
}) {
  const { slug, label, count, cover, mature } = summary;
  // Tall portrait for the wide tiles, square for the narrowest one.
  const aspect = slug === "miscellaneous" ? "aspect-square" : "aspect-[4/5]";
  const seed = cover?._id ?? `cat-${slug}`;

  return (
    <Link
      href={`/gallery/${slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre-deep focus-visible:ring-offset-4 focus-visible:ring-offset-bone"
      aria-label={
        mature
          ? `${label} — age-restricted section, ${count} works`
          : `${label} — ${count} works`
      }
    >
      <div className={`relative w-full ${aspect} overflow-hidden bg-bone-deep`}>
        {cover ? (
          <ProductImage
            image={cover.primaryImage}
            alt={cover.primaryImage?.alt ?? cover.title}
            seed={seed}
            width={1100}
            height={1375}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
          />
        ) : (
          <div
            role="img"
            aria-label={`${label} — no works yet`}
            className="absolute inset-0 bg-gradient-to-br from-ochre/30 via-bone-deep to-ink-soft/30"
          />
        )}

        {/* Veil for the 18+ tile so the cover never feels exposed at the
            doorway. The age gate handles the actual content beyond. */}
        {mature && (
          <div className="absolute inset-0 bg-ink/55 mix-blend-multiply" aria-hidden />
        )}

        {/* Mature badge */}
        {mature && (
          <span
            className="absolute top-5 left-5 inline-flex items-center text-ui text-bone bg-ochre-deep/95 px-3 py-1.5"
            aria-hidden
          >
            18+
          </span>
        )}

        {/* Section number — small mono, top-right, always visible */}
        <span
          className="absolute top-5 right-5 font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.08em] text-bone/90"
          aria-hidden
        >
          № 0{index + 1}
        </span>

        {/* Bottom block: label + enter affordance. Sits over a soft gradient
            for legibility on any cover. */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-display-caps font-light text-bone text-3xl md:text-5xl leading-[0.9] tracking-[-0.02em]">
                {label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.08em] text-bone/80">
                {count} {count === 1 ? "work" : "works"}
                {mature ? " · age-restricted" : ""}
              </p>
            </div>
            <span
              className="hidden sm:inline-flex items-center gap-2 text-ui text-bone/90 group-hover:text-ochre transition-colors"
              aria-hidden
            >
              Enter
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
