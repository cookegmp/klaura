# CLAUDE.md — kellylauraart.com

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

**Surface mode: dark editorial** (pivot 2026-05-31, see charter §design_system / §surface_mode).
Deep charcoal page bg, warm cream type, italic Cormorant Garamond as the dominant voice.
Token names were preserved from the original light palette — what changed is the role each colour plays.

Tokens declared in `app/globals.css`:

- **Surfaces** — `bg-ink` (page bg, `#0d0d0f`), `bg-ink-soft` (elevated cards / footer, `#16171b`).
- **Text** — `text-bone` (primary cream, `#ebe4d6`), `text-bone-deep` (muted cream, `#a8a094`).
- **Hairlines** — `border-rule` (`#2a2a2e`). Avoid `bg-white`, `bg-black`, or any hardcoded hex outside `globals.css` / `opengraph-image.tsx` / `global-error.tsx`.
- **Type families** — Cormorant Garamond (display + body) via `--font-cormorant`. Inter Tight (`--font-ui`) is reserved for `.text-ui` only — never use it for paragraph copy or section labels (charter §forbidden, §pairing_rule).
- **Type scale tokens** — `--text-display-xl/lg/md`, `--text-body-lg`, `--text-ui`, `--text-caption`.

### Typography utility decision matrix

Pick the smallest utility that fits — never reach past it. `.text-ui` is for
buttons only; everything else is italic Cormorant.

| Need | Utility | Notes |
| --- | --- | --- |
| Page heading, section heading, product title, inline accent in a heading | `font-display-italic` | The dominant voice. Lowercase italic Cormorant. |
| Hero / large display heading | `font-display-italic` + `text-[clamp(...)]` | The old `font-display-caps` class is gone — case-as-volume is no longer in the rotation. |
| Section label / list-group header (e.g., "Letters from the studio") | `text-meta` (italic Cormorant ~0.92rem) | Replaces the old `text-ui text-bone-deep` pattern. |
| Caption / field label / metadata string (medium · size · year · count) | `text-meta` | Also replaces the old uppercase-mono atmosphere strings. |
| Roman numeral / short index marker (I, II, § 01, year stamps) | `text-roman` (small-caps Cormorant) | Non-italic, slightly letter-spaced. |
| Button label / form submit / disclosure trigger | `text-ui` | The only place sans is allowed. Tappable controls only. |
| Sold pieces | wrap image container with `relative sold-overlay` | |

### Colour rules (firm)

- **Ochre never appears in text.** No `text-ochre`, `text-ochre-deep`, `hover:text-ochre*`, `group-hover:text-ochre*`, or `decoration-ochre`. Italic Cormorant is the accent — colour is not.
- **Button hovers don't flash ochre.** Cream CTAs (`bg-bone text-ink`) shift to `bg-bone-deep` on hover.
- **Form focus borders use `border-bone`**, not `border-ochre`.
- Ochre tokens survive only as decoration: the small `bg-ochre/95` 18+ tile badge (dark text on it) and the tonal warmth inside the placeholder image gradients in `ProductImage.tsx`.

### Card / grid pattern

Product and category grids are dense and uniform — 2-col on mobile, 3-col tablet, up to 5-col on wide desktop. Tile anatomy:

```
[ cover image, 4:5 aspect ]
[ roman numeral · count ]   (both .text-roman / .text-meta on one baseline row)
[ italic Cormorant title ]  (font-display-italic)
```

`components/site/CategoryDoorways.tsx` is the canonical implementation. `PaintingCard` and `VintageCard` follow the same anatomy with their own metadata strings. The old editorial vertical offsets (`translateY(2.5rem)` on odd indices) were removed — the grid is uniform.

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
