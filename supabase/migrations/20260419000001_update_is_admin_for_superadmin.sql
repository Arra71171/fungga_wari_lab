-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Update is_admin() to include 'superadmin' role
--
-- This MUST run after 20260419000000_add_superadmin_enum_value.sql because
-- Postgres requires new enum values to be committed before use in SQL.
--
-- The function now accepts both 'admin' (legacy, backward-compatible) and
-- 'superadmin' (new exclusive dashboard role). All existing RLS policies that
-- call is_admin() automatically gain superadmin support with no changes.
-- ─────────────────────────────────────────────────────────────────────────────

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
      AND role IN ('admin', 'superadmin')
  );
$$;
