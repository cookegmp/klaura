import Link from "next/link";
import { Container } from "@/components/site/Container";
import { PaintingCard } from "@/components/site/PaintingCard";
import { Reveal } from "@/components/site/Reveal";
import type { Painting, Series } from "@/types/sanity";

/**
 * Series-grouped grid of paintings. Shared by the per-category rooms
 * (`/gallery/[category]`) and the combined "all works" gallery (`/gallery`).
 *
 * Paintings are bucketed by their `series` ref. Known series render first in
 * the order they appear in `allSeries`; anything ungrouped falls into a final
 * "Other" section. When there is nothing to show, the empty state renders.
 */
export function SeriesGallery({
  paintings,
  allSeries,
  emptyTitle,
  emptyBody,
  backHref = "/gallery",
  backLabel = "← Gallery",
}: {
  paintings: Painting[];
  allSeries: Series[];
  emptyTitle: string;
  emptyBody: string;
  backHref?: string;
  backLabel?: string;
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

  if (paintings.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        body={emptyBody}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  return (
    <>
      {orderedKeys.map((key, sectionIdx) => {
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
      })}
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

function EmptyState({
  title,
  body,
  backHref,
  backLabel,
}: {
  title: string;
  body: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <section className="pb-32 md:pb-44">
      <Container width="wide">
        <Reveal>
          <div className="border-t border-rule/60 pt-16 md:pt-24 max-w-2xl">
            <p className="font-display text-2xl md:text-3xl leading-tight">
              {title}
            </p>
            <p className="mt-4 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
              {body}
            </p>
            <Link
              href={backHref}
              className="mt-8 inline-block text-ui border-b border-bone pb-1"
            >
              {backLabel}
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
