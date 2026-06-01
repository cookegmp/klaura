"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({ email: z.email() });

type State = "idle" | "submitting" | "ok" | "error";

export function NewsletterCapture() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      setState("error");
      setMessage("Please enter a valid email.");
      return;
    }
    setState("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("submit failed");
      setState("ok");
      setMessage("Thanks. You'll hear from Kelly soon.");
    } catch {
      setState("error");
      setMessage("Something went sideways. Try again in a moment.");
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
      <div>
        <p className="text-meta mb-6">Letters from the studio</p>
        <h2 className="font-display text-[length:var(--text-display-md)] md:text-[length:var(--text-display-lg)] leading-[1.05] font-light tracking-[-0.02em]">
          Slow updates,
          <span className="font-display-italic"> once a season</span>.
        </h2>
      </div>
      <form onSubmit={onSubmit} className="md:pt-12">
        <label htmlFor="newsletter-email" className="text-meta block mb-3">
          Email
        </label>
        <div className="flex border-b border-bone focus-within:border-bone transition-colors">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="you@somewhere.com"
            autoComplete="email"
            className="flex-1 bg-transparent py-3 outline-none placeholder:text-bone-deep"
          />
          <button
            type="submit"
            disabled={state === "submitting"}
            className="text-ui px-2 py-3 disabled:opacity-50"
          >
            {state === "submitting" ? "Sending…" : "Subscribe →"}
          </button>
        </div>
        {message && (
          <p
            role="status"
            className={`mt-4 text-sm ${state === "error" ? "" : "text-bone-deep"}`}
          >
            {message}
          </p>
        )}
        <p className="text-caption text-bone-deep mt-6">
          No more than four a year. Unsubscribe whenever.
        </p>
      </form>
    </div>
  );
}
