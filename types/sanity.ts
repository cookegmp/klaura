/**
 * Hand-written types matching the Sanity schemas in sanity/schemas/.
 * Charter §conventions allows hand-written or codegen; hand-written keeps
 * the project self-contained until a Sanity project is provisioned.
 */

export type ProductStatus = "available" | "reserved" | "sold" | "nfs";
export type VintageStatus = "available" | "reserved" | "sold";

export type PaintingCategory =
  | "landscapes"
  | "houses"
  | "animals"
  | "eighteen-plus"
  | "miscellaneous";

export const PAINTING_CATEGORIES: ReadonlyArray<{
  slug: PaintingCategory;
  label: string;
  shortLabel: string;
  mature?: true;
}> = [
  { slug: "landscapes", label: "Landscapes", shortLabel: "Landscapes" },
  { slug: "houses", label: "Houses", shortLabel: "Houses" },
  { slug: "animals", label: "Animals & Pets", shortLabel: "Animals" },
  {
    slug: "eighteen-plus",
    label: "Eighteen+",
    shortLabel: "18+",
    mature: true,
  },
  {
    slug: "miscellaneous",
    label: "Miscellaneous",
    shortLabel: "Misc.",
  },
] as const;

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
}

export interface PortableTextBlock {
  _type: string;
  _key: string;
  [key: string]: unknown;
}

export interface Painting {
  _id: string;
  _rev: string;
  title: string;
  slug: { current: string };
  category: PaintingCategory;
  /** Painted year — omitted for works where it isn't recorded. */
  year?: number;
  /** Medium — omitted for works without recorded media. */
  medium?: string;
  /** Physical size — omitted for works without recorded dimensions. */
  dimensions?: {
    widthInches: number;
    heightInches: number;
    depthInches?: number;
    framed?: boolean;
  };
  /** Photo aspect ratio (width / height) — drives the detail-page frame. */
  imageAspect?: number;
  weightOz?: number;
  price: number;
  status: ProductStatus;
  reservedUntil?: string;
  stripeSessionId?: string;
  primaryImage: SanityImage;
  detailImages?: SanityImage[];
  story?: PortableTextBlock[];
  tags?: Array<{ _ref: string }>;
  series?: { _ref: string };
  featured?: boolean;
  featuredOrder?: number;
  createdAt: string;
  soldAt?: string;
  shippingNotes?: string;
}

export interface VintageItem {
  _id: string;
  _rev: string;
  title: string;
  slug: { current: string };
  category: "dress" | "top" | "bottom" | "outerwear" | "knitwear" | "accessory" | "other";
  era?:
    | "pre-1960"
    | "1960s"
    | "1970s"
    | "1980s"
    | "1990s"
    | "2000s"
    | "unknown";
  labelSize?: string;
  measurements?: {
    chestFlat?: number;
    waistFlat?: number;
    hipFlat?: number;
    length?: number;
    sleeve?: number;
    shoulder?: number;
    notes?: string;
  };
  material?: string;
  condition: "excellent" | "very-good" | "good" | "fair";
  conditionNotes?: string;
  price: number;
  status: VintageStatus;
  reservedUntil?: string;
  stripeSessionId?: string;
  primaryImage: SanityImage;
  detailImages?: SanityImage[];
  description?: PortableTextBlock[];
  weightOz: number;
  createdAt: string;
  soldAt?: string;
}

export interface Series {
  _id: string;
  _rev: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface Tag {
  _id: string;
  _rev: string;
  title: string;
  slug: { current: string };
}

export interface CommissionInquiry {
  _id: string;
  _rev: string;
  submittedAt: string;
  name: string;
  email: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
  referenceImages?: SanityImage[];
  status: "new" | "responded" | "in-progress" | "completed" | "declined";
  internalNotes?: string;
}

export interface CommissionExample {
  _id: string;
  _rev: string;
  title: string;
  image: SanityImage;
  story?: string;
  completedYear?: number;
}

export interface AboutPage {
  _id: string;
  _rev: string;
  hero?: SanityImage;
  story: PortableTextBlock[];
  pullQuote?: string;
  studioImages?: SanityImage[];
}

export interface SiteSettings {
  _id: string;
  _rev: string;
  featuredHeroPainting?: { _ref: string };
  marqueePhrases?: string[];
  shippingPolicy?: PortableTextBlock[];
  returnsPolicy?: PortableTextBlock[];
  privacyPolicy?: PortableTextBlock[];
  terms?: PortableTextBlock[];
  instagramHandle?: string;
  contactEmail: string;
  shippingFlatRateUS?: number;
  shippingFlatRateIntl?: number;
}

/** Discriminated union of the two sellable product kinds. */
export type Product =
  | ({ _type: "painting" } & Painting)
  | ({ _type: "vintageItem" } & VintageItem);
