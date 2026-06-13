import { beforeEach, describe, expect, it } from "vitest";
import { reserveProduct } from "@/lib/inventory";
import { reseedForTests } from "@/lib/sanity/mock-store";

/**
 * Charter §risks "Concurrent checkout race" — exercises the
 * `patch().ifRevisionId()` semantics in mock-store. Both requests start
 * from the same snapshot; exactly one wins.
 */
describe("inventory race condition", () => {
  beforeEach(() => {
    reseedForTests();
  });

  it("exactly one of two concurrent reservations succeeds", async () => {
    const productId = "painting.aspens";

    const results = await Promise.allSettled([
      reserveProduct("painting", productId),
      reserveProduct("painting", productId),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const err = (rejected[0] as PromiseRejectedResult).reason as Error & {
      code: string;
    };
    expect(err.code).toBe("CONFLICT");
  });

  it("attempting to reserve an already-sold piece returns CONFLICT", async () => {
    const productId = "painting.aspens";
    const handle = await reserveProduct("painting", productId);
    expect(handle).toBeTruthy();

    await expect(reserveProduct("painting", productId)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("returns NOT_FOUND for unknown product", async () => {
    await expect(
      reserveProduct("painting", "painting.does-not-exist")
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
