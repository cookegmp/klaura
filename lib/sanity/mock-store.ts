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

  // Series
  const placesSeries: Series = {
    _id: "series.places",
    _rev: rev(),
    title: "Places",
    slug: { current: "places" },
    description:
      "Studio practice from a single winter — the same field, the same hour, painted thirty different ways.",
  };
  store.documents[placesSeries._id] = { ...placesSeries, _type: "series" };

  // Paintings (3, charter §exit_criteria Phase 1)
  const p1: Painting = {
    _id: "painting.first-snow",
    _rev: rev(),
    title: "First snow",
    slug: { current: "first-snow" },
    year: 2024,
    medium: "Oil on linen",
    dimensions: { widthInches: 30, heightInches: 24, framed: false },
    weightOz: 64,
    price: 2400,
    status: "available",
    primaryImage: {
      _type: "image",
      asset: { _ref: "image-placeholder-first-snow", _type: "reference" },
      alt: "First snow falling between conifers, a copper-leafed path running diagonally to a clearing.",
    },
    story: undefined,
    tags: [{ _ref: winterTag._id }],
    series: { _ref: placesSeries._id },
    featured: true,
    featuredOrder: 1,
    createdAt: nowIso(),
    shippingNotes: undefined,
  };
  const p2: Painting = {
    _id: "painting.cottage-with-geese",
    _rev: rev(),
    title: "Cottage with geese",
    slug: { current: "cottage-with-geese" },
    year: 2024,
    medium: "Soft pastel on sanded paper",
    dimensions: { widthInches: 16, heightInches: 20 },
    price: 1600,
    status: "available",
    primaryImage: {
      _type: "image",
      asset: { _ref: "image-placeholder-cottage", _type: "reference" },
      alt: "A stone cottage half-hidden by trees, a path of geese walking up to the door.",
    },
    tags: [{ _ref: englishTag._id }, { _ref: animalsTag._id }],
    featured: true,
    featuredOrder: 2,
    createdAt: nowIso(),
  };
  const p3: Painting = {
    _id: "painting.three-cattle",
    _rev: rev(),
    title: "Three cattle on the heath",
    slug: { current: "three-cattle-on-the-heath" },
    year: 2025,
    medium: "Oil on linen",
    dimensions: { widthInches: 36, heightInches: 48 },
    weightOz: 144,
    price: 4800,
    status: "available",
    primaryImage: {
      _type: "image",
      asset: { _ref: "image-placeholder-cattle", _type: "reference" },
      alt: "Three pale cattle on a heather-covered hillside under a stormy violet sky.",
    },
    tags: [{ _ref: animalsTag._id }],
    featured: true,
    featuredOrder: 3,
    createdAt: nowIso(),
    shippingNotes: "Oversized — crating required; ships within 10 business days.",
  };
  store.documents[p1._id] = { ...p1, _type: "painting" };
  store.documents[p2._id] = { ...p2, _type: "painting" };
  store.documents[p3._id] = { ...p3, _type: "painting" };

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
    story: [
      {
        _type: "block",
        _key: "k1",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Kelly paints from a barn studio in eastern Indiana. The light here moves slowly through long winters, and slowness is the practice.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
    pullQuote:
      "Same field, same hour, painted thirty different ways — that's how I know I've seen it.",
  };
  store.documents[about._id] = { ...about, _type: "aboutPage" };

  // Site settings
  const settings: SiteSettings = {
    _id: "siteSettings.singleton",
    _rev: rev(),
    featuredHeroPainting: { _ref: p1._id },
    marqueePhrases: [
      "Painted slowly",
      "One of one",
      "Oil and soft pastel",
      "Worn long after",
      "Sold once, never again",
    ],
    instagramHandle: "kellylaaura",
    contactEmail: "hello@kellylaaura.com",
    shippingFlatRateUS: 45,
    shippingFlatRateIntl: 120,
  };
  store.documents[settings._id] = { ...settings, _type: "siteSettings" };

  // One past commission example (gallery on /commissions)
  const ex1: CommissionExample = {
    _id: "commissionExample.farmhouse",
    _rev: rev(),
    title: "Farmhouse at golden hour",
    image: {
      _type: "image",
      asset: { _ref: "image-placeholder-commission-1", _type: "reference" },
    },
    story: "Commissioned as an anniversary gift — the family farmhouse in Ohio, painted from photos taken across one summer.",
    completedYear: 2024,
  };
  store.documents[ex1._id] = { ...ex1, _type: "commissionExample" };
}
