-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add 'superadmin' to user_role enum
--
-- Context: Previously the only elevated role was 'admin'. We introduce
-- 'superadmin' as the exclusive role that grants access to the Creator
-- Dashboard (enforced by apps/dashboard/proxy.ts). Regular sign-up users
-- receive 'viewer' by default and can browse library stories but cannot
-- access the dashboard.
--
-- NOTE: Postgres requires enum values to be committed before use in SQL
-- expressions, so the is_admin() update is a separate follow-up migration.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';
