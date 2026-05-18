"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import type { Painting } from "@/types/sanity";
import { formatDimensions, formatPriceUSD } from "@/lib/utils";

/**
 * Signature scroll moment for the home page. The outer section is taller
 * than the viewport; while it's stickied at the top of the screen, the
 * inner horizontal track translates left in lockstep with scroll
 * progress. Net effect: vertical scroll = horizontal gallery glide.
 *
 * Falls back to a normal grid below md (mobile gets a simple vertical
 * stack — the horizontal-scroll mechanic doesn't read well on phones).
 *
 * Respects prefers-reduced-motion: animation collapses to a static
 * horizontal scroll with snap points.
 */
export function HorizontalGallery({ paintings }: { paintings: Painting[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;

    const handle = () => {
      raf = 0;
      const rect = wrapper.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      // 0 → 1 as wrapper scrolls past the viewport top.
      const p = Math.max(0, Math.min(1, -rect.top / total));
      setProgress(p);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(handle);
    };

    handle();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (paintings.length === 0) return null;

  // How far the track needs to translate. Computed by: trackWidth - viewportWidth.
  // We set it via inline transform using progress (0..1).
  const trackWidthVw = paintings.length * 70; // each card ~70vw on desktop
  const translateVw = -(trackWidthVw - 100) * progress; // 100vw remains visible at end

  return (
    <>
      {/* Desktop — sticky horizontal scroll mechanic */}
      <div
        ref={wrapperRef}
        className="hidden md:block relative"
        style={{
          // Outer height controls how long the horizontal scroll lasts.
          // ~150vh per painting feels deliberate, not exhausting.
          height: `${paintings.length * 100 + 50}vh`,
        }}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <div
            ref={trackRef}
            className="flex items-center gap-12 lg:gap-20 pl-[8vw] pr-[8vw]"
            style={{
              transform: reduced
                ? "translateX(0)"
                : `translate3d(${translateVw}vw, 0, 0)`,
              willChange: "transform",
            }}
          >
            {paintings.map((p, i) => (
              <GalleryItem painting={p} index={i + 1} total={paintings.length} key={p._id} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile — simple vertical stack */}
      <div className="md:hidden space-y-16">
        {paintings.map((p, i) => (
          <MobileItem painting={p} index={i + 1} total={paintings.length} key={p._id} />
        ))}
      </div>
    </>
  );
}

function GalleryItem({
  painting,
  index,
  total,
}: {
  painting: Painting;
  index: number;
  total: number;
}) {
  const aspect = painting.dimensions.widthInches / painting.dimensions.heightInches;
  return (
    <Link
      href={`/paintings/${painting.slug.current}`}
      className="group block shrink-0 w-[60vw] lg:w-[55vw]"
    >
      <div className="flex items-end justify-between mb-4 font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.08em] text-ink-soft">
        <span>{painting.year}</span>
        <span>
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        <ProductImage
          image={painting.primaryImage}
          alt={painting.primaryImage?.alt ?? painting.title}
          seed={painting._id}
          width={1600}
          height={Math.round(1600 / aspect)}
          sizes="(min-width: 1024px) 55vw, 60vw"
          className="transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
        />
        {painting.status === "sold" && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-bone bg-ink/85 px-5 py-3">
            Sold
          </span>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="font-display text-3xl lg:text-4xl font-light leading-tight tracking-[-0.02em]">
          {painting.title}
        </h3>
        <span className="font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.06em] text-ink-soft">
          {painting.medium} · {formatDimensions(painting.dimensions)}
        </span>
      </div>
      <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.08em] text-ink">
        {painting.status === "sold" ? "Sold" : formatPriceUSD(painting.price)}
      </p>
    </Link>
  );
}

function MobileItem({
  painting,
  index,
  total,
}: {
  painting: Painting;
  index: number;
  total: number;
}) {
  const aspect = painting.dimensions.widthInches / painting.dimensions.heightInches;
  return (
    <Link href={`/paintings/${painting.slug.current}`} className="group block">
      <div className="flex items-end justify-between mb-3 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.08em] text-ink-soft">
        <span>{painting.year}</span>
        <span>
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        <ProductImage
          image={painting.primaryImage}
          alt={painting.primaryImage?.alt ?? painting.title}
          seed={painting._id}
          width={900}
          height={Math.round(900 / aspect)}
          sizes="100vw"
        />
        {painting.status === "sold" && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-ui text-bone bg-ink/85 px-4 py-2">
            Sold
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-2xl font-light">{painting.title}</h3>
      <p className="mt-1 text-caption text-ink-soft">
        {painting.medium} · {formatDimensions(painting.dimensions)}
      </p>
    </Link>
  );
}
