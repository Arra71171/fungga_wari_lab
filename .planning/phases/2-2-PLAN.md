# Phase 2 — Plan 2: Story Content Management (CRUD)

## Context
This plan implements: Story listing, creation forms, and backend integration for uploading story metadata.

## Tasks

<task type="auto">
  <name>Stories List View</name>
  <files>apps/dashboard/app/stories/page.tsx</files>
  <style-reference>apps/web/app/page.tsx</style-reference>
  <action>
    Create a data table or styled grid showing all stories created by the workspace.
    Include fields like Status (Draft/Published), Category, Last Modified, and Actions.
  </action>
  <verify>Table renders stories fetched from `api.stories.getAll`.</verify>
</task>

<task type="auto">
  <name>Story Creation & Metadata Form</name>
  <files>apps/dashboard/components/stories/StoryForm.tsx, apps/dashboard/app/stories/new/page.tsx</files>
  <style-reference>packages/ui/src/styles/globals.css</style-reference>
  <action>
    Create a form to input Story Title, Category (Folk/Legend/Myth), Language, and a Cover Image URL.
    Connect form submission to a new Convex mutation `api.stories.create`.
    Redirect to `/stories/[id]` upon successful creation.
  </action>
  <verify>Submitting the form creates a new story entry in Convex and redirects the user.</verify>
</task>

## Acceptance Criteria
- [ ] Creators can view all stories in the database.
- [ ] Creators can initiate a new story with valid metadata.
