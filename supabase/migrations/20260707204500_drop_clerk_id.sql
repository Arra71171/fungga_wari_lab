-- 1. Drop dependent policies
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "stories_select_admin" ON public.stories;
DROP POLICY IF EXISTS "stories_update_admin" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_admin" ON public.stories;
DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
DROP POLICY IF EXISTS "interactions_select_admin" ON public.interactions;
DROP POLICY IF EXISTS "global_content_insert_admin" ON public.global_content;
DROP POLICY IF EXISTS "global_content_update_admin" ON public.global_content;
DROP POLICY IF EXISTS "global_content_delete_admin" ON public.global_content;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- 2. Drop the obsolete clerk_id column
ALTER TABLE public.users DROP COLUMN IF EXISTS clerk_id;

-- 3. Recreate the policies using auth_id and auth.uid()
CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "stories_select_admin" ON public.stories
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "stories_update_admin" ON public.stories
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "stories_delete_admin" ON public.stories
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE
  USING (
    assignee_id = (auth.uid())::text OR
    EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role)
  );

CREATE POLICY "tasks_delete_admin" ON public.tasks
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE
  USING (author_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "interactions_select_admin" ON public.interactions
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "global_content_insert_admin" ON public.global_content
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "global_content_update_admin" ON public.global_content
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "global_content_delete_admin" ON public.global_content
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'::user_role));

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (auth_id = auth.uid() OR is_admin());
