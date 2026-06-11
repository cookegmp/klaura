import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllPaintings } from "@/lib/sanity/read";
import { PAINTING_CATEGORIES } from "@/types/sanity";

const STATIC_ROUTES = [
  "",
  "/gallery",
  "/studio",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const paintings = await getAllPaintings();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const paintingEntries: MetadataRoute.Sitemap = paintings
    .filter((p) => p.status !== "nfs")
    .map((p) => ({
      url: `${siteConfig.url}/paintings/${p.slug.current}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : now,
      changeFrequency: "monthly",
      priority: p.status === "available" ? 0.9 : 0.5,
    }));

  // Per-category gallery rooms. The Eighteen+ room is marked noindex via
  // route metadata, so we deliberately omit it from the sitemap.
  const categoryEntries: MetadataRoute.Sitemap = PAINTING_CATEGORIES.filter(
    (c) => !c.mature
  ).map((c) => ({
    url: `${siteConfig.url}/gallery/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...paintingEntries];
}
