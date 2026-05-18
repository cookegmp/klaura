import { defineField, defineType } from "sanity";

export const aboutPageSchema = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({
      name: "story",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "pullQuote", type: "text", rows: 3 }),
    defineField({
      name: "studioImages",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string" })],
        },
      ],
    }),
  ],
});
