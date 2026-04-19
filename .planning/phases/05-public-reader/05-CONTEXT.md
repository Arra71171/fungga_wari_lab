# Phase 5 Context — Public Story Reader & Landing Fixes

## Scope

All pending tasks from the "check for pending tasks" session:

### P1 — Public Story Listing Page (`apps/web/app/stories/page.tsx`)
- A new page at `/stories` listing all published stories from Convex `api.stories.getAll`
- Grid layout with cover image, title, category, tags, language
- Each card links to `/story/[slug]`
- Empty state with a culturally resonant message
- Zen Brutalist aesthetic matching `apps/web/app/page.tsx`

### P2 — Wire Story Player to Real Data (`apps/web/app/story/[slug]/page.tsx`)
- `StoryCanvas` currently shows hardcoded placeholder text — must render real Tiptap `JSONContent` from the active scene
- `StorySidebar` must show real chapters and scenes from `storyData.chapters`
- Scene selection state: clicking a scene in the sidebar loads that scene's `tiptapContent` in the canvas
- `StoryRightPanel` can receive real `choices` from the active scene via `api.choices.getByScene` (or from preloaded full data)

### P3 — Fix Hero CTA Dead Link
- "Explore Network" button on `apps/web/app/page.tsx` has no href — add `href="/stories"`

### P4 — Fix Navbar Dead Anchors
- `apps/web/components/layout/Navbar.tsx` links to `#stories`, `#platform` etc. — update to real routes now that `/stories` exists

### P5 — Update `.planning/STATE.md`
- Reflect actual current state of the project (Phases 0-4 are all done)

## Design Decisions

- Story listing: full-bleed cover images, Zen Brutalist card grid, matching the landing page's `shadow-brutal` tokens
- Story player: keep the existing 3-panel cinematic layout — just wire data, don't rebuild
- Tiptap JSON rendering: use a simple block-by-block renderer (no Tiptap editor dependency in `apps/web` — just read JSON)
- Scene selection: local `useState` for `activeSceneId`, no URL param (keep it simple)
- Navbar: "Stories" → `/stories`, rest remain `#anchor` until sections exist

## Files Modified

| File | Action |
|---|---|
| `apps/web/app/stories/page.tsx` | CREATE — story listing page |
| `apps/web/app/page.tsx` | MODIFY — fix "Explore Network" href |
| `apps/web/components/layout/Navbar.tsx` | MODIFY — fix Stories link |
| `apps/web/components/story/StoryCanvas.tsx` | MODIFY — wire real tiptapContent |
| `apps/web/components/story/StorySidebar.tsx` | MODIFY — wire real chapters/scenes |
| `apps/web/app/story/[slug]/page.tsx` | MODIFY — add scene selection state |
| `.planning/STATE.md` | UPDATE — reflect completed phases |
