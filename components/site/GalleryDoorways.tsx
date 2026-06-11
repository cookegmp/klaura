import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import type { Painting } from "@/types/sanity";

interface GalleryDoorwaysProps {
  /** Combined non-mature collection — cover + total work count. */
  gallery: { count: number; cover: Painting | null };
  /** The gated Eighteen+ room — its own cover. */
  mature: { cover: Painting | null };
}

/**
 * Two large framed-plate doorways, side by side: the full Gallery on the
 * left, the gated Eighteen+ room on the right. Same archival-plate anatomy
 * as CategoryDoorways' DoorwayPlate, scaled up for a two-up layout.
 */
export function GalleryDoorways({ gallery, mature }: GalleryDoorwaysProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5">
      <Reveal rise={32}>
        <BigPlate
          href="/gallery"
          numeral="I"
          tag="no. 01"
          cover={gallery.cover}
          title="Gallery"
          subtitle={`${gallery.count} ${gallery.count === 1 ? "work" : "works"} · the collection`}
          fallbackLabel="Gallery"
          priority
        />
      </Reveal>
      <Reveal delay={90} rise={32}>
        <BigPlate
          href="/gallery/eighteen-plus"
          numeral="II"
          tag="no. 02"
          cover={mature.cover}
          title="18+"
          subtitle="age-restricted · enter with care"
          fallbackLabel="Eighteen+"
          mature
        />
      </Reveal>
    </div>
  );
}

function BigPlate({
  href,
  numeral,
  tag,
  cover,
  title,
  subtitle,
  fallbackLabel,
  mature = false,
  priority = false,
}: {
  href: string;
  numeral: string;
  tag: string;
  cover: Painting | null;
  title: string;
  subtitle: string;
  fallbackLabel: string;
  mature?: boolean;
  priority?: boolean;
}) {
  const seed = cover?._id ?? `gallery-${href}`;

  return (
    <Link
      href={href}
      className="group block border border-rule p-3 md:p-5 transition-colors hover:border-bone focus:outline-none focus-visible:border-bone"
      aria-label={
        mature
          ? `${fallbackLabel} — age-restricted section`
          : `${fallbackLabel} — the full collection`
      }
    >
      {/* Tag row — tiny tag top-left, Roman numeral top-right. */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-tag">{tag}</span>
        <span className="text-roman" aria-hidden>
          {numeral}
        </span>
      </div>

      {/* Cover image — taller portrait plate for the larger two-up layout. */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-ink">
        {cover ? (
          <ProductImage
            image={cover.primaryImage}
            alt={cover.primaryImage?.alt ?? cover.title}
            seed={seed}
            width={800}
            height={1000}
            sizes="(min-width: 768px) 19rem, 45vw"
            priority={priority}
            className="transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
          />
        ) : (
          <div
            role="img"
            aria-label={`${fallbackLabel} — no works yet`}
            className="absolute inset-0 bg-ink"
          />
        )}

        {mature && <div className="absolute inset-0 bg-ink/75" aria-hidden />}
      </div>

      {/* Hairline rule between image and caption — the archival-plate signature. */}
      <hr className="my-3 md:my-4 border-0 border-t border-rule" aria-hidden />

      {/* Caption block — italic title, tiny caps subtitle. Centred. */}
      <div className="text-center pb-1">
        <h3 className="font-display-italic text-bone text-xl md:text-3xl leading-tight">
          {title}
        </h3>
        <p className="text-tag mt-2">{subtitle}</p>
      </div>
    </Link>
  );
}
