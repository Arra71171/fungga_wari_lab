"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./authHelpers";

export async function getRecentActivityAction(limit = 20, offset = 0) {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interactions")
    .select("id, type, story_id, created_at, stories(title, slug)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Failed to fetch interactions:", error);
    return [];
  }

  if (!data) return [];

  return data.map(a => ({
    _id: a.id,
    storyId: a.story_id,
    type: a.type,
    timestamp: new Date(a.created_at ?? 0).getTime(),
    storyTitle: Array.isArray(a.stories) ? a.stories[0]?.title : a.stories?.title ?? "Unknown Story",
    storySlug: Array.isArray(a.stories) ? a.stories[0]?.slug : a.stories?.slug ?? ""
  }));
}
