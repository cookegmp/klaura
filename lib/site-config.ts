export const siteConfig = {
  name: "Kelly Laura",
  shortName: "Kelly Laura",
  description:
    "Original paintings by Kelly Laura — landscapes, light, and slow finds.",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  instagram: "kellylaaura",
  contactEmail: "contact@kellylaura.art",
} as const;

export type SiteConfig = typeof siteConfig;
