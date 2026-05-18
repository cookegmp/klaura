import { defineArrayMember, defineType } from "sanity";

/**
 * Portable Text block content. Used by:
 *   - painting.story
 *   - vintageItem.description
 *   - aboutPage.story
 *   - siteSettings.{shippingPolicy,returnsPolicy,privacyPolicy,terms}
 *
 * Restrained mark set — Kelly is a painter, not a publisher; she doesn't
 * need every formatting toggle in the world.
 */
export const blockContentSchema = defineType({
  name: "blockContent",
  title: "Block content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Italic", value: "em" },
          { title: "Bold", value: "strong" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "External link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (Rule) =>
                  Rule.uri({ allowRelative: false, scheme: ["http", "https", "mailto"] }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
  ],
});
