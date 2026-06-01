import { notFound } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { mock_getSession } from "@/lib/payments/mock";
import { formatPriceUSD } from "@/lib/utils";
import { MockCheckoutForm } from "./form";

type Params = Promise<{ id: string }>;

/**
 * Local stand-in for Stripe's hosted Checkout page. Only routable when
 * PAYMENT_PROVIDER=mock — in stripe mode users are bounced to checkout.stripe.com
 * and never see this page.
 */
export default async function MockCheckoutPage({ params }: { params: Params }) {
  if (env().PAYMENT_PROVIDER !== "mock") notFound();

  const { id } = await params;
  const session = mock_getSession(id);
  if (!session) notFound();

  return (
    <div className="min-h-dvh bg-bone text-ink flex items-center">
      <div className="max-w-md mx-auto w-full p-6 md:p-10">
        <p className="text-meta mb-6">Mock checkout · dev only</p>
        <h1 className="font-display text-3xl leading-tight mb-3">{session.productTitle}</h1>
        <p className="text-2xl mb-10">{formatPriceUSD(session.priceUSD)}</p>

        <div className="bg-ink/5 border border-ink/15 p-5 mb-8 text-sm">
          <p className="text-ink/70 mb-2">
            This is a mock checkout. No card is collected. Press <em>Pay</em> to simulate a
            successful payment, or <em>Cancel</em> to abandon.
          </p>
          <p className="text-ink/50 text-xs">Session: {session.id}</p>
          <p className="text-ink/50 text-xs">Status: {session.status}</p>
        </div>

        {session.status === "open" ? (
          <MockCheckoutForm sessionId={session.id} />
        ) : (
          <div className="space-y-4">
            <p className="">This session is {session.status}.</p>
            <Link
              href="/paintings"
              className="text-ui inline-block border-b border-ink"
            >
              Back to the gallery
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
