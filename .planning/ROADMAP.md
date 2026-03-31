# Roadmap — Fungga Wari Lab

## Phase 0: Foundation & Design System
**Status:** 🔴 Not Started
**Complexity:** Medium
**Requirements:** R26, R27

### Description
Establish the Fungga Wari brand identity into the design system, create all shared UI primitives in `@workspace/ui`, and ensure both apps share a consistent, firelight-inspired dark aesthetic. This is the design foundation — everything else builds on it.

### Key Deliverables
- Extend `globals.css` with Fungga Wari brand tokens (amber/ochre/ember color palette for dark mode)
- Build shared UI components: `StoryCard`, `ChapterItem`, `SceneBlock`, `ProgressBar`, `AvatarBadge`, `TaskCard`, `Badge`
- Set up `apps/dashboard` as a new Next.js 15 app in the monorepo
- Configure Clerk + Convex in both apps
- Define and document the full Convex schema for all V1 data models

---

## Phase 1: Story Platform — Reader Experience
**Status:** 🔴 Not Started
**Complexity:** Complex
**Requirements:** R01–R10

### Description
Build the public-facing story reading experience — the heart of Fungga Wari Lab. Implements the FoxStory-inspired 3-panel layout: left sidebar for chapters/navigation, central canvas for story content, and right panel for story progress and choices.

### Key Deliverables
- Story home page (`/`) — story grid with cover art, categories, metadata
- Story player page (`/story/[slug]`) — full 3-panel cinematic layout
- Left sidebar: chapter list, scene list, chapter progress bar
- Center canvas: story title, hero illustration, text content, dialogue blocks, choice buttons
- Right panel: story progress tree, "What to do?" choice suggestions
- Block renderer: text, image, dialogue character blocks
- Chapter/scene navigation with smooth Framer Motion transitions
- Progress persistence (localStorage → Convex sync later)

---

## Phase 2: Creator Dashboard — Content Management
**Status:** 🔴 Not Started
**Complexity:** Complex
**Requirements:** R11–R16, R22, R23–R25

### Description
Build the authenticated creator dashboard where team members upload and manage stories and illustrations. Implements the full Tiptap-powered story editor, Cloudinary media upload, and the publish/draft workflow.

### Key Deliverables
- Auth gate: Clerk login → redirect to dashboard
- Dashboard home: story list with status (draft/published), quick actions
- Story creation flow: metadata (title, category, language, cover image) → chapter/scene builder
- Tiptap rich text editor for scene content with custom block support
- Cloudinary illustration uploader (drag-and-drop, used in scene editor)

- Chapter & scene hierarchy manager (add/reorder/delete chapters and scenes)
- Publish/draft toggle with preview link

---

## Phase 3: Team Workspace — Collaboration & Task Management
**Status:** 🔴 Not Started
**Complexity:** Complex
**Requirements:** R17–R21

### Description
Transform the dashboard into a full team workspace. Implements member management, task assignment, Kanban board, and real-time team chat — building the collaborative layer that makes Fungga Wari Lab an internal platform, not just a CMS.

### Key Deliverables
- Team settings: member list, role badges (admin/editor/viewer), invite by email
- Task manager: create tasks with title, description, assignee, priority, due date
- Kanban board: drag-and-drop task cards across Todo / In Progress / Review / Done
- Progress dashboard: story completion %, tasks by status, team activity feed
- Real-time team chat: workspace-scoped messaging using Convex live queries
- Notifications: task assignment alerts, chat mentions

---

## Phase 4: Discovery & Community (V2)
**Status:** 🔴 Not Started
**Complexity:** Medium
**Requirements:** R32–R39 (V2)

### Description
Enhance the public story platform with discovery, search, social features, and personalization. Builds the community layer for story engagement.

### Key Deliverables
- Full-text story search
- Story series/episodes grouping
- Tags and category filtering on explore page
- Reader accounts (bookmarks, reading history)
- Story likes and comments
- Author profile pages
- Story recommendations sidebar

---

## Phase 5: Advanced Platform (V3)
**Status:** 🔴 Not Started
**Complexity:** Very Complex
**Requirements:** R40–R42 (V3)

### Description
Community UGC platform, gamification, and multiplayer storytelling — the full ecosystem endgame for Fungga Wari Lab.

### Key Deliverables
- Community story publishing (UGC)
- Multiplayer story voting sessions
- Reader XP and achievement system
