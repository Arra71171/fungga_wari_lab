-- Drop the legacy clerk_id column from public.users
-- Clerk is fully deprecated; all identity is now via auth.users.id (auth_id)
ALTER TABLE public.users DROP COLUMN IF EXISTS clerk_id;
