-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Post-Supabase-Auth cleanup + performance optimizations
-- Run AFTER migrating to a new Supabase project.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. GIN index for full-text search (was missing — critical for FTS performance)
CREATE INDEX IF NOT EXISTS idx_stories_search_vector
  ON public.stories USING GIN (search_vector);

-- 2. Composite index for ordered chapter listing
CREATE INDEX IF NOT EXISTS idx_chapters_story_order
  ON public.chapters (story_id, "order");

-- 3. Composite index for ordered scene listing
CREATE INDEX IF NOT EXISTS idx_scenes_chapter_order
  ON public.scenes (chapter_id, "order");

-- 4. Chapter count auto-sync trigger (replaces error-prone manual RPC calls)
--    This ensures chapter_count on stories never drifts from actual row count.
CREATE OR REPLACE FUNCTION public.sync_chapter_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.stories
  SET chapter_count = (
    SELECT COUNT(*)
    FROM public.chapters
    WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)
  )
  WHERE id = COALESCE(NEW.story_id, OLD.story_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_chapter_count ON public.chapters;
CREATE TRIGGER trg_sync_chapter_count
  AFTER INSERT OR DELETE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.sync_chapter_count();

-- 5. Tighten matches_current_identity — use only auth.uid() (Supabase Auth only)
--    The old version also matched Clerk IDs which are legacy and no longer needed.
CREATE OR REPLACE FUNCTION public.matches_current_identity(identity text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT identity IS NOT NULL
    AND (
      -- Match the Supabase auth UUID as text
      identity = auth.uid()::text
      -- OR match via the public.users UUID (for FK-typed references stored as text)
      OR identity = (
        SELECT id::text FROM public.users
        WHERE auth_id = auth.uid()
        LIMIT 1
      )
    );
$$;
