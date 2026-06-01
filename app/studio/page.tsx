import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { FullBleedFeature } from "@/components/site/FullBleedFeature";
import { Marquee } from "@/components/site/Marquee";
import { Parallax } from "@/components/site/Parallax";
import { PortableContent } from "@/components/site/PortableContent";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import {
  getAboutPage,
  getAllPaintings,
  getHeroPainting,
  getSiteSettings,
} from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Kelly Laura — practice, place, and process. A studio in Ohio, landscapes painted from long looks at the same field.",
};

/**
 * /studio — about the artist.
 *
 * Holds the rich editorial content that previously opened the site
 * (hero painting parallax, full-bleed feature, sticky artist column,
 * commission CTA). The five-rooms doorways live on / now; this page
 * stays focused on who Kelly is and why.
 */
export default async function StudioPage() {
  const [hero, allPaintings, settings, about] = await Promise.all([
    getHeroPainting(),
    getAllPaintings(),
    getSiteSettings(),
    getAboutPage(),
  ]);

  const fullBleedFeature =
    allPaintings.find(
      (p) =>
        p._id !== hero?._id &&
        p.status !== "nfs" &&
        p.category !== "eighteen-plus"
    ) ??
    hero ??
    null;

  return (
    <>
      {/* 1. ABOUT HERO ----------------------------------------------- */}
      <section className="relative overflow-hidden pt-16 md:pt-28 pb-24 md:pb-32">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-16 md:gap-x-12 items-end">
            <div className="col-span-12 md:col-span-8">
              <Reveal delay={0} rise={40}>
                <p className="text-meta mb-10 md:mb-14">
                  § About · Montreal painter · based in Ohio · est. 2018
                </p>
              </Reveal>
              <Reveal delay={120} rise={120}>
                <h1 className="font-display-italic font-normal text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em]">
                  A painter.
                  <br />
                  A{" "}
                  <span className="font-display-italic normal-case">
                    studio
                  </span>
                  <br />
                  in Ohio.
                </h1>
              </Reveal>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Reveal delay={280} rise={120}>
                {hero ? (
                  <Link
                    href={`/paintings/${hero.slug.current}`}
                    className="group block"
                  >
                    <Parallax amount={0.12}>
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <ProductImage
                          image={hero.primaryImage}
                          alt={hero.primaryImage?.alt ?? hero.title}
                          seed={hero._id}
                          width={900}
                          height={1200}
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          priority
                          className="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                        />
                      </div>
                    </Parallax>
                    <div className="mt-4 flex items-baseline justify-between gap-6 text-meta text-bone-deep">
                      <span className="text-bone">{hero.title}</span>
                      <span>{hero.year}</span>
                    </div>
                  </Link>
                ) : null}
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Marquee --------------------------------------------------- */}
      {settings?.marqueePhrases && settings.marqueePhrases.length > 0 && (
        <Marquee phrases={settings.marqueePhrases} />
      )}

      {/* 3. FULL-BLEED FEATURE PAINTING ------------------------------ */}
      {fullBleedFeature && <FullBleedFeature painting={fullBleedFeature} />}

      {/* 4. THE STUDIO STRIP ----------------------------------------- */}
      <section className="py-32 md:py-48 border-t border-rule/60">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-12 md:gap-x-16">
            <Reveal
              as="div"
              className="col-span-12 md:col-span-3 md:sticky md:top-32 md:self-start"
            >
              <div className="flex items-baseline gap-4 text-meta text-bone-deep">
                <span>§ 01</span>
                <span>The studio</span>
              </div>
            </Reveal>
            <div className="col-span-12 md:col-span-9 max-w-3xl">
              <Reveal delay={100}>
                <h2 className="font-display-italic font-normal text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.025em]">
                  A practice rebuilt around
                  <br />
                  <span className="font-display-italic normal-case">
                    what the light is doing
                  </span>
                  <br />
                  at four in the afternoon.
                </h2>
              </Reveal>
              <Reveal delay={200} className="mt-10">
                {about?.story ? (
                  <div className="max-w-xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
                    <PortableContent value={about.story} />
                  </div>
                ) : (
                  <p className="max-w-xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
                    Kelly paints from a studio in Ohio, far from Montreal — long winters,
                    long looks at the same field.
                  </p>
                )}
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. THE ARTIST — sticky image column ------------------------- */}
      <section className="py-32 md:py-48 border-t border-rule/60 bg-ink-soft">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-16 md:gap-x-12">
            <div className="col-span-12 md:col-span-5">
              <Reveal>
                <div className="flex items-baseline gap-4 text-meta text-bone-deep mb-10">
                  <span>§ 02</span>
                  <span>The artist</span>
                </div>
              </Reveal>
              <Reveal delay={100} rise={100}>
                <h2 className="font-display-italic font-normal text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.025em]">
                  Kelly
                  <br />
                  <span className="font-display-italic normal-case">
                    Laura
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={220} className="mt-10 space-y-12">
                {about?.pullQuote && (
                  <p className="font-display italic text-2xl md:text-3xl leading-snug text-bone-deep max-w-md">
                    &ldquo;{about.pullQuote}&rdquo;
                  </p>
                )}
                <dl className="grid grid-cols-2 gap-y-4 max-w-md text-meta text-bone-deep">
                  <dt>Working since</dt>
                  <dd className="text-bone">2018</dd>
                  <dt>Studio</dt>
                  <dd className="text-bone">Ohio</dd>
                  <dt>Born</dt>
                  <dd className="text-bone">Montréal</dd>
                  <dt>Media</dt>
                  <dd className="text-bone">Oil · Soft pastel</dd>
                </dl>
              </Reveal>
            </div>

            <div className="col-span-12 md:col-span-6 md:col-start-7">
              <div className="md:sticky md:top-28">
                <Reveal delay={150} rise={100}>
                  {about?.hero ? (
                    <ProductImage
                      image={about.hero}
                      alt={about.hero.alt ?? "Kelly Laura in the studio"}
                      seed="about-hero"
                      width={1000}
                      height={1250}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="w-full"
                    />
                  ) : hero ? (
                    <ProductImage
                      image={hero.primaryImage}
                      alt={hero.primaryImage?.alt ?? hero.title}
                      seed={`artist-${hero._id}`}
                      width={1000}
                      height={1250}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="w-full"
                    />
                  ) : null}
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. STUDIO IMAGES (if any from CMS) -------------------------- */}
      {about?.studioImages && about.studioImages.length > 0 && (
        <section className="py-32 md:py-44 border-t border-rule/60">
          <Container width="wide">
            <Reveal>
              <div className="flex items-baseline gap-4 text-meta text-bone-deep mb-12 md:mb-16">
                <span>§ 03</span>
                <span>In the studio</span>
              </div>
            </Reveal>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {about.studioImages.map((img, i) => (
                <li
                  key={i}
                  className="overflow-hidden"
                  style={{ transform: i % 2 === 1 ? "translateY(2rem)" : undefined }}
                >
                  <ProductImage
                    image={img}
                    alt={img.alt ?? "Studio image"}
                    seed={`studio-${i}`}
                    width={800}
                    height={1000}
                    sizes="(min-width: 768px) 33vw, 50vw"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 7. CLOSING CTA — commissions ------------------------------- */}
      <section className="py-32 md:py-56 border-t border-rule/60 text-center">
        <Container width="wide">
          <Reveal rise={40}>
            <p className="text-meta mb-8">§ A painting for your place</p>
          </Reveal>
          <Reveal delay={100} rise={120}>
            <h2 className="font-display-italic font-normal text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.88] tracking-[-0.03em] max-w-5xl mx-auto">
              Begin a
              <br />
              <span className="font-display-italic normal-case">
                commission
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-10 md:mt-14 max-w-xl mx-auto text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
              Landscapes of a place you love, painted from your photos or a visit. A
              limited number of commissions each season.
            </p>
            <Link
              href="/commissions"
              className="mt-12 inline-block text-ui px-9 py-5 bg-bone text-ink hover:bg-bone-deep transition-colors"
            >
              Begin an inquiry →
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
