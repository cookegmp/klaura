import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/Container";
import { ProductImage } from "@/components/site/ProductImage";
import { PortableContent } from "@/components/site/PortableContent";
import { BuyButton } from "@/components/site/BuyButton";
import { Disclosure } from "@/components/site/Disclosure";
import { PaintingCard } from "@/components/site/PaintingCard";
import {
  getPaintingBySlug,
  getRelatedPaintings,
  getSiteSettings,
} from "@/lib/sanity/read";
import { siteConfig } from "@/lib/site-config";
import { formatDimensions, formatPriceUSD } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const painting = await getPaintingBySlug(slug);
  if (!painting) return { title: "Painting" };

  return {
    title: painting.title,
    description: `${painting.title} — ${painting.medium}, ${painting.year}, by Kelly Laaura.`,
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
  const [related, settings] = await Promise.all([
    getRelatedPaintings(slug, tagIds),
    getSiteSettings(),
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: painting.title,
    description: `${painting.medium}, ${painting.dimensions.heightInches}×${painting.dimensions.widthInches} in, ${painting.year}.`,
    image: painting.primaryImage?.asset?._ref,
    sku: painting._id,
    brand: { "@type": "Person", name: "Kelly Laaura" },
    offers: {
      "@type": "Offer",
      price: painting.price,
      priceCurrency: "USD",
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
              style={{
                aspectRatio:
                  painting.dimensions.widthInches / painting.dimensions.heightInches,
              }}
            >
              <ProductImage
                image={painting.primaryImage}
                alt={painting.primaryImage?.alt ?? painting.title}
                seed={painting._id}
                width={1600}
                height={Math.round(
                  1600 *
                    (painting.dimensions.heightInches / painting.dimensions.widthInches)
                )}
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
              />
              {painting.status === "sold" && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-bone bg-ink/85 px-5 py-3">
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
            <p className="text-ui text-ink-soft mb-4">{painting.year}</p>
            <h1 className="font-display font-light text-[length:var(--text-display-md)] leading-[1.05] tracking-[-0.02em]">
              {painting.title}
            </h1>
            <dl className="mt-8 space-y-2 text-ink-soft">
              <div className="flex justify-between">
                <dt className="text-ui">Medium</dt>
                <dd className="text-right">{painting.medium}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ui">Size</dt>
                <dd className="text-right">{formatDimensions(painting.dimensions)}</dd>
              </div>
              {painting.dimensions.framed !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-ui">Frame</dt>
                  <dd className="text-right">{painting.dimensions.framed ? "Framed" : "Unframed"}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-rule mt-6 pt-6">
                <dt className="text-ui">Price</dt>
                <dd className="text-right text-xl font-display text-ink">
                  {formatPriceUSD(painting.price)}
                </dd>
              </div>
            </dl>

            <BuyButton
              productType="painting"
              productId={painting._id}
              status={painting.status}
              priceLabel={formatPriceUSD(painting.price)}
              className="mt-8"
            />

            {painting.story && painting.story.length > 0 && (
              <div className="mt-12 space-y-4 text-[length:var(--text-body-lg)] leading-relaxed">
                <PortableContent value={painting.story} />
              </div>
            )}

            <div className="mt-12">
              <Disclosure label="Shipping & care">
                <div className="space-y-3 mt-3 text-sm">
                  <p>
                    Ships from Richmond, Indiana via insured ground service. Most pieces
                    arrive in 7–10 business days. Larger or framed works may require
                    additional crating time.
                  </p>
                  {painting.shippingNotes && (
                    <p className="text-caption text-ink-soft">{painting.shippingNotes}</p>
                  )}
                  {settings?.shippingFlatRateUS != null && (
                    <p className="text-caption text-ink-soft">
                      Flat US rate: {formatPriceUSD(settings.shippingFlatRateUS)}
                    </p>
                  )}
                </div>
              </Disclosure>
            </div>
          </aside>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="py-24 md:py-32 bg-bone-deep">
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
