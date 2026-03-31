# Phase 0 — Plan 4: Infrastructure & Data Schema

## Context
This plan implements: Setup and configure Clerk + Convex across `apps/web` and `apps/dashboard`, plus defining the full Data schema for V1 in `convex/schema.ts` (R11, R23, R24).
Dependencies: Phase 0 Plan 3 (apps/dashboard initialization)

## Tasks

<task type="auto">
  <name>Configure Convex and Clerk</name>
  <files>apps/web/components/providers.tsx, apps/dashboard/components/providers.tsx, packages/ui/package.json</files>
  <style-reference>apps/web/package.json</style-reference>
  <action>
    Add `convex` and `@clerk/nextjs` to the necessary applications if not already set, along with `convex-helpers` and `convex-clerk` integrations if needed. Or simply set up the standard ConvexProviderWithClerk.
    Create a `ConvexClientProvider` in `@workspace/ui` or copy it to both `apps/web` and `apps/dashboard` to wrap the `RootLayout` in `<ClerkProvider><ConvexProviderWithClerk>...`.
    Ensure the `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variables are required.
  </action>
  <verify>Provider builds and layout renders without errors.</verify>
  <done>Convex and Clerk context wrappers are actively present on both apps.</done>
</task>

<task type="auto">
  <name>Define Convex V1 Schema</name>
  <files>apps/web/convex/schema.ts, apps/web/convex/auth.config.ts</files>
  <style-reference>docs/requirements.md</style-reference>
  <action>
    Define the Convex schema for stories, chapters, scenes, tasks, messages, and users.
    Use `defineSchema` and `defineTable`.
    - `users`: (identity mapping from Clerk): role, email, name, avatar
    - `stories`: title, authorId, coverImage (Cloudinary URL), status (draft/published), category, language, slug.
    - `chapters`: storyId, title, orderIndex.
    - `scenes`: chapterId, content (JSON/tiptap), orderIndex, illustration (Cloudinary URL), choices (array of objects pointing to next scene).
    - `tasks`: title, description, status (Todo/InProgress/Review/Done), priority, assigneeId, dueDate.
    - `messages`: workspace scoped chat logs.
    Create `auth.config.ts` referencing Clerk environment parameters for verifying tokens.
  </action>
  <verify>Run `npx convex dev --until-success` or `pnpm --filter web dlx convex dev` (assuming convex is installed there) to sync the schema.</verify>
  <done>Convex schema validates successfully against Convex cloud.</done>
</task>

## Acceptance Criteria
- [ ] Apps correctly wrap Next.js in Convex and Clerk providers.
- [ ] Schema accurately maps to `REQUIREMENTS.md` V1 specs.
- [ ] TypeScript types generate properly representing the tables.
