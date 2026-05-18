import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { ProductImage } from "@/components/site/ProductImage";
import { PortableContent } from "@/components/site/PortableContent";
import { getAboutPage } from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "Studio",
  description: "About Kelly Laaura — practice, place, and process.",
};

export default async function StudioPage() {
  const about = await getAboutPage();

  return (
    <Container className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">About</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          The <span className="font-display-italic text-ochre-deep">studio</span>.
        </h1>
      </header>

      {about?.hero && (
        <div className="mb-16">
          <ProductImage
            image={about.hero}
            alt={about.hero.alt ?? "Kelly Laaura in the studio"}
            seed="about-hero"
            width={1400}
            height={900}
            sizes="(min-width: 1024px) 80vw, 100vw"
            priority
          />
        </div>
      )}

      <article className="max-w-2xl space-y-6 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
        {about?.story ? (
          <PortableContent value={about.story} />
        ) : (
          <p>About copy goes here — written and edited from the Sanity Studio.</p>
        )}
      </article>

      {about?.pullQuote && (
        <blockquote className="mt-20 max-w-3xl font-display text-[length:var(--text-display-md)] leading-[1.1] font-light tracking-[-0.02em]">
          <span className="font-display-italic text-ochre-deep">&ldquo;</span>
          {about.pullQuote}
          <span className="font-display-italic text-ochre-deep">&rdquo;</span>
        </blockquote>
      )}

      {about?.studioImages && about.studioImages.length > 0 && (
        <ul className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-6">
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
      )}
    </Container>
  );
}
