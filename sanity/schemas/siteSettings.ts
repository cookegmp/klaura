import { defineField, defineType } from "sanity";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "featuredHeroPainting",
      type: "reference",
      to: [{ type: "painting" }],
      description: "Hero on the home page.",
    }),
    defineField({
      name: "marqueePhrases",
      type: "array",
      of: [{ type: "string" }],
      description: "Short phrases that scroll across the home page.",
    }),
    defineField({ name: "shippingPolicy", type: "blockContent" }),
    defineField({ name: "returnsPolicy", type: "blockContent" }),
    defineField({ name: "privacyPolicy", type: "blockContent" }),
    defineField({ name: "terms", type: "blockContent" }),
    defineField({ name: "instagramHandle", type: "string" }),
    defineField({
      name: "contactEmail",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "shippingFlatRateUS",
      type: "number",
      initialValue: 45,
    }),
    defineField({
      name: "shippingFlatRateIntl",
      type: "number",
      initialValue: 120,
    }),
  ],
});
