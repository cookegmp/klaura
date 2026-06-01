"use client";

import { useState } from "react";

export function MockCheckoutForm({ sessionId }: { sessionId: string }) {
  const [email, setEmail] = useState("buyer@example.com");
  const [busy, setBusy] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy("pay");
    setError(null);
    const res = await fetch("/api/dev/payments/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, customerEmail: email }),
    });
    if (!res.ok) {
      const body = await res.text();
      setError(body || "Mock payment failed");
      setBusy(null);
      return;
    }
    window.location.href = `/checkout/success?session_id=${encodeURIComponent(sessionId)}`;
  }

  async function cancel() {
    setBusy("cancel");
    setError(null);
    // Trigger session.expired for symmetry
    await fetch("/api/dev/payments/expire", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    window.location.href = "/checkout/cancel";
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void pay();
      }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="mock-email" className="text-ui text-ink/60 block mb-2">
          Customer email
        </label>
        <input
          id="mock-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border-b border-ink/30 focus:border-ochre py-2 text-ink outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy !== null}
          className="text-ui px-7 py-4 bg-ochre text-bone hover:bg-ochre-deep hover:text-ink transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy === "pay" ? "Processing…" : "Pay"}
        </button>
        <button
          type="button"
          onClick={() => void cancel()}
          disabled={busy !== null}
          className="text-ui px-7 py-4 border border-ink/30 hover:bg-ink hover:text-bone transition-colors disabled:opacity-60"
        >
          {busy === "cancel" ? "Cancelling…" : "Cancel"}
        </button>
      </div>

      {error && (
        <p role="status" className="text-ochre text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
