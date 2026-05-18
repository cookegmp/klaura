import Link from "next/link";
import { Container } from "@/components/site/Container";
import { Marquee } from "@/components/site/Marquee";
import { NewsletterCapture } from "@/components/site/NewsletterCapture";
import { ProductImage } from "@/components/site/ProductImage";
import { Parallax } from "@/components/site/Parallax";
import { PortableContent } from "@/components/site/PortableContent";
import { Reveal } from "@/components/site/Reveal";
import { HorizontalGallery } from "@/components/site/HorizontalGallery";
import { FullBleedFeature } from "@/components/site/FullBleedFeature";
import {
  getAboutPage,
  getAllPaintings,
  getFeaturedPaintings,
  getHeroPainting,
  getSiteSettings,
} from "@/lib/sanity/read";

/**
 * Home — Galleria-style with substantive scroll choreography.
 *
 * Signature scroll moments:
 *   • Hero painting drifts via parallax as you scroll past
 *   • Full-bleed feature painting between hero and gallery — fills the
 *     viewport, parallax inside, big mono caption
 *   • Selected Works = horizontal-scroll gallery: vertical scroll inside
 *     the section translates the painting strip sideways
 *   • Artist section has a sticky image column with stats scrolling next
 *     to it
 *   • Heavy Reveal entrance animations on every section heading
 */
export default async function HomePage() {
  const [hero, featured, allPaintings, settings, about] = await Promise.all([
    getHeroPainting(),
    getFeaturedPaintings(),
    getAllPaintings(),
    getSiteSettings(),
    getAboutPage(),
  ]);

  const selectedIds = new Set<string>();
  const selected: typeof allPaintings = [];
  for (const p of [...featured, ...allPaintings]) {
    if (selected.length >= 6) break;
    if (selectedIds.has(p._id)) continue;
    if (p.status === "nfs") continue;
    selectedIds.add(p._id);
    selected.push(p);
  }

  const fullBleedFeature =
    allPaintings.find((p) => p._id !== hero?._id && p.status !== "nfs") ??
    hero ??
    null;

  return (
    <>
      {/* 1. HERO ------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-16 md:pt-28 pb-24 md:pb-32">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-16 md:gap-x-12 items-end">
            <div className="col-span-12 md:col-span-8">
              <Reveal delay={0} rise={40}>
                <p className="text-ui text-ink-soft mb-10 md:mb-14">
                  Montreal painter · based in Ohio · est. 2018
                </p>
              </Reveal>
              <Reveal delay={120} rise={120}>
                <h1 className="font-display-caps font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em]">
                  Landscapes
                  <br />
                  that{" "}
                  <span className="font-display-italic text-ochre-deep normal-case">
                    remember
                  </span>
                  <br />
                  you back.
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
                    <div className="mt-4 flex items-baseline justify-between gap-6 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.06em] text-ink-soft">
                      <span className="text-ink">{hero.title}</span>
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

      {/* 3. FULL-BLEED FEATURE PAINTING (signature scroll moment #1) -- */}
      {fullBleedFeature && <FullBleedFeature painting={fullBleedFeature} />}

      {/* 4. ABOUT STRIP ----------------------------------------------- */}
      <section className="py-32 md:py-48 border-t border-rule/60">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-12 md:gap-x-16">
            <Reveal
              as="div"
              className="col-span-12 md:col-span-3 md:sticky md:top-32 md:self-start"
            >
              <div className="flex items-baseline gap-4 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.08em] text-ink-soft">
                <span>§ 01</span>
                <span>The studio</span>
              </div>
            </Reveal>
            <div className="col-span-12 md:col-span-9 max-w-3xl">
              <Reveal delay={100}>
                <h2 className="font-display-caps font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.025em]">
                  A practice rebuilt around
                  <br />
                  <span className="font-display-italic text-ochre-deep normal-case">
                    what the light is doing
                  </span>
                  <br />
                  at four in the afternoon.
                </h2>
              </Reveal>
              <Reveal delay={200} className="mt-10">
                {about?.story ? (
                  <div className="max-w-xl text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
                    <PortableContent value={about.story.slice(0, 1)} />
                  </div>
                ) : (
                  <p className="max-w-xl text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
                    Kelly paints from a studio in Ohio, far from Montreal — long winters,
                    long looks at the same field.
                  </p>
                )}
                <Link
                  href="/studio"
                  className="mt-10 inline-block text-ui border-b border-ink pb-1 hover:text-ochre-deep hover:border-ochre-deep transition-colors"
                >
                  Read about the studio →
                </Link>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. SELECTED WORKS — HORIZONTAL SCROLL (signature moment #2) -- */}
      <section className="border-t border-rule/60 pt-24 md:pt-32 pb-20">
        <Container width="wide">
          <Reveal>
            <div className="flex items-end justify-between mb-12 md:mb-20">
              <div className="flex items-baseline gap-4 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.08em] text-ink-soft">
                <span>§ 02</span>
                <span>Selected works</span>
              </div>
              <Link
                href="/paintings"
                className="text-ui pb-1 border-b border-ink hover:text-ochre-deep hover:border-ochre-deep transition-colors"
              >
                Full catalogue →
              </Link>
            </div>
          </Reveal>
        </Container>
        {selected.length > 0 && <HorizontalGallery paintings={selected} />}
      </section>

      {/* 6. ARTIST — STICKY IMAGE COLUMN (signature moment #3) -------- */}
      <section className="py-32 md:py-48 border-t border-rule/60 bg-bone-deep">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-16 md:gap-x-12">
            <div className="col-span-12 md:col-span-5">
              <Reveal>
                <div className="flex items-baseline gap-4 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.08em] text-ink-soft mb-10">
                  <span>§ 03</span>
                  <span>The artist</span>
                </div>
              </Reveal>
              <Reveal delay={100} rise={100}>
                <h2 className="font-display-caps font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.025em]">
                  Kelly
                  <br />
                  <span className="font-display-italic text-ochre-deep normal-case">
                    Laura
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={220} className="mt-10 space-y-12">
                {about?.pullQuote && (
                  <p className="font-display italic text-2xl md:text-3xl leading-snug text-ink-soft max-w-md">
                    &ldquo;{about.pullQuote}&rdquo;
                  </p>
                )}
                <dl className="grid grid-cols-2 gap-y-4 max-w-md font-[family-name:var(--font-mono)] text-[0.78rem] uppercase tracking-[0.06em] text-ink-soft">
                  <dt>Working since</dt>
                  <dd className="text-ink">2018</dd>
                  <dt>Studio</dt>
                  <dd className="text-ink">Ohio</dd>
                  <dt>Born</dt>
                  <dd className="text-ink">Montréal</dd>
                  <dt>Media</dt>
                  <dd className="text-ink">Oil · Soft pastel</dd>
                </dl>
                <Link
                  href="/studio"
                  className="inline-block text-ui border-b border-ink pb-1 hover:text-ochre-deep hover:border-ochre-deep transition-colors"
                >
                  Read more →
                </Link>
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

      {/* 7. CLOSING CTA ---------------------------------------------- */}
      <section className="py-32 md:py-56 border-t border-rule/60 text-center">
        <Container width="wide">
          <Reveal rise={40}>
            <p className="text-ui text-ink-soft mb-8">§ 04 · A painting for your place</p>
          </Reveal>
          <Reveal delay={100} rise={120}>
            <h2 className="font-display-caps font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.88] tracking-[-0.03em] max-w-5xl mx-auto">
              Begin a
              <br />
              <span className="font-display-italic text-ochre-deep normal-case">
                commission
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-10 md:mt-14 max-w-xl mx-auto text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
              Landscapes of a place you love, painted from your photos or a visit. A
              limited number of commissions each season.
            </p>
            <Link
              href="/commissions"
              className="mt-12 inline-block text-ui px-9 py-5 bg-ink text-bone hover:bg-ochre-deep transition-colors"
            >
              Begin an inquiry →
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* 8. Newsletter ----------------------------------------------- */}
      <section className="pb-32 md:pb-44 border-t border-rule/60 pt-32 md:pt-44">
        <Container>
          <NewsletterCapture />
        </Container>
      </section>
    </>
  );
}
