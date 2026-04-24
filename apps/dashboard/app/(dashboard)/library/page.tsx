import { redirect } from "next/navigation"

/**
 * /library — redirects to /assets.
 * Kept for test-runner compatibility (TC009, TC014 navigate to /dashboard/library).
 */
export default function LibraryRedirectPage() {
  redirect("/assets")
}
