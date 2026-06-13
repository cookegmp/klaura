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
      _id: "painting.first-snow",
      _rev: rev(),
      title: "First snow",
      slug: { current: "first-snow" },
      category: "landscapes",
      year: 2024,
      medium: "Oil on linen",
      dimensions: { widthInches: 30, heightInches: 24, framed: false },
      weightOz: 64,
      price: 2400,
      status: "available",
      primaryImage: localImage(
        "img_7050.jpg",
        "Snowy stream winding between conifers at golden hour."
      ),
      tags: [{ _ref: winterTag._id }],
      series: { _ref: placesSeries._id },
      featured: true,
      featuredOrder: 1,
      createdAt: nowIso(),
    },
    {
      _id: "painting.cottage-with-geese",
      _rev: rev(),
      title: "Cottage with geese",
      slug: { current: "cottage-with-geese" },
      category: "houses",
      year: 2024,
      medium: "Soft pastel on sanded paper",
      dimensions: { widthInches: 16, heightInches: 20 },
      price: 1600,
      status: "available",
      primaryImage: localImage(
        "img_0521.jpg",
        "Stone cottage half-hidden by trees, a flock of geese walking up to the door."
      ),
      tags: [{ _ref: englishTag._id }, { _ref: animalsTag._id }],
      featured: true,
      featuredOrder: 2,
      createdAt: nowIso(),
    },
    {
      _id: "painting.three-cattle",
      _rev: rev(),
      title: "Highland cattle, evening sky",
      slug: { current: "highland-cattle-evening-sky" },
      category: "animals",
      year: 2025,
      medium: "Oil on linen",
      dimensions: { widthInches: 24, heightInches: 36 },
      weightOz: 144,
      price: 4800,
      status: "available",
      primaryImage: localImage(
        "img_7051.jpg",
        "Three pale cattle on a heather-covered hillside under a stormy violet sky."
      ),
      tags: [{ _ref: animalsTag._id }],
      featured: true,
      featuredOrder: 3,
      createdAt: nowIso(),
      shippingNotes: "Oversized — crating required; ships within 10 business days.",
    },
    {
      _id: "painting.birches-and-creek",
      _rev: rev(),
      title: "Birches and creek",
      slug: { current: "birches-and-creek" },
      category: "landscapes",
      year: 2024,
      medium: "Oil on linen",
      dimensions: { widthInches: 24, heightInches: 18 },
      weightOz: 48,
      price: 1900,
      status: "available",
      primaryImage: localImage(
        "img_1517.jpg",
        "Sun on bare birches above a dark winding creek in early spring snow."
      ),
      tags: [{ _ref: winterTag._id }],
      series: { _ref: placesSeries._id },
      featured: true,
      featuredOrder: 4,
      createdAt: nowIso(),
    },
    {
      _id: "painting.pine-path",
      _rev: rev(),
      title: "Pine path, autumn",
      slug: { current: "pine-path-autumn" },
      category: "landscapes",
      year: 2024,
      medium: "Oil on linen",
      dimensions: { widthInches: 18, heightInches: 24 },
      weightOz: 48,
      price: 1750,
      status: "available",
      primaryImage: localImage(
        "img_1497.jpg",
        "Mountain path through pines turning russet, granite peak in low cloud beyond."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.dolomites-meadow",
      _rev: rev(),
      title: "Dolomites meadow",
      slug: { current: "dolomites-meadow" },
      category: "landscapes",
      year: 2023,
      medium: "Oil on linen",
      dimensions: { widthInches: 30, heightInches: 24 },
      weightOz: 80,
      price: 3200,
      status: "available",
      primaryImage: localImage(
        "img_7441.jpg",
        "Alpine meadow rolling toward grey-pink Dolomite peaks, two stone huts in the middle distance."
      ),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 220).toISOString(),
    },
    {
      _id: "painting.bratislava-old-town",
      _rev: rev(),
      title: "Old town, after rain",
      slug: { current: "old-town-after-rain" },
      category: "houses",
      year: 2024,
      medium: "Oil on canvas",
      dimensions: { widthInches: 24, heightInches: 30 },
      weightOz: 64,
      price: 2900,
      status: "available",
      primaryImage: localImage(
        "img_0514.jpg",
        "Looking up through a Central European old town to a cathedral with copper roofs."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.canyon-overlook",
      _rev: rev(),
      title: "Canyon overlook",
      slug: { current: "canyon-overlook" },
      category: "landscapes",
      year: 2024,
      medium: "Oil on linen",
      dimensions: { widthInches: 24, heightInches: 30 },
      weightOz: 64,
      price: 2600,
      status: "available",
      primaryImage: localImage(
        "img_7443.jpg",
        "Wide Southwest canyon view with red rock formations, green scrub in the foreground."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.horses-in-meadow",
      _rev: rev(),
      title: "Three horses, summer field",
      slug: { current: "three-horses-summer-field" },
      category: "animals",
      year: 2024,
      medium: "Oil on linen",
      dimensions: { widthInches: 18, heightInches: 24 },
      weightOz: 48,
      price: 2100,
      status: "available",
      primaryImage: localImage(
        "img_7560.jpg",
        "Three horses grazing in a yellow summer meadow with a heavy mountain ridge behind."
      ),
      tags: [{ _ref: animalsTag._id }],
      createdAt: nowIso(),
    },
    {
      _id: "painting.yellow-house-green-car",
      _rev: rev(),
      title: "Yellow house, green car",
      slug: { current: "yellow-house-green-car" },
      category: "houses",
      year: 2024,
      medium: "Oil on canvas",
      dimensions: { widthInches: 20, heightInches: 24 },
      weightOz: 48,
      price: 2200,
      status: "available",
      primaryImage: localImage(
        "img_6868.jpg",
        "A yellow clapboard house at dusk in winter, a teal sedan parked at the curb."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.lake-bare-tree",
      _rev: rev(),
      title: "Lake with bare tree",
      slug: { current: "lake-with-bare-tree" },
      category: "miscellaneous",
      year: 2023,
      medium: "Acrylic on canvas",
      dimensions: { widthInches: 14, heightInches: 11 },
      weightOz: 20,
      price: 950,
      status: "available",
      primaryImage: localImage(
        "img_5464.jpg",
        "A still lake at the edge of winter, a single bare tree on the near shore."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.deer-in-lilacs",
      _rev: rev(),
      title: "Deer in lilacs",
      slug: { current: "deer-in-lilacs" },
      category: "animals",
      year: 2024,
      medium: "Soft pastel on sanded paper",
      dimensions: { widthInches: 14, heightInches: 18 },
      weightOz: 24,
      price: 1450,
      status: "available",
      primaryImage: localImage(
        "img_8827.jpg",
        "A young buck in front of a lilac hedge in full bloom."
      ),
      tags: [{ _ref: animalsTag._id }],
      createdAt: nowIso(),
    },
    // Miscellaneous — provided art assets, titles inferred from the imagery.
    {
      _id: "painting.pinewood-first-snow",
      _rev: rev(),
      title: "Pinewood, first snow",
      slug: { current: "pinewood-first-snow" },
      category: "miscellaneous",
      year: 2025,
      medium: "Oil on canvas",
      dimensions: { widthInches: 24, heightInches: 17 },
      price: 1200,
      status: "available",
      primaryImage: localImage(
        "img_0009.jpg",
        "Snow-dusted pines with a rust-orange path of fallen needles winding through."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.river-breaking-clouds",
      _rev: rev(),
      title: "River, breaking clouds",
      slug: { current: "river-breaking-clouds" },
      category: "miscellaneous",
      year: 2025,
      medium: "Oil on canvas",
      dimensions: { widthInches: 18, heightInches: 23 },
      price: 1200,
      status: "available",
      primaryImage: localImage(
        "img_5870.jpg",
        "A spring tree in new leaf leaning over a river under a churning, clearing sky."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.reclining-figure-rose-couch",
      _rev: rev(),
      title: "Reclining figure, rose couch",
      slug: { current: "reclining-figure-rose-couch" },
      category: "miscellaneous",
      year: 2025,
      medium: "Oil on canvas",
      dimensions: { widthInches: 28, heightInches: 20 },
      price: 1200,
      status: "available",
      primaryImage: localImage(
        "img_6355.jpg",
        "A figure reclining on a pink couch against a teal wall."
      ),
      createdAt: nowIso(),
    },
    {
      _id: "painting.winter-light-through-pines",
      _rev: rev(),
      title: "Winter light through pines",
      slug: { current: "winter-light-through-pines" },
      category: "miscellaneous",
      year: 2025,
      medium: "Oil on canvas",
      dimensions: { widthInches: 30, heightInches: 23 },
      price: 1200,
      status: "available",
      primaryImage: localImage(
        "img_7554.jpg",
        "Tall pines in sunlit snow, golden light breaking through the forest behind."
      ),
      createdAt: nowIso(),
    },
    // Eighteen+ placeholders — image refs intentionally route to the tonal
    // gradient fallback in ProductImage. Kelly replaces them with real
    // figure work via Sanity Studio.
    {
      _id: "painting.anticipation-no-1",
      _rev: rev(),
      title: "Anticipation, no. 1",
      slug: { current: "anticipation-no-1" },
      category: "eighteen-plus",
      year: 2025,
      medium: "Soft pastel on sanded paper",
      dimensions: { widthInches: 18, heightInches: 24 },
      weightOz: 32,
      price: 1850,
      status: "available",
      primaryImage: {
        _type: "image",
        asset: { _ref: "image-placeholder-figure-01", _type: "reference" },
        alt: "A figure study, the moment before. Tonal placeholder.",
      },
      series: { _ref: anticipationSeries._id },
      createdAt: nowIso(),
    },
    {
      _id: "painting.gateway-no-1",
      _rev: rev(),
      title: "Gateway, no. 1",
      slug: { current: "gateway-no-1" },
      category: "eighteen-plus",
      year: 2025,
      medium: "Oil on linen",
      dimensions: { widthInches: 24, heightInches: 30 },
      weightOz: 64,
      price: 2600,
      status: "nfs",
      primaryImage: {
        _type: "image",
        asset: { _ref: "image-placeholder-figure-02", _type: "reference" },
        alt: "A closer figure study, explicit by intention. Tonal placeholder.",
      },
      series: { _ref: gatewaySeries._id },
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
      "img_6868.jpg",
      "A yellow clapboard house at dusk, photographed in winter, painted for a family anniversary."
    ),
    story:
      "Commissioned as an anniversary gift — the family farmhouse in Ohio, painted from photos taken across one summer.",
    completedYear: 2024,
  };
  store.documents[ex1._id] = { ...ex1, _type: "commissionExample" };
}
