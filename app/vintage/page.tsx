import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { VintageCard } from "@/components/site/VintageCard";
import { VintageFilters } from "@/components/site/VintageFilters";
import { getAllVintage } from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "Vintage",
  description: "One-of-a-kind vintage clothing, curated by Kelly Laura.",
};

type SearchParams = Promise<{
  category?: string;
  era?: string;
}>;

export default async function VintageIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, era } = await searchParams;
  const all = await getAllVintage();

  const filtered = all.filter((v) => {
    if (category && v.category !== category) return false;
    if (era && v.era !== era) return false;
    return true;
  });

  const categories = Array.from(new Set(all.map((v) => v.category))).sort();
  const eras = Array.from(new Set(all.map((v) => v.era).filter(Boolean))).sort() as string[];

  return (
    <Container width="wide" className="py-20 md:py-32">
      <header className="mb-12 max-w-3xl">
        <p className="text-ui text-bone-deep mb-6">The rack</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          Vintage, <span className="font-display-italic text-ochre-deep">found slowly</span>.
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed max-w-xl">
          Each piece is one of one. We list flat measurements alongside the label size, since
          vintage sizing was never standardised.
        </p>
      </header>

      <VintageFilters
        currentCategory={category}
        currentEra={era}
        categories={categories}
        eras={eras}
      />

      {filtered.length === 0 ? (
        <p className="text-bone-deep mt-16">No items match these filters.</p>
      ) : (
        <ul className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
          {filtered.map((v, i) => (
            <li key={v._id}>
              <VintageCard item={v} index={i} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
