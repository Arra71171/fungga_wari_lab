# Phase 1 — Plan 3: Scene Renderer & Interactivity

## Context
This plan implements: Center canvas block rendering (text, image, character dialogue blocks), Right panel choice buttons, and basic React state transition for scenes.
Dependencies: 1-2-PLAN

## Tasks

<task type="auto">
  <name>Create Basic Block Renderer</name>
  <files>apps/web/components/story/StorySceneRenderer.tsx</files>
  <style-reference>packages/ui/src/components/DialogueBlock.tsx</style-reference>
  <action>
    Create a component that takes a `scene` object (from Convex).
    Map over `scene.blocks` and render appropriate UI based on `block.type` ("text", "image", "dialogue").
    Use `<DialogueBlock>` from `@workspace/ui` for "dialogue" type.
    Render rich text paragraphs with `.prose` tailwind typography classes if needed.
    Render images with custom styling (`<img />` with object-cover, rounded edges).
  </action>
  <verify>Check renderer visually in browser.</verify>
  <done>All block types render perfectly according to the schema.</done>
</task>

<task type="auto">
  <name>Implement Right Panel Choices</name>
  <files>apps/web/components/story/StoryRightPanel.tsx</files>
  <style-reference>packages/ui/src/components/ChoiceButton.tsx</style-reference>
  <action>
    Modify `StoryRightPanel` to display a "What to do next?" section if `choices` are available for the current scene.
    Fetch choices by scene ID from Convex or pass them as props.
    Map choices to `@workspace/ui` `ChoiceButton` components.
    When a choice is clicked, trigger a callback to update `activeSceneId` in the `StoryPlayerShell`.
  </action>
  <verify>Clicking a choice updates the current scene correctly.</verify>
  <done>Choices correctly render and trigger state change.</done>
</task>

## Acceptance Criteria
- [ ] Center canvas perfectly renders text, images, and dialogue blocks according to the current active scene.
- [ ] Right panel correctly renders interactive choice buttons.
- [ ] Clicking a choice dynamically updates the rendering to the next scene.
