import { defineField, defineType } from "sanity";

export const vintageItemSchema = defineType({
  name: "vintageItem",
  title: "Vintage item",
  type: "document",
  groups: [
    { name: "core", title: "Core" },
    { name: "fit", title: "Fit & condition" },
    { name: "media", title: "Media" },
    { name: "inventory", title: "Inventory" },
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
      name: "category",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "Dress", value: "dress" },
          { title: "Top", value: "top" },
          { title: "Bottom", value: "bottom" },
          { title: "Outerwear", value: "outerwear" },
          { title: "Knitwear", value: "knitwear" },
          { title: "Accessory", value: "accessory" },
          { title: "Other", value: "other" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "era",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "Pre-1960", value: "pre-1960" },
          { title: "1960s", value: "1960s" },
          { title: "1970s", value: "1970s" },
          { title: "1980s", value: "1980s" },
          { title: "1990s", value: "1990s" },
          { title: "2000s", value: "2000s" },
          { title: "Unknown", value: "unknown" },
        ],
      },
    }),
    defineField({
      name: "labelSize",
      type: "string",
      group: "fit",
      description: "As marked on the garment. May be empty.",
    }),
    defineField({
      name: "measurements",
      type: "object",
      group: "fit",
      description: "All in inches. Flat, garment laid flat then measured.",
      fields: [
        defineField({ name: "chestFlat", type: "number" }),
        defineField({ name: "waistFlat", type: "number" }),
        defineField({ name: "hipFlat", type: "number" }),
        defineField({ name: "length", type: "number" }),
        defineField({ name: "sleeve", type: "number" }),
        defineField({ name: "shoulder", type: "number" }),
        defineField({ name: "notes", type: "text", rows: 3 }),
      ],
    }),
    defineField({ name: "material", type: "string", group: "fit" }),
    defineField({
      name: "condition",
      type: "string",
      group: "fit",
      options: {
        list: [
          { title: "Excellent", value: "excellent" },
          { title: "Very good", value: "very-good" },
          { title: "Good", value: "good" },
          { title: "Fair", value: "fair" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "conditionNotes",
      type: "text",
      group: "fit",
      rows: 4,
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
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reservedUntil",
      type: "datetime",
      group: "inventory",
      readOnly: true,
    }),
    defineField({
      name: "stripeSessionId",
      type: "string",
      group: "inventory",
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
      name: "description",
      type: "blockContent",
      group: "core",
    }),
    defineField({
      name: "weightOz",
      type: "number",
      group: "core",
      description: "For shipping cost calculation.",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      group: "core",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "soldAt", type: "datetime", group: "inventory" }),
  ],
  preview: {
    select: {
      title: "title",
      media: "primaryImage",
      era: "era",
      status: "status",
    },
    prepare({ title, media, era, status }) {
      return {
        title,
        subtitle: `${era ?? "—"} · ${status ?? "—"}`,
        media,
      };
    },
  },
});
