/**
 * Next.js server-side instrumentation hook. Wired for Sentry when a DSN
 * is provided; safe no-op otherwise.
 *
 * To activate Sentry:
 *   pnpm add @sentry/nextjs
 *   set SENTRY_DSN in env
 *   uncomment the import below
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  // const Sentry = await import("@sentry/nextjs");
  // Sentry.init({
  //   dsn,
  //   tracesSampleRate: 0.1,
  //   environment: process.env.NODE_ENV,
  // });
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string }
) {
  if (!process.env.SENTRY_DSN) return;
  // Sentry.captureRequestError(err, request, { routerKind: "App Router" });
  console.error("[instrumentation] request error", request.path, request.method, err);
}
