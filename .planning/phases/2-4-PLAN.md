# Phase 2 — Plan 4: Rich Text Editor & Convex Storage

## Context
This plan implements: Tiptap integration for complex Meetei folk story formatting, including dialogues and Convex Storage media uploading capabilities.
Dependencies: 2-3-PLAN

## Tasks

<task type="auto">
  <name>Integrate Tiptap Editor Core</name>
  <files>apps/dashboard/components/editor/TiptapEditor.tsx</files>
  <style-reference>packages/ui/src/components/DialogueBlock.tsx</style-reference>
  <action>
    Install `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`.
    Implement a minimalist editor toolbar.
    Extend Tiptap to support custom node parsing for `Dialogue` injections.
  </action>
  <verify>Typing in the editor correctly builds `JSON` structures mapped to our schema.</verify>
</task>

<task type="auto">
  <name>Convex Storage Upload Widget</name>
  <files>apps/dashboard/components/editor/ImageUpload.tsx, convex/upload.ts</files>
  <style-reference>apps/dashboard/package.json</style-reference>
  <action>
    Implement an image uploader widget button within the Tiptap toolbar.
    Create a `generateUploadUrl` mutation in `convex/upload.ts`.
    Upload files to Convex Storage and retrieve the `storageId`.
    Create a `getFileUrl` query to convert `storageId` into an accessible URL for the reader platform.
  </action>
  <verify>Uploading a test image saves it to Convex Storage and returns a valid URL.</verify>
</task>

<task type="auto">
  <name>Scene Editor Application State</name>
  <files>apps/dashboard/app/stories/[id]/scene/[sceneId]/page.tsx</files>
  <style-reference>apps/dashboard/components/editor/TiptapEditor.tsx</style-reference>
  <action>
    Combine the Scene data fetching with the `TiptapEditor`.
    Implement an auto-save or debounced manual "Save Scene" button invoking `api.scenes.updateBlocks`.
  </action>
  <verify>Saving content reflects immediately when navigating to the Public Reader App.</verify>
</task>

## Acceptance Criteria
- [ ] Tiptap outputs clean, normalized JSON aligned with `blocks` array in `convex/schema.ts`.
- [ ] Media uploads securely to Convex Storage.
- [ ] Full lifecycle allows writing, saving, and previewing scenes.
