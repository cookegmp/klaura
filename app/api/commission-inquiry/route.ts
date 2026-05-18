import { NextResponse } from "next/server";
import { z } from "zod";
import { storeCommissionInquiry } from "@/lib/sanity/write";
import { sendCommissionInquiry } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  projectType: z.string().max(120).optional(),
  budgetRange: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
  message: z.string().min(1).max(4000),
  /** Honeypot — bots fill this, humans don't see it. */
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  // 1. Honeypot + rate limit.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!rateLimit(ip, { windowMs: 60_000, max: 3 })) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Slow down a moment." } },
      { status: 429 }
    );
  }

  let parsed;
  try {
    parsed = schema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Please check the form fields." } },
      { status: 400 }
    );
  }

  // Honeypot tripped — bot. Return 200 silently so the bot doesn't retry.
  if (parsed.website && parsed.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // 2. Persist.
  const doc = await storeCommissionInquiry({
    name: parsed.name,
    email: parsed.email,
    projectType: parsed.projectType,
    budgetRange: parsed.budgetRange,
    timeline: parsed.timeline,
    message: parsed.message,
  });

  // 3. Email Kelly.
  await sendCommissionInquiry({
    inquiryId: doc.id,
    name: parsed.name,
    email: parsed.email,
    projectType: parsed.projectType,
    budgetRange: parsed.budgetRange,
    timeline: parsed.timeline,
    message: parsed.message,
  });

  return NextResponse.json({ ok: true, id: doc.id });
}
