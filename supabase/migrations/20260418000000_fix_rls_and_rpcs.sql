-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Fix RLS policies + add missing RPC functions
-- 
-- Root cause: All tables had RLS enabled but only 4 SELECT policies existed.
-- All INSERT/UPDATE/DELETE was silently blocked. Authors could not see drafts.
-- The `auth.jwt()->>'sub'` resolves to the Clerk userId stored in users.clerk_id.
-- We use a SECURITY DEFINER helper to map Clerk ID → Supabase UUID safely.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: Resolve current Clerk user's Supabase UUID ──────────────────────
-- SECURITY DEFINER bypasses RLS on users table so it doesn't recurse.
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE clerk_id = (auth.jwt() ->> 'sub') LIMIT 1;
$$;

-- ─── Helper: Check if current user is admin ──────────────────────────────────
-- Already exists from migration 00000000000001, recreating for completeness
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
  );
$$;

-- ─── Helper: Check if user owns a story ─────────────────────────────────────
CREATE OR REPLACE FUNCTION is_story_owner(p_story_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM stories
    WHERE id = p_story_id
      AND author_id = get_my_user_id()
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS table policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop legacy conflicting policies (already dropped in migration 00000000000001
-- but safe to re-drop with IF EXISTS)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- SELECT: own row or admin
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    clerk_id = (auth.jwt() ->> 'sub')
    OR is_admin()
  );

-- INSERT: only during Clerk webhook sync (service role) or self-upsert
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (
    clerk_id = (auth.jwt() ->> 'sub')
    OR is_admin()
  );

-- UPDATE: own row or admin
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    clerk_id = (auth.jwt() ->> 'sub')
    OR is_admin()
  );

-- DELETE: admin only
CREATE POLICY "users_delete_admin" ON users
  FOR DELETE USING (is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- STORIES table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Published stories are viewable by everyone." ON stories;
DROP POLICY IF EXISTS "stories_select_public" ON stories;
DROP POLICY IF EXISTS "stories_select_author" ON stories;
DROP POLICY IF EXISTS "stories_insert_author" ON stories;
DROP POLICY IF EXISTS "stories_update_author" ON stories;
DROP POLICY IF EXISTS "stories_delete_author" ON stories;
DROP POLICY IF EXISTS "stories_all_admin" ON stories;

-- SELECT: published stories are public; author sees all their own stories
CREATE POLICY "stories_select_public" ON stories
  FOR SELECT USING (
    status = 'published'
    OR author_id = get_my_user_id()
    OR is_admin()
  );

-- INSERT: authenticated users can create stories for themselves
CREATE POLICY "stories_insert_author" ON stories
  FOR INSERT WITH CHECK (
    author_id = get_my_user_id()
    OR is_admin()
  );

-- UPDATE: author can update their own stories; admin can update any
CREATE POLICY "stories_update_author" ON stories
  FOR UPDATE USING (
    author_id = get_my_user_id()
    OR is_admin()
  );

-- DELETE: author can delete their own stories; admin can delete any
CREATE POLICY "stories_delete_author" ON stories
  FOR DELETE USING (
    author_id = get_my_user_id()
    OR is_admin()
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- CHAPTERS table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Published chapters are viewable by everyone." ON chapters;
DROP POLICY IF EXISTS "chapters_select" ON chapters;
DROP POLICY IF EXISTS "chapters_insert_author" ON chapters;
DROP POLICY IF EXISTS "chapters_update_author" ON chapters;
DROP POLICY IF EXISTS "chapters_delete_author" ON chapters;

-- SELECT: chapter is readable if story is published OR current user owns the story
CREATE POLICY "chapters_select" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
        AND (
          stories.status = 'published'
          OR stories.author_id = get_my_user_id()
          OR is_admin()
        )
    )
  );

-- INSERT: user must own the parent story
CREATE POLICY "chapters_insert_author" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

-- UPDATE: user must own the parent story
CREATE POLICY "chapters_update_author" ON chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

-- DELETE: user must own the parent story
CREATE POLICY "chapters_delete_author" ON chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- SCENES table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Published scenes are viewable by everyone." ON scenes;
DROP POLICY IF EXISTS "scenes_select" ON scenes;
DROP POLICY IF EXISTS "scenes_insert_author" ON scenes;
DROP POLICY IF EXISTS "scenes_update_author" ON scenes;
DROP POLICY IF EXISTS "scenes_delete_author" ON scenes;

CREATE POLICY "scenes_select" ON scenes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = scenes.chapter_id
        AND (
          stories.status = 'published'
          OR stories.author_id = get_my_user_id()
          OR is_admin()
        )
    )
  );

CREATE POLICY "scenes_insert_author" ON scenes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = chapter_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

CREATE POLICY "scenes_update_author" ON scenes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = scenes.chapter_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

CREATE POLICY "scenes_delete_author" ON scenes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = scenes.chapter_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOCKS table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "blocks_select" ON blocks;
DROP POLICY IF EXISTS "blocks_insert_author" ON blocks;
DROP POLICY IF EXISTS "blocks_update_author" ON blocks;
DROP POLICY IF EXISTS "blocks_delete_author" ON blocks;

CREATE POLICY "blocks_select" ON blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = blocks.story_id
        AND (
          stories.status = 'published'
          OR stories.author_id = get_my_user_id()
          OR is_admin()
        )
    )
  );

CREATE POLICY "blocks_insert_author" ON blocks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

CREATE POLICY "blocks_update_author" ON blocks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = blocks.story_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

CREATE POLICY "blocks_delete_author" ON blocks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = blocks.story_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- CHOICES table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "choices_select" ON choices;
DROP POLICY IF EXISTS "choices_insert_author" ON choices;
DROP POLICY IF EXISTS "choices_update_author" ON choices;
DROP POLICY IF EXISTS "choices_delete_author" ON choices;

CREATE POLICY "choices_select" ON choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (
          stories.status = 'published'
          OR stories.author_id = get_my_user_id()
          OR is_admin()
        )
    )
  );

CREATE POLICY "choices_insert_author" ON choices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = scene_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

CREATE POLICY "choices_update_author" ON choices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );

CREATE POLICY "choices_delete_author" ON choices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (stories.author_id = get_my_user_id() OR is_admin())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- ASSETS table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "assets_select" ON assets;
DROP POLICY IF EXISTS "assets_insert_author" ON assets;
DROP POLICY IF EXISTS "assets_update_author" ON assets;
DROP POLICY IF EXISTS "assets_delete_author" ON assets;

CREATE POLICY "assets_select" ON assets
  FOR SELECT USING (
    uploaded_by = get_my_user_id()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = assets.story_id AND stories.status = 'published'
    )
  );

CREATE POLICY "assets_insert_author" ON assets
  FOR INSERT WITH CHECK (
    uploaded_by = get_my_user_id()
    OR is_admin()
  );

CREATE POLICY "assets_update_author" ON assets
  FOR UPDATE USING (
    uploaded_by = get_my_user_id()
    OR is_admin()
  );

CREATE POLICY "assets_delete_author" ON assets
  FOR DELETE USING (
    uploaded_by = get_my_user_id()
    OR is_admin()
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- BOOKMARKS table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "bookmarks_select" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_insert" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_delete" ON bookmarks;

CREATE POLICY "bookmarks_select" ON bookmarks
  FOR SELECT USING (user_id = get_my_user_id() OR is_admin());

CREATE POLICY "bookmarks_insert" ON bookmarks
  FOR INSERT WITH CHECK (user_id = get_my_user_id());

CREATE POLICY "bookmarks_delete" ON bookmarks
  FOR DELETE USING (user_id = get_my_user_id() OR is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- INTERACTIONS table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "interactions_select" ON interactions;
DROP POLICY IF EXISTS "interactions_insert" ON interactions;

-- Interactions are readable by the story author and admin
CREATE POLICY "interactions_select" ON interactions
  FOR SELECT USING (
    user_id = get_my_user_id()
    OR is_story_owner(story_id)
    OR is_admin()
  );

-- Anyone (including anon) can insert interactions (view tracking)
CREATE POLICY "interactions_insert" ON interactions
  FOR INSERT WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TASKS table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_author" ON tasks;
DROP POLICY IF EXISTS "tasks_update_author" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_author" ON tasks;

CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING (
    is_story_owner(story_id)
    OR assignee_id = get_my_user_id()
    OR is_admin()
  );

CREATE POLICY "tasks_insert_author" ON tasks
  FOR INSERT WITH CHECK (
    is_story_owner(story_id) OR is_admin()
  );

CREATE POLICY "tasks_update_author" ON tasks
  FOR UPDATE USING (
    is_story_owner(story_id)
    OR assignee_id = get_my_user_id()
    OR is_admin()
  );

CREATE POLICY "tasks_delete_author" ON tasks
  FOR DELETE USING (
    is_story_owner(story_id) OR is_admin()
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_delete" ON messages;

CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    author_id = get_my_user_id()
    OR (story_id IS NOT NULL AND is_story_owner(story_id))
    OR is_admin()
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    author_id = get_my_user_id()
  );

CREATE POLICY "messages_delete" ON messages
  FOR DELETE USING (
    author_id = get_my_user_id() OR is_admin()
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- GLOBAL_CONTENT table policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "global_content_select" ON global_content;
DROP POLICY IF EXISTS "global_content_admin" ON global_content;

-- Global content is readable by everyone
CREATE POLICY "global_content_select" ON global_content
  FOR SELECT USING (true);

-- Only admins can write global content
CREATE POLICY "global_content_admin" ON global_content
  FOR ALL USING (is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- RPC Functions: view/chapter count management
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_view_count(story_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE stories
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = story_id;
$$;

CREATE OR REPLACE FUNCTION increment_chapter_count(story_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE stories
  SET chapter_count = COALESCE(chapter_count, 0) + 1
  WHERE id = story_id;
$$;

CREATE OR REPLACE FUNCTION decrement_chapter_count(story_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE stories
  SET chapter_count = GREATEST(COALESCE(chapter_count, 0) - 1, 0)
  WHERE id = story_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Index: Speed up common story queries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories (slug);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories (status);
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories (author_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters (story_id);
CREATE INDEX IF NOT EXISTS idx_scenes_chapter_id ON scenes (chapter_id);
CREATE INDEX IF NOT EXISTS idx_blocks_story_id ON blocks (story_id);
CREATE INDEX IF NOT EXISTS idx_blocks_scene_id ON blocks (scene_id);
CREATE INDEX IF NOT EXISTS idx_interactions_story_id ON interactions (story_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id);
