import Image from "next/image";
import Link from "next/link";
import { CategoryDoorways } from "@/components/site/CategoryDoorways";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { getCategorySummaries } from "@/lib/sanity/read";

/**
 * Home — full-bleed fabric intro with cursive signature, then Gallery
 * doorways, Commissions, catalogue/about. Single narrow column elsewhere.
 */
export default async function HomePage() {
  const summaries = await getCategorySummaries();

  return (
    <>
      {/* 0. Signature intro — full-bleed fabric photograph --------- */}
      <section className="relative w-full h-[78dvh] min-h-[460px] overflow-hidden">
        <Image
          src="/kateryna-hliznitsova-9Tre3EXnF0g-unsplash.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
        {/* Warm-ink overlay — top vignette for nav legibility, bottom for footer transition */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/80"
        />
        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <div className="text-center">
            <p className="text-tag text-bone/75 mb-6 md:mb-8">
              vol. i · est. 2018
            </p>
            <h1 className="font-signature text-bone text-[clamp(4.5rem,17vw,10rem)] leading-[0.9] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
              Kelly Laura
            </h1>
            <p className="font-display-italic text-bone-deep text-base md:text-lg mt-5 md:mt-7">
              paintings · pastels · vintage
            </p>
          </div>
        </div>
      </section>

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

    </>
  );
}
