# Phase 2 — Plan 3: Chapter & Scene Manager

## Context
This plan implements: Reordering and adding structural hierarchy to a specific story.
Dependencies: 2-2-PLAN

## Tasks

<task type="auto">
  <name>Story Edit View Shell</name>
  <files>apps/dashboard/app/stories/[id]/layout.tsx, apps/dashboard/app/stories/[id]/page.tsx</files>
  <style-reference>packages/ui/src/styles/globals.css</style-reference>
  <action>
    Create a detailed view for a specific story with tabs: "Overview", "Chapters", "Settings".
    "Overview" will show metadata stats.
    "Chapters" is the primary workspace for content.
  </action>
  <verify>Navigating to `/stories/[id]` loads the detailed workspace layout successfully.</verify>
</task>

<task type="auto">
  <name>Chapter Manager Component</name>
  <files>apps/dashboard/components/stories/ChapterManager.tsx</files>
  <style-reference>packages/ui/src/components/ChapterItem.tsx</style-reference>
  <action>
    List all chapters associated with the story relying on `api.chapters.getByStoryId`.
    Add UI to create a "New Chapter".
    Implement simple drag-and-drop or up/down arrows to reorder Chapters.
  </action>
  <verify>Newly created chapters appear instantly due to optimistic updates or subscriptions.</verify>
</task>

<task type="auto">
  <name>Scene Manager within Chapters</name>
  <files>apps/dashboard/components/stories/SceneManager.tsx</files>
  <style-reference>apps/dashboard/components/stories/ChapterManager.tsx</style-reference>
  <action>
    Within each chapter block, map over associated scenes.
    Provide a "New Scene" button triggering `api.scenes.create`.
    Each scene row links to `/stories/[id]/chapter/[chapterId]/scene/[sceneId]`.
  </action>
  <verify>Scenes nest visually under their respective chapters.</verify>
</task>

## Acceptance Criteria
- [ ] Stories act as root directories for Chapters.
- [ ] Chapters act as directories for Scenes.
- [ ] Hierarchy mutations accurately affect the Convex schema `order` fields.
