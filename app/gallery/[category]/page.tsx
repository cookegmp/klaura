import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeGate } from "@/components/site/AgeGate";
import { Container } from "@/components/site/Container";
import { PaintingCard } from "@/components/site/PaintingCard";
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

  const categorySlug = def.slug;
  const [paintings, allSeries] = await Promise.all([
    getPaintingsByCategory(categorySlug),
    getAllSeries(),
  ]);

  // The 18+ room is gated. After the age check it shows the works alongside a
  // standing "commissions coming soon" note (figure commissions are pending).
  if (def.mature) {
    return (
      <AgeGate declineHref="/gallery">
        <MatureRoom definition={def} paintings={paintings} />
      </AgeGate>
    );
  }

  return (
    <CategoryBody
      definition={def}
      paintings={paintings}
      allSeries={allSeries}
      categorySlug={categorySlug}
    />
  );
}

function MatureRoom({
  definition,
  paintings,
}: {
  definition: (typeof PAINTING_CATEGORIES)[number];
  paintings: Painting[];
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
            {definition.label}
          </h1>
        </Reveal>

        <div className="mt-16 md:mt-24 grid grid-cols-12 gap-x-8 gap-y-14">
          {/* Standing commissions note — sits beside the works. */}
          <Reveal
            as="div"
            className="col-span-12 md:col-span-4 md:sticky md:top-32 md:self-start"
          >
            <p className="text-meta mb-4">§ Commissions</p>
            <h2 className="font-display-italic font-normal text-[length:var(--text-display-md)] leading-[0.95] tracking-[-0.025em]">
              Commissions coming soon
            </h2>
            <p className="mt-6 max-w-md text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
              Faceless figure studies and commissioned work for this room are in
              progress. Please check back soon.
            </p>
            <Link
              href="/gallery"
              className="mt-8 inline-block text-ui border-b border-bone pb-1"
            >
              ← Gallery
            </Link>
          </Reveal>

          {/* The works. */}
          <div className="col-span-12 md:col-span-8">
            {paintings.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
                {paintings.map((p, i) => (
                  <Reveal key={p._id} delay={Math.min(i * 60, 360)} rise={32}>
                    <PaintingCard painting={p} index={i} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <p className="text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
                No works in this room yet.
              </p>
            )}
          </div>
        </div>
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
