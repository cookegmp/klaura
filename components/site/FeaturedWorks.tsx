/**
 * Renders the four featured paintings strip on the home page.
 *
 * Phase 2 will wire this to `getFeaturedPaintings()` from sanity/lib/queries.
 * In Phase 0/1 we render placeholder tiles so the layout is real.
 */
import Link from "next/link";

type Tile = {
  href: string;
  title: string;
  meta: string;
  tone: string;
};

const placeholders: Tile[] = [
  {
    href: "/paintings",
    title: "Sample painting",
    meta: "Oil on linen · 24 × 30 in",
    tone: "from-ochre/40 via-bone-deep to-ink-soft/30",
  },
  {
    href: "/paintings",
    title: "Sample painting",
    meta: "Soft pastel · 18 × 24 in",
    tone: "from-ink-soft/30 via-bone-deep to-ochre/30",
  },
  {
    href: "/paintings",
    title: "Sample painting",
    meta: "Oil on linen · 30 × 40 in",
    tone: "from-ochre-deep/40 via-bone to-ink-soft/20",
  },
  {
    href: "/paintings",
    title: "Sample painting",
    meta: "Soft pastel · 12 × 16 in",
    tone: "from-bone-deep via-ochre/30 to-ink-soft/40",
  },
];

export function FeaturedWorks() {
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
      {placeholders.map((t, i) => (
        <li
          key={i}
          className="group"
          style={{ transform: i % 2 === 1 ? "translateY(2.5rem)" : undefined }}
        >
          <Link href={t.href} className="block">
            <div
              className={`relative aspect-[3/4] w-full bg-gradient-to-br ${t.tone} overflow-hidden`}
            >
              <span className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03]" />
            </div>
            <div className="mt-5 flex flex-col gap-1">
              <p className="font-display text-xl leading-tight">{t.title}</p>
              <p className="text-caption text-ink-soft">{t.meta}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
