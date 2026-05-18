import { createClient, type SanityClient } from "next-sanity";
import { env } from "@/lib/env";

/**
 * Real Sanity clients (read + write). Only constructed when SANITY_MODE=live.
 * The mock-store handles SANITY_MODE=mock transparently from the caller's
 * point of view — see `lib/sanity/read.ts` and `lib/sanity/write.ts`.
 */

let readClient: SanityClient | undefined;
let writeClient: SanityClient | undefined;

export function getReadClient(): SanityClient {
  if (!readClient) {
    const e = env();
    readClient = createClient({
      projectId: e.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: e.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: e.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: true,
      perspective: "published",
      token: e.SANITY_API_READ_TOKEN,
    });
  }
  return readClient;
}

export function getWriteClient(): SanityClient {
  if (!writeClient) {
    const e = env();
    if (!e.SANITY_API_WRITE_TOKEN) {
      throw new Error("SANITY_API_WRITE_TOKEN is required when SANITY_MODE=live");
    }
    writeClient = createClient({
      projectId: e.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: e.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: e.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false,
      perspective: "raw",
      token: e.SANITY_API_WRITE_TOKEN,
    });
  }
  return writeClient;
}
