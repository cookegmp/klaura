import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/Container";
import { ProductImage } from "@/components/site/ProductImage";
import { PortableContent } from "@/components/site/PortableContent";
import { PaintingCard } from "@/components/site/PaintingCard";
import {
  getPaintingBySlug,
  getRelatedPaintings,
} from "@/lib/sanity/read";
import { siteConfig } from "@/lib/site-config";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const painting = await getPaintingBySlug(slug);
  if (!painting) return { title: "Painting" };

  const facts = [painting.medium, painting.year].filter(Boolean).join(", ");
  return {
    title: painting.title,
    description: facts
      ? `${painting.title} — ${facts}, by Kelly Laura.`
      : `${painting.title} — an original work by Kelly Laura.`,
    openGraph: {
      title: painting.title,
      type: "website",
    },
  };
}

export default async function PaintingDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const painting = await getPaintingBySlug(slug);
  if (!painting) notFound();

  const tagIds = (painting.tags ?? []).map((t) => t._ref);
  const related = await getRelatedPaintings(slug, tagIds);

  // Frame the hero from the photo's own ratio when known, falling back to the
  // recorded physical proportions, then to a square.
  const heroRatio =
    painting.imageAspect ??
    (painting.dimensions
      ? painting.dimensions.widthInches / painting.dimensions.heightInches
      : 1);

  const jsonLdFacts = [
    painting.medium,
    painting.dimensions
      ? `${painting.dimensions.heightInches}×${painting.dimensions.widthInches} in`
      : null,
    painting.year ? String(painting.year) : null,
  ].filter(Boolean);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: painting.title,
    description: jsonLdFacts.length
      ? `${jsonLdFacts.join(", ")}.`
      : `An original work by Kelly Laura.`,
    image: painting.primaryImage?.asset?._ref,
    sku: painting._id,
    brand: { "@type": "Person", name: "Kelly Laura" },
    offers: {
      "@type": "Offer",
      availability:
        painting.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url: `${siteConfig.url}/paintings/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Container width="wide" className="py-12 md:py-20">
        <div className="grid grid-cols-12 gap-y-16 md:gap-x-16">
          {/* Imagery */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8">
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: heroRatio }}
            >
              <ProductImage
                image={painting.primaryImage}
                alt={painting.primaryImage?.alt ?? painting.title}
                seed={painting._id}
                width={1600}
                height={Math.round(1600 / heroRatio)}
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
              />
              {painting.status === "sold" && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-ink bg-bone/85 px-5 py-3">
                  Sold
                </span>
              )}
            </div>

            {painting.detailImages && painting.detailImages.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {painting.detailImages.map((img, i) => (
                  <li key={i} className="aspect-square overflow-hidden">
                    <ProductImage
                      image={img}
                      alt={img.alt ?? `${painting.title} — detail ${i + 1}`}
                      seed={`${painting._id}-${i}`}
                      width={600}
                      height={600}
                      sizes="(min-width: 768px) 25vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Metadata + buy */}
          <aside className="col-span-12 md:col-span-5 lg:col-span-4 md:sticky md:top-28 md:self-start">
            {painting.year && <p className="text-meta mb-4">{painting.year}</p>}
            <h1 className="font-display font-light text-[length:var(--text-display-md)] leading-[1.05] tracking-[-0.02em]">
              {painting.title}
            </h1>

            {painting.status === "sold" ? (
              <p className="mt-8 inline-block text-ui px-8 py-5 bg-rule text-bone-deep">
                Sold
              </p>
            ) : painting.status === "nfs" ? (
              <p className="mt-8 text-caption text-bone-deep italic">
                Not for sale — part of the studio collection.
              </p>
            ) : (
              <a
                href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
                  `Inquiry about "${painting.title}"`
                )}`}
                className="mt-8 inline-block text-ui px-8 py-5 bg-bone text-ink hover:bg-bone-deep transition-colors"
              >
                Inquire about purchase
              </a>
            )}

            {painting.story && painting.story.length > 0 && (
              <div className="mt-12 space-y-4 text-[length:var(--text-body-lg)] leading-relaxed">
                <PortableContent value={painting.story} />
              </div>
            )}
          </aside>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="py-24 md:py-32 bg-ink-soft">
          <Container width="wide">
            <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-12">
              Related <span className="font-display-italic">works</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-16">
              {related.map((p, i) => (
                <li key={p._id}>
                  <PaintingCard painting={p} index={i} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
