# CLAUDE.md — kellylaaura.com

Project-specific guidance for Claude Code. Treat [`documentation/charter.xml`](./documentation/charter.xml) as authoritative; this file is a quick-reference and notes deviations.

## Stack snapshot

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC default) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 via `@theme` in `app/globals.css` |
| CMS | Sanity v4 mounted at `/studio-admin` |
| Payments | Stripe Checkout (hosted) — **currently mocked** |
| Email | Resend + React Email — **currently mocked** |
| Hosting | Vercel |

## Deviations from charter

- **Next.js 16** instead of 15.x (decided in build session — explicit user approval).
- **Stripe is mocked** (`PAYMENT_PROVIDER=mock`) until Kelly is ready for a live storefront. Real provider stub lives in `lib/payments/stripe.ts`.
- **Email is mocked** (`EMAIL_PROVIDER=mock`) — writes JSON artifacts to `/tmp/klaura-emails/`. Real provider stub in `lib/email/resend.ts`.
- **Sanity is mocked** (`SANITY_MODE=mock`) — in-memory seeded store at `lib/sanity/mock-store.ts`. Real client in `lib/sanity/client.ts` activates on `SANITY_MODE=live`.

## Architectural rules

These are load-bearing — violating any of them risks data corruption.

1. **Inventory state lives only in `lib/inventory.ts`.** Never patch a `painting` or `vintageItem` document's `status` / `reservedUntil` / `stripeSessionId` from anywhere else. The race condition test exists because of this.
2. **Webhook is the single source of truth for sale completion.** `/checkout/success` only *reads* — it never mutates inventory. The webhook handler is idempotent; the cron is defense-in-depth.
3. **Server Components by default.** Add `"use client"` only when state, effects, or browser APIs are required. Check the existing components for the threshold (`BuyButton` is client, `PaintingCard` is server).
4. **Env access via `lib/env.ts`.** Zero direct `process.env.X` lookups outside that file (the Sanity Studio config is the documented exception because it needs `NEXT_PUBLIC_*` at build time).
5. **Provider switches at `lib/{payments,email}/index.ts` and `lib/sanity/{read,write}.ts`.** Adding a new provider means dropping in another adapter and one branch.
6. **No client-side state libraries.** Charter §forbidden is firm: URL search params for filters, form actions or fetch for mutations, cookies (httpOnly via server actions) for cart-like state.
7. **Type safety is end-to-end.** `types/sanity.ts` is hand-maintained; if you change a schema, update the type. The mock-store treats those types as the contract.

## Design system shortcuts

Tokens declared in `app/globals.css`:

- Palette: `bone`, `bone-deep`, `ink`, `ink-soft`, `ochre`, `ochre-deep`, `rule`, `sold-overlay`
- Type: `font-display` (Fraunces) and `font-body` (Inter Tight) via `next/font`
- Type scale tokens: `--text-display-xl/lg/md`, `--text-body-lg`, `--text-ui`, `--text-caption`
- Use `text-ui` utility for the uppercase-tracked label style (nav, button text)
- Use `font-display-italic` for the deliberate italic accent (charter §pairing_rule — italic is an accent, not a default)
- Sold pieces: wrap image container with `relative sold-overlay`

## Charter principles to keep front-of-mind

- **Asymmetry over symmetry.** Editorial offsets between grid items (see `PaintingCard` `transform: translateY(2.5rem)` on odd indices).
- **Restraint in motion.** One well-orchestrated entrance per section. No bouncy springs, no parallax, no scroll-jacking. Honor `prefers-reduced-motion`.
- **Image quality is non-negotiable.** Every image flows through `next/image` (the `ProductImage` component) with `sizes` set per layout. LCP image preloaded on detail pages.
- **One of one.** Charter §inventory: every product is qty=1. Never introduce variants or stock counts.

## Useful entry points

| Want to… | Look at |
| --- | --- |
| Understand the data shape | `types/sanity.ts` + `sanity/schemas/*` |
| Read content | `lib/sanity/read.ts` |
| Write content | `lib/sanity/write.ts` |
| Trace a Buy click | `components/site/BuyButton.tsx` → `app/api/checkout/route.ts` → `lib/inventory.ts` → `lib/payments/mock.ts` |
| Add a new page | App Router file under `app/`. RSC by default; data via `lib/sanity/read.ts`. |
| Add a new schema | Schema file under `sanity/schemas/`; export from `sanity/schemas/index.ts`; add to `desk-structure.ts` if user-facing in Studio; add to `types/sanity.ts`. |
| Add a new payment/email provider | Implement the `PaymentProvider`/`EmailProvider` interface; register in the `index.ts` switch. |

## Pre-commit checks

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm test        # vitest run (inventory + webhook tests)
pnpm build       # next build (Turbopack)
```

All four should be clean before merging anything that touches commerce or webhook code.
