"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const saveProgressSchema = z.object({
  storyId: z.string().uuid(),
  chapterId: z.string().uuid().nullable(),
  sceneId: z.string().uuid().nullable(),
});

const getProgressSchema = z.object({
  storyId: z.string().uuid(),
});

/**
 * saveReadingProgress — upserts the reader's last scene position for a story.
 * Called client-side whenever the active scene changes.
 */
export async function saveReadingProgress(input: {
  storyId: string;
  chapterId: string | null;
  sceneId: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = saveProgressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid progress data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Resolve supabase user row id from auth.uid()
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "User profile not found" };
  }

  const { error } = await supabase.from("reading_progress").upsert(
    {
      user_id: profile.id,
      story_id: parsed.data.storyId,
      chapter_id: parsed.data.chapterId,
      scene_id: parsed.data.sceneId,
    },
    { onConflict: "user_id,story_id" }
  );

  if (error) {
    console.error("[saveReadingProgress] DB error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * getReadingProgress — returns the last saved reading position for a story.
 * Returns null if the user is not signed in or has no progress saved.
 */
export async function getReadingProgress(input: {
  storyId: string;
}): Promise<{
  chapterId: string | null;
  sceneId: string | null;
} | null> {
  const parsed = getProgressSchema.safeParse(input);
  if (!parsed.success) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) return null;

  const { data, error } = await supabase
    .from("reading_progress")
    .select("chapter_id, scene_id")
    .eq("user_id", profile.id)
    .eq("story_id", parsed.data.storyId)
    .single();

  if (error || !data) return null;

  return {
    chapterId: data.chapter_id,
    sceneId: data.scene_id,
  };
}
