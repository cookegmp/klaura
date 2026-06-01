import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import type { CategorySummary } from "@/lib/sanity/read";

interface CategoryDoorwaysProps {
  summaries: CategorySummary[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Framed-plate doorway cards. Each tile is a self-contained "perfume plate"
 * with a thin beige border, internal padding, image inside, a hairline rule
 * below, then the Roman numeral, italic title, and tiny caps subtitle.
 *
 * Mirrors the fragrance-card pattern in documentation/samples/Screenshot.png
 * (the "Leather & Patchouli" / "Graphite & Muse" tiles).
 */
export function CategoryDoorways({ summaries }: CategoryDoorwaysProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {summaries.map((cat, i) => (
        <Reveal key={cat.slug} delay={i * 70} rise={32}>
          <DoorwayPlate summary={cat} index={i} />
        </Reveal>
      ))}
    </div>
  );
}

function DoorwayPlate({
  summary,
  index,
}: {
  summary: CategorySummary;
  index: number;
}) {
  const { slug, label, count, cover, mature } = summary;
  const seed = cover?._id ?? `cat-${slug}`;
  const numeral = ROMAN[index] ?? `${index + 1}`;
  const subtitle = mature
    ? "age-restricted · enter with care"
    : `${count} ${count === 1 ? "work" : "works"} · the collection`;

  return (
    <Link
      href={`/gallery/${slug}`}
      className="group block border border-rule p-3 md:p-4 transition-colors hover:border-bone focus:outline-none focus-visible:border-bone"
      aria-label={
        mature
          ? `${label} — age-restricted section, ${count} works`
          : `${label} — ${count} works`
      }
    >
      {/* Tag row — tiny tag top-left, Roman numeral top-right. Reads like
          a museum plate or perfume bottle label. */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-tag">no. {String(index + 1).padStart(2, "0")}</span>
        <span className="text-roman" aria-hidden>
          {numeral}
        </span>
      </div>

      {/* Cover image — square aspect, sits inside the framed plate. */}
      <div className="relative w-full aspect-square overflow-hidden bg-ink">
        {cover ? (
          <ProductImage
            image={cover.primaryImage}
            alt={cover.primaryImage?.alt ?? cover.title}
            seed={seed}
            width={800}
            height={800}
            sizes="(min-width: 768px) 18rem, 45vw"
            priority={index === 0}
            className="transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
          />
        ) : (
          <div
            role="img"
            aria-label={`${label} — no works yet`}
            className="absolute inset-0 bg-ink"
          />
        )}

        {mature && <div className="absolute inset-0 bg-ink/75" aria-hidden />}
      </div>

      {/* Hairline rule between image and caption — the archival-plate signature. */}
      <hr className="my-3 border-0 border-t border-rule" aria-hidden />

      {/* Caption block — italic title, tiny caps subtitle. Centred. */}
      <div className="text-center pb-1">
        <h2 className="font-display-italic text-bone text-lg md:text-xl leading-tight">
          {label}
        </h2>
        <p className="text-tag mt-2">{subtitle}</p>
      </div>
    </Link>
  );
}
