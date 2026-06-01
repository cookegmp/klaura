import "server-only";
import { env } from "@/lib/env";
import { getWriteClient } from "./client";
import * as mock from "./mock-store";

function live(): boolean {
  return env().SANITY_MODE === "live";
}

export async function storeCommissionInquiry(input: {
  name: string;
  email: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
}): Promise<{ id: string }> {
  const payload = {
    _type: "commissionInquiry" as const,
    submittedAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    projectType: input.projectType,
    budgetRange: input.budgetRange,
    timeline: input.timeline,
    message: input.message,
    status: "new" as const,
  };

  if (!live()) {
    const doc = mock.createDocument(payload);
    return { id: doc._id };
  }
  const result = await getWriteClient().create(payload);
  return { id: result._id };
}
