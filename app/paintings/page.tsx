import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { PaintingCard } from "@/components/site/PaintingCard";
import { PaintingsFilters } from "@/components/site/PaintingsFilters";
import { getAllPaintings } from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "Paintings",
  description: "Original paintings by Kelly Laaura. Each work is one of one.",
};

type SearchParams = Promise<{
  status?: string;
  tag?: string;
}>;

export default async function PaintingsIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, tag } = await searchParams;
  const all = await getAllPaintings();

  const filtered = all.filter((p) => {
    if (status === "available" && p.status !== "available") return false;
    if (status === "sold" && p.status !== "sold") return false;
    if (tag && !(p.tags ?? []).some((t) => t._ref === tag)) return false;
    return true;
  });

  return (
    <Container width="wide" className="py-20 md:py-32">
      <header className="mb-16 max-w-3xl">
        <p className="text-ui text-ink-soft mb-6">The gallery</p>
        <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
          Paintings <span className="font-display-italic text-ochre-deep">in light</span>.
        </h1>
        <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed max-w-xl">
          Each work is original and sold once. Pieces that have already found a home stay
          in the archive — visible but quieted.
        </p>
      </header>

      <PaintingsFilters
        currentStatus={status}
        availableCount={all.filter((p) => p.status === "available").length}
        soldCount={all.filter((p) => p.status === "sold").length}
      />

      {filtered.length === 0 ? (
        <p className="text-ink-soft mt-16">No works match these filters.</p>
      ) : (
        <ul className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 lg:gap-x-12">
          {filtered.map((p, i) => (
            <li key={p._id}>
              <PaintingCard painting={p} index={i} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
