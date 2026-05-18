import type { StructureResolver } from "sanity/structure";

/**
 * Studio desk layout. Singletons live at the top (Site settings, About) so
 * Kelly never has to think about "where do I edit those"; commerce content
 * (paintings, vintage) gets its own headed group; inquiries get a separate
 * top-level item so they're visible the moment a new one lands.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings.singleton")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings.singleton")
        ),
      S.listItem()
        .title("About page")
        .id("aboutPage.singleton")
        .child(
          S.document().schemaType("aboutPage").documentId("aboutPage.singleton")
        ),
      S.divider(),
      S.listItem()
        .title("Paintings")
        .schemaType("painting")
        .child(S.documentTypeList("painting").title("Paintings")),
      S.listItem()
        .title("Vintage items")
        .schemaType("vintageItem")
        .child(S.documentTypeList("vintageItem").title("Vintage items")),
      S.divider(),
      S.listItem()
        .title("Commission inquiries")
        .schemaType("commissionInquiry")
        .child(
          S.documentTypeList("commissionInquiry").title("Commission inquiries")
        ),
      S.listItem()
        .title("Commission examples (public gallery)")
        .schemaType("commissionExample")
        .child(
          S.documentTypeList("commissionExample").title("Commission examples")
        ),
      S.divider(),
      S.listItem()
        .title("Series")
        .schemaType("series")
        .child(S.documentTypeList("series").title("Series")),
      S.listItem()
        .title("Tags")
        .schemaType("tag")
        .child(S.documentTypeList("tag").title("Tags")),
      S.divider(),
      S.listItem()
        .title("Newsletter signups")
        .schemaType("newsletterSignup")
        .child(S.documentTypeList("newsletterSignup").title("Signups")),
    ]);
