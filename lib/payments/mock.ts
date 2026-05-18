import { randomBytes } from "crypto";
import type {
  CheckoutSession,
  CreateCheckoutSessionInput,
  PaymentProvider,
  RetrievedSession,
  WebhookEvent,
} from "./types";

/**
 * In-memory payment provider for local development & weeks-before-launch
 * iteration. Sessions live in a module-scoped Map; restarting the dev
 * server resets state.
 *
 * Dev complete: POST to `/api/dev/payments/complete?session=cs_mock_xxx`
 * to fire a fake `checkout.session.completed` event into our webhook.
 *
 * The signature scheme is a constant string `"mock-signature"` — the dev
 * complete endpoint sends it; production never reaches this branch.
 */

interface InternalSession {
  id: string;
  status: "open" | "complete" | "expired";
  productType: "painting" | "vintage";
  productId: string;
  productTitle: string;
  priceUSD: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string | null;
  expiresAt: number;
}

const sessions = new Map<string, InternalSession>();
const TTL_MS = 30 * 60 * 1000;
const MOCK_SIGNATURE = "mock-signature";

function newId(): string {
  return `cs_mock_${randomBytes(12).toString("hex")}`;
}

function expireIfDue(s: InternalSession): InternalSession {
  if (s.status === "open" && Date.now() > s.expiresAt) {
    s.status = "expired";
  }
  return s;
}

export const mockProvider: PaymentProvider = {
  name: "mock",

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    const id = newId();
    const session: InternalSession = {
      id,
      status: "open",
      productType: input.productType,
      productId: input.productId,
      productTitle: input.productTitle,
      priceUSD: input.priceUSD,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      customerEmail: null,
      expiresAt: Date.now() + TTL_MS,
    };
    sessions.set(id, session);
    // The "hosted" page is a local route that mimics Stripe Checkout.
    return {
      id,
      url: `/mock-checkout/${id}`,
    };
  },

  async verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
    if (signature !== MOCK_SIGNATURE) {
      throw new Error("Mock webhook signature mismatch");
    }
    return JSON.parse(rawBody) as WebhookEvent;
  },

  async retrieveSession(id: string): Promise<RetrievedSession | null> {
    const s = sessions.get(id);
    if (!s) return null;
    expireIfDue(s);
    return {
      id: s.id,
      status: s.status,
      productType: s.productType,
      productId: s.productId,
      productTitle: s.productTitle,
      priceUSD: s.priceUSD,
      customerEmail: s.customerEmail,
    };
  },
};

/* -----------------------------------------------------------------------
   Mock-only helpers exported for the dev endpoints and tests. The real
   Stripe adapter does not export these.
   ----------------------------------------------------------------------- */

export function mock_completeSession(id: string, customerEmail: string | null): WebhookEvent {
  const s = sessions.get(id);
  if (!s) throw new Error(`Unknown mock session ${id}`);
  s.status = "complete";
  s.customerEmail = customerEmail;
  return {
    type: "checkout.session.completed",
    session: {
      id: s.id,
      customerEmail,
      productType: s.productType,
      productId: s.productId,
    },
  };
}

export function mock_expireSession(id: string): WebhookEvent {
  const s = sessions.get(id);
  if (!s) throw new Error(`Unknown mock session ${id}`);
  s.status = "expired";
  return {
    type: "checkout.session.expired",
    session: {
      id: s.id,
      productType: s.productType,
      productId: s.productId,
    },
  };
}

export function mock_getSession(id: string): InternalSession | undefined {
  return sessions.get(id);
}

export function mock_resetSessions(): void {
  sessions.clear();
}

export const MOCK_WEBHOOK_SIGNATURE = MOCK_SIGNATURE;
