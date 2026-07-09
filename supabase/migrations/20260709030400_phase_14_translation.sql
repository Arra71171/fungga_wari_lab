-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Phase 14 - Native Script Translation
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE translation_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE NOT NULL,
  language_code text NOT NULL,
  tiptap_content jsonb NOT NULL,
  UNIQUE(scene_id, language_code)
);

ALTER TABLE translation_blocks ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can view translations if the scene is viewable
CREATE POLICY "translation_blocks_select" ON public.translation_blocks FOR SELECT USING (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id JOIN stories ON stories.id = chapters.story_id WHERE scenes.id = translation_blocks.scene_id AND (stories.status = 'published' OR stories.author_id = (auth.uid())::text OR is_admin()))
);

-- Insert/Update/Delete policy: Only story owners and admins can manage translations
CREATE POLICY "translation_blocks_insert" ON public.translation_blocks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id WHERE scenes.id = scene_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);

CREATE POLICY "translation_blocks_update" ON public.translation_blocks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id WHERE scenes.id = scene_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);

CREATE POLICY "translation_blocks_delete" ON public.translation_blocks FOR DELETE USING (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id WHERE scenes.id = scene_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);
