-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Consolidate RLS policies and fix helper functions
-- 
-- Description: 
-- 1. Drops legacy policies that referenced dropped clerk_id or caused duplication.
-- 2. Updates security definer helpers to securely resolve auth.uid() references.
-- 3. Implements unified, correct, and optimized policies for all tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Recreate RLS Helper Functions ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_story_owner(p_story_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM stories
    WHERE id = p_story_id
      AND author_id = (auth.uid())::text
  );
$$;



-- ─── 2. Drop Helper functions that are obsolete ────────────────────────────────

DROP FUNCTION IF EXISTS public.get_my_clerk_id();

-- ─── 3. Clean up Duplicate Policies ───────────────────────────────────────────

-- assets
DROP POLICY IF EXISTS "assets_delete_own" ON public.assets;
DROP POLICY IF EXISTS "assets_insert_own" ON public.assets;
DROP POLICY IF EXISTS "assets_select_auth" ON public.assets;
DROP POLICY IF EXISTS "assets_update_own" ON public.assets;
DROP POLICY IF EXISTS "assets_select" ON public.assets;
DROP POLICY IF EXISTS "assets_insert_author" ON public.assets;
DROP POLICY IF EXISTS "assets_update_author" ON public.assets;
DROP POLICY IF EXISTS "assets_delete_author" ON public.assets;

-- blocks
DROP POLICY IF EXISTS "blocks_delete_author" ON public.blocks;
DROP POLICY IF EXISTS "blocks_delete_own" ON public.blocks;
DROP POLICY IF EXISTS "blocks_insert_author" ON public.blocks;
DROP POLICY IF EXISTS "blocks_insert_own" ON public.blocks;
DROP POLICY IF EXISTS "blocks_select" ON public.blocks;
DROP POLICY IF EXISTS "blocks_select_own" ON public.blocks;
DROP POLICY IF EXISTS "blocks_select_published" ON public.blocks;
DROP POLICY IF EXISTS "blocks_update_author" ON public.blocks;
DROP POLICY IF EXISTS "blocks_update_own" ON public.blocks;

-- bookmarks
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_delete" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_delete_own" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_insert" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_insert_own" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_select" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks_select_own" ON public.bookmarks;

-- chapters
DROP POLICY IF EXISTS "Authors can manage chapters" ON public.chapters;
DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON public.chapters;
DROP POLICY IF EXISTS "chapters_delete_author" ON public.chapters;
DROP POLICY IF EXISTS "chapters_delete_own" ON public.chapters;
DROP POLICY IF EXISTS "chapters_insert_author" ON public.chapters;
DROP POLICY IF EXISTS "chapters_insert_own" ON public.chapters;
DROP POLICY IF EXISTS "chapters_select" ON public.chapters;
DROP POLICY IF EXISTS "chapters_select_own" ON public.chapters;
DROP POLICY IF EXISTS "chapters_select_published" ON public.chapters;
DROP POLICY IF EXISTS "chapters_update_author" ON public.chapters;
DROP POLICY IF EXISTS "chapters_update_own" ON public.chapters;

-- choices
DROP POLICY IF EXISTS "Published choices are viewable by everyone." ON public.choices;
DROP POLICY IF EXISTS "choices_delete_author" ON public.choices;
DROP POLICY IF EXISTS "choices_delete_own" ON public.choices;
DROP POLICY IF EXISTS "choices_insert_author" ON public.choices;
DROP POLICY IF EXISTS "choices_insert_own" ON public.choices;
DROP POLICY IF EXISTS "choices_select" ON public.choices;
DROP POLICY IF EXISTS "choices_select_own" ON public.choices;
DROP POLICY IF EXISTS "choices_select_published" ON public.choices;
DROP POLICY IF EXISTS "choices_update_author" ON public.choices;
DROP POLICY IF EXISTS "choices_update_own" ON public.choices;

-- global_content
DROP POLICY IF EXISTS "Admins can manage global content" ON public.global_content;
DROP POLICY IF EXISTS "Global content is viewable by everyone" ON public.global_content;
DROP POLICY IF EXISTS "global_content_admin" ON public.global_content;
DROP POLICY IF EXISTS "global_content_delete_admin" ON public.global_content;
DROP POLICY IF EXISTS "global_content_insert_admin" ON public.global_content;
DROP POLICY IF EXISTS "global_content_select" ON public.global_content;
DROP POLICY IF EXISTS "global_content_select_public" ON public.global_content;
DROP POLICY IF EXISTS "global_content_update_admin" ON public.global_content;

-- interactions
DROP POLICY IF EXISTS "Users can manage their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "interactions_insert" ON public.interactions;
DROP POLICY IF EXISTS "interactions_insert_anon" ON public.interactions;
DROP POLICY IF EXISTS "interactions_select" ON public.interactions;
DROP POLICY IF EXISTS "interactions_select_admin" ON public.interactions;
DROP POLICY IF EXISTS "interactions_select_own" ON public.interactions;

-- messages
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_auth" ON public.messages;
DROP POLICY IF EXISTS "messages_select_auth" ON public.messages;
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_delete" ON public.messages;

-- reading_progress
DROP POLICY IF EXISTS "Users can delete own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can insert own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can update own reading progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can view own reading progress" ON public.reading_progress;

-- scenes
DROP POLICY IF EXISTS "Authors can manage scenes" ON public.scenes;
DROP POLICY IF EXISTS "Scenes are viewable by everyone" ON public.scenes;
DROP POLICY IF EXISTS "scenes_delete_author" ON public.scenes;
DROP POLICY IF EXISTS "scenes_delete_own" ON public.scenes;
DROP POLICY IF EXISTS "scenes_insert_author" ON public.scenes;
DROP POLICY IF EXISTS "scenes_insert_own" ON public.scenes;
DROP POLICY IF EXISTS "scenes_select" ON public.scenes;
DROP POLICY IF EXISTS "scenes_select_own" ON public.scenes;
DROP POLICY IF EXISTS "scenes_select_published" ON public.scenes;
DROP POLICY IF EXISTS "scenes_update_author" ON public.scenes;
DROP POLICY IF EXISTS "scenes_update_own" ON public.scenes;

-- stories
DROP POLICY IF EXISTS "Authors can create stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can delete their own stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_admin" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_author" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_own" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_author" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
DROP POLICY IF EXISTS "stories_select_admin" ON public.stories;
DROP POLICY IF EXISTS "stories_select_own" ON public.stories;
DROP POLICY IF EXISTS "stories_select_public" ON public.stories;
DROP POLICY IF EXISTS "stories_select_published" ON public.stories;
DROP POLICY IF EXISTS "stories_update_admin" ON public.stories;
DROP POLICY IF EXISTS "stories_update_author" ON public.stories;
DROP POLICY IF EXISTS "stories_update_own" ON public.stories;

-- tasks
DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_auth" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select_auth" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_author" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_author" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_author" ON public.tasks;

-- users
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- ─── 4. Recreate Unified RLS Policies ──────────────────────────────────────────

-- USERS
CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth_id = auth.uid() OR is_admin());
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth_id = auth.uid() OR is_admin());
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth_id = auth.uid() OR is_admin());
CREATE POLICY "users_delete" ON public.users FOR DELETE USING (is_admin());

-- STORIES
CREATE POLICY "stories_select" ON public.stories FOR SELECT USING (status = 'published' OR author_id = (select auth.uid())::text OR is_admin());
CREATE POLICY "stories_insert" ON public.stories FOR INSERT WITH CHECK (author_id = (select auth.uid())::text OR is_admin());
CREATE POLICY "stories_update" ON public.stories FOR UPDATE USING (author_id = (select auth.uid())::text OR is_admin());
CREATE POLICY "stories_delete" ON public.stories FOR DELETE USING (author_id = (select auth.uid())::text OR is_admin());

-- CHAPTERS
CREATE POLICY "chapters_select" ON public.chapters FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND (stories.status = 'published' OR stories.author_id = (auth.uid())::text OR is_admin()))
);
CREATE POLICY "chapters_insert" ON public.chapters FOR INSERT WITH CHECK (is_story_owner(story_id) OR is_admin());
CREATE POLICY "chapters_update" ON public.chapters FOR UPDATE USING (is_story_owner(story_id) OR is_admin());
CREATE POLICY "chapters_delete" ON public.chapters FOR DELETE USING (is_story_owner(story_id) OR is_admin());

-- SCENES
CREATE POLICY "scenes_select" ON public.scenes FOR SELECT USING (
  EXISTS (SELECT 1 FROM chapters JOIN stories ON stories.id = chapters.story_id WHERE chapters.id = scenes.chapter_id AND (stories.status = 'published' OR stories.author_id = (auth.uid())::text OR is_admin()))
);
CREATE POLICY "scenes_insert" ON public.scenes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chapters WHERE chapters.id = chapter_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);
CREATE POLICY "scenes_update" ON public.scenes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM chapters WHERE chapters.id = chapter_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);
CREATE POLICY "scenes_delete" ON public.scenes FOR DELETE USING (
  EXISTS (SELECT 1 FROM chapters WHERE chapters.id = chapter_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);

-- BLOCKS
CREATE POLICY "blocks_select" ON public.blocks FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = blocks.story_id AND (stories.status = 'published' OR stories.author_id = (auth.uid())::text OR is_admin()))
);
CREATE POLICY "blocks_insert" ON public.blocks FOR INSERT WITH CHECK (is_story_owner(story_id) OR is_admin());
CREATE POLICY "blocks_update" ON public.blocks FOR UPDATE USING (is_story_owner(story_id) OR is_admin());
CREATE POLICY "blocks_delete" ON public.blocks FOR DELETE USING (is_story_owner(story_id) OR is_admin());

-- CHOICES
CREATE POLICY "choices_select" ON public.choices FOR SELECT USING (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id JOIN stories ON stories.id = chapters.story_id WHERE scenes.id = choices.scene_id AND (stories.status = 'published' OR stories.author_id = (auth.uid())::text OR is_admin()))
);
CREATE POLICY "choices_insert" ON public.choices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id WHERE scenes.id = scene_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);
CREATE POLICY "choices_update" ON public.choices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id WHERE scenes.id = scene_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);
CREATE POLICY "choices_delete" ON public.choices FOR DELETE USING (
  EXISTS (SELECT 1 FROM scenes JOIN chapters ON chapters.id = scenes.chapter_id WHERE scenes.id = scene_id AND (is_story_owner(chapters.story_id) OR is_admin()))
);

-- ASSETS
CREATE POLICY "assets_select" ON public.assets FOR SELECT USING (
  uploaded_by = (auth.uid())::text
  OR is_admin()
  OR EXISTS (SELECT 1 FROM stories WHERE stories.id = assets.story_id AND stories.status = 'published')
);
CREATE POLICY "assets_insert" ON public.assets FOR INSERT WITH CHECK (uploaded_by = (auth.uid())::text OR is_admin());
CREATE POLICY "assets_update" ON public.assets FOR UPDATE USING (uploaded_by = (auth.uid())::text OR is_admin());
CREATE POLICY "assets_delete" ON public.assets FOR DELETE USING (uploaded_by = (auth.uid())::text OR is_admin());

-- BOOKMARKS
CREATE POLICY "bookmarks_select" ON public.bookmarks FOR SELECT USING (user_id = (auth.uid())::text OR is_admin());
CREATE POLICY "bookmarks_insert" ON public.bookmarks FOR INSERT WITH CHECK (user_id = (auth.uid())::text OR is_admin());
CREATE POLICY "bookmarks_delete" ON public.bookmarks FOR DELETE USING (user_id = (auth.uid())::text OR is_admin());

-- INTERACTIONS
CREATE POLICY "interactions_select" ON public.interactions FOR SELECT USING (
  user_id = (auth.uid())::text
  OR is_story_owner(story_id)
  OR is_admin()
);
CREATE POLICY "interactions_insert" ON public.interactions FOR INSERT WITH CHECK (user_id = (auth.uid())::text);

-- TASKS
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (
  is_story_owner(story_id)
  OR assignee_id = (auth.uid())::text
  OR is_admin()
);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (is_story_owner(story_id) OR is_admin());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (
  is_story_owner(story_id)
  OR assignee_id = (auth.uid())::text
  OR is_admin()
);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (is_story_owner(story_id) OR is_admin());

-- MESSAGES
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR (story_id IS NOT NULL AND is_story_owner(story_id))
  OR is_admin()
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "messages_delete" ON public.messages FOR DELETE USING (
  author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR is_admin()
);

-- GLOBAL CONTENT
CREATE POLICY "global_content_select" ON public.global_content FOR SELECT USING (true);
CREATE POLICY "global_content_write" ON public.global_content FOR ALL USING (is_admin());

-- READING PROGRESS
CREATE POLICY "reading_progress_select" ON public.reading_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = reading_progress.user_id AND users.auth_id = auth.uid())
);
CREATE POLICY "reading_progress_insert" ON public.reading_progress FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = user_id AND users.auth_id = auth.uid())
);
CREATE POLICY "reading_progress_update" ON public.reading_progress FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = reading_progress.user_id AND users.auth_id = auth.uid())
);
CREATE POLICY "reading_progress_delete" ON public.reading_progress FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = reading_progress.user_id AND users.auth_id = auth.uid())
);
