import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { completeSale, releaseReservation } from "@/lib/inventory";
import { sendOrderEmails } from "@/lib/email";

/**
 * Stripe-compatible webhook endpoint. Wired against the abstract
 * PaymentProvider, so the mock provider exercises the exact same code path.
 *
 * Idempotency (charter §step 3): if the product is already "sold" with the
 * matching session ID, return 200 immediately without state changes.
 *
 * Stripe retries non-2xx — we MUST never throw to the runtime; surface every
 * unexpected error as a 500 explicit body.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const signature = request.headers.get("stripe-signature") ?? "";
  const rawBody = await request.text();

  let event;
  try {
    event = await provider.verifyWebhook(rawBody, signature);
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_SIGNATURE", message: "Invalid webhook signature" } },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const completed = event as Extract<typeof event, { type: "checkout.session.completed" }>;
      const result = await completeSale({ sessionId: completed.session.id });
      if (result.alreadySold) {
        // Idempotent — Stripe re-delivered.
        return NextResponse.json({ ok: true, idempotent: true });
      }
      await sendOrderEmails({
        productTitle: result.productTitle,
        productPrice: result.price,
        customerEmail: completed.session.customerEmail,
        sessionId: completed.session.id,
      });
      return NextResponse.json({ ok: true });
    }

    if (event.type === "checkout.session.expired") {
      await releaseReservation({ sessionId: event.session.id });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: event.type });
  } catch (err) {
    console.error("[webhook]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Webhook handler failed" } },
      { status: 500 }
    );
  }
}
