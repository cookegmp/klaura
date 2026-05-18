/**
 * Client-side instrumentation. Sentry browser SDK initialisation lives here
 * when DSN is set. No-op otherwise.
 *
 * To activate:
 *   pnpm add @sentry/nextjs
 *   uncomment below
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  // import("@sentry/nextjs").then(({ init }) => {
  //   init({
  //     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  //     tracesSampleRate: 0.1,
  //   });
  // });
}

export {};
