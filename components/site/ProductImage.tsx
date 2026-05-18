import Image from "next/image";
import { isPlaceholderImage, localImageUrl, urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/types/sanity";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  image: SanityImage | undefined;
  alt: string;
  /** Used to seed the deterministic gradient when no real image exists. */
  seed?: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Single image renderer used everywhere on the storefront. Three branches:
 *
 *   1. Real Sanity image — built via @sanity/image-url
 *   2. Local sample-art image — served directly from /public/sample-art/
 *      (the mock-store seed paintings)
 *   3. No image / placeholder ref — tonal gradient, deterministic per seed
 *
 * In every branch the rendered <Image> uses the same aspect-ratio container
 * so layout shift is impossible.
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
  const localUrl = localImageUrl(image);
  const isPlaceholder = isPlaceholderImage(image);

  if (isPlaceholder) {
    const gradient = pickGradient(seed ?? alt);
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("relative w-full overflow-hidden bg-bone-deep", gradient, className)}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    );
  }

  if (localUrl) {
    return (
      <Image
        src={localUrl}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={cn("w-full h-full object-cover", className)}
        // Sample artwork lives in `/public` so disable next/image optimisation
        // server requests (it would re-encode through sharp, which we don't
        // have in dev). The browser still gets the original JPEG with the
        // requested width prop.
        unoptimized
      />
    );
  }

  // Real Sanity image path.
  const url = urlFor(image!).width(width * 2).fit("max").auto("format").url();
  return (
    <Image
      src={url}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn("w-full h-full object-cover", className)}
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
