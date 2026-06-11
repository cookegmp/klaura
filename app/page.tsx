import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { GalleryDoorways } from "@/components/site/GalleryDoorways";
import { Reveal } from "@/components/site/Reveal";
import { getCategorySummaries } from "@/lib/sanity/read";

/**
 * Home — full-bleed fabric intro with cursive signature, then the two
 * Gallery doorways (full collection + gated 18+), a commissions-coming-soon
 * note, and an about-the-artist link. Single narrow column elsewhere.
 */
export default async function HomePage() {
  const summaries = await getCategorySummaries();
  const matureSummary = summaries.find((s) => s.mature) ?? null;
  const gallerySummaries = summaries.filter((s) => !s.mature);
  const galleryCover = gallerySummaries.find((c) => c.cover)?.cover ?? null;

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
            <h1 className="font-signature text-bone text-[clamp(4.5rem,17vw,10rem)] leading-[0.9] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
              Kelly Laura
            </h1>
            <p className="font-display-italic text-bone-deep text-base md:text-lg mt-5 md:mt-7">
              Contemporary Fine Art
            </p>
          </div>
        </div>
      </section>

      {/* 1. Gallery doorways — wider two-up on desktop ------------- */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24">
        <Container width="wide">
          <Reveal>
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-display-italic text-bone text-3xl md:text-4xl leading-tight">
                Gallery
              </h2>
            </div>
          </Reveal>
          <GalleryDoorways
            gallery={{ cover: galleryCover }}
            mature={{ cover: matureSummary?.cover ?? null }}
          />
          <Reveal delay={180}>
            <p className="font-display-italic text-bone-deep text-center text-base md:text-lg mt-8 md:mt-10">
              Commissions coming soon
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 2. About the artist — single button -------------------- */}
      <section className="pb-16 md:pb-20 border-t border-rule pt-10 md:pt-14">
        <Container>
          <Reveal>
            <div className="flex justify-center">
              <Link
                href="/studio"
                className="inline-block text-ui px-6 py-3 border border-bone text-bone hover:bg-bone hover:text-ink transition-colors"
              >
                about kelly
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

    </>
  );
}
