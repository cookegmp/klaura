import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { env } from "@/lib/env";
import type { SanityImage } from "@/types/sanity";

/**
 * Sanity image URL builder. Falls back to a tonal placeholder gradient when
 * the project is in mock mode and the image ref starts with
 * "image-placeholder-…".
 */

let _builder: ReturnType<typeof imageUrlBuilder> | undefined;

function builder() {
  if (!_builder) {
    const e = env();
    _builder = imageUrlBuilder({
      projectId: e.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder",
      dataset: e.NEXT_PUBLIC_SANITY_DATASET,
    });
  }
  return _builder;
}

export function urlFor(source: SanityImageSource) {
  return builder().image(source);
}

export function isPlaceholderImage(image: SanityImage | undefined | null): boolean {
  if (!image) return true;
  return image.asset?._ref?.startsWith("image-placeholder-") ?? false;
}
