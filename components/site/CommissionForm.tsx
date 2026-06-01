"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
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
      // Focus the first invalid field for keyboard users.
      const firstKey = Object.keys(next)[0];
      if (firstKey) {
        const el = (e.currentTarget.elements.namedItem(firstKey) as HTMLElement | null);
        el?.focus();
      }
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

      <Field name="name" label="Your name" error={errors.name}>
        <input
          type="text"
          required
          autoComplete="name"
          className="w-full bg-transparent border-b border-bone py-3 outline-none focus:border-bone"
        />
      </Field>

      <Field name="email" label="Email" error={errors.email}>
        <input
          type="email"
          required
          autoComplete="email"
          className="w-full bg-transparent border-b border-bone py-3 outline-none focus:border-bone"
        />
      </Field>

      <Field name="projectType" label="What you'd like painted" error={errors.projectType}>
        <input
          type="text"
          placeholder="e.g. our family farm, a coastal scene, a portrait of place"
          className="w-full bg-transparent border-b border-bone py-3 outline-none focus:border-bone placeholder:text-bone-deep/50"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-8">
        <Field name="budgetRange" label="Budget range" error={errors.budgetRange}>
          <select
            className="w-full bg-transparent border-b border-bone py-3 outline-none focus:border-bone"
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
        <Field name="timeline" label="Timeline" error={errors.timeline}>
          <select
            className="w-full bg-transparent border-b border-bone py-3 outline-none focus:border-bone"
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

      <Field name="message" label="Tell Kelly about the piece" error={errors.message}>
        <textarea
          required
          rows={6}
          className="w-full bg-transparent border border-bone p-4 outline-none focus:border-bone resize-y"
          placeholder="What does the place feel like? Is this for a particular room? Any references you'd like to share?"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={phase === "submitting"}
          className="text-ui px-8 py-5 bg-bone text-ink hover:bg-bone-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {phase === "submitting" ? "Sending…" : "Send inquiry"}
        </button>
        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`text-sm ${phase === "ok" ? "text-bone" : ""}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * Field wraps a single form control and links its label + error message via
 * id / aria-invalid / aria-describedby. Cloning the child input lets us
 * inject the correct ARIA without callers having to repeat themselves.
 */
function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: ReactElement<{
    name?: string;
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}) {
  const inputId = `field-${name}`;
  const errorId = error ? `${inputId}-error` : undefined;

  const enhancedChild = isValidElement(children)
    ? cloneElement(children, {
        name,
        id: inputId,
        "aria-invalid": !!error,
        "aria-describedby": errorId,
      })
    : children;

  return (
    <div className="block">
      <label htmlFor={inputId} className="text-meta block mb-2">
        {label}
      </label>
      {enhancedChild}
      {error && (
        <span id={errorId} className="block mt-2 text-sm">
          {error}
        </span>
      )}
    </div>
  );
}
