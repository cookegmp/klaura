import type { SchemaTypeDefinition } from "sanity";
import { aboutPageSchema } from "./aboutPage";
import { blockContentSchema } from "./blockContent";
import { commissionExampleSchema } from "./commissionExample";
import { commissionInquirySchema } from "./commissionInquiry";
import { paintingSchema } from "./painting";
import { seriesSchema } from "./series";
import { siteSettingsSchema } from "./siteSettings";
import { tagSchema } from "./tag";
import { vintageItemSchema } from "./vintageItem";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  paintingSchema,
  vintageItemSchema,
  seriesSchema,
  tagSchema,
  commissionInquirySchema,
  commissionExampleSchema,
  aboutPageSchema,
  siteSettingsSchema,
  // Shared types
  blockContentSchema,
];
