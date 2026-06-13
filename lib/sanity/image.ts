import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { env } from "@/lib/env";
import type { SanityImage } from "@/types/sanity";

/**
 * Sanity image URL builder. Two non-Sanity ref conventions are recognised:
 *
 *   - `local-image:<filename>`     → served from `/sample-art/<filename>`
 *                                    (used by the mock-store seed paintings)
 *   - `local-image:/<path>`        → served from `/<path>` verbatim, for
 *                                    assets that live at the public root
 *                                    (e.g. the artist portrait `/kelly.jpg`)
 *   - `image-placeholder-…`        → no image at all; ProductImage falls back
 *                                    to a tonal gradient placeholder
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

const PLACEHOLDER_PREFIX = "image-placeholder-";
const LOCAL_PREFIX = "local-image:";

export function isPlaceholderImage(image: SanityImage | undefined | null): boolean {
  if (!image) return true;
  const ref = image.asset?._ref ?? "";
  // Real Sanity images, the local-image: convention, and anything else with
  // a meaningful asset ref are NOT placeholders.
  return ref.startsWith(PLACEHOLDER_PREFIX);
}

export function localImageUrl(image: SanityImage | undefined | null): string | null {
  if (!image) return null;
  const ref = image.asset?._ref ?? "";
  if (!ref.startsWith(LOCAL_PREFIX)) return null;
  const filename = ref.slice(LOCAL_PREFIX.length);
  // A leading slash means the asset lives at the public root, not in sample-art.
  if (filename.startsWith("/")) return filename;
  return `/sample-art/${filename}`;
}
