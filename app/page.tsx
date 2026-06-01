import Link from "next/link";
import { CategoryDoorways } from "@/components/site/CategoryDoorways";
import { Container } from "@/components/site/Container";
import { NewsletterCapture } from "@/components/site/NewsletterCapture";
import { Reveal } from "@/components/site/Reveal";
import { getCategorySummaries } from "@/lib/sanity/read";

/**
 * Home — built around the "Choose a doorway" concept.
 *
 * The five rooms are the page. The rich introduction to Kelly's practice
 * lives at /studio. /gallery redirects here so any bookmarks resolve.
 */
export default async function HomePage() {
  const summaries = await getCategorySummaries();

  return (
    <>
      {/* 1. DOORWAY HERO --------------------------------------------- */}
      <section className="pt-20 md:pt-32 pb-20 md:pb-28">
        <Container width="wide">
          <Reveal>
            <p className="text-ui text-bone-deep mb-8 md:mb-10">
              § Kelly Laura · five rooms
            </p>
          </Reveal>
          <Reveal delay={120} rise={48}>
            <h1 className="font-display-caps font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
              Choose a
              <br />
              <span className="font-display-italic text-ochre-deep normal-case">
                doorway
              </span>
              .
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-12 max-w-xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
              The work is grouped into five rooms. Each one keeps its own pace.
              The Eighteen+ room is age-restricted; you&rsquo;ll be asked to
              confirm before you enter.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 2. THE FIVE ROOMS ------------------------------------------- */}
      <section className="pb-32 md:pb-48">
        <Container width="wide">
          <CategoryDoorways summaries={summaries} />
        </Container>
      </section>

      {/* 3. ALSO — full catalogue + about, single closing band ------ */}
      <section className="pb-24 md:pb-32 border-t border-rule/60 pt-16 md:pt-20">
        <Container width="wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
              <div>
                <p className="text-ui text-bone-deep mb-4">§ Also</p>
                <p className="font-display text-2xl md:text-3xl leading-tight max-w-xl">
                  See every available work in one long catalogue, or read about the
                  artist.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 self-start md:self-end">
                <Link
                  href="/paintings"
                  className="text-ui pb-1 border-b border-bone hover:text-ochre-deep hover:border-ochre-deep transition-colors"
                >
                  Full catalogue →
                </Link>
                <Link
                  href="/studio"
                  className="text-ui pb-1 border-b border-bone hover:text-ochre-deep hover:border-ochre-deep transition-colors"
                >
                  About Kelly →
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 4. Newsletter ---------------------------------------------- */}
      <section className="pb-32 md:pb-44 border-t border-rule/60 pt-24 md:pt-32">
        <Container>
          <NewsletterCapture />
        </Container>
      </section>
    </>
  );
}
