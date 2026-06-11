import { redirect } from "next/navigation";

// The catalogue is now the framed Gallery at /gallery — the single canonical
// view of the full collection. This index stays as a permanent redirect so
// older links and bookmarks keep working. Individual works still live at
// /paintings/[slug].
export default function PaintingsIndexPage(): never {
  redirect("/gallery");
}
