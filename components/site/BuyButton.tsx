"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BuyButtonProps {
  productType: "painting" | "vintage";
  productId: string;
  status: "available" | "reserved" | "sold" | "nfs";
  priceLabel: string;
  className?: string;
}

type Phase = "idle" | "submitting" | "redirecting" | "error";

export function BuyButton({
  productType,
  productId,
  status,
  priceLabel,
  className,
}: BuyButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string>("");

  if (status === "sold") {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "text-ui px-8 py-5 bg-rule text-bone-deep cursor-not-allowed",
          className
        )}
      >
        Sold
      </button>
    );
  }

  if (status === "nfs") {
    return (
      <p className={cn("text-caption text-bone-deep italic", className)}>
        Not for sale — part of the studio collection.
      </p>
    );
  }

  if (status === "reserved") {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "text-ui px-8 py-5 bg-rule text-bone-deep cursor-not-allowed",
          className
        )}
      >
        Reserved
      </button>
    );
  }

  async function onClick() {
    setPhase("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productType, productId }),
      });
      const data = (await res.json()) as { url?: string; error?: { message: string } };

      if (res.status === 409) {
        setPhase("error");
        setMessage(data.error?.message ?? "This piece was just sold.");
        return;
      }
      if (!res.ok || !data.url) {
        setPhase("error");
        setMessage(data.error?.message ?? "Something went wrong. Try again.");
        return;
      }
      setPhase("redirecting");
      window.location.href = data.url;
    } catch {
      setPhase("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={phase === "submitting" || phase === "redirecting"}
        className="text-ui px-8 py-5 bg-bone text-ink hover:bg-bone-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {phase === "submitting"
          ? "Reserving…"
          : phase === "redirecting"
            ? "Redirecting…"
            : `Buy — ${priceLabel}`}
      </button>
      {message && (
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
