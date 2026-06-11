import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { SeriesGallery } from "@/components/site/SeriesGallery";
import { getAllPaintings, getAllSeries } from "@/lib/sanity/read";
import { PAINTING_CATEGORIES } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Every available work by Kelly Laura, grouped by series.",
};

// Mature rooms live behind their own gated doorway (/gallery/eighteen-plus)
// and are kept out of the combined gallery.
const MATURE_SLUGS = new Set(
  PAINTING_CATEGORIES.filter((c) => c.mature).map((c) => c.slug)
);

export default async function GalleryIndexPage() {
  const [all, allSeries] = await Promise.all([
    getAllPaintings(),
    getAllSeries(),
  ]);
  const paintings = all.filter((p) => !MATURE_SLUGS.has(p.category));

  const availableCount = paintings.filter(
    (p) => p.status === "available" || p.status === "reserved"
  ).length;

  return (
    <>
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
        <Container width="wide">
          <Reveal>
            <p className="text-meta mb-8 md:mb-10">§ Gallery</p>
          </Reveal>
          <Reveal delay={120} rise={48}>
            <h1 className="font-display-italic font-normal text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
              The collection
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-meta text-bone-deep">
              <span>{paintings.length.toString().padStart(2, "0")} works</span>
              <span>· {availableCount} available</span>
              <Link href="/" className="ml-auto text-bone">
                ← Home
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <SeriesGallery
        paintings={paintings}
        allSeries={allSeries}
        emptyTitle="No works to show yet."
        emptyBody="Kelly is working on the next pieces. Please check back soon."
        backHref="/"
        backLabel="← Home"
      />
    </>
  );
}
