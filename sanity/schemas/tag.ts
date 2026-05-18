import { defineField, defineType } from "sanity";

export const tagSchema = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
  ],
});
