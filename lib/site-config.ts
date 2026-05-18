export const siteConfig = {
  name: "Kelly Laaura",
  shortName: "Kelly Laaura",
  description:
    "Original paintings and one-of-a-kind vintage from Kelly Laaura — landscapes, light, and slow finds.",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  instagram: "kellylaaura",
  contactEmail: "hello@kellylaaura.com",
} as const;

export type SiteConfig = typeof siteConfig;
