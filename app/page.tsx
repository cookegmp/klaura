import Link from "next/link";
import { CategoryDoorways } from "@/components/site/CategoryDoorways";
import { Container } from "@/components/site/Container";
import { NewsletterCapture } from "@/components/site/NewsletterCapture";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import {
  getCategorySummaries,
  getFeaturedPaintings,
  getHeroPainting,
} from "@/lib/sanity/read";

/**
 * Home — an archival-scrapbook landing page modelled directly on
 * documentation/samples/Screenshot.png. Single narrow column. Asymmetric
 * composition: top tag, large featured plate, two-card row, "Our Rooms"
 * italic header, framed doorway grid. Beige type on near-black.
 */
export default async function HomePage() {
  const [summaries, hero, featured] = await Promise.all([
    getCategorySummaries(),
    getHeroPainting(),
    getFeaturedPaintings(),
  ]);

  // Two satellite cards underneath the hero plate. Prefer different
  // featured paintings; fall back to the first two non-hero summaries.
  const satellites = featured.filter((p) => p._id !== hero?._id).slice(0, 2);

  return (
    <>
      {/* 1. Archival masthead -------------------------------------- */}
      <section className="pt-12 md:pt-16 pb-8">
        <Container>
          <Reveal>
            <div className="flex items-baseline justify-between border-b border-rule pb-3">
              <span className="text-tag">vol. i — kelly laura</span>
              <span className="text-tag">est. 2018</span>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 2. Featured hero plate ----------------------------------- */}
      {hero && (
        <section className="pb-10 md:pb-14">
          <Container>
            <Reveal rise={32}>
              <FeaturedHero painting={hero} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* 3. Satellite cards row ----------------------------------- */}
      {satellites.length >= 2 && (
        <section className="pb-14 md:pb-20">
          <Container>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Reveal delay={80} rise={28}>
                <SatellitePlate painting={satellites[0]!} index={1} variant="solid" />
              </Reveal>
              <Reveal delay={160} rise={28}>
                <SatellitePlate painting={satellites[1]!} index={2} variant="outline" />
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* 4. Our Rooms section ------------------------------------- */}
      <section className="pb-16 md:pb-24">
        <Container>
          <Reveal>
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-display-italic text-bone text-3xl md:text-4xl leading-tight">
                Our Rooms
              </h2>
              <p className="text-tag mt-3">
                five doorways · enter at your pace
              </p>
            </div>
          </Reveal>
          <CategoryDoorways summaries={summaries} />
        </Container>
      </section>

      {/* 5. Also: catalogue + about -------------------------------- */}
      <section className="pb-16 md:pb-20 border-t border-rule pt-10 md:pt-14">
        <Container>
          <Reveal>
            <div className="text-center">
              <p className="text-tag mb-3">also in the archive</p>
              <p className="font-display-italic text-bone text-xl md:text-2xl leading-snug max-w-md mx-auto">
                See every available work in one long catalogue, or read about the artist.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/paintings"
                  className="inline-block text-ui px-6 py-3 bg-bone text-ink hover:bg-bone-deep transition-colors"
                >
                  the catalogue
                </Link>
                <Link
                  href="/studio"
                  className="inline-block text-ui px-6 py-3 border border-bone text-bone hover:bg-bone hover:text-ink transition-colors"
                >
                  about kelly
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 6. Newsletter --------------------------------------------- */}
      <section className="pb-16 md:pb-24 border-t border-rule pt-14 md:pt-20">
        <Container>
          <NewsletterCapture />
        </Container>
      </section>
    </>
  );
}

/* -----------------------------------------------------------------------
   FeaturedHero — the calla-lily plate. Cream-ish frame, painting inside,
   "MZIA"-style title underneath with Roman numeral on the right.
   ----------------------------------------------------------------------- */
function FeaturedHero({
  painting,
}: {
  painting: import("@/types/sanity").Painting;
}) {
  return (
    <Link
      href={`/paintings/${painting.slug.current}`}
      className="group block border border-rule p-4 md:p-5 hover:border-bone transition-colors"
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-tag">vol. i · no. 01</span>
        <span className="text-tag">{painting.year ?? "—"}</span>
      </div>

      <div className="relative w-full aspect-[4/5] overflow-hidden bg-ink">
        <ProductImage
          image={painting.primaryImage}
          alt={painting.primaryImage?.alt ?? painting.title}
          seed={painting._id}
          width={1100}
          height={1375}
          sizes="(min-width: 768px) 36rem, 92vw"
          priority
          className="transition-transform duration-[1100ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
        />
      </div>

      <hr className="my-4 border-0 border-t border-rule" aria-hidden />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-bone text-3xl md:text-[2.5rem] leading-[1.05] uppercase tracking-[0.04em]">
            {painting.title}
          </h1>
          <p className="text-subtle mt-1.5">
            {painting.medium} · oil &amp; soft pastel
          </p>
        </div>
        <span className="text-roman shrink-0" aria-hidden>
          XII
        </span>
      </div>
    </Link>
  );
}

/* -----------------------------------------------------------------------
   SatellitePlate — two smaller cards under the hero. One "solid" (filled
   beige), one "outline" (border only) so the row reads as a paired but
   asymmetric composition, like the screenshot reference.
   ----------------------------------------------------------------------- */
function SatellitePlate({
  painting,
  index,
  variant,
}: {
  painting: import("@/types/sanity").Painting;
  index: number;
  variant: "solid" | "outline";
}) {
  const numeral = ["XI", "X"][index - 1] ?? "IX";
  const frameClass =
    variant === "solid"
      ? "bg-ink-soft border border-rule hover:border-bone"
      : "border border-rule hover:border-bone";

  return (
    <Link
      href={`/paintings/${painting.slug.current}`}
      className={`group block p-3 transition-colors ${frameClass}`}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-ink">
        <ProductImage
          image={painting.primaryImage}
          alt={painting.primaryImage?.alt ?? painting.title}
          seed={painting._id}
          width={600}
          height={600}
          sizes="(min-width: 768px) 18rem, 45vw"
          className="transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex items-baseline justify-between mt-3 pl-1">
        <p className="font-display-italic text-bone text-sm md:text-base leading-tight truncate pr-2">
          {painting.title}
        </p>
        <span className="text-roman shrink-0" aria-hidden>
          {numeral}
        </span>
      </div>
    </Link>
  );
}
