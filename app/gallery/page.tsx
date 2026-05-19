import { redirect } from "next/navigation";

// The five-rooms doorway experience now lives at the site root. /gallery
// stays as a permanent redirect so any in-flight bookmarks or external
// links keep working.
export default function GalleryIndexPage(): never {
  redirect("/");
}
