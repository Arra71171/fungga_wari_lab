-- Migration: Clerk → Supabase Auth
-- Adds auth_id column, signup trigger, and updates RLS helper functions

-- 1. Add auth_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- 2. Backfill auth_id for existing users by matching on verified email.
--    This is safe because Supabase Auth enforces unique, verified emails per project.
UPDATE public.users AS u
SET auth_id = au.id
FROM auth.users AS au
WHERE u.id IN (
  SELECT DISTINCT ON (lower(email)) id
  FROM public.users
  WHERE auth_id IS NULL AND email IS NOT NULL
  ORDER BY lower(email), created_at DESC
)
AND lower(u.email) = lower(au.email)
  AND au.email_confirmed_at IS NOT NULL;

-- Safety guard: abort if any privileged or active users remain unmapped.
-- Comment this block out if you want to allow partial backfill on first run.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_id IS NULL
      AND (
        role IN ('admin', 'superadmin', 'editor')
        OR has_lifetime_access IS TRUE
      )
  ) THEN
    RAISE EXCEPTION 'Cannot switch RLS helpers: privileged users without auth_id remain. Backfill or manually map them first.';
  END IF;
END $$;

-- 3. Create trigger function for auto-inserting users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.users
  SET
    auth_id = NEW.id,
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.name),
    updated_at = now()
  WHERE id = (
    SELECT id FROM public.users
    WHERE auth_id IS NULL
      AND email IS NOT NULL
      AND lower(email) = lower(NEW.email)
    ORDER BY created_at DESC
    LIMIT 1
  );

  IF FOUND THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (auth_id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'viewer')
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update get_my_user_id() to use auth.uid() instead of clerk JWT
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- 5. Update is_admin() to use auth.uid() instead of clerk JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$;

-- 6. Index for fast auth lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (auth_id);
