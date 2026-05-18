import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemas";
import { structure } from "@/sanity/desk-structure";

/**
 * Sanity Studio config — mounted in the same Next.js app at
 * `/studio-admin/[[...tool]]`.
 *
 * Project ID is intentionally read at runtime via NEXT_PUBLIC_* so a
 * placeholder works fine in mock mode; the Studio simply won't load
 * remote data until real values are wired in.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

export default defineConfig({
  name: "kellylaura",
  title: "Kelly Laura — Studio",
  projectId,
  dataset,
  apiVersion,
  basePath: "/studio-admin",
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: { types: schemaTypes },
});
