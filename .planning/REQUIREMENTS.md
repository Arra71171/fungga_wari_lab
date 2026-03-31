# Requirements — Fungga Wari Lab

## V1 — Must Ship (MVP Platform)

### Story Platform (`apps/web`)
- [ ] R01: Cinematic 3-panel story reader layout (sidebar / canvas / right-panel) matching FoxStory reference
- [ ] R02: Story list (home/explore page) — discover all published Meetei folk stories with cover art
- [ ] R03: Individual story player — chapters, scenes, rich text content, illustrations
- [ ] R04: Block-based content renderer (text, image, character dialogue blocks)
- [ ] R05: Chapter progress tracking — progress bar, scene completion state (local persisted)
- [ ] R06: Right panel: Story Progress tree, "What do you want to do?" choices
- [ ] R07: Responsive dark mode (dark is primary, warm amber brand color for Meetei firelight aesthetic)
- [ ] R08: Branching choice system — interactive "what to do next" choices tied to scenes
- [ ] R10: Story metadata — author, category (folk, legend, myth), language (Meitei/English)

### Creator Dashboard (`apps/dashboard`)
- [ ] R11: Authentication via Convex Auth — team login with email/password + OAuth, roles stored in Convex schema (admin/editor/viewer)
- [ ] R12: Story management CRUD — create, edit, publish/draft, delete stories
- [ ] R13: Rich text story editor (Tiptap) — write story content with formatting
- [ ] R14: Illustration uploader — drag-and-drop image upload to Cloudinary, attach to story scenes
- [ ] R16: Chapter & scene manager — organize story into chapters → scenes hierarchy
- [ ] R17: Team workspace — member list, invite by email, role management (admin/editor/viewer)
- [ ] R18: Task management — create tasks, assign to team members, set priorities and due dates
- [ ] R19: Task board (Kanban) — Todo / In Progress / Review / Done columns
- [ ] R20: Progress tracking — view story completion status, task completion rates
- [ ] R21: Team chat — real-time messaging within the workspace (Convex live queries)
- [ ] R22: Story publish/draft toggle — control visibility on public platform

### Shared Infrastructure
- [ ] R23: Convex backend — stories, chapters, scenes, tasks, team, messages schema
- [ ] R24: Convex Auth integrated across both apps (session management, protected routes, role middleware)
- [ ] R25: Cloudinary media integration (image upload)
- [ ] R26: `@workspace/ui` component library extended with all shared primitives used across both apps
- [ ] R27: Design system — extend `globals.css` with Fungga Wari brand tokens (firelight amber, ember, ochre)

## V2 — Next Milestone

- [ ] R28: Story series / episodes — group stories into series with episode ordering
- [ ] R29: Branching story graph editor (visual node editor with React Flow) in dashboard
- [ ] R30: Full-text search — search stories by title, category, keyword
- [ ] R31: AI translation tool — translate Meitei story content to English and vice versa (DEFERRED — team translates manually)
- [ ] R32: Reader accounts — public users can bookmark stories, track reading history
- [ ] R33: Story likes & comments — community engagement on public platform
- [ ] R34: Creator profiles — author bio, published stories list
- [ ] R35: Story recommendation system — similar stories based on tags

## V3 — Future Roadmap

- [ ] R40: Community platform — readers publish their own folk stories (UGC)
- [ ] R41: Multiplayer story sessions — group story reading with voting on choices
- [ ] R42: Gamification — XP, achievements, reading streaks
- [ ] R43: Mobile app (Expo) — if explicitly approved later

## Out of Scope (V1)

- [X] Mobile app (explicitly excluded per project notes)
- [X] Plugin marketplace
- [X] Player economy / in-game items
- [X] AI NPC system / open world simulation
- [X] Cross-world narrative systems
- [X] Stripe / Razorpay payments — no monetization planned
- [X] Public user registration on story platform (V2)
- [X] Audio Narration — no MP3 audio narration uploads for stories
- [X] AI Story Enhancer — team writes all stories manually
- [X] AI Narration Generator — team records narration manually
- [X] AI Scene Illustrator — team creates all illustrations manually
- [X] AI Task Assistant — not needed
- [X] AI translation tool — team handles Meitei/English translation manually
- [X] AI content moderation — not needed
- [X] Autonomous AI story branching engine — team authors all stories manually
