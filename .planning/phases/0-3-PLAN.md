# Phase 0 — Plan 3: Dashboard App Initialization

## Context
This plan implements: Setup `apps/dashboard` as a new Next.js 15 app within the turborepo monorepo and configures the basic layout, conforming to the structural foundation.
Dependencies: None

## Tasks

<task type="auto">
  <name>Initialize Dashboard Next.js App</name>
  <files>apps/dashboard/package.json, apps/dashboard/app/layout.tsx</files>
  <style-reference>apps/web/package.json</style-reference>
  <action>
    Use Turborepo/Next.js to locally scaffold `apps/dashboard`. Since it is inside a monorepo, clone or copy the `apps/web` basic structure into `apps/dashboard`.
    Update `apps/dashboard/package.json` with `"name": "dashboard"`.
    Ensure `apps/dashboard` uses Next.js 15, `react`, `react-dom`, and is wired to use `@workspace/ui`, `@workspace/eslint-config`, and `@workspace/typescript-config`.
    Modify the `pnpm-workspace.yaml` if necessary to include `apps/*` (already true presumably).
  </action>
  <verify>Run `pnpm install` then `pnpm --filter dashboard run build` to verify the new app complies with the monorepo.</verify>
  <done>apps/dashboard builds standalone.</done>
</task>

<task type="auto">
  <name>Configure Tailwind and CSS in Dashboard</name>
  <files>apps/dashboard/app/globals.css, apps/dashboard/components/providers.tsx</files>
  <style-reference>apps/web/app/globals.css</style-reference>
  <action>
    Create `apps/dashboard/app/globals.css` with Tailwind v4 setup. Just import `@workspace/ui/globals.css` as `apps/web` does.
    Create a basic `Providers` component wrapping `next-themes` (ThemeProvider) so the dashboard can switch to `.dark` class. Ensure `forceTheme="dark"` or user-toggled.
  </action>
  <verify>Ensure `globals.css` correctly maps tokens.</verify>
  <done>Tailwind v4 layout applies correctly.</done>
</task>


## Acceptance Criteria
- [ ] `apps/dashboard` exists and is a functioning Next.js 15 app router.
- [ ] The dashboard imports the shared components and CSS from `@workspace/ui`.
- [ ] Build process verifies without type-checking errors.
