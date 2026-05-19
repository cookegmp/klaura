import type { Metadata } from "next";
import Link from "next/link";
import { CategoryDoorways } from "@/components/site/CategoryDoorways";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { getCategorySummaries } from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Five rooms of work by Kelly Laura — Landscapes, Houses, Animals & Pets, Eighteen+, and Miscellaneous.",
};

export default async function GalleryIndexPage() {
  const summaries = await getCategorySummaries();

  return (
    <>
      <section className="pt-20 md:pt-32 pb-20 md:pb-28">
        <Container width="wide">
          <Reveal>
            <p className="text-ui text-ink-soft mb-8 md:mb-10">
              § Gallery · five rooms
            </p>
          </Reveal>
          <Reveal delay={120} rise={48}>
            <h1 className="font-display-caps font-light text-[length:var(--text-display-lg)] md:text-[length:var(--text-display-xl)] leading-[0.85] tracking-[-0.03em] max-w-5xl">
              Choose a
              <br />
              <span className="font-display-italic text-ochre-deep normal-case">
                doorway
              </span>
              .
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-12 max-w-xl text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
              The work is grouped into five rooms. Each one keeps its own pace.
              The Eighteen+ room is age-restricted; you&rsquo;ll be asked to confirm
              before you enter.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="pb-32 md:pb-48">
        <Container width="wide">
          <CategoryDoorways summaries={summaries} />
        </Container>
      </section>

      {/* A quiet escape hatch for visitors who want to see everything at once. */}
      <section className="pb-32 md:pb-44 border-t border-rule/60 pt-16 md:pt-20">
        <Container width="wide">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-ui text-ink-soft mb-4">§ Or</p>
                <p className="font-display text-2xl md:text-3xl leading-tight max-w-xl">
                  See every available work in one long catalogue.
                </p>
              </div>
              <Link
                href="/paintings"
                className="text-ui pb-1 border-b border-ink hover:text-ochre-deep hover:border-ochre-deep transition-colors self-start md:self-auto"
              >
                Full catalogue →
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
