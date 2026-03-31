# Phase 0 — Plan 2: Advanced UI Primitives

## Context
This plan implements: Advanced shared UI components (`StoryCard`, `ChapterItem`, `SceneBlock`, `TaskCard`) for Phase 0 (R26). These are standard components that assemble the basic primitives into functional units for the web and dashboard apps.
Dependencies: Phase 0 Plan 1 (Badge, AvatarBadge, ProgressBar)

## Tasks

<task type="auto">
  <name>Create StoryCard Component</name>
  <files>packages/ui/src/components/story-card.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create a `StoryCard` component using `cva` and `cn`.
    Accepts props: `title`, `author`, `category`, `coverImage`, `language`, and `orientation` (`horizontal` | `vertical`).
    Use the `shadow-brutal` offset token on hover to reflect Brutalist design.
    If `coverImage` is provided, use Next.js `next/image` or a standard styled responsive image fallback.
    Apply semantic colors (e.g. `bg-card text-card-foreground`).
  </action>
  <verify>Check for proper React component and cva usage.</verify>
  <done>StoryCard component exports successfully and uses proper brutalist shadow tokens and image tags.</done>
</task>

<task type="auto">
  <name>Create ChapterItem Component</name>
  <files>packages/ui/src/components/chapter-item.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create a `ChapterItem` component representing an individual chapter in the sidebar or navigation tree.
    Takes `title`, `number`, `isActive`, and `isCompleted`.
    When `isActive`, apply `bg-primary/10 border-l-4 border-primary text-primary`.
    When inactive, simple `text-muted-foreground hover:bg-secondary/50` style.
  </action>
  <verify>Ensure variants for states are correctly mapped using `cva`.</verify>
  <done>Component created rendering an interactive chapter list item.</done>
</task>

<task type="auto">
  <name>Create SceneBlock Component</name>
  <files>packages/ui/src/components/scene-block.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create a `SceneBlock` component representing a paragraph or block of narrative inside the reader content.
    For dialogue, use the new `blockquote` styling natively or via specialized `type="dialogue"` prop.
    Base text should use `text-lg leading-relaxed font-sans` for readability, aligning with the "Zen" layout.
    No card borders — simply pure text spacing blocks.
  </action>
  <verify>Ensure text styling matches editorial design vibe with proper tracking and line height spacing.</verify>
  <done>Text blocks correctly render for standard prose and dialogue prose.</done>
</task>

<task type="auto">
  <name>Create TaskCard Component</name>
  <files>packages/ui/src/components/task-card.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create a `TaskCard` component for the dashboard Kanban board.
    Takes `title`, `status`, `assignee` (avatar), `priority`, and `dueDate`.
    Include a top-level border and muted background: `border border-border bg-card rounded-md shadow-sm`.
    Should display `Badge` for status/priority and `AvatarBadge` for the assignee.
    Must also include offset hover `hover:shadow-brutal-sm hover:-translate-y-0.5` interaction.
  </action>
  <verify>Component correctly imports previously made Badge and AvatarBadge.</verify>
  <done>TaskCard is rendered as a draggable-ready item with expected data fields.</done>
</task>

## Acceptance Criteria
- [ ] `StoryCard`, `ChapterItem`, `SceneBlock`, and `TaskCard` are in `@workspace/ui`.
- [ ] They correctly import internal `@workspace/ui` types and other components.
- [ ] No hardcoded values.
