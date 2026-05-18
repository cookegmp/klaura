import { defineField, defineType } from "sanity";

export const paintingSchema = defineType({
  name: "painting",
  title: "Painting",
  type: "document",
  groups: [
    { name: "core", title: "Core" },
    { name: "media", title: "Media" },
    { name: "inventory", title: "Inventory" },
    { name: "presentation", title: "Presentation" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "core",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "core",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      type: "number",
      group: "core",
      validation: (Rule) => Rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: "medium",
      type: "string",
      group: "core",
      description: "e.g., Oil on linen, Soft pastel on sanded paper",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dimensions",
      type: "object",
      group: "core",
      fields: [
        defineField({
          name: "widthInches",
          type: "number",
          validation: (Rule) => Rule.required().positive(),
        }),
        defineField({
          name: "heightInches",
          type: "number",
          validation: (Rule) => Rule.required().positive(),
        }),
        defineField({ name: "depthInches", type: "number" }),
        defineField({ name: "framed", type: "boolean", initialValue: false }),
      ],
    }),
    defineField({
      name: "weightOz",
      type: "number",
      group: "core",
      description: "For shipping cost calculation.",
    }),
    defineField({
      name: "price",
      type: "number",
      group: "core",
      description: "USD, integer dollars.",
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "status",
      type: "string",
      group: "inventory",
      initialValue: "available",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Reserved", value: "reserved" },
          { title: "Sold", value: "sold" },
          { title: "Not for sale", value: "nfs" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reservedUntil",
      type: "datetime",
      group: "inventory",
      description: "Set when checkout opens; cleared on completion or expiry.",
      readOnly: true,
    }),
    defineField({
      name: "stripeSessionId",
      type: "string",
      group: "inventory",
      description: "Active payment session, if any.",
      readOnly: true,
    }),
    defineField({
      name: "primaryImage",
      type: "image",
      group: "media",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          description: "Required for accessibility.",
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "detailImages",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string" })],
        },
      ],
    }),
    defineField({
      name: "story",
      type: "blockContent",
      group: "core",
      description: "Optional artist statement.",
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "presentation",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({
      name: "series",
      type: "reference",
      group: "presentation",
      to: [{ type: "series" }],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "presentation",
      initialValue: false,
    }),
    defineField({
      name: "featuredOrder",
      type: "number",
      group: "presentation",
      hidden: ({ document }) => !document?.featured,
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      group: "core",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "soldAt", type: "datetime", group: "inventory" }),
    defineField({
      name: "shippingNotes",
      type: "text",
      group: "inventory",
      description: "Per-piece notes (oversized, fragile, etc.).",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "primaryImage",
      year: "year",
      status: "status",
    },
    prepare({ title, media, year, status }) {
      return {
        title,
        subtitle: `${year ?? "—"} · ${status ?? "—"}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Created (newest first)",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Featured order",
      name: "featuredOrder",
      by: [{ field: "featuredOrder", direction: "asc" }],
    },
  ],
});
