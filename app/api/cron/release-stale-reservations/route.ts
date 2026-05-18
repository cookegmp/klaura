import { NextResponse } from "next/server";
import { releaseStaleReservations } from "@/lib/inventory";
import { env } from "@/lib/env";

/**
 * Vercel Cron entrypoint — defense-in-depth for the webhook. Releases any
 * product whose reservation has expired but whose webhook never arrived.
 *
 * Scheduled in `vercel.json`. The Vercel Hobby plan caps crons at daily,
 * so the schedule is `0 9 * * *` (09:00 UTC). On Pro plan you can restore
 * a finer cadence (e.g. every 10 minutes) to keep the safety net tight.
 * The webhook is still the authoritative path either way (charter §step 3).
 *
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 * Operators can also trigger this endpoint manually with the same header
 * (see RUNBOOK → "Release a stuck reservation").
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
