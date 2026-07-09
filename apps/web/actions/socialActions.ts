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

  // Check if like exists
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userData.id)
    .eq("story_id", storyId)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);
    
    if (error) return { error: error.message };
    revalidatePath(`/stories/[slug]`, "page");
    return { liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userData.id, story_id: storyId });
    
    if (error) return { error: error.message };
    revalidatePath(`/stories/[slug]`, "page");
    return { liked: true };
  }
}

export async function addComment(data: z.infer<typeof commentSchema>) {
  const parsed = commentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid comment data" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!userData) {
    return { error: "User not found" };
  }

  const { error } = await supabase
    .from("comments")
    .insert({
      user_id: userData.id,
      story_id: parsed.data.storyId,
      content: parsed.data.content,
    });

  if (error) {
    console.error("[addComment]", error);
    return { error: error.message };
  }

  revalidatePath(`/stories/[slug]`, "page");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("[deleteComment]", error);
    return { error: error.message };
  }

  revalidatePath(`/stories/[slug]`, "page");
  return { success: true };
}
