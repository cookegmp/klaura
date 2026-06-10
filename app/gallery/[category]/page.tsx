import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeGate } from "@/components/site/AgeGate";
import { Container } from "@/components/site/Container";
import { PaintingCard } from "@/components/site/PaintingCard";
import { Reveal } from "@/components/site/Reveal";
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
            ← All rooms
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
  // Group paintings by series ref. Anything without a series ends up in
  // "" — rendered as a final "Other" section if non-empty.
  const groups = new Map<string, Painting[]>();
  for (const p of paintings) {
    const key = p.series?._ref ?? "";
    const bucket = groups.get(key);
    if (bucket) bucket.push(p);
    else groups.set(key, [p]);
  }

  const seriesIndex = new Map(allSeries.map((s) => [s._id, s]));

  // Ordered: known series first (in the order they appear in allSeries), then
  // ungrouped at the end.
  const orderedKeys = [
    ...allSeries.map((s) => s._id).filter((id) => groups.has(id)),
    ...(groups.has("") ? [""] : []),
  ];

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
                ← All rooms
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {paintings.length === 0 ? (
        <EmptyState categorySlug={categorySlug} />
      ) : (
        orderedKeys.map((key, sectionIdx) => {
          const series = key ? seriesIndex.get(key) : null;
          const items = groups.get(key) ?? [];
          return (
            <SeriesSection
              key={key || "__ungrouped"}
              series={series ?? null}
              items={items}
              sectionIdx={sectionIdx}
              groupedCount={orderedKeys.length}
            />
          );
        })
      )}
    </>
  );
}

function SeriesSection({
  series,
  items,
  sectionIdx,
  groupedCount,
}: {
  series: Series | null;
  items: Painting[];
  sectionIdx: number;
  groupedCount: number;
}) {
  const showHeader = groupedCount > 1 || series !== null;
  return (
    <section
      className={`pb-24 md:pb-32 ${sectionIdx > 0 ? "border-t border-rule/60" : ""}`}
    >
      <Container width="wide">
        {showHeader && (
          <Reveal>
            <div className="grid grid-cols-12 gap-x-8 pt-16 md:pt-24 pb-10 md:pb-14">
              <div className="col-span-12 md:col-span-3 md:sticky md:top-32 md:self-start">
                <div className="flex items-baseline gap-4 text-meta text-bone-deep">
                  <span>§ 0{sectionIdx + 1}</span>
                  <span>
                    {series
                      ? series.title
                      : groupedCount > 1
                      ? "Other"
                      : "Works"}
                  </span>
                </div>
              </div>
              {series?.description && (
                <p className="col-span-12 md:col-span-8 mt-6 md:mt-0 max-w-2xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
                  {series.description}
                </p>
              )}
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16 pt-4">
          {items.map((p, i) => (
            <Reveal key={p._id} delay={Math.min(i * 60, 360)} rise={32}>
              <PaintingCard painting={p} index={i} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EmptyState({ categorySlug }: { categorySlug: PaintingCategory }) {
  return (
    <section className="pb-32 md:pb-44">
      <Container width="wide">
        <Reveal>
          <div className="border-t border-rule/60 pt-16 md:pt-24 max-w-2xl">
            <p className="font-display text-2xl md:text-3xl leading-tight">
              No works in this room yet.
            </p>
            <p className="mt-4 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
              {categorySlug === "miscellaneous"
                ? "One-off pieces that don't belong to a series will appear here as they're finished."
                : "Kelly is working on this. Check back, or visit another room."}
            </p>
            <Link
              href="/gallery"
              className="mt-8 inline-block text-ui border-b border-bone pb-1"
            >
              ← Back to rooms
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
