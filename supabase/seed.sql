-- Seed Data for test users and roles
-- Users keep stable UUIDs, but Clerk-backed ownership columns store clerk_id text.

-- Insert Admin User
INSERT INTO users (id, name, email, role, clerk_id, bio, alias)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin@fungga.wari',
  'admin',
  'user_admin123',
  'System Administrator',
  'Admin'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert Editor User
INSERT INTO users (id, name, email, role, clerk_id, bio, alias)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Editor User',
  'editor@fungga.wari',
  'editor',
  'user_editor123',
  'Content Editor and Creator',
  'Editor'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert Viewer User
INSERT INTO users (id, name, email, role, clerk_id, bio, alias)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Viewer User',
  'viewer@fungga.wari',
  'viewer',
  'user_viewer123',
  'Regular Reader',
  'Reader'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert a test story for Editor
INSERT INTO stories (id, author_id, title, slug, language, status, description, category)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'user_editor123',
  'The First Tale',
  'the-first-tale',
  'en',
  'published',
  'A seed story for testing.',
  'legend'
) ON CONFLICT (id) DO NOTHING;
