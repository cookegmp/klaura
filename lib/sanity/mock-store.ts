import { randomBytes } from "crypto";
import type {
  Painting,
  VintageItem,
  AboutPage,
  SiteSettings,
  CommissionExample,
  Series,
  Tag,
} from "@/types/sanity";

/**
 * In-memory Sanity stand-in. Lets the entire app run without a real Sanity
 * project — including the inventory race-condition logic, which mimics
 * patch().ifRevisionId() semantics exactly:
 *
 *   - every document carries a monotonic _rev (random hex)
 *   - patchIfRev throws `ConcurrencyError` when the provided rev doesn't
 *     match the current rev, so the second of two concurrent reservations
 *     fails identically to a real ifRevisionId() patch
 *
 * Seeded with three paintings and three vintage items so the storefront
 * has something to render in dev. Persisted at /tmp so iteration doesn't
 * lose state on hot reload.
 */

export class ConcurrencyError extends Error {
  code = "CONFLICT" as const;
  constructor(documentId: string) {
    super(`Revision mismatch on ${documentId}`);
    this.name = "ConcurrencyError";
  }
}

export class NotFoundError extends Error {
  code = "NOT_FOUND" as const;
  constructor(documentId: string) {
    super(`Document not found: ${documentId}`);
    this.name = "NotFoundError";
  }
}

/**
 * Minimal contract every stored document must satisfy. We deliberately omit
 * an open index signature so domain types from types/sanity.ts (which don't
 * carry one) can be stored without unsafe casts.
 */
type AnyDoc = { _id: string; _rev: string; _type: string };

interface StoreShape {
  documents: Record<string, AnyDoc>;
}

const store: StoreShape = { documents: {} };
let seeded = false;

function rev(): string {
  return randomBytes(8).toString("hex");
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Build a fake Sanity image reference that points at a file in `/public/sample-art/`.
 * `ProductImage` recognises the `local-image:` prefix and serves the file
 * directly from the public folder. This lets the dev experience use Kelly's
 * actual paintings as seed art without a Sanity project.
 */
function localImage(filename: string, alt: string): {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt: string;
} {
  return {
    _type: "image",
    asset: { _ref: `local-image:${filename}`, _type: "reference" },
    alt,
  };
}

export function bumpRev(): string {
  return rev();
}

export function getDocument<T extends AnyDoc = AnyDoc>(id: string): T | null {
  if (!seeded) seed();
  const doc = store.documents[id];
  return doc ? (structuredClone(doc) as T) : null;
}

export function getAllByType<T extends AnyDoc = AnyDoc>(type: string): T[] {
  if (!seeded) seed();
  return Object.values(store.documents)
    .filter((d) => d._type === type)
    .map((d) => structuredClone(d) as T);
}

export function createDocument<T extends { _type: string }>(doc: T): AnyDoc & T {
  if (!seeded) seed();
  const id = `${doc._type}.${randomBytes(8).toString("hex")}`;
  const full = { ...doc, _id: id, _rev: rev() } as AnyDoc & T;
  store.documents[id] = full;
  return structuredClone(full);
}

/**
 * Optimistic-concurrency patch. The fundamental primitive backing inventory
 * reservation. Throws ConcurrencyError if the caller's rev is stale.
 */
export function patchIfRev<T extends AnyDoc = AnyDoc>(
  id: string,
  expectedRev: string,
  patchPayload: Record<string, unknown>
): T {
  if (!seeded) seed();
  const current = store.documents[id];
  if (!current) throw new NotFoundError(id);
  if (current._rev !== expectedRev) throw new ConcurrencyError(id);
  const next = { ...current, ...patchPayload, _id: id, _rev: rev() } as AnyDoc;
  store.documents[id] = next;
  return structuredClone(next) as T;
}

/** Unconditional patch — used by webhooks (post-payment, no race). */
export function patch(id: string, patchPayload: Record<string, unknown>): AnyDoc {
  if (!seeded) seed();
  const current = store.documents[id];
  if (!current) throw new NotFoundError(id);
  const next = { ...current, ...patchPayload, _id: id, _rev: rev() } as AnyDoc;
  store.documents[id] = next;
  return structuredClone(next);
}

export function findFirst<T extends AnyDoc = AnyDoc>(
  type: string,
  predicate: (doc: T) => boolean
): T | null {
  if (!seeded) seed();
  const docs = Object.values(store.documents).filter(
    (d) => d._type === type
  ) as T[];
  const match = docs.find(predicate);
  return match ? (structuredClone(match) as T) : null;
}

export function findMany<T extends AnyDoc = AnyDoc>(
  type: string,
  predicate: (doc: T) => boolean
): T[] {
  if (!seeded) seed();
  return (Object.values(store.documents).filter((d) => d._type === type) as T[])
    .filter(predicate)
    .map((d) => structuredClone(d) as T);
}

export function resetForTests(): void {
  store.documents = {};
  seeded = false;
}

export function reseedForTests(): void {
  resetForTests();
  seed();
}

/* -----------------------------------------------------------------------
   Seed data
   ----------------------------------------------------------------------- */
function seed(): void {
  seeded = true;

  // Tags
  const winterTag: Tag = {
    _id: "tag.winter",
    _rev: rev(),
    title: "Winter",
    slug: { current: "winter" },
  };
  const animalsTag: Tag = {
    _id: "tag.animals",
    _rev: rev(),
    title: "Animals",
    slug: { current: "animals" },
  };
  const englishTag: Tag = {
    _id: "tag.english-countryside",
    _rev: rev(),
    title: "English countryside",
    slug: { current: "english-countryside" },
  };
  store.documents[winterTag._id] = { ...winterTag, _type: "tag" };
  store.documents[animalsTag._id] = { ...animalsTag, _type: "tag" };
  store.documents[englishTag._id] = { ...englishTag, _type: "tag" };

  // Series — sub-collections that live inside categories.
  //   Places, Nighttime         → within Landscapes
  //   Anticipation, Gateway     → within Eighteen+
  const placesSeries: Series = {
    _id: "series.places",
    _rev: rev(),
    title: "Places",
    slug: { current: "places" },
  };
  const nighttimeSeries: Series = {
    _id: "series.nighttime",
    _rev: rev(),
    title: "Nighttime",
    slug: { current: "nighttime" },
  };
  const anticipationSeries: Series = {
    _id: "series.anticipation",
    _rev: rev(),
    title: "Anticipation",
    slug: { current: "anticipation" },
  };
  const gatewaySeries: Series = {
    _id: "series.gateway",
    _rev: rev(),
    title: "Gateway",
    slug: { current: "gateway" },
  };
  for (const s of [placesSeries, nighttimeSeries, anticipationSeries, gatewaySeries]) {
    store.documents[s._id] = { ...s, _type: "series" };
  }

  // Paintings. Seed images live in /public/sample-art and are referenced via
  // a custom `local-image:<filename>` ref convention that ProductImage knows
  // to translate into a public URL. Lets us run the entire site against real
  // artwork without a Sanity project.
  const paintings: Painting[] = [
    {
      _id: "painting.mountain-forest",
      _rev: rev(),
      title: "Mountain Forest",
      slug: { current: "mountain-forest" },
      category: "landscapes",
      medium: "Acrylic on stretched canvas",
      dimensions: { widthInches: 12, heightInches: 16 },
      imageAspect: 0.791,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "mountain-forest.jpg",
        "Mountain Forest — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.aspens",
      _rev: rev(),
      title: "Aspens",
      slug: { current: "aspens" },
      category: "landscapes",
      medium: "Acrylic on stretched canvas",
      dimensions: { widthInches: 10, heightInches: 8 },
      imageAspect: 1.302,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "aspens.jpg",
        "Aspens — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.deer",
      _rev: rev(),
      title: "Deer",
      slug: { current: "deer" },
      category: "animals",
      medium: "Oil Pastel on pastel paper",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.811,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "deer.jpg",
        "Deer — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.december-evening",
      _rev: rev(),
      title: "December Evening",
      slug: { current: "december-evening" },
      category: "houses",
      medium: "Acrylic on canvas panel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.779,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "december-evening.jpg",
        "December Evening — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.serene",
      _rev: rev(),
      title: "Serene",
      slug: { current: "serene" },
      category: "landscapes",
      medium: "Oil Pastel on pastel paper",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.423,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "serene.jpg",
        "Serene — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.wanderers",
      _rev: rev(),
      title: "Wanderers",
      slug: { current: "wanderers" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.376,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "wanderers.jpg",
        "Wanderers — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.tuscan-hills",
      _rev: rev(),
      title: "Tuscan Hills",
      slug: { current: "tuscan-hills" },
      category: "landscapes",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.393,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "tuscan-hills.jpg",
        "Tuscan Hills — Soft Pastel painting by Kelly Laura."
      ),
      featured: true,
      featuredOrder: 2,
      createdAt: nowIso(),
    },
    {
      _id: "painting.giraffe",
      _rev: rev(),
      title: "Giraffe!",
      slug: { current: "giraffe" },
      category: "animals",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.375,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "giraffe.jpg",
        "Giraffe! — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.winter-sheep",
      _rev: rev(),
      title: "Winter Sheep",
      slug: { current: "winter-sheep" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.404,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "winter-sheep.jpg",
        "Winter Sheep — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.sanctuary",
      _rev: rev(),
      title: "Sanctuary",
      slug: { current: "sanctuary" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.364,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "sanctuary.jpg",
        "Sanctuary — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.red-earth",
      _rev: rev(),
      title: "Red Earth",
      slug: { current: "red-earth" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 16, heightInches: 12 },
      imageAspect: 1.371,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "red-earth.jpg",
        "Red Earth — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.october",
      _rev: rev(),
      title: "October",
      slug: { current: "october" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.397,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "october.jpg",
        "October — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.kin",
      _rev: rev(),
      title: "Kin",
      slug: { current: "kin" },
      category: "animals",
      medium: "Oil Pastel on pastel paper",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.715,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "kin.jpg",
        "Kin — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.high-country",
      _rev: rev(),
      title: "High Country",
      slug: { current: "high-country" },
      category: "landscapes",
      medium: "Acrylic on stretched canvas",
      dimensions: { widthInches: 11, heightInches: 14 },
      imageAspect: 0.788,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "high-country.jpg",
        "High Country — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.desert",
      _rev: rev(),
      title: "Desert",
      slug: { current: "desert" },
      category: "landscapes",
      medium: "Acrylic",
      dimensions: { widthInches: 11, heightInches: 16 },
      imageAspect: 0.789,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "desert.jpg",
        "Desert — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.snow-light",
      _rev: rev(),
      title: "Snow Light",
      slug: { current: "snow-light" },
      category: "landscapes",
      medium: "Acrylic",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.287,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "snow-light.jpg",
        "Snow Light — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.grazing",
      _rev: rev(),
      title: "Grazing",
      slug: { current: "grazing" },
      category: "animals",
      medium: "Acrylic on stretched canvas",
      dimensions: { widthInches: 9.5, heightInches: 12 },
      imageAspect: 0.775,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "grazing.jpg",
        "Grazing — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.last-snow",
      _rev: rev(),
      title: "Last Snow",
      slug: { current: "last-snow" },
      category: "landscapes",
      medium: "Acrylic",
      dimensions: { widthInches: 10, heightInches: 8 },
      imageAspect: 1.262,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "last-snow.jpg",
        "Last Snow — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.cottage",
      _rev: rev(),
      title: "Cottage",
      slug: { current: "cottage" },
      category: "houses",
      medium: "Oil Pastel",
      dimensions: { widthInches: 16, heightInches: 12 },
      imageAspect: 1.377,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "cottage.jpg",
        "Cottage — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.bear",
      _rev: rev(),
      title: "Bear",
      slug: { current: "bear" },
      category: "animals",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.72,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "bear.jpg",
        "Bear — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.citrus",
      _rev: rev(),
      title: "Citrus",
      slug: { current: "citrus" },
      category: "miscellaneous",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.716,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "citrus.jpg",
        "Citrus — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.hillside",
      _rev: rev(),
      title: "Hillside",
      slug: { current: "hillside" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.689,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "hillside.jpg",
        "Hillside — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.river",
      _rev: rev(),
      title: "River",
      slug: { current: "river" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.413,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "river.jpg",
        "River — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.spring-valley",
      _rev: rev(),
      title: "Spring Valley",
      slug: { current: "spring-valley" },
      category: "landscapes",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.336,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "spring-valley.jpg",
        "Spring Valley — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.sea-cliffs",
      _rev: rev(),
      title: "Sea Cliffs",
      slug: { current: "sea-cliffs" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.372,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "sea-cliffs.jpg",
        "Sea Cliffs — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.winter-light",
      _rev: rev(),
      title: "Winter Light",
      slug: { current: "winter-light" },
      category: "landscapes",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.363,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "winter-light.jpg",
        "Winter Light — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.warmth",
      _rev: rev(),
      title: "Warmth",
      slug: { current: "warmth" },
      category: "landscapes",
      medium: "Soft Pastel on pastel paper",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.351,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "warmth.jpg",
        "Warmth — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.autumn-stream",
      _rev: rev(),
      title: "Autumn Stream",
      slug: { current: "autumn-stream" },
      category: "landscapes",
      medium: "Oil Pastel on pastel paper",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.747,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "autumn-stream.jpg",
        "Autumn Stream — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.herd",
      _rev: rev(),
      title: "Herd",
      slug: { current: "herd" },
      category: "animals",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.705,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "herd.jpg",
        "Herd — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.soft-snow",
      _rev: rev(),
      title: "Soft Snow",
      slug: { current: "soft-snow" },
      category: "landscapes",
      medium: "Pastel Pencil",
      dimensions: { widthInches: 5.8, heightInches: 8.3 },
      imageAspect: 0.578,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "soft-snow.jpg",
        "Soft Snow — Pastel Pencil painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.lily-pods",
      _rev: rev(),
      title: "Lily Pods",
      slug: { current: "lily-pods" },
      category: "landscapes",
      medium: "Pastel Pencil",
      dimensions: { widthInches: 5.8, heightInches: 8.3 },
      imageAspect: 0.588,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "lily-pods.jpg",
        "Lily Pods — Pastel Pencil painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.little-friends",
      _rev: rev(),
      title: "Little Friends",
      slug: { current: "little-friends" },
      category: "houses",
      medium: "Soft Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.743,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "little-friends.jpg",
        "Little Friends — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.bloom",
      _rev: rev(),
      title: "Bloom",
      slug: { current: "bloom" },
      category: "landscapes",
      medium: "Soft Pastel on pastel paper",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.366,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "bloom.jpg",
        "Bloom — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.mountain-shadows",
      _rev: rev(),
      title: "Mountain Shadows",
      slug: { current: "mountain-shadows" },
      category: "landscapes",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.34,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "mountain-shadows.jpg",
        "Mountain Shadows — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.fortress",
      _rev: rev(),
      title: "Fortress",
      slug: { current: "fortress" },
      category: "houses",
      medium: "Pastel Pencil",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.337,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "fortress.jpg",
        "Fortress — Pastel Pencil painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.green-hills",
      _rev: rev(),
      title: "Green Hills",
      slug: { current: "green-hills" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.641,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "green-hills.jpg",
        "Green Hills — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.the-clearing",
      _rev: rev(),
      title: "The Clearing",
      slug: { current: "the-clearing" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.351,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "the-clearing.jpg",
        "The Clearing — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.rebirth",
      _rev: rev(),
      title: "Rebirth",
      slug: { current: "rebirth" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.726,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "rebirth.jpg",
        "Rebirth — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.nocturne",
      _rev: rev(),
      title: "Nocturne",
      slug: { current: "nocturne" },
      category: "eighteen-plus",
      imageAspect: 1.315,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "nocturne.jpg",
        "Nocturne — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.study-in-red",
      _rev: rev(),
      title: "Study in Red",
      slug: { current: "study-in-red" },
      category: "eighteen-plus",
      imageAspect: 1.064,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "study-in-red.jpg",
        "Study in Red — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.repose",
      _rev: rev(),
      title: "Repose",
      slug: { current: "repose" },
      category: "eighteen-plus",
      imageAspect: 1.435,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "repose.jpg",
        "Repose — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.green-victorian",
      _rev: rev(),
      title: "Green Victorian",
      slug: { current: "green-victorian" },
      category: "houses",
      imageAspect: 0.8,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "green-victorian.jpg",
        "Green Victorian — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.sun-glint",
      _rev: rev(),
      title: "Sun Glint",
      slug: { current: "sun-glint" },
      category: "landscapes",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.378,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "forest-river.jpg",
        "Sun Glint — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.sam",
      _rev: rev(),
      title: "Sam",
      slug: { current: "sam" },
      category: "animals",
      imageAspect: 0.704,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "sam.jpg",
        "Sam — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.tuxedo",
      _rev: rev(),
      title: "Tuxedo",
      slug: { current: "tuxedo" },
      category: "animals",
      imageAspect: 1.356,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "tuxedo.jpg",
        "Tuxedo — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.shade",
      _rev: rev(),
      title: "Shade",
      slug: { current: "shade" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.8,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "summer-shade.jpg",
        "Shade — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.mountain-river",
      _rev: rev(),
      title: "Mountain River",
      slug: { current: "mountain-river" },
      category: "landscapes",
      imageAspect: 1.379,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "mountain-river.jpg",
        "Mountain River — painting by Kelly Laura."
      ),
      featured: true,
      featuredOrder: 3,
      createdAt: nowIso(),
    },
    {
      _id: "painting.liminal",
      _rev: rev(),
      title: "Liminal",
      slug: { current: "liminal" },
      category: "miscellaneous",
      medium: "Soft Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.799,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "threshold.jpg",
        "Liminal — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.lavender",
      _rev: rev(),
      title: "Lavender",
      slug: { current: "lavender" },
      category: "landscapes",
      medium: "Acrylic",
      dimensions: { widthInches: 7, heightInches: 5 },
      imageAspect: 1.416,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "cliff-lavender.jpg",
        "Lavender — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.marshland",
      _rev: rev(),
      title: "Marshland",
      slug: { current: "marshland" },
      category: "landscapes",
      imageAspect: 1.346,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "marshland.jpg",
        "Marshland — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.indigo",
      _rev: rev(),
      title: "Indigo",
      slug: { current: "indigo" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.431,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "indigo-field.jpg",
        "Indigo — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.tulip-fields",
      _rev: rev(),
      title: "Tulip Fields",
      slug: { current: "tulip-fields" },
      category: "landscapes",
      imageAspect: 1.361,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "tulip-fields.jpg",
        "Tulip Fields — painting by Kelly Laura."
      ),
      featured: true,
      featuredOrder: 4,
      createdAt: nowIso(),
    },
    {
      _id: "painting.crisp",
      _rev: rev(),
      title: "Crisp",
      slug: { current: "crisp" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.4,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "autumn-blaze.jpg",
        "Crisp — Oil Pastel painting by Kelly Laura."
      ),
      featured: true,
      featuredOrder: 1,
      createdAt: nowIso(),
    },
    {
      _id: "painting.aspen-creek",
      _rev: rev(),
      title: "Aspen Creek",
      slug: { current: "aspen-creek" },
      category: "landscapes",
      imageAspect: 0.723,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "aspen-creek.jpg",
        "Aspen Creek — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.autumn-falls",
      _rev: rev(),
      title: "Autumn Falls",
      slug: { current: "autumn-falls" },
      category: "landscapes",
      imageAspect: 0.708,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "autumn-falls.jpg",
        "Autumn Falls — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.tidal-marsh",
      _rev: rev(),
      title: "Tidal Marsh",
      slug: { current: "tidal-marsh" },
      category: "landscapes",
      imageAspect: 1.306,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "tidal-marsh.jpg",
        "Tidal Marsh — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.country-lane",
      _rev: rev(),
      title: "Country Lane",
      slug: { current: "country-lane" },
      category: "landscapes",
      imageAspect: 0.711,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "country-lane.jpg",
        "Country Lane — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.old-books",
      _rev: rev(),
      title: "Old Books",
      slug: { current: "old-books" },
      category: "miscellaneous",
      imageAspect: 0.721,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "old-books.jpg",
        "Old Books — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.ember-sky",
      _rev: rev(),
      title: "Ember Sky",
      slug: { current: "ember-sky" },
      category: "landscapes",
      imageAspect: 0.841,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "ember-sky.jpg",
        "Ember Sky — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.breakers",
      _rev: rev(),
      title: "Breakers",
      slug: { current: "breakers" },
      category: "landscapes",
      imageAspect: 1.394,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "breakers.jpg",
        "Breakers — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.pool",
      _rev: rev(),
      title: "Pool",
      slug: { current: "pool" },
      category: "miscellaneous",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.996,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "fracture.jpg",
        "Pool — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.daisy-meadow",
      _rev: rev(),
      title: "Daisy Meadow",
      slug: { current: "daisy-meadow" },
      category: "landscapes",
      imageAspect: 0.759,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "daisy-meadow.jpg",
        "Daisy Meadow — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.wildflower-path",
      _rev: rev(),
      title: "Wildflower Path",
      slug: { current: "wildflower-path" },
      category: "landscapes",
      imageAspect: 1.363,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "wildflower-path.jpg",
        "Wildflower Path — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.exploring",
      _rev: rev(),
      title: "Exploring",
      slug: { current: "exploring" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 9, heightInches: 12 },
      imageAspect: 0.729,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "first-light-winter.jpg",
        "Exploring — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.apple-pickers",
      _rev: rev(),
      title: "Apple Pickers",
      slug: { current: "apple-pickers" },
      category: "miscellaneous",
      imageAspect: 0.519,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "apple-pickers.jpg",
        "Apple Pickers — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.the-calf",
      _rev: rev(),
      title: "The Calf",
      slug: { current: "the-calf" },
      category: "animals",
      imageAspect: 0.786,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "the-calf.jpg",
        "The Calf — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.fresh-waters",
      _rev: rev(),
      title: "Fresh Waters",
      slug: { current: "fresh-waters" },
      category: "landscapes",
      medium: "Oil Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.41,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "cascade.jpg",
        "Fresh Waters — Oil Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.turf-houses",
      _rev: rev(),
      title: "Turf Houses",
      slug: { current: "turf-houses" },
      category: "houses",
      imageAspect: 1.4,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "turf-houses.jpg",
        "Turf Houses — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.bear-cat",
      _rev: rev(),
      title: "Bear",
      slug: { current: "bear-cat" },
      category: "animals",
      medium: "Soft Pastel",
      dimensions: { widthInches: 12, heightInches: 9 },
      imageAspect: 1.314,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "marmalade.jpg",
        "Bear — Soft Pastel painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.winter-hills",
      _rev: rev(),
      title: "Winter Hills",
      slug: { current: "winter-hills" },
      category: "landscapes",
      imageAspect: 1.343,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "winter-hills.jpg",
        "Winter Hills — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.high-desert",
      _rev: rev(),
      title: "High Desert",
      slug: { current: "high-desert" },
      category: "landscapes",
      imageAspect: 1.368,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "high-desert.jpg",
        "High Desert — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.dusk-mist",
      _rev: rev(),
      title: "Dusk Mist",
      slug: { current: "dusk-mist" },
      category: "landscapes",
      imageAspect: 1.298,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "dusk-mist.jpg",
        "Dusk Mist — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.river-bend",
      _rev: rev(),
      title: "River Bend",
      slug: { current: "river-bend" },
      category: "landscapes",
      imageAspect: 1.346,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "river-bend.jpg",
        "River Bend — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.headland",
      _rev: rev(),
      title: "Headland",
      slug: { current: "headland" },
      category: "landscapes",
      imageAspect: 1.342,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "headland.jpg",
        "Headland — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.mountain-meadow",
      _rev: rev(),
      title: "Mountain Meadow",
      slug: { current: "mountain-meadow" },
      category: "landscapes",
      imageAspect: 1.358,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "mountain-meadow.jpg",
        "Mountain Meadow — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.heather-path",
      _rev: rev(),
      title: "Heather Path",
      slug: { current: "heather-path" },
      category: "landscapes",
      imageAspect: 1.358,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "heather-path.jpg",
        "Heather Path — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.autumn-field",
      _rev: rev(),
      title: "Autumn Field",
      slug: { current: "autumn-field" },
      category: "landscapes",
      imageAspect: 1.338,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "autumn-field.jpg",
        "Autumn Field — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.rose-sky",
      _rev: rev(),
      title: "Rose Sky",
      slug: { current: "rose-sky" },
      category: "landscapes",
      imageAspect: 1.397,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "rose-sky.jpg",
        "Rose Sky — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.winter-marsh",
      _rev: rev(),
      title: "Winter Marsh",
      slug: { current: "winter-marsh" },
      category: "landscapes",
      imageAspect: 1.366,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "winter-marsh.jpg",
        "Winter Marsh — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.green-valley",
      _rev: rev(),
      title: "Green Valley",
      slug: { current: "green-valley" },
      category: "landscapes",
      imageAspect: 1.363,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "green-valley.jpg",
        "Green Valley — painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.church-bells",
      _rev: rev(),
      title: "Church Bells",
      slug: { current: "church-bells" },
      category: "houses",
      medium: "Acrylic on canvas panel",
      dimensions: { widthInches: 11, heightInches: 14 },
      imageAspect: 0.766,
      price: 0,
      status: "available",
      primaryImage: localImage(
        "church-bells.jpg",
        "Church Bells — Acrylic painting by Kelly Laura."
      ),
      createdAt: nowIso(),
    },
  ];
  for (const p of paintings) {
    store.documents[p._id] = { ...p, _type: "painting" };
  }

  // Vintage (3)
  const v1: VintageItem = {
    _id: "vintageItem.cream-aran-fisherman",
    _rev: rev(),
    title: "Cream aran fisherman sweater",
    slug: { current: "cream-aran-fisherman" },
    category: "knitwear",
    era: "1970s",
    labelSize: "M",
    measurements: {
      chestFlat: 22,
      length: 27,
      sleeve: 24,
      notes: "Hand-knit. Slight pilling on inner forearm, otherwise excellent.",
    },
    material: "Wool",
    condition: "very-good",
    conditionNotes: "Minor pilling, no holes or stains.",
    price: 245,
    status: "available",
    primaryImage: {
      _type: "image",
      asset: { _ref: "image-placeholder-aran", _type: "reference" },
      alt: "Cream cable-knit fisherman sweater on a wooden hanger.",
    },
    weightOz: 28,
    createdAt: nowIso(),
  };
  const v2: VintageItem = {
    _id: "vintageItem.brown-leather-cropped-jacket",
    _rev: rev(),
    title: "Brown leather cropped jacket",
    slug: { current: "brown-leather-cropped-jacket" },
    category: "outerwear",
    era: "1980s",
    labelSize: "S",
    measurements: { chestFlat: 19, length: 21, sleeve: 23, shoulder: 16 },
    material: "Leather",
    condition: "excellent",
    price: 385,
    status: "available",
    primaryImage: {
      _type: "image",
      asset: { _ref: "image-placeholder-jacket", _type: "reference" },
      alt: "Brown leather cropped jacket with notched lapels, photographed against linen.",
    },
    weightOz: 48,
    createdAt: nowIso(),
  };
  const v3: VintageItem = {
    _id: "vintageItem.silk-prairie-dress",
    _rev: rev(),
    title: "Black silk prairie dress",
    slug: { current: "black-silk-prairie-dress" },
    category: "dress",
    era: "1990s",
    labelSize: "S/M",
    measurements: { chestFlat: 18, waistFlat: 14, hipFlat: 20, length: 46 },
    material: "100% silk",
    condition: "very-good",
    conditionNotes: "Tiny pull on left sleeve, otherwise pristine.",
    price: 320,
    status: "available",
    primaryImage: {
      _type: "image",
      asset: { _ref: "image-placeholder-dress", _type: "reference" },
      alt: "Black silk prairie dress with ruffled collar, hanging in front of a window.",
    },
    weightOz: 12,
    createdAt: nowIso(),
  };
  store.documents[v1._id] = { ...v1, _type: "vintageItem" };
  store.documents[v2._id] = { ...v2, _type: "vintageItem" };
  store.documents[v3._id] = { ...v3, _type: "vintageItem" };

  // About
  const about: AboutPage = {
    _id: "aboutPage.singleton",
    _rev: rev(),
    hero: {
      _type: "image",
      asset: { _ref: "local-image:/kelly.jpg", _type: "reference" },
      alt: "Kelly Laura",
    },
    story: [
      {
        _type: "block",
        _key: "k1",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Hi! My name is Kelly.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
      {
        _type: "block",
        _key: "k2",
        children: [
          {
            _type: "span",
            _key: "s2",
            text: "I'm from Montréal, Québec. I now live in the states.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
      {
        _type: "block",
        _key: "k3",
        children: [
          {
            _type: "span",
            _key: "s3",
            text: "I think it all started with one of those complete art sets a lot of girls had in the early 2000's. Nothing makes me feel the way painting does, it's my therapy. I've experimented with different mediums, but I mostly enjoy oil pastels, soft pastels, acrylic and oil paint.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
      {
        _type: "block",
        _key: "k4",
        children: [
          {
            _type: "span",
            _key: "s4",
            text: "I plan on commissioning nude figure works soon. They will be faceless so the focus will be on the body!",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
    pullQuote:
      "Nothing makes me feel the way painting does — it's my therapy.",
  };
  store.documents[about._id] = { ...about, _type: "aboutPage" };

  // Site settings
  const settings: SiteSettings = {
    _id: "siteSettings.singleton",
    _rev: rev(),
    featuredHeroPainting: { _ref: paintings[0]!._id },
    marqueePhrases: [],
    instagramHandle: "kellylaaura",
    contactEmail: "hello@kellylauraart.com",
    shippingFlatRateUS: 45,
    shippingFlatRateIntl: 120,
  };
  store.documents[settings._id] = { ...settings, _type: "siteSettings" };

  // One past commission example (gallery on /commissions, and seeds the
  // Commissions tile on the home page).
  const ex1: CommissionExample = {
    _id: "commissionExample.farmhouse",
    _rev: rev(),
    title: "Farmhouse at golden hour",
    image: localImage(
      "december-evening.jpg",
      "A yellow clapboard house at dusk, photographed in winter, painted for a family anniversary."
    ),
    story:
      "Commissioned as an anniversary gift — the family farmhouse in Ohio, painted from photos taken across one summer.",
    completedYear: 2024,
  };
  store.documents[ex1._id] = { ...ex1, _type: "commissionExample" };
}
