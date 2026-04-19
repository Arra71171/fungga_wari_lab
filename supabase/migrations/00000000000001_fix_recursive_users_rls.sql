-- ─── Fix: Infinite recursion in users RLS policies ───────────────────────────
-- The original policies used EXISTS (SELECT 1 FROM users ...) inside a policy
-- ON users, causing Postgres to recurse infinitely.
-- Solution: create a SECURITY DEFINER helper that bypasses RLS.

-- 1. Create a helper that checks if the requesting Clerk user is an admin,
--    bypassing RLS so it does NOT trigger the users policy again.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE clerk_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
  );
$$;

-- 2. Drop the recursive SELECT policy and replace it
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (
    clerk_id = (auth.jwt() ->> 'sub')
    OR is_admin()
  );

-- 3. Drop the recursive UPDATE (admin) policy and replace it
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  USING (is_admin());

-- 4. Drop the conflicting "viewable by everyone" policy from initial migration
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON users;
