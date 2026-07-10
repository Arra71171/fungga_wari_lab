import { redirect } from "next/navigation"

/**
 * /series — redirects to /stories.
 * Series management has been removed in the current database schema.
 */
export default function SeriesPage() {
  redirect("/stories")
}
