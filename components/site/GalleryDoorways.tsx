import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import type { Painting } from "@/types/sanity";

interface GalleryDoorwaysProps {
  /** Combined non-mature collection cover. */
  gallery: { cover: Painting | null };
  /** The gated Eighteen+ room cover. */
  mature: { cover: Painting | null };
}

/**
 * Two large framed-plate doorways, side by side: the full Gallery on the
 * left, the gated intimate room on the right. Same archival-plate frame as
 * CategoryDoorways' DoorwayPlate, scaled up and stripped of the museum-plate
 * number row.
 */
export function GalleryDoorways({ gallery, mature }: GalleryDoorwaysProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-4 md:gap-8">
      <Reveal rise={32} className="h-full">
        <BigPlate
          href="/gallery"
          cover={gallery.cover}
          title="Gallery"
          subtitle="landscapes, buildings, animals, misc."
          fallbackLabel="Gallery"
          priority
        />
      </Reveal>
      <Reveal delay={90} rise={32} className="h-full">
        <BigPlate
          href="/gallery/eighteen-plus"
          cover={mature.cover}
          title="Intimate contemporary fine art"
          subtitle="18+, age restricted"
          fallbackLabel="Intimate contemporary fine art"
          mature
        />
      </Reveal>
    </div>
  );
}

function BigPlate({
  href,
  cover,
  title,
  subtitle,
  fallbackLabel,
  mature = false,
  priority = false,
}: {
  href: string;
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
      className="group frame-molding flex h-full flex-col bg-ink p-2 md:p-3 focus:outline-none"
      aria-label={
        mature
          ? `${fallbackLabel} — age-restricted section`
          : `${fallbackLabel} — the full collection`
      }
    >
      {/* Inner mat — hairline rule and padding set the image off the molding. */}
      <div className="flex flex-1 flex-col border border-rule p-2.5 md:p-3.5">
        {/* Cover image — taller portrait plate for the larger two-up layout. */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-ink">
          {cover ? (
            <ProductImage
              image={cover.primaryImage}
              alt={cover.primaryImage?.alt ?? cover.title}
              seed={seed}
              width={800}
              height={1000}
              sizes="(min-width: 768px) 28rem, 45vw"
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
      </div>
    </Link>
  );
}
