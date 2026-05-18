export const siteConfig = {
  name: "Kelly Laura",
  shortName: "Kelly Laura",
  description:
    "Original paintings and one-of-a-kind vintage from Kelly Laura — landscapes, light, and slow finds.",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  instagram: "kellylaaura",
  contactEmail: "hello@kellylauraart.com",
} as const;

export type SiteConfig = typeof siteConfig;
