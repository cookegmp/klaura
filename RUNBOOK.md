# RUNBOOK — kellylauraart.com

Operational tasks. Read [`README.md`](./README.md) first for stack overview.

---

## Add a new painting

1. Sign in at `/studio-admin`.
2. **Paintings → Create new**.
3. Fill in:
   - Title, slug (auto from title), year, medium (e.g. *Oil on linen*).
   - Dimensions: width and height in inches. Depth optional; framed boolean.
   - Weight (oz) — used for shipping cost calculation later.
   - Price (USD integer).
   - **Primary image** — required, alt text required.
   - Optional: detail images, story (Portable Text), tags, series.
   - Featured + featured order — controls home-page strip placement.
4. Status defaults to **Available**. Leave it.
5. **Publish**. The Sanity webhook fires `/api/revalidate`; the new piece appears at `/paintings/<slug>` within a few seconds.

> **Tip:** for the *Featured works* strip on the home page, set `featured = true` and assign `featuredOrder` (1–4, ascending).

---

## Add a vintage item

Same flow, **Vintage items → Create new**. Required: category, condition, primary image with alt, weight (oz), price. Add full flat measurements — vintage sizing demands it.

---

## A piece sold somewhere else — mark it sold manually

1. Open the document in Studio.
2. Inventory group → **Status → Sold**.
3. Set **soldAt** to now (Studio has a "Now" shortcut).
4. Publish. The card on `/paintings` and `/vintage` flips to the sold overlay; the detail page Buy button becomes a disabled *Sold* state.

---

## Handle a failed payment

A customer reports they paid but the site still shows the piece as available.

**Diagnose:**

1. Check Stripe Dashboard → Payments → find the customer's session.
2. Check Stripe → Developers → Webhooks → `${SITE_URL}/api/webhooks/stripe` → recent attempts. Look for failures.
3. Check Vercel logs for `/api/webhooks/stripe` around the relevant timestamp.

**Resolve:**

- **If webhook failed:** click **Resend** in Stripe Dashboard. Our handler is idempotent — safe even if it partially succeeded.
- **If webhook never arrived:** the cron (`/api/cron/release-stale-reservations`) will eventually free the reservation. To fix immediately, open the document in Studio and:
  1. Set **Status → Sold**, set **soldAt**, leave **stripeSessionId** intact (for audit).
  2. Publish.
  3. Manually email the customer their confirmation. The full data is in Stripe Dashboard.

---

## Release a stuck reservation

A piece stays in *reserved* status with no sale completing.

1. **The webhook handles this normally.** Stripe sends `checkout.session.expired` ~30 minutes after a session opens; our `/api/webhooks/stripe` releases the reservation immediately.
2. **The daily cron is the safety net.** Runs at 09:00 UTC (~4–5 AM ET) and releases anything still reserved past its TTL. On the Vercel Hobby plan, daily is the highest frequency allowed — upgrade to Pro to restore the original `*/10 * * * *` cadence (see `vercel.json`).
3. **To force-release immediately**, two options:
   - Trigger the cron yourself: `curl -H "Authorization: Bearer $CRON_SECRET" https://kellylaura.com/api/cron/release-stale-reservations`
   - Or open the document in Studio, set **Status → Available**, clear **reservedUntil** and **stripeSessionId**, publish.

> **Charter §risks:** the cron is defense-in-depth. The webhook is the authoritative path. If a reservation needs the cron to clean up more than once or twice in a row, check Stripe webhook delivery health in the dashboard.

---

## Refund a sale

The site itself doesn't initiate refunds.

1. Open the Stripe Dashboard → find the payment → **Refund**.
2. In Studio, decide whether to re-list:
   - If the piece is going back on the wall (rare): set status back to **Available**, clear `soldAt` and `stripeSessionId`.
   - If it's keepsake or damaged: set status to **NFS** (not-for-sale), keep `soldAt` for history.
3. Email the customer confirming the refund.

---

## Review commission inquiries

1. `/studio-admin` → **Commission inquiries**. Newest first.
2. Each inquiry shows status: `new`, `responded`, `in-progress`, `completed`, `declined`.
3. After replying, update the status and add internal notes.

---

## Update legal pages or marquee phrases

All of these come from the **Site settings** singleton in Studio.

- Shipping / Returns / Privacy / Terms — Portable Text blocks
- Marquee phrases — array of strings, shown on the home page
- Flat shipping rates (US, intl) — used in the future calculated-shipping flow

Edits go live immediately on publish (via the revalidate webhook).

---

## Add a past commission to the public gallery

1. **Commission examples → Create new**.
2. Title, image (hotspot/alt), short story, completion year.
3. Publish. Appears on `/commissions`.

---

## Newsletter signups

`/studio-admin` → **Newsletter signups**. Currently stored in Sanity only. When you choose an ESP (Mailchimp, Buttondown, etc.), wire `lib/email/index.ts` to also push the address — or export the list and import into the ESP manually.

---

## Bring up a preview branch

1. Push a branch to `github.com/cookegmp/klaura`.
2. Vercel creates a preview deploy automatically.
3. The Sanity webhook is configured for production only — preview deploys read the same dataset but use Next.js's local cache, so changes won't auto-revalidate. Force-refresh as needed.

---

## Roll back a bad deploy

In Vercel:
1. **Deployments** → find the previous-known-good deploy.
2. **Promote to production**.

This does not roll back Sanity content. If a content change is the problem, revert it in Studio.

---

## Emergency: take the site offline

Vercel → Project → **Settings → General → Pause project**. The site returns 503 from Vercel's edge; nothing in Sanity, Stripe, or Resend changes.
