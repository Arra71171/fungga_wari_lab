# Phase 1 — Plan 2: 3-Panel Cinematic Layout Shell

## Context
This plan implements: Story player page (`/story/[slug]`) — full 3-panel cinematic layout via `StoryPlayerShell.tsx`.
Dependencies: 1-1-PLAN

## Tasks

<task type="auto">
  <name>Create Basic Player Routing</name>
  <files>apps/web/app/story/[slug]/page.tsx</files>
  <style-reference>apps/web/app/page.tsx</style-reference>
  <action>
    Create the dynamic route `[slug]/page.tsx`.
    Fetch the story by slug server-side or pass the slug to a client component.
    Create a wrapper `<StoryPlayerShell storySlug={params.slug} />`.
  </action>
  <verify>Check if routing to `/story/test-slug` renders without 404.</verify>
  <done>Route resolves correctly.</done>
</task>

<task type="auto">
  <name>Implement 3-Panel Layout Shell</name>
  <files>apps/web/components/story/StoryPlayerShell.tsx, apps/web/components/story/StorySidebar.tsx, apps/web/components/story/StoryRightPanel.tsx</files>
  <style-reference>packages/ui/src/components/RightPanelSection.tsx</style-reference>
  <action>
    Create a client component `StoryPlayerShell` that creates a 100vh CSS Grid layout with 3 columns (e.g., `grid-cols-[300px_1fr_300px]`).
    Implement `StorySidebar` on the left (bg-background, border-r border-border).
    Implement Content Canvas in the center (bg-background/95).
    Implement `StoryRightPanel` on the right (bg-background, border-l border-border) utilizing `RightPanelSection`.
    Setup basic React state to track `activeSceneId`.
  </action>
  <verify>Ensure left and right sidebars collapse gracefully on mobile (hide left/right on small screens, show center canvas only).</verify>
  <done>3-panel layout renders perfectly with the dark theme and brand colors.</done>
</task>

<task type="auto">
  <name>Sidebar Components (Chapters & Progress)</name>
  <files>apps/web/components/story/StorySidebar.tsx</files>
  <style-reference>packages/ui/src/components/ChapterItem.tsx</style-reference>
  <action>
    Update `StorySidebar` to display hardcoded or fetched chapters using `ChapterItem`.
    Include the `ProgressBar` component to show current reading completion.
  </action>
  <verify>Check visual rendering in browser.</verify>
  <done>Left panel displays chapters cleanly using shared UI components.</done>
</task>

## Acceptance Criteria
- [ ] `/story/[slug]` routing works.
- [ ] 3-panel grid layout spans the full height of the viewport.
- [ ] `StorySidebar` uses `ChapterItem` and `ProgressBar`.
- [ ] `StoryRightPanel` uses `RightPanelSection`.
