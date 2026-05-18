import "server-only";
import { env } from "@/lib/env";
import { mockEmail } from "./mock";
import { resendEmail } from "./resend";
import type {
  CommissionEmailInput,
  EmailProvider,
  OrderEmailInput,
} from "./types";

function provider(): EmailProvider {
  return env().EMAIL_PROVIDER === "resend" ? resendEmail : mockEmail;
}

export async function sendOrderEmails(input: OrderEmailInput): Promise<void> {
  return provider().sendOrderEmails(input);
}

export async function sendCommissionInquiry(
  input: CommissionEmailInput
): Promise<void> {
  return provider().sendCommissionInquiry(input);
}

export type { OrderEmailInput, CommissionEmailInput, EmailProvider } from "./types";
