import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { EmailProvider, OrderEmailInput, CommissionEmailInput } from "./types";

/**
 * Mock email provider — writes a JSON artifact per "sent" message into
 * /tmp/klaura-emails so you can inspect what would be sent without
 * touching a real SMTP service. Also logs a one-line summary.
 */

const OUTBOX = join(tmpdir(), "klaura-emails");

async function writeArtifact(filename: string, payload: unknown): Promise<string> {
  await mkdir(OUTBOX, { recursive: true });
  const path = join(OUTBOX, filename);
  await writeFile(path, JSON.stringify(payload, null, 2));
  return path;
}

export const mockEmail: EmailProvider = {
  name: "mock",

  async sendOrderEmails(input: OrderEmailInput): Promise<void> {
    const timestamp = Date.now();
    const customerPath = await writeArtifact(
      `${timestamp}-order-customer-${input.sessionId}.json`,
      {
        to: input.customerEmail ?? "(no customer email on session)",
        subject: `Your piece is on its way — ${input.productTitle}`,
        productTitle: input.productTitle,
        priceUSD: input.productPrice,
        sessionId: input.sessionId,
      }
    );
    const kellyPath = await writeArtifact(
      `${timestamp}-order-kelly-${input.sessionId}.json`,
      {
        to: "kelly@kellylauraart.com",
        subject: `Sold: ${input.productTitle}`,
        productTitle: input.productTitle,
        priceUSD: input.productPrice,
        customerEmail: input.customerEmail,
        sessionId: input.sessionId,
      }
    );
    console.log(
      `[email:mock] order emails written → ${customerPath}, ${kellyPath}`
    );
  },

  async sendCommissionInquiry(input: CommissionEmailInput): Promise<void> {
    const path = await writeArtifact(
      `${Date.now()}-commission-${input.inquiryId}.json`,
      {
        to: "kelly@kellylauraart.com",
        subject: `Commission inquiry — ${input.name}`,
        ...input,
      }
    );
    console.log(`[email:mock] commission inquiry written → ${path}`);
  },
};
