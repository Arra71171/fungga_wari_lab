-- Migration: Fix RLS policies on `users` table to rely on `auth_id`
-- Description: After migrating from Clerk to Supabase Auth, the JWT `sub` claim now contains the user's Supabase UUID instead of the Clerk string ID.
-- However, the RLS policies were still checking `clerk_id = (auth.jwt() ->> 'sub')`, which evaluates to false.
-- This migration updates these policies to correctly check `auth_id = auth.uid()`.

-- 1. Drop existing policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- 2. Create updated policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (
    auth_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (
    auth_id = auth.uid()
    OR is_admin()
  )
  WITH CHECK (
    auth_id = auth.uid()
    OR is_admin()
  );

-- Also fix any other references if necessary, but the previous migrations already updated the functions (get_my_user_id, is_admin).
