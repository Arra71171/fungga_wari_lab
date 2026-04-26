"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./authHelpers";
import { revalidatePath } from "next/cache";

// ─── Character Types ──────────────────────────────────────────────────────────

export type CharacterRow = {
  id: string;
  name: string;
  role: string | null;
  description: string | null;
  story_id: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * getAllCharacters — all characters in the library for this author.
 */
export async function getAllCharacters(): Promise<CharacterRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("characters" as any)
    .select("id, name, role, description, story_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as CharacterRow[];
}

/**
 * searchCharacters — search characters by name or role.
 */
export async function searchCharacters(query: string): Promise<CharacterRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("characters" as any)
    .select("id, name, role, description, story_id, created_at, updated_at")
    .or(`name.ilike.%${query}%,role.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as CharacterRow[];
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * createCharacter — add a new character to the library.
 */
export async function createCharacter(args: {
  name: string;
  role?: string;
  description?: string;
  storyId?: string;
}): Promise<string> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("characters" as any)
    .insert({
      name: args.name,
      role: args.role ?? null,
      description: args.description ?? null,
      story_id: args.storyId ?? null,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create character: ${error.message}`);

  revalidatePath("/library");
  return (data as any).id;
}

/**
 * updateCharacter — update character metadata.
 */
export async function updateCharacter(
  id: string,
  patch: { name?: string; role?: string; description?: string }
): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("characters" as any)
    .update(patch)
    .eq("id", id);

  if (error) throw new Error(`Failed to update character: ${error.message}`);

  revalidatePath("/library");
}

/**
 * deleteCharacter — remove a character from the library.
 */
export async function deleteCharacter(id: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("characters" as any)
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete character: ${error.message}`);

  revalidatePath("/library");
}
