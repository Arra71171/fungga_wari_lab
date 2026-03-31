# Phase 1 — Plan 4: Animations & Polishing

## Context
This plan implements: Framer Motion transitions for scene navigation and simple localStorage caching of reading progress to persist the active scene.
Dependencies: 1-3-PLAN

## Tasks

<task type="auto">
  <name>Configure Framer Motion</name>
  <files>apps/web/package.json, apps/web/components/story/StorySceneRenderer.tsx</files>
  <style-reference>apps/web/components/story/StoryPlayerShell.tsx</style-reference>
  <action>
    Run `pnpm add framer-motion` in the `apps/web` application.
    Wrap the `StorySceneRenderer` scene content inside an `<AnimatePresence>` and `motion.div`.
    Implement a smooth fade-and-slide up animation (cinematic fade-in) when the active scene changes.
  </action>
  <verify>Navigate between scenes and observe the slide-up fade.</verify>
  <done>Smooth scene transitions without layout jumping.</done>
</task>

<task type="auto">
  <name>Implement Progress Sync</name>
  <files>apps/web/components/story/StoryPlayerShell.tsx</files>
  <style-reference>apps/web/components/story/StoryPlayerShell.tsx</style-reference>
  <action>
    Add a `useEffect` hook to read from and sync to `localStorage` (key: `fungga_progress_[storySlug]`).
    When navigating to the story URL, optionally restore `activeSceneId` from `localStorage`.
    Save `activeSceneId` string whenever it changes.
  </action>
  <verify>Select a choice, hard refresh the page, see if scene persists.</verify>
  <done>Progress successfully survives page refreshes.</done>
</task>

## Acceptance Criteria
- [ ] Smooth cross-fade or slide animations occur when selecting a choice.
- [ ] Refreshing the page persists your current location in the story.
