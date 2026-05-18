import { beforeEach, describe, expect, it } from "vitest";
import {
  releaseStaleReservations,
  reserveProduct,
} from "@/lib/inventory";
import {
  patch,
  reseedForTests,
  getDocument,
} from "@/lib/sanity/mock-store";

/**
 * Charter §step 4 — defense-in-depth cron releases reservations whose
 * TTL has elapsed but whose webhook never arrived.
 */
describe("stale reservation cleanup", () => {
  beforeEach(() => {
    reseedForTests();
  });

  it("releases reservations whose reservedUntil is in the past", async () => {
    const productId = "painting.three-cattle";
    const handle = await reserveProduct("painting", productId);
    await handle.attachSessionId("cs_mock_stale_1");

    // Force the reservation into the past.
    const past = new Date(Date.now() - 60_000).toISOString();
    patch(productId, { reservedUntil: past });

    const result = await releaseStaleReservations();
    expect(result.released).toBeGreaterThanOrEqual(1);

    const doc = getDocument(productId) as
      | { status: string; reservedUntil?: string; stripeSessionId?: string }
      | null;
    expect(doc?.status).toBe("available");
    expect(doc?.reservedUntil).toBeUndefined();
    expect(doc?.stripeSessionId).toBeUndefined();
  });

  it("does not release reservations that are still within their TTL", async () => {
    const productId = "vintageItem.cream-aran-fisherman";
    await reserveProduct("vintage", productId);

    const result = await releaseStaleReservations();
    expect(result.released).toBe(0);

    const doc = getDocument(productId) as { status: string } | null;
    expect(doc?.status).toBe("reserved");
  });
});
