-- Migration: Clerk → Supabase Auth
-- Adds auth_id column, signup trigger, and updates RLS helper functions

-- 1. Add auth_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- 2. Create trigger function for auto-inserting users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
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

-- 3. Update get_my_user_id() to use auth.uid() instead of clerk JWT
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- 4. Update is_admin() to use auth.uid() instead of clerk JWT
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

-- 5. Index for fast auth lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (auth_id);
