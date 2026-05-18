import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";

/**
 * Sanity webhook → tag-based revalidation. Configure in Sanity webhook UI:
 *   URL: ${SITE_URL}/api/revalidate
 *   Secret: matches SANITY_REVALIDATE_SECRET
 *   Body: {"tags": ["paintings", "vintage", "settings", ...]}
 */
const ALLOWED_TAGS = new Set([
  "paintings",
  "vintage",
  "about",
  "settings",
  "commission-examples",
]);

export async function POST(request: Request) {
  const secret = request.headers.get("x-sanity-secret") ?? "";
  const expected = env().SANITY_REVALIDATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid revalidate secret" } },
      { status: 401 }
    );
  }

  const body = (await request.json()) as { tags?: string[] };
  const tags = (body.tags ?? []).filter((t) => ALLOWED_TAGS.has(t));

  // Next 16 requires a cache profile; "default" is the standard
  // (5 min stale / 15 min revalidate) — matches Sanity webhook latency well.
  for (const tag of tags) {
    revalidateTag(tag, "default");
  }

  return NextResponse.json({ revalidated: tags });
}
