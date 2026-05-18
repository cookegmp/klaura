import { NextResponse } from "next/server";
import { z } from "zod";
import { reserveProduct } from "@/lib/inventory";
import { getPaymentProvider } from "@/lib/payments";
import { env } from "@/lib/env";

const requestSchema = z.object({
  productType: z.enum(["painting", "vintage"]),
  productId: z.string().min(1),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid request body" } },
      { status: 400 }
    );
  }

  // 1. Reserve atomically. Sanity's ifRevisionId() is the lock; if another
  //    request beat us, this throws CONFLICT and we surface 409 to the user.
  let reservation;
  try {
    reservation = await reserveProduct(parsed.productType, parsed.productId);
  } catch (err) {
    const e = err as Error & { code?: string };
    if (e.code === "CONFLICT") {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_SOLD",
            message: "This piece was just sold — try another.",
          },
        },
        { status: 409 }
      );
    }
    if (e.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }
    throw err;
  }

  // 2. Create checkout session with the active payment provider (mock by default).
  const provider = getPaymentProvider();
  const session = await provider.createCheckoutSession({
    productType: parsed.productType,
    productId: parsed.productId,
    productTitle: reservation.title,
    priceUSD: reservation.price,
    sanityRevisionId: reservation.revisionId,
    successUrl: `${env().SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${env().SITE_URL}/checkout/cancel`,
  });

  // 3. Stamp the session ID back onto the reservation.
  await reservation.attachSessionId(session.id);

  return NextResponse.json({ url: session.url, sessionId: session.id }, { status: 200 });
}
