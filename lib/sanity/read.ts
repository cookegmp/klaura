import "server-only";
import { env } from "@/lib/env";
import { getReadClient } from "./client";
import * as mock from "./mock-store";
import * as q from "./queries";
import type {
  Painting,
  PaintingCategory,
  Series,
  VintageItem,
  AboutPage,
  SiteSettings,
  CommissionExample,
} from "@/types/sanity";
import { PAINTING_CATEGORIES } from "@/types/sanity";

/**
 * All read-paths through here so we can branch on SANITY_MODE. The mock
 * implementation reads from the in-memory seed; the live implementation
 * runs GROQ against the real client with `next: { tags: [...] }` for cache
 * tag-based revalidation.
 */

function live(): boolean {
  return env().SANITY_MODE === "live";
}

export async function getAllPaintings(): Promise<Painting[]> {
  if (!live()) {
    return mock
      .getAllByType<Painting & { _type: "painting" }>("painting")
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }
  return getReadClient().fetch<Painting[]>(q.PAINTINGS_LIST, {}, {
    next: { tags: ["paintings"] },
  });
}

export async function getPaintingsByCategory(
  category: PaintingCategory
): Promise<Painting[]> {
  if (!live()) {
    return mock
      .findMany<Painting & { _type: "painting" }>(
        "painting",
        (p) => p.category === category
      )
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }
  return getReadClient().fetch<Painting[]>(
    q.PAINTINGS_BY_CATEGORY,
    { category },
    { next: { tags: ["paintings", `category:${category}`] } }
  );
}

export interface CategorySummary {
  slug: PaintingCategory;
  label: string;
  shortLabel: string;
  mature?: true;
  count: number;
  cover: Painting | null;
}

/**
 * The five gallery doorways. Each one reports its current count and a
 * cover painting (preferring featured items, then most recent). Used by
 * the home page and /gallery index.
 */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const all = await getAllPaintings();
  return PAINTING_CATEGORIES.map(({ slug, label, shortLabel, mature }) => {
    const inCategory = all.filter((p) => p.category === slug);
    const sortedForCover = [...inCategory].sort((a, b) => {
      const af = a.featured ? 0 : 1;
      const bf = b.featured ? 0 : 1;
      if (af !== bf) return af - bf;
      const ao = a.featuredOrder ?? 999;
      const bo = b.featuredOrder ?? 999;
      if (ao !== bo) return ao - bo;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
    return {
      slug,
      label,
      shortLabel,
      ...(mature ? { mature: true as const } : {}),
      count: inCategory.length,
      cover: sortedForCover[0] ?? null,
    };
  });
}

export async function getPaintingBySlug(slug: string): Promise<Painting | null> {
  if (!live()) {
    return mock.findFirst<Painting & { _type: "painting" }>(
      "painting",
      (p) => p.slug?.current === slug
    );
  }
  return getReadClient().fetch<Painting | null>(
    q.PAINTING_BY_SLUG,
    { slug },
    { next: { tags: ["paintings", `painting:${slug}`] } }
  );
}

export async function getRelatedPaintings(
  slug: string,
  tagIds: string[]
): Promise<Painting[]> {
  if (!live()) {
    if (tagIds.length === 0) return [];
    return mock
      .findMany<Painting & { _type: "painting" }>("painting", (p) => {
        if (p.slug?.current === slug) return false;
        return (p.tags ?? []).some((t) => tagIds.includes(t._ref));
      })
      .slice(0, 3);
  }
  return getReadClient().fetch<Painting[]>(
    q.RELATED_PAINTINGS,
    { slug, tagIds },
    { next: { tags: ["paintings"] } }
  );
}

export async function getFeaturedPaintings(): Promise<Painting[]> {
  if (!live()) {
    return mock
      .findMany<Painting & { _type: "painting" }>("painting", (p) => p.featured === true)
      .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
      .slice(0, 4);
  }
  return getReadClient().fetch<Painting[]>(q.FEATURED_PAINTINGS, {}, {
    next: { tags: ["paintings"] },
  });
}

export async function getHeroPainting(): Promise<Painting | null> {
  if (!live()) {
    const settings = mock.getDocument<SiteSettings & { _type: "siteSettings" }>(
      "siteSettings.singleton"
    );
    if (!settings?.featuredHeroPainting?._ref) return null;
    return mock.getDocument<Painting & { _type: "painting" }>(
      settings.featuredHeroPainting._ref
    );
  }
  return getReadClient().fetch<Painting | null>(q.HERO_PAINTING, {}, {
    next: { tags: ["paintings", "settings"] },
  });
}

export async function getAllVintage(): Promise<VintageItem[]> {
  if (!live()) {
    return mock
      .getAllByType<VintageItem & { _type: "vintageItem" }>("vintageItem")
      .sort((a, b) => {
        if (a.status === "available" && b.status !== "available") return -1;
        if (b.status === "available" && a.status !== "available") return 1;
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      });
  }
  return getReadClient().fetch<VintageItem[]>(q.VINTAGE_LIST, {}, {
    next: { tags: ["vintage"] },
  });
}

export async function getVintageBySlug(slug: string): Promise<VintageItem | null> {
  if (!live()) {
    return mock.findFirst<VintageItem & { _type: "vintageItem" }>(
      "vintageItem",
      (v) => v.slug?.current === slug
    );
  }
  return getReadClient().fetch<VintageItem | null>(
    q.VINTAGE_BY_SLUG,
    { slug },
    { next: { tags: ["vintage", `vintage:${slug}`] } }
  );
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!live()) {
    return mock.getDocument<SiteSettings & { _type: "siteSettings" }>(
      "siteSettings.singleton"
    );
  }
  return getReadClient().fetch<SiteSettings | null>(q.SITE_SETTINGS, {}, {
    next: { tags: ["settings"] },
  });
}

export async function getAboutPage(): Promise<AboutPage | null> {
  if (!live()) {
    return mock.getDocument<AboutPage & { _type: "aboutPage" }>("aboutPage.singleton");
  }
  return getReadClient().fetch<AboutPage | null>(q.ABOUT_PAGE, {}, {
    next: { tags: ["about"] },
  });
}

export async function getAllSeries(): Promise<Series[]> {
  if (!live()) {
    return mock.getAllByType<Series & { _type: "series" }>("series");
  }
  // Live path: simple list query inline — no need for a dedicated GROQ const.
  return getReadClient().fetch<Series[]>(
    /* groq */ `*[_type == "series"]{ _id, _rev, title, slug, description }`,
    {},
    { next: { tags: ["series"] } }
  );
}

export async function getCommissionExamples(): Promise<CommissionExample[]> {
  if (!live()) {
    return mock
      .getAllByType<CommissionExample & { _type: "commissionExample" }>("commissionExample")
      .sort((a, b) => (b.completedYear ?? 0) - (a.completedYear ?? 0));
  }
  return getReadClient().fetch<CommissionExample[]>(q.COMMISSION_EXAMPLES, {}, {
    next: { tags: ["commission-examples"] },
  });
}
