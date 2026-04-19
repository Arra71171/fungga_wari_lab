-- Enums
CREATE TYPE asset_type AS ENUM ('illustration', 'sketch', 'reference_photo', 'audio_lore', 'cover');
CREATE TYPE block_type AS ENUM ('text', 'heading', 'image', 'dialogue', 'audio', 'choice', 'divider', 'quote', 'scene_break');
CREATE TYPE interaction_type AS ENUM ('view', 'read', 'complete', 'drop_off');
CREATE TYPE story_category AS ENUM ('creation_myth', 'animal_fable', 'historical', 'legend', 'moral_tale', 'romance', 'adventure', 'supernatural', 'other');
CREATE TYPE story_status AS ENUM ('draft', 'in_review', 'published');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('lore_gathering', 'translating', 'illustrating', 'review', 'done');
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias text,
  avatar_url text,
  bio text,
  clerk_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  custom_avatar_url text,
  email text,
  name text,
  phone text,
  role user_role DEFAULT 'viewer',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Stories table
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attributed_author text,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category story_category,
  chapter_count integer DEFAULT 0,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  description text,
  language text NOT NULL DEFAULT 'en',
  moral text,
  published_at timestamptz,
  read_count integer DEFAULT 0,
  reading_time integer DEFAULT 0,
  searchable_text text,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(searchable_text, ''))) STORED,
  slug text NOT NULL UNIQUE,
  status story_status NOT NULL DEFAULT 'draft',
  tags text[],
  title text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0
);
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Chapters table
CREATE TABLE chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  created_at timestamptz DEFAULT now(),
  illustration_url text,
  "order" integer NOT NULL,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  tiptap_content jsonb,
  title text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Scenes table
CREATE TABLE scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  excerpt text,
  illustration_url text,
  is_draft boolean DEFAULT true,
  "order" integer NOT NULL,
  reading_time integer DEFAULT 0,
  tiptap_content jsonb,
  title text,
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1
);
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

-- Blocks table
CREATE TABLE blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  "order" integer NOT NULL,
  props jsonb,
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  type block_type NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Assets table
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  public_id text,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  tags text[],
  title text NOT NULL,
  type asset_type NOT NULL,
  uploaded_by uuid REFERENCES users(id) NOT NULL,
  url text NOT NULL
);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Bookmarks table
CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(story_id, user_id)
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Choices table
CREATE TABLE choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  label text NOT NULL,
  next_scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE NOT NULL,
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE NOT NULL
);
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

-- Global Content table
CREATE TABLE global_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  tiptap_content jsonb,
  title text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE global_content ENABLE ROW LEVEL SECURITY;

-- Interactions table
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  duration integer,
  metadata jsonb,
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  type interaction_type NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL
);
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  description jsonb,
  due_date timestamptz,
  priority task_priority NOT NULL DEFAULT 'medium',
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE,
  status task_status NOT NULL DEFAULT 'lore_gathering',
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  title text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Setup initial RLS policies for basic access
-- Admins have full access to everything. This should be a function later.

-- Basic read access for published stories
CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Published stories are viewable by everyone." ON stories FOR SELECT USING (status = 'published');
CREATE POLICY "Published chapters are viewable by everyone." ON chapters FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.status = 'published')
);
CREATE POLICY "Published scenes are viewable by everyone." ON scenes FOR SELECT USING (
  EXISTS (SELECT 1 FROM chapters JOIN stories ON stories.id = chapters.story_id WHERE chapters.id = scenes.chapter_id AND stories.status = 'published')
);
