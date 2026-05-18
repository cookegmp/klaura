import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { mock_expireSession } from "@/lib/payments/mock";
import { releaseReservation } from "@/lib/inventory";

/** Dev-only mock for `checkout.session.expired`. Releases the reservation. */
export async function POST(request: Request) {
  if (env().PAYMENT_PROVIDER !== "mock") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Mock endpoint disabled" } },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { sessionId?: string };
  if (!body.sessionId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "sessionId required" } },
      { status: 400 }
    );
  }

  mock_expireSession(body.sessionId);
  const result = await releaseReservation({ sessionId: body.sessionId });
  return NextResponse.json({ ok: true, released: result.released });
}
