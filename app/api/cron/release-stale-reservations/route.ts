import { NextResponse } from "next/server";
import { releaseStaleReservations } from "@/lib/inventory";
import { env } from "@/lib/env";

/**
 * Vercel Cron entrypoint — defense-in-depth for the webhook. Runs every
 * 10 minutes (see vercel.json). Releases any product whose reservation has
 * expired but whose webhook never arrived.
 *
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${env().CRON_SECRET}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
      { status: 401 }
    );
  }

  const result = await releaseStaleReservations();
  return NextResponse.json({ released: result.released });
}
