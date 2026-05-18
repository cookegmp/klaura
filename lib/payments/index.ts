import { env } from "@/lib/env";
import { mockProvider } from "./mock";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  switch (env().PAYMENT_PROVIDER) {
    case "mock":
      return mockProvider;
    case "stripe":
      return stripeProvider;
  }
}

export type {
  CheckoutSession,
  CreateCheckoutSessionInput,
  PaymentProvider,
  ProductType,
  RetrievedSession,
  WebhookEvent,
} from "./types";
