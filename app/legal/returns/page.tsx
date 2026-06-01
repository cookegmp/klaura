import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <LegalShell title="Returns" subtitle="Living with the piece you bought">
      <p>
        Because every painting and vintage piece on this site is one-of-a-kind, returns
        are handled case-by-case. If something arrives damaged, or doesn&apos;t match its
        listing, write to us within 7 days and we&apos;ll make it right.
      </p>
      <p>
        Final-sale items are clearly marked. Custom commissions are non-returnable, but
        Kelly works closely with you through proofs and progress photos to make sure the
        finished piece is what you wanted.
      </p>
      <p className="text-caption text-bone-deep/80">
        Placeholder copy — sourced from Sanity in Phase 2.
      </p>
    </LegalShell>
  );
}
