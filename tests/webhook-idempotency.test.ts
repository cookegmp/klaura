import { beforeEach, describe, expect, it } from "vitest";
import { completeSale, reserveProduct } from "@/lib/inventory";
import { reseedForTests } from "@/lib/sanity/mock-store";

/**
 * Charter §step 3 "Webhook handler must be idempotent. Stripe retries on
 * non-2xx. If product is already 'sold' with matching sessionId, return
 * 200 without changes."
 */
describe("webhook idempotency", () => {
  beforeEach(() => {
    reseedForTests();
  });

  it("duplicate completion does not double-process", async () => {
    const productId = "painting.cottage";
    const handle = await reserveProduct("painting", productId);
    await handle.attachSessionId("cs_mock_idemp_1");

    const first = await completeSale({ sessionId: "cs_mock_idemp_1" });
    expect(first.alreadySold).toBe(false);
    expect(first.productTitle).toBeTruthy();

    // Stripe retries — same event, same sessionId
    const second = await completeSale({ sessionId: "cs_mock_idemp_1" });
    expect(second.alreadySold).toBe(true);
    expect(second.productId).toBe(first.productId);
    expect(second.productTitle).toBe(first.productTitle);
  });

  it("unknown sessionId throws NOT_FOUND", async () => {
    await expect(
      completeSale({ sessionId: "cs_mock_never_existed" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
