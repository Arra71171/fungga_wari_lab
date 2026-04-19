-- ============================================================================
-- Migration: Add public RLS for choices + auto-update chapter_count trigger
-- ============================================================================

-- 1. Public read policy for choices on published stories
-- Without this, the nested join in StoryReaderContext returns [] for all choices.
CREATE POLICY "Published choices are viewable by everyone."
  ON choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories  ON stories.id  = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND stories.status = 'published'
    )
  );

-- 2. Auto-update chapter_count on stories when chapters change
CREATE OR REPLACE FUNCTION update_story_chapter_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET chapter_count = (
      SELECT COUNT(*) FROM chapters WHERE story_id = NEW.story_id
    ) WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET chapter_count = (
      SELECT COUNT(*) FROM chapters WHERE story_id = OLD.story_id
    ) WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_chapter_count
  AFTER INSERT OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_story_chapter_count();

-- 3. Backfill existing stories with accurate chapter counts
UPDATE stories s
SET chapter_count = (
  SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id
);
