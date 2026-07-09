"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const seriesSchema = z.object({
  title: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
});

export async function createSeries(data: z.infer<typeof seriesSchema>) {
  const parsed = seriesSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid series data" };
  }

  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("series")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      cover_image_url: parsed.data.coverImageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("[createSeries]", error);
    return { error: error.message };
  }

  revalidatePath("/(dashboard)/series", "page");
  return { data: inserted };
}

export async function updateSeries(id: string, data: z.infer<typeof seriesSchema>) {
  const parsed = seriesSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid series data" };
  }

  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("series")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      cover_image_url: parsed.data.coverImageUrl,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateSeries]", error);
    return { error: error.message };
  }

  revalidatePath("/(dashboard)/series", "page");
  return { data: updated };
}

export async function deleteSeries(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("series")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteSeries]", error);
    return { error: error.message };
  }

  revalidatePath("/(dashboard)/series", "page");
  return { success: true };
}
