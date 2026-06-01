import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms" subtitle="The basics">
      <p>
        Use of kellylauraart.com is governed by these terms. All artwork shown is the
        copyrighted property of Kelly Laura and may not be reproduced without
        permission.
      </p>
      <p>
        Prices, inventory, and availability are subject to change without notice. The
        original-artwork market means we may need to remove a piece from sale at any
        time — if your order is affected, we&apos;ll refund you in full.
      </p>
      <p className="text-caption text-bone-deep/80">
        Placeholder copy — sourced from Sanity in Phase 2.
      </p>
    </LegalShell>
  );
}
