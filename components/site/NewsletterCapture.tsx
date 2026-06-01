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
    <div className="text-center">
      <p className="text-tag mb-3">letters from the studio</p>
      <h2 className="font-display-italic text-bone text-2xl md:text-3xl leading-snug">
        Slow updates,
        <br />
        once a season.
      </h2>
      <form onSubmit={onSubmit} className="mt-8 max-w-sm mx-auto">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <div className="flex border-b border-bone">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="you@somewhere.com"
            autoComplete="email"
            className="flex-1 bg-transparent py-3 text-center font-display-italic text-bone outline-none placeholder:text-bone-deep"
          />
        </div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="mt-5 text-ui px-6 py-3 bg-bone text-ink hover:bg-bone-deep transition-colors disabled:opacity-50"
        >
          {state === "submitting" ? "sending" : "subscribe"}
        </button>
        {message && (
          <p role="status" className="mt-4 text-meta">
            {message}
          </p>
        )}
        <p className="text-tag mt-5">
          no more than four a year — unsubscribe whenever
        </p>
      </form>
    </div>
  );
}
