/**
 * Studio gets a minimal layout — no site nav/footer chrome around it.
 * Sanity Studio paints the full viewport itself.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
