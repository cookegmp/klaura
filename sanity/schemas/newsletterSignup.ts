import { defineField, defineType } from "sanity";

export const newsletterSignupSchema = defineType({
  name: "newsletterSignup",
  title: "Newsletter signup",
  type: "document",
  fields: [
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "submittedAt",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "source", type: "string" }),
  ],
  preview: {
    select: { title: "email", subtitle: "submittedAt" },
  },
  orderings: [
    {
      title: "Newest first",
      name: "newest",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
});
