"use client";

/**
 * Studio mount — renders the Sanity Studio at /studio-admin/*. The double
 * catch-all is required so internal Studio routes (e.g. /studio-admin/desk/...)
 * are handled by Studio's own router, not Next.js.
 *
 * Auth is delegated to Sanity (charter §route §studio-admin).
 */
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
