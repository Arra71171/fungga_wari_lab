# Roadmap — Fungga Wari Lab

## ✅ Phase 0: Foundation & Design System
**Status:** ✅ Complete
**Complexity:** Medium

Established OKLCH Zen Brutalist design system. All shared UI primitives live in `@workspace/ui`. Both apps share the amber/ochre/ember firelight token system. Tailwind v4 PostCSS-based, no config file.

---

## ✅ Phase 1: Story Platform — Reader Experience
**Status:** ✅ Complete
**Complexity:** Complex

3-panel cinematic immersive reader: StorySidebar (chapter/scene nav), BlockStoryReader (rich content), StoryRightPanel (map, AI narration visualiser). GSAP + Framer Motion animations throughout.

---

## ✅ Phase 2: Creator Dashboard — Content Management
**Status:** ✅ Complete
**Complexity:** Complex

Full authenticated creator studio. Tiptap v2 rich-text editor per scene, chapter/scene hierarchy manager, story metadata editor, cover image upload, publish/draft toggle with preview.

---

## ✅ Phase 3: Team Workspace — Collaboration & Task Management
**Status:** ✅ Complete
**Complexity:** Complex

Kanban board with drag-and-drop task cards, real-time team chat via Supabase Realtime, story assignment, member role badges, progress dashboard. All gated behind Clerk admin auth.

---

## ✅ Phase 4: Global Identity Sync
**Status:** ✅ Complete
**Complexity:** Medium

Supabase Auth aligned to Clerk. `SyncUserStore` silently syncs on login. `auth.uid()` used for all RLS policies. Superadmin enum added. Multi-identity lookup (`getIdentityIds`) helper centralised in server actions.

---

## ✅ Phase 5: Public Story Reader
**Status:** ✅ Complete
**Complexity:** Complex

Landing page (hero, bento grid, GSAP capabilities, marquee, manifesto, CTA), story catalogue (`/stories`), cinematic reader (`/stories/[slug]`), WiseEpu AI lore-keeper chatbot, dark/light theme toggle, Stripe/Razorpay lifetime access paywall (₹899), ElevenLabs TTS with George voice, Cloudinary assets for illustrations.

---

## ✅ Phase 6: Hardening, Security & Accessibility
**Status:** ✅ Complete
**Complexity:** Medium

Zod validation on all server actions, RLS policy audit (all tables), Clerk webhook secret secured, ARIA attributes on interactive elements and progress bars (TC005 fix), keyboard focus states, `ScrollProgressBar` and `ReadingProgressBar` fully accessible (`role="progressbar"`, `aria-valuenow`).

---

## 🟡 Phase 7: Cloudinary Full Integration
**Status:** 🟡 In Progress
**Complexity:** Medium
**Requirements:** W3.1

### Description
Wire Cloudinary signed upload directly into the Tiptap scene editor. Currently cover images on stories use Cloudinary URLs but the inline image insert in Tiptap (`onImageUpload`) is unwired. Chapter illustration uploads need the same treatment.

### Key Deliverables
- [ ] Cloudinary signed upload server action (`uploadToCloudinary.ts`)
- [ ] Wire `onImageUpload` prop in dashboard Tiptap editor
- [ ] Store returned URL into `scenes.illustration_url` via Supabase

---

## 🔴 Phase 8: Reader Bookmark Persistence
**Status:** 🔴 Not Started
**Complexity:** Low-Medium
**Requirements:** W3.2

### Description
Allow signed-in readers to save their chapter/scene position. `bookmarks` table already exists with `{user_id, story_id}`. Extend it or use a new `reading_progress` table to track `{user_id, story_id, chapter_id, scene_id}`.

### Key Deliverables
- [ ] Migration: `reading_progress(user_id, story_id, chapter_id, scene_id, updated_at)` with RLS
- [ ] Server action `saveReadingProgress` + `getReadingProgress`
- [ ] Reader auto-resumes at last saved position on return visit

---

## 🔴 Phase 9: Server-Side Full-Text Search
**Status:** 🔴 Not Started
**Complexity:** Low
**Requirements:** W3.3

### Description
`stories.search_vector` tsvector column already exists and is generated automatically. Wire it to a search server action and expose a search input on the catalogue page.

### Key Deliverables
- [ ] `searchStories(query: string)` server action using `supabase.rpc('search_stories', { query })`
- [ ] Search input on `/stories` catalogue header
- [ ] Debounced client-side search with server action

---

## 🔴 Phase 10: Admin Role Management UI
**Status:** 🔴 Not Started
**Complexity:** Medium
**Requirements:** W3.4

### Description
Settings page in dashboard to promote/demote users. `users.role` enum exists with `admin/editor/viewer/superadmin`. Currently no UI to change roles after initial assignment.

### Key Deliverables
- [ ] Settings page: member list with current roles
- [ ] Role promotion modal (admin-only action)
- [ ] `updateUserRole` server action with Zod validation + admin guard

---

## 🔴 Phase 11: Dashboard E2E Test Coverage
**Status:** 🔴 Not Started
**Complexity:** Medium

### Description
Bootstrap TestSprite for `apps/dashboard` (port 3000). Generate comprehensive test plan covering: login flow, story CRUD, chapter editor, publish toggle, cover upload, team management, task creation.

### Key Deliverables
- [ ] TestSprite bootstrap for dashboard app
- [ ] Full 25+ test suite execution in production mode
- [ ] Test report with pass/fail/blocked analysis

---

## 🔴 Phase 12: Discovery & Community (V2)
**Status:** 🔴 Not Started
**Complexity:** Medium
**Requirements:** R32–R39

### Key Deliverables
- Story series/episode grouping with episode ordering
- Tags and category filtering refinement on catalogue
- Reader profiles with reading history
- Story likes and comments
- Author profile pages (`/creators/[username]`)
- Story recommendations sidebar in reader
