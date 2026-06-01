import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import type { CategorySummary } from "@/lib/sanity/read";

interface CategoryDoorwaysProps {
  summaries: CategorySummary[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * The five gallery doorways. Dense card grid — 2-col on mobile, 3-col on
 * tablet, 5-col on wide desktop — modelled on the editorial reference at
 * documentation/samples/Screenshot.png. Each tile is a small "museum plate":
 * cover image, Roman numeral index, italic Cormorant title, quiet subtitle.
 * No vertical offsets, no overlay captions — labels sit BELOW the image so
 * the whole grid reads as a coherent index, not a stack of slides.
 */
export function CategoryDoorways({ summaries }: CategoryDoorwaysProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
      {summaries.map((cat, i) => (
        <Reveal key={cat.slug} delay={i * 80} rise={40}>
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
  const seed = cover?._id ?? `cat-${slug}`;
  const numeral = ROMAN[index] ?? `${index + 1}`;

  return (
    <Link
      href={`/gallery/${slug}`}
      className="group block focus:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
      aria-label={
        mature
          ? `${label} — age-restricted section, ${count} works`
          : `${label} — ${count} works`
      }
    >
      {/* Image plate — uniform 4/5 aspect across every tile so the grid
          reads as an index, not a layout puzzle. */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-ink-soft border border-rule">
        {cover ? (
          <ProductImage
            image={cover.primaryImage}
            alt={cover.primaryImage?.alt ?? cover.title}
            seed={seed}
            width={800}
            height={1000}
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            priority={index === 0}
            className="transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
          />
        ) : (
          <div
            role="img"
            aria-label={`${label} — no works yet`}
            className="absolute inset-0 bg-ink-soft"
          />
        )}

        {/* Age-veil: the 18+ cover is dimmed until the visitor opts in. */}
        {mature && <div className="absolute inset-0 bg-ink/75" aria-hidden />}

        {/* Mature badge — small, top-left, italic so it sits in the same
            voice as everything else. */}
        {mature && (
          <span
            className="absolute top-2 left-2 inline-flex items-center font-display-italic text-[0.78rem] text-bone bg-ink/70 backdrop-blur-sm px-2 py-0.5"
            aria-hidden
          >
            eighteen+
          </span>
        )}
      </div>

      {/* Caption block — Roman numeral · italic title · count. Reads like
          a small museum plate. */}
      <div className="mt-3 md:mt-4 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-roman text-bone-deep" aria-hidden>
            {numeral}
          </span>
          <span className="text-meta text-bone-deep">
            {count} {count === 1 ? "work" : "works"}
          </span>
        </div>
        <h2 className="font-display-italic text-bone text-2xl md:text-[1.65rem] leading-[1.05] tracking-tight">
          {label}
        </h2>
      </div>
    </Link>
  );
}
