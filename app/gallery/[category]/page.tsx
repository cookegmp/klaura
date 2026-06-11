import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeGate } from "@/components/site/AgeGate";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { SeriesGallery } from "@/components/site/SeriesGallery";
import {
  getAllSeries,
  getPaintingsByCategory,
} from "@/lib/sanity/read";
import { PAINTING_CATEGORIES } from "@/types/sanity";
import type {
  Painting,
  PaintingCategory,
  Series,
} from "@/types/sanity";

type Params = Promise<{ category: string }>;

function findCategory(slug: string) {
  return PAINTING_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category } = await params;
  const def = findCategory(category);
  if (!def) return { title: "Gallery" };
  return {
    title: def.label,
    description: `${def.label} — paintings by Kelly Laura.`,
    robots: def.mature ? { index: false, follow: false } : undefined,
  };
}

export function generateStaticParams() {
  return PAINTING_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const def = findCategory(category);
  if (!def) notFound();

  // The 18+ room is gated and, for now, shows a "commissions coming soon"
  // notice with no examples instead of the gallery. The age check still runs
  // first via AgeGate.
  if (def.mature) {
    return (
      <AgeGate declineHref="/gallery">
        <ComingSoon definition={def} />
      </AgeGate>
    );
  }

  const categorySlug = def.slug;
  const [paintings, allSeries] = await Promise.all([
    getPaintingsByCategory(categorySlug),
    getAllSeries(),
  ]);

  return (
    <CategoryBody
      definition={def}
      paintings={paintings}
      allSeries={allSeries}
      categorySlug={categorySlug}
    />
  );
}

function ComingSoon({
  definition,
}: {
  definition: (typeof PAINTING_CATEGORIES)[number];
}) {
  return (
    <section className="pt-20 md:pt-32 pb-32 md:pb-44">
      <Container width="wide">
        <Reveal>
          <p className="text-meta mb-8 md:mb-10">
            § Gallery / {definition.shortLabel}
          </p>
        </Reveal>
        <Reveal delay={120} rise={48}>
          <h1 className="font-display-italic font-normal text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
            Commissions coming soon
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-12 max-w-2xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
            Figure and commissioned work for this room is in progress. Please
            check back soon.
          </p>
          <Link
            href="/gallery"
            className="mt-10 inline-block text-ui border-b border-bone pb-1"
          >
            ← Gallery
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

function CategoryBody({
  definition,
  paintings,
  allSeries,
  categorySlug,
}: {
  definition: (typeof PAINTING_CATEGORIES)[number];
  paintings: Painting[];
  allSeries: Series[];
  categorySlug: PaintingCategory;
}) {
  const availableCount = paintings.filter(
    (p) => p.status === "available" || p.status === "reserved"
  ).length;

  return (
    <>
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
        <Container width="wide">
          <Reveal>
            <p className="text-meta mb-8 md:mb-10">
              § Gallery / {definition.shortLabel}
            </p>
          </Reveal>
          <Reveal delay={120} rise={48}>
            <h1 className="font-display-italic font-normal text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
              {definition.label}
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-meta text-bone-deep">
              <span>{paintings.length.toString().padStart(2, "0")} works</span>
              <span>· {availableCount} available</span>
              <Link
                href="/gallery"
                className="ml-auto text-bone"
              >
                ← Gallery
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <SeriesGallery
        paintings={paintings}
        allSeries={allSeries}
        emptyTitle="No works in this room yet."
        emptyBody={
          categorySlug === "miscellaneous"
            ? "One-off pieces that don't belong to a series will appear here as they're finished."
            : "Kelly is working on this. Check back, or visit the full gallery."
        }
      />
    </>
  );
}
