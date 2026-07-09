"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const commentSchema = z.object({
  storyId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export async function toggleLike(storyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's DB id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!userData) {
    return { error: "User not found" };
  }

  // Check if bookmark exists
  const { data: existingBookmark } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userData.id)
    .eq("story_id", storyId)
    .single();

  if (existingBookmark) {
    // Unbookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existingBookmark.id);
    
    if (error) return { error: error.message };
    revalidatePath(`/stories/[slug]`, "page");
    return { liked: false };
  } else {
    // Bookmark
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: userData.id, story_id: storyId });
    
    if (error) return { error: error.message };
    revalidatePath(`/stories/[slug]`, "page");
    return { liked: true };
  }
}

export async function addComment(data: z.infer<typeof commentSchema>) {
  return { error: "Comments are disabled." };
}

export async function deleteComment(commentId: string) {
  return { error: "Comments are disabled." };
}
