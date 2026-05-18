import Image from "next/image";
import { isPlaceholderImage, urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/types/sanity";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  image: SanityImage | undefined;
  alt: string;
  /** Used to seed deterministic placeholder colour. */
  seed?: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Single image renderer used everywhere on the storefront. Falls back to a
 * deterministic tonal gradient when no real Sanity asset is connected
 * (mock-mode dev). This keeps the editorial design language intact even
 * with empty data.
 */
export function ProductImage({
  image,
  alt,
  seed,
  width,
  height,
  sizes,
  priority,
  className,
}: ProductImageProps) {
  if (isPlaceholderImage(image)) {
    const gradient = pickGradient(seed ?? alt);
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "relative w-full overflow-hidden bg-bone-deep",
          gradient,
          className
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    );
  }

  const url = urlFor(image!).width(width * 2).fit("max").auto("format").url();

  return (
    <Image
      src={url}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn("w-full h-auto", className)}
    />
  );
}

/* -----------------------------------------------------------------------
   Deterministic gradient picker — the same seed always yields the same
   tone, so a piece keeps its identity across renders.
   ----------------------------------------------------------------------- */
const GRADIENTS = [
  "bg-gradient-to-br from-ochre/40 via-bone-deep to-ink-soft/30",
  "bg-gradient-to-br from-ink-soft/35 via-bone-deep to-ochre/30",
  "bg-gradient-to-tr from-ochre-deep/40 via-bone to-ink-soft/25",
  "bg-gradient-to-bl from-bone-deep via-ochre/30 to-ink-soft/40",
  "bg-gradient-to-tl from-ochre/35 via-bone via-bone-deep to-ink-soft/30",
  "bg-gradient-to-r from-ink-soft/25 via-bone-deep to-ochre-deep/35",
] as const;

function pickGradient(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash << 5) - hash + ch.charCodeAt(0);
  const i = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[i]!;
}
