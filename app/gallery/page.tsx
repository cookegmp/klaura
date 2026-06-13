import type { Metadata } from "next";
import Link from "next/link";
import { CategoryGallery } from "@/components/site/CategoryGallery";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { getAllPaintings } from "@/lib/sanity/read";
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
  const all = await getAllPaintings();
  const paintings = all.filter((p) => !MATURE_SLUGS.has(p.category));

  return (
    <>
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
        <Container width="wide">
          <Reveal delay={120} rise={48}>
            <h1 className="font-display-italic font-normal text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
              Gallery
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-meta text-bone-deep">
              <span>{paintings.length.toString().padStart(2, "0")} works</span>
              <Link href="/" className="ml-auto text-bone">
                ← Home
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <CategoryGallery
        paintings={paintings}
        emptyTitle="No works to show yet."
        emptyBody="Kelly is working on the next pieces. Please check back soon."
        backHref="/"
        backLabel="← Home"
      />
    </>
  );
}
