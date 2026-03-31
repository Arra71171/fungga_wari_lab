# Phase 1 — Plan 1: Home Page & Convex Integration

## Context
This plan implements: Story home page (`/`) — story grid with cover art, categories, metadata + Convex Provider setup.
Dependencies: none

## Tasks

<task type="auto">
  <name>Setup Convex Provider</name>
  <files>apps/web/components/convex-provider.tsx, apps/web/app/layout.tsx</files>
  <style-reference>packages/ui/src/styles/globals.css</style-reference>
  <action>
    Create a `ConvexClientProvider` component using `convex/react` and `ConvexProvider`.
    Wrap the `children` in `apps/web/app/layout.tsx` with this provider. 
    Ensure `"use client"` directive is added to the provider.
  </action>
  <verify>Check apps/web/app/layout.tsx has ConvexClientProvider imported and used.</verify>
  <done>Next.js app compiles without errors and Convex client is available.</done>
</task>

<task type="auto">
  <name>Create Stories Queries</name>
  <files>convex/stories.ts</files>
  <style-reference>convex/schema.ts</style-reference>
  <action>
    Export a `getAll` query that returns all published stories.
    Export a `getBySlug` query that returns a specific story by its slug.
    Use `query` from `./_generated/server` and strict validation where required.
  </action>
  <verify>Run `pnpm run typecheck` to verify no TypeScript issues.</verify>
  <done>Queries are queryable via `useQuery(api.stories.getAll)`.</done>
</task>

<task type="auto">
  <name>Implement Story Home Page</name>
  <files>apps/web/app/page.tsx</files>
  <style-reference>packages/ui/src/components/StoryCard.tsx</style-reference>
  <action>
    Refactor the main page to fetch stories using `useQuery(api.stories.getAll)`.
    Display stories in a responsive CSS Grid using `gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
    Use the shared `StoryCard` component from `@workspace/ui`.
    Handle loading states (display some skeleton or simple loading text).
    Wrap the component in `"use client"` since it consumes Convex hooks directly, or separate into a client component.
  </action>
  <verify>Run `pnpm run dev` and check `http://localhost:3000/`.</verify>
  <done>Home page renders a grid of StoryCards.</done>
</task>

## Acceptance Criteria
- [ ] Convex Provider is wrapping the app.
- [ ] `convex/stories.ts` queries are strongly typed and working.
- [ ] `apps/web/app/page.tsx` displays the grid of `StoryCard`s.
- [ ] Oklch brand tokens are respected.
