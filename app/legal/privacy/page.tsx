import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy" subtitle="What we collect and why">
      <p>
        We only collect what we need to complete your order: name, shipping address,
        email, and payment information (handled by Stripe — we never see your card
        number).
      </p>
      <p>
        We don&apos;t sell or share your information with third parties. Newsletter
        subscribers can unsubscribe at any time. Order records are retained for tax
        purposes and to honor any future warranty or condition questions.
      </p>
      <p className="text-caption text-ink-soft/80">
        Placeholder copy — sourced from Sanity in Phase 2.
      </p>
    </LegalShell>
  );
}
