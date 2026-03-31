# Phase 2 — Plan 1: Dashboard Auth & App Shell

## Context
This plan implements: Convex Auth setup, Login screen, and the foundational Dashboard layout (Sidebar + Header) for `apps/dashboard`.

## Tasks

<task type="auto">
  <name>Install & Configure Convex Auth</name>
  <files>convex/auth.ts, convex/http.ts, package.json</files>
  <style-reference>packages/ui/src/styles/globals.css</style-reference>
  <action>
    Install `@convex-dev/auth` in `apps/dashboard`.
    Setup `convex/auth.ts` using `@convex-dev/auth` with simple email/password or magic links.
    Setup routing in `convex/http.ts`.
  </action>
  <verify>Auth initialization works without breaking existing Convex connections.</verify>
</task>

<task type="auto">
  <name>Login Screen & Auth Gates</name>
  <files>apps/dashboard/app/login/page.tsx, apps/dashboard/components/AuthGate.tsx</files>
  <style-reference>@workspace/ui/components/ui/button.tsx</style-reference>
  <action>
    Create a polished `/login` page using brand tokens.
    Implement an `<AuthGate>` component that redirects unauthenticated users resolving via Convex `useConvexAuth` to `/login`.
  </action>
  <verify>Navigating to `/` redirects to `/login` if not authenticated.</verify>
</task>

<task type="auto">
  <name>Dashboard App Shell</name>
  <files>apps/dashboard/components/layout/Sidebar.tsx, apps/dashboard/app/layout.tsx</files>
  <style-reference>packages/ui/src/components/RightPanelSection.tsx</style-reference>
  <action>
    Implement a left sidebar navigation containing links to "Stories", "Tasks", "Team", "Settings".
    Wrap the authenticated children in a CSS Grid application shell.
  </action>
  <verify>Sidebar renders correctly on desktop and collapses/abstracts on mobile.</verify>
</task>

## Acceptance Criteria
- [ ] Users must log in via Convex Auth to see dashboard content.
- [ ] The dashboard features a clean, firelight-inspired sidebar tracking navigation state.
