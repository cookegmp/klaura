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

**Surface mode: archival scrapbook** (2026-05-31 — see charter §design_system / §surface_mode).
Narrow centred dark editorial column. Warm near-black bg, warm beige type **and** borders.
High-contrast Bodoni Moda Didone is the voice. Reference image:
[`documentation/samples/Screenshot.png`](./documentation/samples/Screenshot.png) — treat it as
the source of truth. If a screen doesn't feel like a luxury perfume brand's archival
scrapbook (minimal, romantic, slightly gothic, quiet, expensive), the screen is wrong.

Tokens declared in `app/globals.css`:

- **Surfaces** — `bg-ink` (warm near-black page, `#0a0908`), `bg-ink-soft` (faint card lift, `#131110`).
- **Text & borders** — `text-bone` / `border-bone` (warm beige, `#d4c5a0`), `text-bone-deep` (aged beige, `#8a7d63`).
- **Hairlines** — `border-rule` (`#4a4030`) — warm beige hairline on dark for card frames and dividers.
- **Type families** — Bodoni Moda (display + body) via `--font-bodoni`. Inter Tight (`--font-ui`) is reserved for two utilities only: `.text-tag` (tiny archival labels) and `.text-ui` (flat beige buttons). Never use Inter Tight for paragraph copy, section markers, or nav.

### Typography utility decision matrix

Pick the smallest utility that fits. Bodoni is the default voice; sans appears only in `.text-tag` and `.text-ui`.

| Need | Utility | Notes |
| --- | --- | --- |
| Page / section heading, plate title, italic accent | `font-display-italic` | Italic Bodoni — the dominant voice. |
| Featured-plate caps title (the "MZIA"-style title inside the hero plate) | `font-display` + `uppercase tracking-[0.04em]` | One of very few caps Bodoni usages; reserved for the hero. |
| Caption / metadata string (medium · size · year · price) | `text-meta` | Small italic Bodoni, `bone-deep`. |
| Roman numeral / short index marker (I, II, IX, XII) | `text-roman` | Bodoni small-caps, slightly letter-spaced. |
| Archival tag — `vol. i`, `no. 01`, `est. 2018`, `explore`, `elsewhere`, footer legal row | `text-tag` | Tiny Inter Tight caps tracked; THE dominant small-label utility. |
| Tiny italic subtitle directly under a plate title ("eau de toilette" voice) | `text-subtle` | Small italic Bodoni. |
| Button label / form submit | `text-ui` | Inter Tight caps, only on tappable controls. |
| Sold pieces | wrap image container with `relative sold-overlay` | |

### Colour rules (firm)

- **Two colours only — beige on near-black.** No accent hues. The `ochre*` tokens are now aliases of beige and survive only as button backgrounds. Never `text-ochre*` or `decoration-ochre`.
- **Borders are beige (`border-rule`), not subtle grey.** Card frames hover from `border-rule` to `border-bone` (faint → visible).
- **Buttons are flat beige rectangles.** Solid: `bg-bone text-ink`. Outline: `border border-bone text-bone hover:bg-bone hover:text-ink`. No rounded corners, no gradients, no shadows. Solid hover dims fill to `bg-bone-deep`.
- **No colour-flashing hovers anywhere.** Hover changes border, opacity, or image scale — not hue.

### Framed plate (the only card pattern)

Every product / doorway / satellite tile is a framed plate with this exact anatomy:

```tsx
<a className="group block border border-rule p-3 hover:border-bone transition-colors">
  <div className="flex items-baseline justify-between mb-2">
    <span className="text-tag">no. 01</span>
    <span className="text-roman">I</span>
  </div>
  <div className="relative w-full aspect-square overflow-hidden bg-ink">
    <ProductImage … />
  </div>
  <hr className="my-3 border-0 border-t border-rule" />
  <div className="text-center pb-1">
    <h3 className="font-display-italic text-bone text-base md:text-lg leading-tight">{title}</h3>
    <p className="text-tag mt-1.5">{subtitle}</p>
  </div>
</a>
```

Canonical implementation: `components/site/CategoryDoorways.tsx` → `DoorwayPlate`. `PaintingCard` and `VintageCard` follow the same shape. The hero plate (`FeaturedHero` in `app/page.tsx`) is a larger variant with a `aspect-[4/5]` image and a left-aligned caps Bodoni title.

### Layout column

Sitewide narrow centred column via `<Container>` (in `components/site/Container.tsx`):

| Width | max | Use for |
| --- | --- | --- |
| `narrow` | `34rem` | Form-only sections |
| `default` | `40rem` | **Everything** — pages, Nav, Footer, doorway grid |
| `wide` | `64rem` | Reserved for any future genuinely wide grid (rarely needed) |
| `bleed` | none | Full-bleed imagery |

The narrow column is the design's signature. Do not use `width="wide"` or write `max-w-screen-2xl` anywhere — wide layouts break the scrapbook feel.

### Home page composition (canonical scrapbook order)

`app/page.tsx` is the reference layout. Sections, in order:

1. **Gallery** — centred italic Bodoni `<h2>` + `.text-tag` subtitle, then the framed doorway grid (`CategoryDoorways`).
2. **Commissions** — `.text-tag` lede + centred italic Bodoni `<h2>` + italic body copy + single solid beige button to `/commissions`.
3. **Also row** — `.text-tag` + italic copy + two flat beige buttons (catalogue, about).
4. **Footer** — centred italic voice + two narrow link columns + tiny legal row.

## Charter principles to keep front-of-mind

- **Narrow column always.** No wide layouts. The site is a single magazine column on every viewport.
- **Two colours.** Beige on near-black. No accent hues.
- **Framed plates.** Every card is bordered with internal padding, hairline, italic title, and tiny tag — never bare image + caption.
- **Restraint in motion.** Reveal entrances on scroll, image-scale on hover, frame-tint on hover. No bouncy springs, no parallax, no scroll-jacking. Honor `prefers-reduced-motion`.
- **Image quality is non-negotiable.** Every image flows through `next/image` (the `ProductImage` component) with `sizes` set per layout.
- **One of one.** Charter §inventory: every product is qty=1.

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
