## Architecture, SEO & UI Hygiene

This PR ships all outstanding fixes from the recent development session.

### What's Inside:
- **Dashboard Refactors:** Removed the duplicate `motion` package. Refactored `tsconfig.json` to extend from the workspace config.
- **Web App Performance:** Migrated `apps/web/app/page.tsx` to a Server Component, moving interactive sections to `client-islands.tsx`.
- **API Security:** Added rate limiters to `api/wise-epu` and `api/tts` endpoints.
- **UI System Strictness:** Injected `data-slot` attributes into 17 remaining primitive UI components.

### Verification:
- [x] All `pnpm run typecheck` tests pass across `web`, `dashboard`, and `ui`.
- [x] UI component syntax matches the Zen Brutalist guidelines.
