import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";

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

  // Phase 3 will server-verify the session via the payments provider here.
  // Inventory mutation happens in the webhook, NOT this page (charter §step 5).

  return (
    <Container width="narrow" className="py-32 md:py-48 text-center">
      <p className="text-ui text-ink-soft mb-6">Thank you</p>
      <h1 className="font-display font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] tracking-[-0.02em]">
        Your piece is <span className="font-display-italic text-ochre-deep">on its way</span>.
      </h1>
      <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
        We&apos;ve sent a confirmation to your inbox. Kelly will reach out within a few days with shipping details.
      </p>
      {session_id && (
        <p className="text-caption text-ink-soft/70 mt-6">Reference: {session_id}</p>
      )}
      <div className="mt-12 flex justify-center gap-4">
        <Link
          href="/paintings"
          className="text-ui px-7 py-4 bg-ink text-bone hover:bg-ochre-deep transition-colors"
        >
          Back to the gallery
        </Link>
      </div>
    </Container>
  );
}
