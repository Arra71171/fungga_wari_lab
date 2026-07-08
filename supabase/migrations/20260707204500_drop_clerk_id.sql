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

