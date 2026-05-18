import type { EmailProvider } from "./types";

/**
 * Resend adapter — stub. Activated when EMAIL_PROVIDER=resend.
 *
 * Implementation:
 *   import { Resend } from "resend";
 *   const client = new Resend(env().RESEND_API_KEY);
 *   // Use the React Email templates from `emails/*.tsx`
 *   await client.emails.send({
 *     from: env().RESEND_FROM_ADDRESS,
 *     to: ...,
 *     subject: ...,
 *     react: <OrderConfirmationEmail ... />,
 *   });
 */
export const resendEmail: EmailProvider = {
  name: "resend",

  async sendOrderEmails() {
    throw new Error(
      "Resend provider not yet implemented — set EMAIL_PROVIDER=mock or finish resend.ts"
    );
  },

  async sendCommissionInquiry() {
    throw new Error("Resend provider not yet implemented");
  },
};
