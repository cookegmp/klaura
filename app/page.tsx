import Link from "next/link";
import { CategoryDoorways } from "@/components/site/CategoryDoorways";
import { Container } from "@/components/site/Container";
import { NewsletterCapture } from "@/components/site/NewsletterCapture";
import { Reveal } from "@/components/site/Reveal";
import { getCategorySummaries } from "@/lib/sanity/read";

/**
 * Home — Gallery doorways first, then Commissions, then catalogue/about,
 * then newsletter. Single narrow column, beige type on near-black.
 */
export default async function HomePage() {
  const summaries = await getCategorySummaries();

  return (
    <>
      {/* 1. Gallery doorways -------------------------------------- */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24">
        <Container>
          <Reveal>
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-display-italic text-bone text-3xl md:text-4xl leading-tight">
                Gallery
              </h2>
              <p className="text-tag mt-3">
                five doorways · enter at your pace
              </p>
            </div>
          </Reveal>
          <CategoryDoorways summaries={summaries} />
        </Container>
      </section>

      {/* 2. Commissions ------------------------------------------- */}
      <section className="pb-16 md:pb-24 border-t border-rule pt-14 md:pt-20">
        <Container>
          <Reveal>
            <div className="text-center">
              <p className="text-tag mb-3">by invitation</p>
              <h2 className="font-display-italic text-bone text-3xl md:text-4xl leading-tight">
                Commissions
              </h2>
              <p className="font-display-italic text-bone-deep text-lg md:text-xl leading-snug max-w-md mx-auto mt-5">
                A painting of a place you love, made from your photos or a visit. A limited
                number each season.
              </p>
              <div className="mt-7">
                <Link
                  href="/commissions"
                  className="inline-block text-ui px-6 py-3 bg-bone text-ink hover:bg-bone-deep transition-colors"
                >
                  begin an inquiry
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 3. Also: catalogue + about -------------------------------- */}
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

      {/* 4. Newsletter --------------------------------------------- */}
      <section className="pb-16 md:pb-24 border-t border-rule pt-14 md:pt-20">
        <Container>
          <NewsletterCapture />
        </Container>
      </section>
    </>
  );
}
