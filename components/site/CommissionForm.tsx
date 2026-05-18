"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Required").max(120),
  email: z.email("Please enter a valid email"),
  projectType: z.string().max(120).optional(),
  budgetRange: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
  message: z.string().min(1, "Required").max(4000),
  // Honeypot: bots fill in `website`, humans never see it.
  website: z.string().max(0).optional(),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;
type Phase = "idle" | "submitting" | "ok" | "error";

const BUDGET_OPTIONS = [
  "Under $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "Over $10,000",
  "Not sure",
];

const TIMELINE_OPTIONS = [
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "Flexible / no rush",
];

export function CommissionForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      projectType: String(fd.get("projectType") ?? ""),
      budgetRange: String(fd.get("budgetRange") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setPhase("error");
      setMessage("A couple of fields need attention.");
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/commission-inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 429) {
        setPhase("error");
        setMessage("That's a few inquiries in a row — please try again in a minute.");
        return;
      }
      if (!res.ok) {
        setPhase("error");
        setMessage("Something went wrong sending the message. Try again in a moment.");
        return;
      }
      setPhase("ok");
      setMessage(
        "Thank you — your inquiry is in Kelly's inbox. You'll hear back within a week."
      );
      (e.target as HTMLFormElement).reset();
    } catch {
      setPhase("error");
      setMessage("Network hiccup. Try again in a moment.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* Honeypot — hidden visually, never tabbed to */}
      <div
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        tabIndex={-1}
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Your name" error={errors.name}>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full bg-transparent border-b border-ink py-3 outline-none focus:border-ochre"
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-transparent border-b border-ink py-3 outline-none focus:border-ochre"
        />
      </Field>

      <Field label="What you'd like painted" error={errors.projectType}>
        <input
          name="projectType"
          type="text"
          placeholder="e.g. our family farm, a coastal scene, a portrait of place"
          className="w-full bg-transparent border-b border-ink py-3 outline-none focus:border-ochre placeholder:text-ink-soft/50"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-8">
        <Field label="Budget range" error={errors.budgetRange}>
          <select
            name="budgetRange"
            className="w-full bg-transparent border-b border-ink py-3 outline-none focus:border-ochre"
            defaultValue=""
          >
            <option value="">Choose one</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Timeline" error={errors.timeline}>
          <select
            name="timeline"
            className="w-full bg-transparent border-b border-ink py-3 outline-none focus:border-ochre"
            defaultValue=""
          >
            <option value="">Choose one</option>
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tell Kelly about the piece" error={errors.message}>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full bg-transparent border border-ink p-4 outline-none focus:border-ochre resize-y"
          placeholder="What does the place feel like? Is this for a particular room? Any references you'd like to share?"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={phase === "submitting"}
          className="text-ui px-8 py-5 bg-ink text-bone hover:bg-ochre-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {phase === "submitting" ? "Sending…" : "Send inquiry"}
        </button>
        {message && (
          <p
            role="status"
            className={`text-sm ${phase === "ok" ? "text-ink" : "text-ochre-deep"}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-ui text-ink-soft block mb-2">{label}</span>
      {children}
      {error && <span className="block mt-2 text-sm text-ochre-deep">{error}</span>}
    </label>
  );
}
