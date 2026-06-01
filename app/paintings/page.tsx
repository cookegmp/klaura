import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { ProductImage } from "@/components/site/ProductImage";
import { getAllPaintings } from "@/lib/sanity/read";
import { formatDimensions, formatPriceUSD } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Original paintings by Kelly Laura. Each work is one of one.",
};

export default async function PaintingsIndexPage() {
  const all = await getAllPaintings();
  const available = all.filter((p) => p.status === "available" || p.status === "reserved");
  const archive = all.filter((p) => p.status === "sold");

  return (
    <>
      {/* Title block */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
        <Container width="wide">
          <Reveal>
            <p className="text-ui text-bone-deep mb-8 md:mb-10">§ Gallery · the catalogue</p>
          </Reveal>
          <Reveal delay={120} rise={48}>
            <h1 className="font-display-caps font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
              Paintings,
              <br />
              <span className="font-display-italic text-ochre-deep normal-case">in light</span>.
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-12 max-w-xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
              Each work is original and sold only once. Pieces that have already found a home
              stay in the archive — visible, quieted, dated.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Now showing */}
      {available.length > 0 && (
        <section className="pb-24 md:pb-32 border-t border-rule/60">
          <Container width="wide">
            <Reveal>
              <SectionMarker index="01" label="Now showing" count={available.length} />
            </Reveal>
            <CatalogueTable rows={available} />
          </Container>
        </section>
      )}

      {/* The archive */}
      {archive.length > 0 && (
        <section className="pb-32 md:pb-44 border-t border-rule/60">
          <Container width="wide">
            <Reveal>
              <SectionMarker index="02" label="The archive" count={archive.length} />
            </Reveal>
            <CatalogueTable rows={archive} archive />
          </Container>
        </section>
      )}
    </>
  );
}

function SectionMarker({
  index,
  label,
  count,
}: {
  index: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-end justify-between pt-12 md:pt-20 pb-10 md:pb-16">
      <div className="flex items-baseline gap-4 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.08em] text-bone-deep">
        <span>§ {index}</span>
        <span>{label}</span>
      </div>
      <span className="font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.06em] text-bone-deep">
        {count.toString().padStart(2, "0")} works
      </span>
    </div>
  );
}

function CatalogueTable({
  rows,
  archive = false,
}: {
  rows: Awaited<ReturnType<typeof getAllPaintings>>;
  archive?: boolean;
}) {
  return (
    <ul className="border-t border-bone">
      {rows.map((p, i) => (
        <Reveal key={p._id} as="li" delay={Math.min(i * 60, 480)} rise={20}>
          <Link
            href={`/paintings/${p.slug.current}`}
            className="group grid grid-cols-12 gap-x-6 items-center py-6 md:py-8 border-b border-rule/60 hover:bg-ink-soft/60 transition-colors px-2 -mx-2"
          >
            {/* Year — far left, mono, prominent */}
            <span className="col-span-2 md:col-span-1 font-[family-name:var(--font-mono)] text-[0.78rem] uppercase tracking-[0.06em] text-bone-deep">
              {p.year}
            </span>

            {/* Thumbnail — small square peek of the painting */}
            <div className="col-span-2 md:col-span-1">
              <div className="relative w-14 h-14 md:w-16 md:h-16 overflow-hidden bg-ink-soft">
                <ProductImage
                  image={p.primaryImage}
                  alt={p.primaryImage?.alt ?? p.title}
                  seed={p._id}
                  width={128}
                  height={128}
                  sizes="64px"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Title — italic Fraunces, the largest piece of the row */}
            <h3 className="col-span-8 md:col-span-4 font-display text-xl md:text-3xl font-light leading-tight tracking-[-0.01em]">
              <span className={archive ? "text-bone-deep" : "text-bone"}>
                {p.title}
              </span>
            </h3>

            {/* Medium — middle column on desktop only */}
            <span className="hidden md:block md:col-span-3 text-caption text-bone-deep">
              {p.medium}
            </span>

            {/* Size — desktop only */}
            <span className="hidden md:block md:col-span-2 text-caption text-bone-deep">
              {formatDimensions(p.dimensions)}
            </span>

            {/* Price / Sold — far right */}
            <span className="col-span-12 md:col-span-1 text-right font-[family-name:var(--font-mono)] text-[0.78rem] uppercase tracking-[0.06em] text-bone">
              {p.status === "sold" ? "Sold" : formatPriceUSD(p.price)}
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
