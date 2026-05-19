/**
 * GROQ queries — strings only. Execution lives in `lib/sanity/read.ts` so it
 * can branch between the real client and the mock-store.
 */

export const PAINTINGS_LIST = /* groq */ `
  *[_type == "painting"] | order(createdAt desc) {
    _id, _rev, title, slug, category, year, medium, dimensions, price, status,
    primaryImage, tags, series, featured, featuredOrder, createdAt
  }
`;

export const PAINTINGS_BY_CATEGORY = /* groq */ `
  *[_type == "painting" && category == $category] | order(createdAt desc) {
    _id, _rev, title, slug, category, year, medium, dimensions, price, status,
    primaryImage, "series": series->{ _id, title, slug, description },
    featured, featuredOrder, createdAt
  }
`;

export const PAINTINGS_COVER_BY_CATEGORY = /* groq */ `
  {
    "byCategory": *[_type == "painting"] | order(featuredOrder asc, createdAt desc) {
      category,
      _id,
      title,
      slug,
      primaryImage
    }
  }
`;

export const PAINTING_BY_SLUG = /* groq */ `
  *[_type == "painting" && slug.current == $slug][0] {
    ...,
    "series": series->{ _id, title, slug },
    "tags": tags[]->{ _id, title, slug }
  }
`;

export const RELATED_PAINTINGS = /* groq */ `
  *[_type == "painting" && slug.current != $slug && count((tags[]._ref)[@ in $tagIds]) > 0] | order(createdAt desc) [0...3] {
    _id, title, slug, primaryImage, price, status
  }
`;

export const VINTAGE_LIST = /* groq */ `
  *[_type == "vintageItem"] | order(status == "available" desc, createdAt desc) {
    _id, _rev, title, slug, category, era, labelSize, price, status,
    primaryImage, condition, createdAt
  }
`;

export const VINTAGE_BY_SLUG = /* groq */ `
  *[_type == "vintageItem" && slug.current == $slug][0]
`;

export const FEATURED_PAINTINGS = /* groq */ `
  *[_type == "painting" && featured == true] | order(featuredOrder asc, createdAt desc) [0...4] {
    _id, title, slug, primaryImage, price, status, dimensions, medium
  }
`;

export const HERO_PAINTING = /* groq */ `
  *[_id == "siteSettings.singleton"][0].featuredHeroPainting->{
    _id, title, slug, primaryImage, dimensions, medium, year
  }
`;

export const SITE_SETTINGS = /* groq */ `
  *[_id == "siteSettings.singleton"][0]
`;

export const ABOUT_PAGE = /* groq */ `
  *[_id == "aboutPage.singleton"][0]
`;

export const COMMISSION_EXAMPLES = /* groq */ `
  *[_type == "commissionExample"] | order(completedYear desc)
`;
