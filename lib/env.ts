import { z } from "zod";

/**
 * Centralised, validated environment access. Anything outside this module
 * that reads process.env directly is a code smell.
 *
 * Most values are optional because the project ships in "mock mode" by
 * default — placeholders only become required when their provider is
 * switched on (PAYMENT_PROVIDER=stripe, EMAIL_PROVIDER=resend, etc.).
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.url().default("http://localhost:3000"),

  // Provider switches
  PAYMENT_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  EMAIL_PROVIDER: z.enum(["mock", "resend"]).default("mock"),
  SANITY_MODE: z.enum(["mock", "live"]).default("mock"),

  // Sanity (only required when SANITY_MODE=live; we validate then)
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default("production"),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default("2025-01-01"),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_API_WRITE_TOKEN: z.string().optional(),
  SANITY_REVALIDATE_SECRET: z.string().optional(),

  // Stripe (only required when PAYMENT_PROVIDER=stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_ADDRESS: z.string().default("Kelly Laura <hello@kellylauraart.com>"),
  KELLY_NOTIFICATION_EMAIL: z.string().default("kelly@kellylauraart.com"),

  // Cron
  CRON_SECRET: z.string().default("local-dev-cron-secret"),

  // Sentry (no-op when empty)
  SENTRY_DSN: z.string().optional(),
});

type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid environment configuration:\n${message}`);
    }
    cached = parsed.data;

    // Hard-fail late when a provider is set to "live" but its required
    // creds are missing — better an explicit error at boot than a 500
    // on first checkout.
    if (cached.PAYMENT_PROVIDER === "stripe") {
      requireKeys(cached, ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);
    }
    if (cached.EMAIL_PROVIDER === "resend") {
      requireKeys(cached, ["RESEND_API_KEY"]);
    }
    if (cached.SANITY_MODE === "live") {
      requireKeys(cached, ["NEXT_PUBLIC_SANITY_PROJECT_ID"]);
    }
  }
  return cached;
}

function requireKeys(e: Env, keys: (keyof Env)[]): void {
  const missing = keys.filter((k) => !e[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars for active providers: ${missing.join(", ")}`
    );
  }
}
