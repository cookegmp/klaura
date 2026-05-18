# kellylaaura.com

Single-brand e-commerce + portfolio for **Kelly Laaura** — landscape painter and vintage clothing curator. Built per [`documentation/charter.xml`](./documentation/charter.xml).

## Status

Pre-launch, in mock mode. The site runs end-to-end against in-memory mock providers (payments, email, Sanity) so you can iterate on look-and-feel and content schemas weeks before any external accounts are provisioned. Switching to live providers is one env var per provider.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. The Sanity Studio lives at `/studio-admin` (it loads, but won't talk to a real Sanity project until you set `SANITY_MODE=live` and the related env vars).

### Mock checkout walk-through

1. Go to `/paintings` — three seeded pieces should render.
2. Open any painting, click **Buy**.
3. You'll land on `/mock-checkout/cs_mock_xxxx`. Enter a fake email, click **Pay**.
4. The inventory flips to *sold* in the mock-Sanity store, a JSON artifact for both order emails lands in `/tmp/klaura-emails/`, and you're redirected to `/checkout/success` with a session summary.
5. Revisit `/paintings` — the piece now displays the sold overlay.

### Tests

```bash
pnpm test            # vitest one-shot
pnpm test:watch      # watch mode
```

Three load-bearing tests live in `tests/`:
- `inventory-race.test.ts` — two concurrent reservations, exactly one wins
- `webhook-idempotency.test.ts` — duplicate `checkout.session.completed` is a no-op
- `inventory-expiry.test.ts` — stale reservations released by the cron handler

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, RSC default) | Charter pinned 15.x; we upgraded with permission. |
| Language | TypeScript strict, `noUncheckedIndexedAccess` | |
| Styling | Tailwind CSS v4 via `@theme` | Tokens in `app/globals.css` |
| Fonts | Fraunces (variable, opsz + SOFT axes) + Inter Tight | Self-hosted via `next/font/google` |
| CMS | Sanity v4, mounted at `/studio-admin` | Mock-store backed dev mode |
| Payments | Stripe Checkout (hosted) | **Currently mocked**; see `lib/payments/` |
| Email | Resend + React Email | **Currently mocked**; artifacts at `/tmp/klaura-emails/` |
| Forms | `react-hook-form`-style hand-rolled + Zod | Newsletter and commission inquiry |
| Hosting | Vercel | Cron declared in `vercel.json` |

## Provider mode

Three env-var switches control mock vs live:

```env
PAYMENT_PROVIDER=mock      # mock | stripe
EMAIL_PROVIDER=mock        # mock | resend
SANITY_MODE=mock           # mock | live
```

When set to `live`, the corresponding provider requires its credentials (see `.env.example`). Boot fails fast (`lib/env.ts`) if a live provider is missing required keys — better than a 500 mid-checkout.

## Environment

Full list in `.env.example`. Required values when going live:

| Variable | Required when | Purpose |
| --- | --- | --- |
| `SITE_URL` | always (defaults to localhost) | Absolute URLs in metadata, sitemap, OG, emails |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `SANITY_MODE=live` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `SANITY_MODE=live` | Defaults to `production` |
| `SANITY_API_READ_TOKEN` | `SANITY_MODE=live` (optional) | Bypass CDN, read drafts |
| `SANITY_API_WRITE_TOKEN` | `SANITY_MODE=live` | Inventory patches, inquiry writes |
| `SANITY_REVALIDATE_SECRET` | `SANITY_MODE=live` | Webhook → `/api/revalidate` shared secret |
| `STRIPE_SECRET_KEY` | `PAYMENT_PROVIDER=stripe` | |
| `STRIPE_PUBLISHABLE_KEY` | `PAYMENT_PROVIDER=stripe` | |
| `STRIPE_WEBHOOK_SECRET` | `PAYMENT_PROVIDER=stripe` | Signature verification |
| `RESEND_API_KEY` | `EMAIL_PROVIDER=resend` | |
| `RESEND_FROM_ADDRESS` | `EMAIL_PROVIDER=resend` | e.g. `Kelly Laaura <hello@kellylaaura.com>` |
| `KELLY_NOTIFICATION_EMAIL` | `EMAIL_PROVIDER=resend` | Where order/commission alerts go |
| `CRON_SECRET` | always | Bearer token for Vercel Cron auth |
| `SENTRY_DSN` | optional | If set, server-side errors are reported |

## Project layout

```
app/                       # Next.js App Router pages, API routes
  api/                       # Route handlers
    checkout/                # POST → reserve + create checkout session
    webhooks/stripe/         # Inventory state authority
    cron/                    # Defense-in-depth stale reservation cleanup
    commission-inquiry/      # Commission form submission
    newsletter/              # Email capture
    revalidate/              # Sanity webhook → tag-based revalidation
    dev/                     # Mock-only payment endpoints
  studio-admin/              # Sanity Studio mount
  mock-checkout/             # Local stand-in for Stripe Checkout (dev)
components/site/           # Storefront UI components
emails/                    # React Email templates
lib/
  env.ts                     # Zod-validated env access (single source of truth)
  inventory.ts               # Reservation/sale/release state machine
  payments/                  # Payment provider interface + mock + stripe stub
  email/                     # Email provider interface + mock + resend stub
  sanity/                    # Client, mock-store, queries, image, read, write
  rate-limit.ts              # Process-local sliding window
sanity/
  schemas/                   # All charter schemas
  desk-structure.ts          # Studio desk layout
tests/                     # Vitest specs for inventory & webhooks
types/sanity.ts            # Hand-written types matching schemas
documentation/charter.xml  # Authoritative project spec
```

## Going live — provider switchovers

### 1. Sanity

1. Create a Sanity project at https://sanity.io. Note the project ID.
2. In the Sanity dashboard, add CORS origin entries for:
   - `http://localhost:3000`
   - `https://kellylaaura.com`
   - `https://*.vercel.app` (for previews)
3. Generate tokens: a read token (optional) and a write token (Editor role).
4. Set env vars (`.env.local` for dev, Vercel Project Settings for prod):
   ```
   SANITY_MODE=live
   NEXT_PUBLIC_SANITY_PROJECT_ID=<project_id>
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=<read_token>
   SANITY_API_WRITE_TOKEN=<write_token>
   SANITY_REVALIDATE_SECRET=<random_string>
   ```
5. In the Sanity Studio, add a webhook (GROQ filter `*[]`) pointing at `${SITE_URL}/api/revalidate` with the secret header `x-sanity-secret`.

### 2. Stripe

1. Create a Stripe account, enable Stripe Tax (registered in Kelly's home state — Ohio at v1).
2. Wire `lib/payments/stripe.ts` — the file has the implementation outline in comments.
3. Set:
   ```
   PAYMENT_PROVIDER=stripe
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Add the production webhook in Stripe (endpoint: `${SITE_URL}/api/webhooks/stripe`, events: `checkout.session.completed`, `checkout.session.expired`).
5. Charter §step 3: Stripe retries on non-2xx — our handler is idempotent. Verify with `webhook-idempotency.test.ts`.

### 3. Resend

1. Create a Resend account, verify your sending domain.
2. Wire `lib/email/resend.ts` (outline in comments; the React Email templates are in `emails/`).
3. Set:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_...
   RESEND_FROM_ADDRESS="Kelly Laaura <hello@kellylaaura.com>"
   KELLY_NOTIFICATION_EMAIL=kelly@kellylaaura.com
   ```

### 4. Vercel

1. Connect this GitHub repo to a Vercel project.
2. Set all env vars in Vercel Project Settings (Production + Preview).
3. Confirm the cron at `/api/cron/release-stale-reservations` is picked up from `vercel.json` (it auto-attaches the `Authorization: Bearer ${CRON_SECRET}` header).
4. Connect `kellylaaura.com` in Domains.

## Operations

Day-to-day operational tasks live in [`RUNBOOK.md`](./RUNBOOK.md).
