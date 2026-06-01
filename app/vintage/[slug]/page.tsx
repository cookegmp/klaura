import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/Container";
import { ProductImage } from "@/components/site/ProductImage";
import { PortableContent } from "@/components/site/PortableContent";
import { BuyButton } from "@/components/site/BuyButton";
import { Disclosure } from "@/components/site/Disclosure";
import { getVintageBySlug, getSiteSettings } from "@/lib/sanity/read";
import { siteConfig } from "@/lib/site-config";
import { formatPriceUSD } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getVintageBySlug(slug);
  if (!item) return { title: "Vintage" };
  return {
    title: item.title,
    description: `${item.title} — ${item.era ?? "vintage"} ${item.category}, condition ${item.condition}.`,
  };
}

export default async function VintageDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = await getVintageBySlug(slug);
  if (!item) notFound();

  const settings = await getSiteSettings();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: `${item.era ?? "Vintage"} ${item.category}. Condition: ${item.condition}.`,
    sku: item._id,
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "USD",
      availability:
        item.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url: `${siteConfig.url}/vintage/${slug}`,
    },
  };

  const m = item.measurements;
  const measurementRows: [string, number | undefined][] = [
    ["Chest (flat)", m?.chestFlat],
    ["Waist (flat)", m?.waistFlat],
    ["Hip (flat)", m?.hipFlat],
    ["Length", m?.length],
    ["Sleeve", m?.sleeve],
    ["Shoulder", m?.shoulder],
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Container width="wide" className="py-12 md:py-20">
        <div className="grid grid-cols-12 gap-y-16 md:gap-x-16">
          <div className="col-span-12 md:col-span-7 lg:col-span-8 space-y-4">
            <div className="relative overflow-hidden aspect-[4/5]">
              <ProductImage
                image={item.primaryImage}
                alt={item.primaryImage?.alt ?? item.title}
                seed={item._id}
                width={1400}
                height={1750}
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
              />
              {item.status === "sold" && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-ink bg-bone/85 px-5 py-3">
                  Sold
                </span>
              )}
            </div>
            {item.detailImages && item.detailImages.length > 0 && (
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {item.detailImages.map((img, i) => (
                  <li key={i} className="aspect-square overflow-hidden">
                    <ProductImage
                      image={img}
                      alt={img.alt ?? `${item.title} — detail ${i + 1}`}
                      seed={`${item._id}-${i}`}
                      width={600}
                      height={600}
                      sizes="(min-width: 768px) 25vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="col-span-12 md:col-span-5 lg:col-span-4 md:sticky md:top-28 md:self-start">
            <p className="text-meta mb-4 capitalize">
              {item.era ?? "Vintage"} · {item.category}
            </p>
            <h1 className="font-display font-light text-[length:var(--text-display-md)] leading-[1.05] tracking-[-0.02em]">
              {item.title}
            </h1>

            <dl className="mt-8 space-y-2 text-bone-deep text-sm">
              {item.material && (
                <div className="flex justify-between">
                  <dt className="text-meta">Material</dt>
                  <dd className="text-right">{item.material}</dd>
                </div>
              )}
              {item.labelSize && (
                <div className="flex justify-between">
                  <dt className="text-meta">Label size</dt>
                  <dd className="text-right">{item.labelSize}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-meta">Condition</dt>
                <dd className="text-right capitalize">{item.condition.replace("-", " ")}</dd>
              </div>
              <div className="flex justify-between border-t border-rule mt-6 pt-6">
                <dt className="text-meta">Price</dt>
                <dd className="text-right text-xl font-display text-bone">
                  {formatPriceUSD(item.price)}
                </dd>
              </div>
            </dl>

            <BuyButton
              productType="vintage"
              productId={item._id}
              status={item.status}
              priceLabel={formatPriceUSD(item.price)}
              className="mt-8"
            />

            {item.description && item.description.length > 0 && (
              <div className="mt-12 space-y-4">
                <PortableContent value={item.description} />
              </div>
            )}

            {item.conditionNotes && (
              <div className="mt-8 p-5 bg-ink-soft">
                <p className="text-meta mb-2">Condition notes</p>
                <p className="text-sm text-bone-deep leading-relaxed">{item.conditionNotes}</p>
              </div>
            )}

            <div className="mt-12">
              <Disclosure label="Measurements (inches)" defaultOpen>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {measurementRows.map(([label, val]) =>
                    typeof val === "number" ? (
                      <div key={label} className="flex justify-between border-b border-rule/40 py-1.5">
                        <dt>{label}</dt>
                        <dd>{val} in</dd>
                      </div>
                    ) : null
                  )}
                  {m?.notes && <p className="pt-3 text-caption text-bone-deep">{m.notes}</p>}
                </dl>
              </Disclosure>
              <Disclosure label="Shipping & care">
                <div className="space-y-3 mt-3 text-sm">
                  <p>
                    Vintage ships USPS Priority and arrives in 3–5 business days within the
                    US. Tracking included.
                  </p>
                  {settings?.shippingFlatRateUS != null && (
                    <p className="text-caption text-bone-deep">
                      Flat US rate: {formatPriceUSD(settings.shippingFlatRateUS)}
                    </p>
                  )}
                </div>
              </Disclosure>
              <Disclosure label="Notes on vintage sizing">
                <p className="text-sm mt-3">
                  Label sizes from past decades don&apos;t match modern equivalents — use
                  the flat measurements above. If you&apos;d like help comparing to a
                  garment you already own, just reach out.
                </p>
              </Disclosure>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
