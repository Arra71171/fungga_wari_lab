"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const saveTranslationSchema = z.object({
  sceneId: z.string().uuid(),
  languageCode: z.string().min(2).max(5),
  tiptapContent: z.any(),
})

export async function saveTranslation(rawArgs: z.infer<typeof saveTranslationSchema>) {
  const args = saveTranslationSchema.parse(rawArgs)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { error } = await supabase
    .from("translation_blocks")
    .upsert(
      {
        scene_id: args.sceneId,
        language_code: args.languageCode,
        tiptap_content: args.tiptapContent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "scene_id,language_code" }
    )

  if (error) throw new Error(`Failed to save translation: ${error.message}`)
  return { success: true }
}

export async function getTranslationsForScene(rawSceneId: string) {
  const sceneId = z.string().uuid().parse(rawSceneId)
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("translation_blocks")
    .select("language_code, tiptap_content")
    .eq("scene_id", sceneId)

  if (error) throw new Error(`Failed to fetch translations: ${error.message}`)
  return data || []
}
