-- Seed Data for test users and roles
-- Users keep stable UUIDs, but Clerk-backed ownership columns store clerk_id text.

-- Insert Admin User
INSERT INTO users (id, name, email, role, bio, alias)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin@fungga.wari',
  'admin',
  'System Administrator',
  'Admin'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert Editor User
INSERT INTO users (id, name, email, role, bio, alias)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Editor User',
  'editor@fungga.wari',
  'editor',
  'Content Editor and Creator',
  'Editor'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert Viewer User
INSERT INTO users (id, name, email, role, bio, alias)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Viewer User',
  'viewer@fungga.wari',
  'viewer',
  'Regular Reader',
  'Reader'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert a test story for Editor
INSERT INTO stories (id, author_id, title, slug, language, status, description, category)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  'The First Tale',
  'the-first-tale',
  'en',
  'published',
  'A seed story for testing.',
  'legend'
) ON CONFLICT (id) DO NOTHING;

-- ─── E2E Test Story: Fully free-access, multi-chapter story ─────────────────
-- This story exists exclusively to allow TestSprite E2E tests to exercise
-- chapter navigation, TTS, and illustration switching WITHOUT hitting the paywall.
-- DO NOT remove — it is required for TC006, TC010, TC014 to pass.

INSERT INTO stories (id, author_id, title, slug, language, status, description, category, chapter_count, is_free)
VALUES (
  '00000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000002',
  'Nongpok Ningthou: The King of the East (Test)',
  'nongpok-ningthou-test',
  'en',
  'published',
  'A test story with free access to all chapters for automated E2E testing. Part of the Meitei creation myth cycle.',
  'creation_myth',
  2,
  true
) ON CONFLICT (id) DO NOTHING;

-- Chapter 1: freely accessible
INSERT INTO chapters (id, story_id, title, "order", tiptap_content, illustration_url, audio_url)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000099',
  'The Dawn of Kangleipak',
  1,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"In the beginning, there was only the vast expanse of water and sky. Atiya Sidaba, the sky father, looked down upon the swirling darkness and breathed the first word of creation — Kangleipak."}]}]}',
  'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
) ON CONFLICT (id) DO NOTHING;

-- Scene 1.1
INSERT INTO scenes (id, chapter_id, title, "order", tiptap_content, is_draft, reading_time)
VALUES (
  '00000000-0000-0000-0000-000000001011',
  '00000000-0000-0000-0000-000000000101',
  'The First Breath',
  1,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Before the mountains rose and the rivers found their courses, the world was a song without a singer. Atiya Sidaba cupped his hands and blew warmth into the cold silence, and from that breath sprang the first lotus — pale and luminous — floating on the primordial water."}]},{"type":"paragraph","content":[{"type":"text","text":"The lotus opened. And in its heart sat Pakhangba, the serpent-dragon of eternal time, coiled seven times around himself, waiting."}]}]}',
  false,
  3
) ON CONFLICT (id) DO NOTHING;

-- Chapter 2: second chapter (normally paywalled, but story is seed-only for tests)
INSERT INTO chapters (id, story_id, title, "order", tiptap_content, illustration_url)
VALUES (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000099',
  'Nongpok Ningthou Awakens',
  2,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The King of the East opened his eyes for the first time and saw the light of Sanamahi''s torch burning in the western sky. His heart, ancient and patient, began to beat."}]}]}',
  'https://res.cloudinary.com/demo/image/upload/v1312461204/sample2.jpg'
) ON CONFLICT (id) DO NOTHING;

-- Scene 2.1
INSERT INTO scenes (id, chapter_id, title, "order", tiptap_content, is_draft, reading_time)
VALUES (
  '00000000-0000-0000-0000-000000001021',
  '00000000-0000-0000-0000-000000000102',
  'The First Light',
  1,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Nongpok Ningthou, the guardian of the eastern gate, stretched his vast form across the horizon. Where his shadow fell, night pooled like dark water in a valley. Where he stepped, dawn cracked open the sky like an ember catching fire."}]},{"type":"paragraph","content":[{"type":"text","text":"The first birds rose to greet him, their songs becoming the calendar of seasons that the Meitei people would follow for ten thousand years."}]}]}',
  false,
  4
) ON CONFLICT (id) DO NOTHING;
