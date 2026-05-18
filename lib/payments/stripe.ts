import type { PaymentProvider } from "./types";

/**
 * Stripe adapter — stub. Activated when PAYMENT_PROVIDER=stripe.
 *
 * Implementation notes for when this is wired up:
 *   - import Stripe from "stripe"
 *   - `new Stripe(env().STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.acacia" })`
 *   - createCheckoutSession: `stripe.checkout.sessions.create({...})` with:
 *       mode: "payment"
 *       line_items: single ad-hoc price_data entry (we don't pre-create products)
 *       shipping_address_collection: enabled, US + international
 *       shipping_options: pulled from Sanity siteSettings
 *       automatic_tax: { enabled: true }
 *       metadata: { productType, productId, sanityRevisionId }
 *       expires_at: now + 30 minutes
 *   - verifyWebhook: stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
 *   - retrieveSession: stripe.checkout.sessions.retrieve(id, { expand: ["line_items"] })
 *
 * Throwing here ensures we don't silently fall through to a broken provider.
 */
export const stripeProvider: PaymentProvider = {
  name: "stripe",

  async createCheckoutSession() {
    throw new Error(
      "Stripe provider not yet implemented — set PAYMENT_PROVIDER=mock or finish stripe.ts"
    );
  },

  async verifyWebhook() {
    throw new Error("Stripe provider not yet implemented");
  },

  async retrieveSession() {
    throw new Error("Stripe provider not yet implemented");
  },
};
