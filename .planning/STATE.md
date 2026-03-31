# State — Fungga Wari Lab

## Current Position

- **Phase:** Not started (awaiting roadmap approval)
- **Last Session:** 2026-03-29
- **Active App:** `apps/web` (Next.js 15 shell exists, minimal)
- **Dashboard App:** Not created yet (`apps/dashboard` to be scaffolded in Phase 0)

## Workspace Status

| Item | Status |
|---|---|
| Monorepo (pnpm + Turborepo) | ✅ Configured |
| `apps/web` (Next.js 15) | ✅ Shell exists, minimal |
| `packages/ui` | ✅ Exists — `button.tsx` + `globals.css` design tokens |
| `apps/dashboard` | ❌ Does not exist yet |
| Convex backend | ❌ Not integrated |
| Clerk auth | ❌ Not integrated |
| Cloudinary | ❌ Not integrated |
| Framer Motion | ❌ Not installed |
| Tiptap | ❌ Not installed |

## Key Decisions

- **USER-DECIDED:** No mobile app (Expo excluded from scope)
- **USER-DECIDED:** Design reference = FoxStory screenshot (3-panel cinematic dark layout)
- **USER-DECIDED:** Platform name = "Fungga Wari Lab" (Meetei Fireplace Folk Stories)
- **AI-SUGGESTED:** Use Convex for real-time backend (chat, tasks, stories)
- **AI-SUGGESTED:** Use Clerk for auth (team roles: admin/editor/viewer)
- **AI-SUGGESTED:** Use Cloudinary for media (illustrations + audio)
- **AI-SUGGESTED:** Two apps: `apps/web` (reader) + `apps/dashboard` (creator workspace)
- **DESIGN:** Dark mode is primary — deep dark background + warm amber/ochre brand accent (firelight)
- **DESIGN:** Extend design system with Fungga Wari brand tokens in `globals.css`
- **RULE:** All shared UI goes to `packages/ui/src/components/` — NEVER in `apps/web/components/` unless app-specific

## Blockers

None currently. Awaiting roadmap approval.

## Next Steps

1. Get user approval on ROADMAP.md
2. Run `/gsd-discuss-phase` for Phase 0 to capture design preferences
3. Begin Phase 0: Foundation & Design System
