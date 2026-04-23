-- Align ownership columns with the live Clerk-backed identity model.
--
-- Root cause:
-- - The initial schema stored ownership / assignment columns as UUID FKs to users.id.
-- - The live apps write Clerk IDs (auth.jwt() ->> 'sub') into stories.author_id,
--   assets.uploaded_by, bookmarks.user_id, interactions.user_id, and tasks.assignee_id.
-- - Fresh db resets therefore diverged from the deployed schema and broke RLS parity.

DROP POLICY IF EXISTS "stories_select_public" ON stories;
DROP POLICY IF EXISTS "stories_insert_author" ON stories;
DROP POLICY IF EXISTS "stories_update_author" ON stories;
DROP POLICY IF EXISTS "stories_delete_author" ON stories;

DROP POLICY IF EXISTS "chapters_select" ON chapters;
DROP POLICY IF EXISTS "chapters_insert_author" ON chapters;
DROP POLICY IF EXISTS "chapters_update_author" ON chapters;
DROP POLICY IF EXISTS "chapters_delete_author" ON chapters;

DROP POLICY IF EXISTS "scenes_select" ON scenes;
DROP POLICY IF EXISTS "scenes_insert_author" ON scenes;
DROP POLICY IF EXISTS "scenes_update_author" ON scenes;
DROP POLICY IF EXISTS "scenes_delete_author" ON scenes;

DROP POLICY IF EXISTS "blocks_select" ON blocks;
DROP POLICY IF EXISTS "blocks_insert_author" ON blocks;
DROP POLICY IF EXISTS "blocks_update_author" ON blocks;
DROP POLICY IF EXISTS "blocks_delete_author" ON blocks;

DROP POLICY IF EXISTS "assets_select" ON assets;
DROP POLICY IF EXISTS "assets_insert_author" ON assets;
DROP POLICY IF EXISTS "assets_update_author" ON assets;
DROP POLICY IF EXISTS "assets_delete_author" ON assets;

DROP POLICY IF EXISTS "bookmarks_select" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_insert" ON bookmarks;
DROP POLICY IF EXISTS "bookmarks_delete" ON bookmarks;

DROP POLICY IF EXISTS "interactions_select" ON interactions;
DROP POLICY IF EXISTS "interactions_insert" ON interactions;

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_author" ON tasks;
DROP POLICY IF EXISTS "tasks_update_author" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_author" ON tasks;

DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_delete" ON messages;

DROP POLICY IF EXISTS "choices_select" ON choices;
DROP POLICY IF EXISTS "choices_insert_author" ON choices;
DROP POLICY IF EXISTS "choices_update_author" ON choices;
DROP POLICY IF EXISTS "choices_delete_author" ON choices;

ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_author_id_fkey;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_uploaded_by_fkey;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_user_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

ALTER TABLE stories
  ALTER COLUMN author_id TYPE text USING author_id::text;

ALTER TABLE assets
  ALTER COLUMN uploaded_by TYPE text USING uploaded_by::text;

ALTER TABLE bookmarks
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE interactions
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE tasks
  ALTER COLUMN assignee_id TYPE text USING assignee_id::text;

UPDATE stories AS stories_to_fix
SET author_id = users.clerk_id
FROM users
WHERE stories_to_fix.author_id = users.id::text
  AND users.clerk_id IS NOT NULL;

UPDATE assets AS assets_to_fix
SET uploaded_by = users.clerk_id
FROM users
WHERE assets_to_fix.uploaded_by = users.id::text
  AND users.clerk_id IS NOT NULL;

UPDATE bookmarks AS bookmarks_to_fix
SET user_id = users.clerk_id
FROM users
WHERE bookmarks_to_fix.user_id = users.id::text
  AND users.clerk_id IS NOT NULL;

UPDATE interactions AS interactions_to_fix
SET user_id = users.clerk_id
FROM users
WHERE interactions_to_fix.user_id = users.id::text
  AND users.clerk_id IS NOT NULL;

UPDATE tasks AS tasks_to_fix
SET assignee_id = users.clerk_id
FROM users
WHERE tasks_to_fix.assignee_id = users.id::text
  AND users.clerk_id IS NOT NULL;

CREATE OR REPLACE FUNCTION get_my_clerk_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() ->> 'sub';
$$;

CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM users
  WHERE clerk_id = get_my_clerk_id()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION matches_current_identity(identity text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT identity IS NOT NULL
    AND (
      identity = get_my_clerk_id()
      OR identity = COALESCE(get_my_user_id()::text, '')
    );
$$;

CREATE OR REPLACE FUNCTION is_story_owner(p_story_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM stories
    WHERE id = p_story_id
      AND matches_current_identity(author_id)
  );
$$;



CREATE POLICY "stories_select_public" ON stories
  FOR SELECT USING (
    status = 'published'
    OR matches_current_identity(author_id)
    OR is_admin()
  );

CREATE POLICY "stories_insert_author" ON stories
  FOR INSERT WITH CHECK (
    matches_current_identity(author_id)
    OR is_admin()
  );

CREATE POLICY "stories_update_author" ON stories
  FOR UPDATE USING (
    matches_current_identity(author_id)
    OR is_admin()
  );

CREATE POLICY "stories_delete_author" ON stories
  FOR DELETE USING (
    matches_current_identity(author_id)
    OR is_admin()
  );



CREATE POLICY "chapters_select" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = chapters.story_id
        AND (
          stories.status = 'published'
          OR matches_current_identity(stories.author_id)
          OR is_admin()
        )
    )
  );

CREATE POLICY "chapters_insert_author" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = chapters.story_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );

CREATE POLICY "chapters_update_author" ON chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = chapters.story_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );

CREATE POLICY "chapters_delete_author" ON chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = chapters.story_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );



CREATE POLICY "scenes_select" ON scenes
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = scenes.chapter_id
        AND (
          stories.status = 'published'
          OR matches_current_identity(stories.author_id)
          OR is_admin()
        )
    )
  );

CREATE POLICY "scenes_insert_author" ON scenes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = chapter_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );

CREATE POLICY "scenes_update_author" ON scenes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = scenes.chapter_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );

CREATE POLICY "scenes_delete_author" ON scenes
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = scenes.chapter_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );



CREATE POLICY "blocks_select" ON blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = blocks.story_id
        AND (
          stories.status = 'published'
          OR matches_current_identity(stories.author_id)
          OR is_admin()
        )
    )
  );

CREATE POLICY "blocks_insert_author" ON blocks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = blocks.story_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );

CREATE POLICY "blocks_update_author" ON blocks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = blocks.story_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );

CREATE POLICY "blocks_delete_author" ON blocks
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = blocks.story_id
        AND (matches_current_identity(stories.author_id) OR is_admin())
    )
  );



CREATE POLICY "assets_select" ON assets
  FOR SELECT USING (
    matches_current_identity(uploaded_by)
    OR is_admin()
    OR EXISTS (
      SELECT 1
      FROM stories
      WHERE stories.id = assets.story_id
        AND stories.status = 'published'
    )
  );

CREATE POLICY "assets_insert_author" ON assets
  FOR INSERT WITH CHECK (
    matches_current_identity(uploaded_by)
    OR is_admin()
  );

CREATE POLICY "assets_update_author" ON assets
  FOR UPDATE USING (
    matches_current_identity(uploaded_by)
    OR is_admin()
  );

CREATE POLICY "assets_delete_author" ON assets
  FOR DELETE USING (
    matches_current_identity(uploaded_by)
    OR is_admin()
  );



CREATE POLICY "bookmarks_select" ON bookmarks
  FOR SELECT USING (matches_current_identity(user_id) OR is_admin());

CREATE POLICY "bookmarks_insert" ON bookmarks
  FOR INSERT WITH CHECK (matches_current_identity(user_id));

CREATE POLICY "bookmarks_delete" ON bookmarks
  FOR DELETE USING (matches_current_identity(user_id) OR is_admin());



CREATE POLICY "interactions_select" ON interactions
  FOR SELECT USING (
    matches_current_identity(user_id)
    OR is_story_owner(story_id)
    OR is_admin()
  );

CREATE POLICY "interactions_insert" ON interactions
  FOR INSERT WITH CHECK (true);



CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING (
    is_story_owner(story_id)
    OR matches_current_identity(assignee_id)
    OR is_admin()
  );

CREATE POLICY "tasks_insert_author" ON tasks
  FOR INSERT WITH CHECK (
    is_story_owner(story_id)
    OR is_admin()
  );

CREATE POLICY "tasks_update_author" ON tasks
  FOR UPDATE USING (
    is_story_owner(story_id)
    OR matches_current_identity(assignee_id)
    OR is_admin()
  );

CREATE POLICY "tasks_delete_author" ON tasks
  FOR DELETE USING (
    is_story_owner(story_id)
    OR is_admin()
  );

CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    matches_current_identity(author_id::text)
    OR (story_id IS NOT NULL AND is_story_owner(story_id))
    OR is_admin()
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    matches_current_identity(author_id::text)
  );

CREATE POLICY "messages_delete" ON messages
  FOR DELETE USING (
    matches_current_identity(author_id::text) OR is_admin()
  );

CREATE POLICY "choices_select" ON choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (
          stories.status = 'published'
          OR matches_current_identity(stories.author_id::text)
          OR is_admin()
        )
    )
  );

CREATE POLICY "choices_insert_author" ON choices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (matches_current_identity(stories.author_id::text) OR is_admin())
    )
  );

CREATE POLICY "choices_update_author" ON choices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (matches_current_identity(stories.author_id::text) OR is_admin())
    )
  );

CREATE POLICY "choices_delete_author" ON choices
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM scenes
      JOIN chapters ON chapters.id = scenes.chapter_id
      JOIN stories ON stories.id = chapters.story_id
      WHERE scenes.id = choices.scene_id
        AND (matches_current_identity(stories.author_id::text) OR is_admin())
    )
  );

CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks (assignee_id);
