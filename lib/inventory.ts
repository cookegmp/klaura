import "server-only";
import { env } from "@/lib/env";
import { getWriteClient } from "@/lib/sanity/client";
import * as mock from "@/lib/sanity/mock-store";
import type { ProductType } from "@/lib/payments/types";
import type {
  Painting as PaintingDoc,
  VintageItem as VintageDoc,
} from "@/types/sanity";

type AnyProductDoc = (PaintingDoc | VintageDoc) & { _type: "painting" | "vintageItem" };

/**
 * Inventory state machine. This is the load-bearing module of the whole
 * commerce flow — every state transition must be safe under concurrent
 * checkouts (charter §risks "Concurrent checkout race").
 *
 * Three operations need atomicity:
 *   1. reserveProduct  — availble → reserved   (RACE: optimistic concurrency)
 *   2. completeSale    — reserved → sold       (no race: webhook is single-source)
 *   3. releaseReservation — reserved → available (no race: webhook or cron)
 *
 * Mock and live paths use the same logic; the mock-store mimics
 * patch().ifRevisionId() exactly so the race test exercises the
 * production code path.
 */

const RESERVATION_TTL_MS = 30 * 60 * 1000;

interface ProductSnapshot {
  _id: string;
  _rev: string;
  title: string;
  price: number;
  status: string;
}

export interface ReservationHandle {
  productType: ProductType;
  productId: string;
  title: string;
  price: number;
  revisionId: string;
  attachSessionId(sessionId: string): Promise<void>;
}

function liveSanity(): boolean {
  return env().SANITY_MODE === "live";
}

async function readProduct(
  _productType: ProductType,
  productId: string
): Promise<ProductSnapshot> {
  if (!liveSanity()) {
    const doc = mock.getDocument<AnyProductDoc>(productId);
    if (!doc) {
      const err = new Error("Product not found") as Error & { code: string };
      err.code = "NOT_FOUND";
      throw err;
    }
    return {
      _id: doc._id,
      _rev: doc._rev,
      title: doc.title,
      price: doc.price,
      status: doc.status,
    };
  }
  const client = getWriteClient();
  const doc = await client.fetch<ProductSnapshot | null>(
    `*[_id == $id][0] { _id, _rev, title, price, status }`,
    { id: productId }
  );
  if (!doc) {
    const err = new Error("Product not found") as Error & { code: string };
    err.code = "NOT_FOUND";
    throw err;
  }
  return doc;
}

/**
 * Atomic reservation. If two requests race, exactly one succeeds — the
 * other throws ConcurrencyError, which the API route translates to 409.
 */
export async function reserveProduct(
  productType: ProductType,
  productId: string
): Promise<ReservationHandle> {
  const current = await readProduct(productType, productId);

  if (current.status !== "available") {
    const err = new Error("Product not available") as Error & { code: string };
    err.code = "CONFLICT";
    throw err;
  }

  const reservedUntil = new Date(Date.now() + RESERVATION_TTL_MS).toISOString();

  if (!liveSanity()) {
    // Mock path — uses identical optimistic-concurrency semantics.
    const patched = mock.patchIfRev(current._id, current._rev, {
      status: "reserved",
      reservedUntil,
      stripeSessionId: undefined,
    });

    return {
      productType,
      productId,
      title: current.title,
      price: current.price,
      revisionId: patched._rev,
      async attachSessionId(sessionId: string) {
        mock.patch(productId, { stripeSessionId: sessionId });
      },
    };
  }

  // Live path — Sanity's patch().ifRevisionId() does the same thing.
  const client = getWriteClient();
  const patched = await client
    .patch(current._id)
    .ifRevisionId(current._rev)
    .set({
      status: "reserved",
      reservedUntil,
      stripeSessionId: null,
    })
    .commit();

  return {
    productType,
    productId,
    title: current.title,
    price: current.price,
    revisionId: patched._rev,
    async attachSessionId(sessionId: string) {
      await client.patch(productId).set({ stripeSessionId: sessionId }).commit();
    },
  };
}

/**
 * Webhook-driven sale completion. Idempotent: if the product is already
 * sold with the same session ID, return alreadySold=true.
 */
export async function completeSale(input: {
  sessionId: string;
}): Promise<{
  alreadySold: boolean;
  productTitle: string;
  price: number;
  productId: string;
}> {
  if (!liveSanity()) {
    const painting = mock.findFirst<PaintingDoc & { _type: "painting" }>(
      "painting",
      (p) => p.stripeSessionId === input.sessionId
    );
    const vintage =
      painting ??
      mock.findFirst<VintageDoc & { _type: "vintageItem" }>(
        "vintageItem",
        (v) => v.stripeSessionId === input.sessionId
      );
    const doc = painting ?? vintage;
    if (!doc) {
      const err = new Error("Session not associated with any product") as Error & {
        code: string;
      };
      err.code = "NOT_FOUND";
      throw err;
    }
    if (doc.status === "sold") {
      return {
        alreadySold: true,
        productTitle: doc.title,
        price: doc.price,
        productId: doc._id,
      };
    }
    mock.patch(doc._id, {
      status: "sold",
      soldAt: new Date().toISOString(),
      reservedUntil: undefined,
    });
    return {
      alreadySold: false,
      productTitle: doc.title,
      price: doc.price,
      productId: doc._id,
    };
  }

  const client = getWriteClient();
  const doc = await client.fetch<
    | ({
        _id: string;
        title: string;
        price: number;
        status: string;
      } & Record<string, unknown>)
    | null
  >(
    `*[stripeSessionId == $sessionId][0] { _id, title, price, status }`,
    { sessionId: input.sessionId }
  );
  if (!doc) {
    const err = new Error("Session not associated with any product") as Error & {
      code: string;
    };
    err.code = "NOT_FOUND";
    throw err;
  }
  if (doc.status === "sold") {
    return {
      alreadySold: true,
      productTitle: doc.title,
      price: doc.price,
      productId: doc._id,
    };
  }
  await client
    .patch(doc._id)
    .set({ status: "sold", soldAt: new Date().toISOString() })
    .unset(["reservedUntil"])
    .commit();
  return {
    alreadySold: false,
    productTitle: doc.title,
    price: doc.price,
    productId: doc._id,
  };
}

export async function releaseReservation(input: {
  sessionId: string;
}): Promise<{ released: number }> {
  if (!liveSanity()) {
    const candidates = [
      ...mock.findMany<PaintingDoc & { _type: "painting" }>(
        "painting",
        (p) => p.stripeSessionId === input.sessionId && p.status === "reserved"
      ),
      ...mock.findMany<VintageDoc & { _type: "vintageItem" }>(
        "vintageItem",
        (v) => v.stripeSessionId === input.sessionId && v.status === "reserved"
      ),
    ];
    for (const doc of candidates) {
      mock.patch(doc._id, {
        status: "available",
        reservedUntil: undefined,
        stripeSessionId: undefined,
      });
    }
    return { released: candidates.length };
  }

  const client = getWriteClient();
  const docs = await client.fetch<Array<{ _id: string }>>(
    `*[stripeSessionId == $sessionId && status == "reserved"]{ _id }`,
    { sessionId: input.sessionId }
  );
  for (const doc of docs) {
    await client
      .patch(doc._id)
      .set({ status: "available" })
      .unset(["reservedUntil", "stripeSessionId"])
      .commit();
  }
  return { released: docs.length };
}

/**
 * Cron-driven defense-in-depth. Releases reservations whose TTL has
 * elapsed but whose webhook never arrived.
 */
export async function releaseStaleReservations(): Promise<{ released: number }> {
  const cutoff = new Date().toISOString();

  if (!liveSanity()) {
    const stale = [
      ...mock.findMany<PaintingDoc & { _type: "painting" }>(
        "painting",
        (p) =>
          p.status === "reserved" &&
          typeof p.reservedUntil === "string" &&
          p.reservedUntil < cutoff
      ),
      ...mock.findMany<VintageDoc & { _type: "vintageItem" }>(
        "vintageItem",
        (v) =>
          v.status === "reserved" &&
          typeof v.reservedUntil === "string" &&
          v.reservedUntil < cutoff
      ),
    ];
    for (const doc of stale) {
      mock.patch(doc._id, {
        status: "available",
        reservedUntil: undefined,
        stripeSessionId: undefined,
      });
    }
    return { released: stale.length };
  }

  const client = getWriteClient();
  const stale = await client.fetch<Array<{ _id: string }>>(
    `*[status == "reserved" && reservedUntil < $cutoff]{ _id }`,
    { cutoff }
  );
  for (const doc of stale) {
    await client
      .patch(doc._id)
      .set({ status: "available" })
      .unset(["reservedUntil", "stripeSessionId"])
      .commit();
  }
  return { released: stale.length };
}

// Re-export shared types so callers don't have to import from two places.
export type { ProductType };
