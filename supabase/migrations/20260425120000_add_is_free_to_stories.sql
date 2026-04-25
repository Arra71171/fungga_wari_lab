-- Migration: add is_free column to stories
-- Replaces the hardcoded slug === "nongpok-ningthou-test" paywall bypass
-- in page.tsx with a data-driven approach: stories with is_free = true
-- are accessible to all visitors without requiring lifetime access.

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;

-- Mark the E2E test story as free-access so TestSprite can exercise
-- chapter navigation, TTS, and illustration switching without hitting the paywall.
UPDATE stories
  SET is_free = true
  WHERE slug = 'nongpok-ningthou-test';

-- RLS: is_free is a read-only column for authenticated + anon readers.
-- Writers (authors, editors) keep their existing UPDATE policies.
-- No new policy needed — existing SELECT policies on stories already
-- expose all columns to the select-permitted roles.
