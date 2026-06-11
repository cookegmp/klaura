import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { getPaymentProvider } from "@/lib/payments";
import { formatPriceUSD } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id } = await searchParams;

  let summary: {
    productTitle?: string;
    price?: number;
    customerEmail?: string | null;
  } = {};

  if (session_id) {
    const session = await getPaymentProvider().retrieveSession(session_id);
    if (session) {
      summary = {
        productTitle: session.productTitle,
        price: session.priceUSD,
        customerEmail: session.customerEmail,
      };
    }
  }

  return (
    <Container width="narrow" className="py-32 md:py-48 text-center">
      <p className="text-meta mb-6">Thank you</p>
      <h1 className="font-display font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] tracking-[-0.02em]">
        Your piece is <span className="font-display-italic">on its way</span>.
      </h1>

      {summary.productTitle && (
        <div className="mt-12 inline-block border-t border-rule pt-8">
          <p className="text-meta mb-2">Order summary</p>
          <p className="font-display text-2xl">{summary.productTitle}</p>
          {summary.price && (
            <p className="text-lg mt-1">{formatPriceUSD(summary.price)}</p>
          )}
          {summary.customerEmail && (
            <p className="text-caption text-bone-deep mt-3">
              Confirmation sent to {summary.customerEmail}
            </p>
          )}
        </div>
      )}

      <p className="mt-10 text-[length:var(--text-body-lg)] text-bone-deep leading-relaxed">
        Kelly will reach out within a few days with shipping details.
      </p>

      {session_id && (
        <p className="text-caption text-bone-deep/70 mt-6">Reference: {session_id}</p>
      )}

      <div className="mt-12 flex justify-center gap-4">
        <Link
          href="/gallery"
          className="text-ui px-7 py-4 bg-bone text-ink hover:bg-bone-deep transition-colors"
        >
          Back to the gallery
        </Link>
      </div>
    </Container>
  );
}
