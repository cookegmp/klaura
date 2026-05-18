import Link from "next/link";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Marquee } from "@/components/site/Marquee";
import { NewsletterCapture } from "@/components/site/NewsletterCapture";
import { PaintingCard } from "@/components/site/PaintingCard";
import { ProductImage } from "@/components/site/ProductImage";
import { PortableContent } from "@/components/site/PortableContent";
import { SectionTiles } from "@/components/site/SectionTiles";
import {
  getAboutPage,
  getAllVintage,
  getCommissionExamples,
  getFeaturedPaintings,
  getHeroPainting,
  getSiteSettings,
} from "@/lib/sanity/read";
import { formatDimensions } from "@/lib/utils";

export default async function HomePage() {
  const [hero, featured, settings, about, commissionExamples, vintage] =
    await Promise.all([
      getHeroPainting(),
      getFeaturedPaintings(),
      getSiteSettings(),
      getAboutPage(),
      getCommissionExamples(),
      getAllVintage(),
    ]);

  // First commission example seeds the Commissions tile; first available
  // painting seeds the Gallery tile (falling back to the hero); first
  // available vintage item seeds the Shop tile.
  const commissionsExample = commissionExamples[0] ?? null;
  const galleryHero = featured[0] ?? hero ?? null;
  const shopHero =
    vintage.find((v) => v.status === "available") ?? vintage[0] ?? null;

  return (
    <>
      {/* Hero ----------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-16 md:pt-28">
        <Container width="wide">
          <div className="grid grid-cols-12 gap-y-16 md:gap-x-12">
            <div className="col-span-12 md:col-span-7 md:pt-20 lg:pt-32 animate-entrance">
              <p className="text-ui text-ink-soft mb-8">Montreal painter · based in Ohio</p>
              <h1 className="font-display font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.88] tracking-[-0.03em]">
                Landscapes that
                <br />
                <span className="font-display-italic text-ochre-deep">remember</span> you back.
              </h1>
            </div>

            <div
              className="col-span-12 md:col-span-5 animate-entrance"
              style={{ animationDelay: "150ms" }}
            >
              {hero ? (
                <Link href={`/paintings/${hero.slug.current}`} className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <ProductImage
                      image={hero.primaryImage}
                      alt={hero.primaryImage?.alt ?? hero.title}
                      seed={hero._id}
                      width={900}
                      height={1200}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      priority
                      className="transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-6">
                    <p className="font-display text-xl">{hero.title}</p>
                    <p className="text-caption text-ink-soft">
                      {hero.medium}
                      {hero.dimensions ? ` · ${formatDimensions(hero.dimensions)}` : ""}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="relative aspect-[3/4] w-full bg-bone-deep overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-ochre/40 via-bone-deep to-ink-soft/30" />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Marquee -------------------------------------------------------- */}
      {settings?.marqueePhrases && settings.marqueePhrases.length > 0 && (
        <div className="mt-24 md:mt-32">
          <Marquee phrases={settings.marqueePhrases} />
        </div>
      )}

      {/* Section tiles — Commissions / Gallery / Shop ------------------- */}
      <section className="py-28 md:py-40">
        <Container width="wide">
          <div className="flex items-end justify-between mb-14 md:mb-20">
            <p className="text-ui text-ink-soft">Sections</p>
            <p className="font-[family-name:var(--font-mono)] text-[0.72rem] tracking-[0.05em] uppercase text-ink-soft/70">
              003 / 003
            </p>
          </div>
          <SectionTiles
            commissionsExample={commissionsExample}
            galleryHero={galleryHero}
            shopHero={shopHero}
          />
        </Container>
      </section>

      {/* Featured works strip ------------------------------------------ */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 bg-bone-deep">
          <Container width="wide">
            <SectionHeading
              eyebrow="Currently available"
              title="Featured works"
              italicWord="Featured"
              className="mb-14 md:mb-20"
            />
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {featured.map((p, i) => (
                <li key={p._id}>
                  <PaintingCard painting={p} index={i} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* About teaser --------------------------------------------------- */}
      <section className="py-32 md:py-44">
        <Container>
          <div className="max-w-2xl">
            <p className="text-ui text-ink-soft mb-6">About</p>
            {about?.pullQuote ? (
              <p className="font-display text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] font-light tracking-[-0.02em]">
                <span className="font-display-italic text-ochre-deep">&ldquo;</span>
                {about.pullQuote}
                <span className="font-display-italic text-ochre-deep">&rdquo;</span>
              </p>
            ) : about?.story ? (
              <div className="font-display text-[length:var(--text-display-md)] leading-[1.1] font-light tracking-[-0.02em]">
                <PortableContent value={about.story.slice(0, 1)} />
              </div>
            ) : (
              <p className="font-display text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] font-light tracking-[-0.02em]">
                Kelly paints from a studio in Ohio, far from Montreal —
                <span className="font-display-italic"> long looks at the same field</span>.
              </p>
            )}
            <Link
              href="/studio"
              className="mt-12 inline-block text-ui border-b border-ink pb-1 hover:text-ochre-deep hover:border-ochre-deep transition-colors"
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
