import Link from "next/link";
import { Container } from "@/components/site/Container";
import { PaintingCard } from "@/components/site/PaintingCard";
import { Reveal } from "@/components/site/Reveal";
import { PAINTING_CATEGORIES } from "@/types/sanity";
import type { Painting } from "@/types/sanity";

/**
 * Category-grouped grid for the combined gallery. Paintings are bucketed by
 * their `category`, rendered in the canonical PAINTING_CATEGORIES order. Each
 * room gets a quiet centred italic heading and a tiny tag count, set off by a
 * hairline rule — the same archival-plate voice as the rest of the site.
 *
 * Mature rooms are expected to be filtered out before this renders (they live
 * behind their own gated doorway).
 */
export function CategoryGallery({
  paintings,
  emptyTitle,
  emptyBody,
  backHref = "/",
  backLabel = "← Home",
}: {
  paintings: Painting[];
  emptyTitle: string;
  emptyBody: string;
  backHref?: string;
  backLabel?: string;
}) {
  const groups = PAINTING_CATEGORIES.filter((c) => !c.mature)
    .map((def) => ({
      def,
      items: paintings.filter((p) => p.category === def.slug),
    }))
    .filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return (
      <section className="pb-32 md:pb-44">
        <Container width="wide">
          <Reveal>
            <div className="border-t border-rule/60 pt-16 md:pt-24 max-w-2xl">
              <p className="font-display text-2xl md:text-3xl leading-tight">
                {emptyTitle}
              </p>
              <p className="mt-4 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
                {emptyBody}
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

  return (
    <>
      {groups.map(({ def, items }, sectionIdx) => (
        <section
          key={def.slug}
          className={
            sectionIdx === 0
              ? "pb-20 md:pb-28"
              : "pt-16 md:pt-24 pb-20 md:pb-28 border-t border-rule/60"
          }
        >
          <Container width="wide">
            <Reveal>
              <div className="text-center mb-10 md:mb-14">
                <h2 className="font-display-italic text-bone text-2xl md:text-3xl leading-tight">
                  {def.label}
                </h2>
                <p className="text-tag mt-2">
                  {items.length} {items.length === 1 ? "work" : "works"}
                </p>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
              {items.map((p, i) => (
                <Reveal key={p._id} delay={Math.min(i * 60, 360)} rise={32}>
                  <PaintingCard painting={p} index={i} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}
