"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "klaura:eighteen-plus:confirmed";

interface AgeGateProps {
  children: ReactNode;
  /** Where to go when the visitor declines the gate. */
  declineHref?: string;
}

/**
 * Session-scoped age gate for the Eighteen+ gallery room. While unconfirmed
 * the children do not render — they are not just visually hidden but never
 * mounted, so cover images aren't downloaded behind the curtain.
 *
 * Storage is sessionStorage rather than a cookie: a soft promise that
 * persists across tabs within a browsing session but resets on close. For
 * a real legal age gate (charter §commerce / payments) this would need to
 * pair with the consent + anonymity flow that's still on the roadmap.
 */
export function AgeGate({ children, declineHref = "/gallery" }: AgeGateProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      setConfirmed(stored === "1");
    } catch {
      setConfirmed(false);
    }
  }, []);

  // First paint while we resolve sessionStorage — show the gate UI but
  // disable buttons. Avoids a flash of unconfirmed content when the visitor
  // has previously confirmed in this session.
  if (confirmed === null) {
    return <GatePanel busy />;
  }

  if (!confirmed) {
    return (
      <GatePanel
        onConfirm={() => {
          try {
            window.sessionStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore — gate still works for this render */
          }
          setConfirmed(true);
        }}
        onDecline={() => router.push(declineHref)}
      />
    );
  }

  return <>{children}</>;
}

function GatePanel({
  onConfirm,
  onDecline,
  busy = false,
}: {
  onConfirm?: () => void;
  onDecline?: () => void;
  busy?: boolean;
}) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-body"
      className="min-h-[80vh] flex items-center justify-center px-6 py-24 md:py-32"
    >
      <div className="max-w-2xl w-full text-center">
        <p className="text-ui text-ink-soft mb-6">§ Eighteen+</p>
        <h1
          id="age-gate-title"
          className="font-display-caps font-light text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[0.9] tracking-[-0.025em]"
        >
          This room contains
          <br />
          <span className="font-display-italic text-ochre-deep normal-case">
            adult content
          </span>
          .
        </h1>
        <p
          id="age-gate-body"
          className="mt-10 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed max-w-lg mx-auto"
        >
          Figure work and explicit pieces. Please confirm you are eighteen or older
          before continuing.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="text-ui px-9 py-5 bg-ink text-bone hover:bg-ochre-deep transition-colors disabled:opacity-50"
          >
            I am 18 or older — enter
          </button>
          <button
            type="button"
            onClick={onDecline}
            disabled={busy}
            className="text-ui px-9 py-5 border border-ink text-ink hover:bg-bone-deep transition-colors disabled:opacity-50"
          >
            Take me back
          </button>
        </div>
        <p className="mt-12 font-[family-name:var(--font-mono)] text-[0.74rem] uppercase tracking-[0.06em] text-ink-soft">
          This choice applies for the current browser session.
        </p>
      </div>
    </section>
  );
}
