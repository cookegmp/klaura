import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { Parallax } from "@/components/site/Parallax";
import { PortableContent } from "@/components/site/PortableContent";
import { ProductImage } from "@/components/site/ProductImage";
import { Reveal } from "@/components/site/Reveal";
import { getAboutPage } from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Kelly Laura — a painter from Montréal, Québec, now working in the United States across oil, pastel, and acrylic.",
};

/**
 * /studio — about the artist.
 *
 * A single focused panel: Kelly's portrait (with a gentle scroll parallax)
 * alongside her own words. No invented editorial copy — just the blurb.
 */
export default async function StudioPage() {
  const about = await getAboutPage();

  return (
    <section className="relative overflow-hidden pt-16 md:pt-28 pb-24 md:pb-32">
      <Container width="wide">
        <div className="grid grid-cols-12 gap-y-12 md:gap-x-16 items-center">
          {/* Kelly — portrait with scroll parallax */}
          <div className="col-span-12 md:col-span-6">
            <Reveal rise={120}>
              <Parallax amount={0.12}>
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <ProductImage
                    image={about?.hero}
                    alt={about?.hero?.alt ?? "Kelly Laura"}
                    seed="about-hero"
                    width={1200}
                    height={900}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority
                  />
                </div>
              </Parallax>
            </Reveal>
          </div>

          {/* Her blurb */}
          <div className="col-span-12 md:col-span-6">
            <Reveal delay={150} rise={80}>
              {about?.story && (
                <div className="max-w-xl text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
                  <PortableContent value={about.story} />
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
