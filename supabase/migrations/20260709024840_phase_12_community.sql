-- Phase 12: Discovery & Community Migrations

-- 1. Create Series Table
CREATE TABLE series (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  cover_image_url text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 2. Modify Stories Table for Series
ALTER TABLE stories
ADD COLUMN series_id uuid REFERENCES series(id) ON DELETE SET NULL,
ADD COLUMN series_order integer;

-- 3. Create Likes Table
CREATE TABLE likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id   uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- 4. Create Comments Table
CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id   uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security (RLS) setup

-- Enable RLS
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Series Policies
-- Public can read series
CREATE POLICY "Public can view series"
  ON series FOR SELECT
  USING (true);

-- Superadmin/Admin can manage series (editors can't create series for now)
CREATE POLICY "Admins can insert series"
  ON series FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Admins can update series"
  ON series FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Admins can delete series"
  ON series FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('superadmin', 'admin')
    )
  );

-- Likes Policies
-- Public can see likes
CREATE POLICY "Public can view likes"
  ON likes FOR SELECT
  USING (true);

-- Users can like/unlike
CREATE POLICY "Users can insert own likes"
  ON likes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = likes.user_id
      AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = likes.user_id
      AND u.auth_id = auth.uid()
    )
  );

-- Comments Policies
-- Public can view comments
CREATE POLICY "Public can view comments"
  ON comments FOR SELECT
  USING (true);

-- Users can comment
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = comments.user_id
      AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = comments.user_id
      AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = comments.user_id
      AND u.auth_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_series_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION update_series_timestamp();

CREATE OR REPLACE FUNCTION update_comments_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_timestamp();
