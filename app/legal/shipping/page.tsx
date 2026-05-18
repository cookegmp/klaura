import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <LegalShell title="Shipping" subtitle="How your piece gets to you">
      <p>
        Original paintings ship from Richmond, Indiana via insured ground service. Most
        pieces arrive within 7–10 business days of purchase. Larger or framed works may
        require additional crating time — Kelly will email you with specifics before
        anything leaves the studio.
      </p>
      <p>
        Vintage pieces ship via USPS Priority and arrive within 3–5 business days. We
        include tracking with every order.
      </p>
      <p>
        International shipping is available on request. Reach out and we&apos;ll quote
        rates for your destination.
      </p>
      <p className="text-caption text-ink-soft/80">
        This is placeholder copy — final policy is sourced from Sanity site settings in
        Phase 2.
      </p>
    </LegalShell>
  );
}
