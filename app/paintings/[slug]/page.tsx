import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/Container";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    description: `Painting by Kelly Laaura — ${slug.replace(/-/g, " ")}`,
  };
}

export default async function PaintingDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!slug) notFound();

  return (
    <Container width="wide" className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">Painting · placeholder</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em] capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
          Detail page — full-bleed image, metadata, story, and Buy button render once Sanity is connected (Phase 2).
        </p>
      </header>
    </Container>
  );
}
