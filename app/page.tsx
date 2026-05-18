import Link from "next/link";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Marquee } from "@/components/site/Marquee";
import { FeaturedWorks } from "@/components/site/FeaturedWorks";
import { NewsletterCapture } from "@/components/site/NewsletterCapture";

export default function HomePage() {
  return (
    <>
      {/* Hero ----------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-12 md:gap-x-10">
            <div className="col-span-12 md:col-span-7 md:pt-16 lg:pt-28 animate-entrance">
              <p className="text-ui text-ink-soft mb-6">Studio practice · Richmond, IN</p>
              <h1 className="font-display font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.92] tracking-[-0.025em]">
                Landscapes that
                <br />
                <span className="font-display-italic text-ochre-deep">remember</span> you back.
              </h1>
              <p className="mt-10 max-w-xl text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
                Original paintings &amp; a small, slowly-gathered collection of vintage clothing —
                each piece sold only once.
              </p>
              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  href="/paintings"
                  className="text-ui px-7 py-4 bg-ink text-bone hover:bg-ochre-deep transition-colors"
                >
                  See the paintings
                </Link>
                <Link
                  href="/vintage"
                  className="text-ui px-7 py-4 border border-ink hover:bg-ink hover:text-bone transition-colors"
                >
                  Browse vintage
                </Link>
              </div>
            </div>

            {/* Hero image placeholder — replaced by Sanity hero painting */}
            <div className="col-span-12 md:col-span-5 animate-entrance" style={{ animationDelay: "150ms" }}>
              <div className="relative aspect-[3/4] w-full bg-bone-deep overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-ochre/40 via-bone-deep to-ink-soft/30" />
                <div className="absolute inset-x-8 bottom-8">
                  <p className="text-caption text-ink-soft">Featured work — appears once Sanity is connected</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Marquee -------------------------------------------------------- */}
      <Marquee
        phrases={[
          "Painted slowly",
          "One of one",
          "Oil &amp; soft pastel",
          "Worn long after",
          "Sold once, never again",
        ]}
      />

      {/* Two-section split --------------------------------------------- */}
      <section className="py-32 md:py-44">
        <Container width="wide">
          <div className="grid md:grid-cols-2 gap-y-20 md:gap-x-20">
            <div className="md:pt-16">
              <SectionHeading
                eyebrow="01"
                title="Paintings"
                italicWord="Paintings"
                description="Oil on linen and soft pastel on sanded paper. Studio work and commissioned portraits of place."
              />
              <Link
                href="/paintings"
                className="mt-10 inline-block text-ui border-b border-ink pb-1 hover:text-ochre hover:border-ochre transition-colors"
              >
                Enter the gallery →
              </Link>
            </div>
            <div className="md:translate-y-24">
              <SectionHeading
                eyebrow="02"
                title="Vintage"
                italicWord="Vintage"
                description="Slow finds: knitwear, outerwear, and the occasional dress that should not have survived but did."
              />
              <Link
                href="/vintage"
                className="mt-10 inline-block text-ui border-b border-ink pb-1 hover:text-ochre hover:border-ochre transition-colors"
              >
                Browse the rack →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured works strip ------------------------------------------ */}
      <section className="py-20 md:py-28 bg-bone-deep">
        <Container width="wide">
          <SectionHeading
            eyebrow="Currently available"
            title="Featured works"
            italicWord="Featured"
            className="mb-14 md:mb-20"
          />
          <FeaturedWorks />
        </Container>
      </section>

      {/* About teaser --------------------------------------------------- */}
      <section className="py-32 md:py-44">
        <Container>
          <div className="max-w-2xl">
            <p className="text-ui text-ink-soft mb-6">About</p>
            <p className="font-display text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] font-light tracking-[-0.02em]">
              Kelly paints from a barn studio in eastern Indiana — long winters,
              <span className="font-display-italic"> long looks at the same field</span>, a
              practice rebuilt around what the light is doing at four in the afternoon.
            </p>
            <Link
              href="/studio"
              className="mt-12 inline-block text-ui border-b border-ink pb-1 hover:text-ochre hover:border-ochre transition-colors"
            >
              Read more →
            </Link>
          </div>
        </Container>
      </section>

      {/* Newsletter ----------------------------------------------------- */}
      <section className="pb-32 md:pb-44">
        <Container>
          <NewsletterCapture />
        </Container>
      </section>
    </>
  );
}
