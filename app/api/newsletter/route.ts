import { NextResponse } from "next/server";
import { z } from "zod";
import { storeNewsletterSignup } from "@/lib/sanity/write";

const schema = z.object({ email: z.email() });

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = schema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Please enter a valid email." } },
      { status: 400 }
    );
  }

  await storeNewsletterSignup({
    email: parsed.email,
    source: "homepage",
  });

  return NextResponse.json({ ok: true });
}
