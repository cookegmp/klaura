import { defineField, defineType } from "sanity";

export const commissionInquirySchema = defineType({
  name: "commissionInquiry",
  title: "Commission inquiry",
  type: "document",
  fields: [
    defineField({
      name: "submittedAt",
      type: "datetime",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({ name: "projectType", type: "string" }),
    defineField({ name: "budgetRange", type: "string" }),
    defineField({ name: "timeline", type: "string" }),
    defineField({
      name: "message",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "referenceImages",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Responded", value: "responded" },
          { title: "In progress", value: "in-progress" },
          { title: "Completed", value: "completed" },
          { title: "Declined", value: "declined" },
        ],
        layout: "radio",
      },
    }),
    defineField({ name: "internalNotes", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "name", subtitle: "email", status: "status" },
    prepare({ title, subtitle, status }) {
      return { title, subtitle: `${subtitle} · ${status}` };
    },
  },
  orderings: [
    {
      title: "Newest first",
      name: "newest",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
});
