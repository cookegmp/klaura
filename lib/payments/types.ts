/**
 * Provider-agnostic payment interface. Stripe is one implementation;
 * `mock.ts` is the default. Everything the rest of the app talks to is
 * shaped to match Stripe's mental model so swapping is trivial.
 */

export type ProductType = "painting" | "vintage";

export interface CreateCheckoutSessionInput {
  productType: ProductType;
  productId: string;
  productTitle: string;
  /** USD integer dollars (charter §data_model — price stored as integer USD). */
  priceUSD: number;
  /** Sanity revision id at reservation time — round-tripped via session metadata. */
  sanityRevisionId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * The slim event shape our webhook handler cares about. Stripe events are
 * much richer; the adapter narrows to this.
 */
export type WebhookEvent =
  | {
      type: "checkout.session.completed";
      session: {
        id: string;
        customerEmail: string | null;
        productType: ProductType;
        productId: string;
      };
    }
  | {
      type: "checkout.session.expired";
      session: {
        id: string;
        productType: ProductType;
        productId: string;
      };
    }
  | { type: string; session: { id: string } };

export interface RetrievedSession {
  id: string;
  status: "open" | "complete" | "expired";
  productType: ProductType;
  productId: string;
  productTitle: string;
  priceUSD: number;
  customerEmail: string | null;
}

export interface PaymentProvider {
  readonly name: "mock" | "stripe";

  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>;

  /**
   * Verify the webhook signature and decode it into our slim event shape.
   * Throws on bad signature.
   */
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;

  /** Read-only session fetch — used by /checkout/success to render receipt. */
  retrieveSession(id: string): Promise<RetrievedSession | null>;
}
