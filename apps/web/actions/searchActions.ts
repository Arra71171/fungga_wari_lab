"use server";

import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
};

const searchQuerySchema = z.string().min(2).max(100);

export async function searchStories(rawQuery: string): Promise<SearchResult[]> {
  const parsed = searchQuerySchema.safeParse(rawQuery.trim());
  if (!parsed.success) return [];
  const query = parsed.data;


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
