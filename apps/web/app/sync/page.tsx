import { redirect } from "next/navigation";

// The /sync page is no longer needed with Supabase Auth.
// Role-based routing is now handled directly in the login page.
// This redirect exists for backward compatibility with any bookmarks.
export default function SyncPage() {
  redirect("/");
}
