"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
};

export async function searchStories(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();

  // Convert "magic stick" into "magic | stick" or use 'websearch_to_tsquery' syntax
  // Supabase's textSearch supports plainto_tsquery or phraseto_tsquery or websearch_to_tsquery.
  // We'll use websearch which handles quoted phrases and operators naturally.
  const { data, error } = await supabase
    .from("stories")
    .select("id, title, slug, description, cover_image_url, category")
    .eq("status", "published")
    .textSearch("search_vector", query.trim(), {
      type: "websearch",
      config: "english",
    })
    .limit(10);

  if (error) {
    console.error("[searchStories] Error:", error);
    return [];
  }

  return data ?? [];
}
