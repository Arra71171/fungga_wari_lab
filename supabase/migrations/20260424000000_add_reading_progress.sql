-- Migration: Add reading_progress table for reader scene bookmark persistence
-- Allows signed-in readers to resume from their last read position

CREATE TABLE reading_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id    uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id  uuid REFERENCES chapters(id) ON DELETE SET NULL,
  scene_id    uuid REFERENCES scenes(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Readers can only see and manage their own progress
CREATE POLICY "Users can view own reading progress"
  ON reading_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = reading_progress.user_id
      AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = reading_progress.user_id
      AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = reading_progress.user_id
      AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reading progress"
  ON reading_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = reading_progress.user_id
      AND u.auth_id = auth.uid()
    )
  );

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION update_reading_progress_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reading_progress_updated_at
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_reading_progress_timestamp();
