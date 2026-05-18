import { defineField, defineType } from "sanity";

export const commissionExampleSchema = defineType({
  name: "commissionExample",
  title: "Commission example",
  type: "document",
  description: "Past commission for the public gallery on /commissions.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "story", type: "text", rows: 5 }),
    defineField({ name: "completedYear", type: "number" }),
  ],
  preview: {
    select: { title: "title", subtitle: "completedYear", media: "image" },
  },
});
