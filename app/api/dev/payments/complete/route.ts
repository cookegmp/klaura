import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { MOCK_WEBHOOK_SIGNATURE, mock_completeSession } from "@/lib/payments/mock";
import { completeSale } from "@/lib/inventory";
import { sendOrderEmails } from "@/lib/email";

/**
 * Dev-only endpoint that simulates a successful payment. Wires the mock
 * provider's session-completion into the same code path as a real Stripe
 * webhook: same event shape, same handler logic, same email + inventory
 * side effects. Only mounted when PAYMENT_PROVIDER=mock.
 *
 * Marked unused parameter (signature) deliberately — it's documented as
 * the webhook integration point.
 */
export async function POST(request: Request) {
  if (env().PAYMENT_PROVIDER !== "mock") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Mock endpoint disabled" } },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    sessionId?: string;
    customerEmail?: string;
  };
  if (!body.sessionId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "sessionId required" } },
      { status: 400 }
    );
  }

  // Build the event exactly as Stripe would have, then run the same code
  // path our webhook handler uses. We invoke the inventory logic directly
  // rather than fetching our own webhook URL, because that keeps the test
  // and dev experience deterministic (no internal HTTP roundtrip).
  const event = mock_completeSession(body.sessionId, body.customerEmail ?? null);
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json(
      { error: { code: "BAD_EVENT", message: "Unexpected event type" } },
      { status: 500 }
    );
  }
  // Signature is documented but not exercised in this dev path:
  void MOCK_WEBHOOK_SIGNATURE;

  const result = await completeSale({ sessionId: body.sessionId });
  if (!result.alreadySold) {
    await sendOrderEmails({
      productTitle: result.productTitle,
      productPrice: result.price,
      customerEmail: body.customerEmail ?? null,
      sessionId: body.sessionId,
    });
  }
  return NextResponse.json({ ok: true, alreadySold: result.alreadySold });
}
