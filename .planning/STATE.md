# State — Fungga Wari Lab

## Current Position

- **Phase:** Phase 5 Complete — Public Story Reader
- **Last Session:** 2026-04-01
- **Active App:** `apps/web` (fully functional public reader)

## Workspace Status

| Item | Status |
|---|---|
| Monorepo (pnpm + Turborepo) | ✅ Configured |
| `apps/web` (Next.js 15) | ✅ Full landing page + story reader |
| `apps/dashboard` (Next.js 15) | ✅ Full creator workspace with auth |
| `packages/ui` | ✅ Full design system (buttons, cards, editor, kanban, marquee, etc.) |
| `packages/auth` | ✅ Clerk + Supabase provider + SyncUserStore |
| Supabase backend | ✅ Fully integrated (stories, chapters, scenes, users, tasks, messages) |
| Clerk auth | ✅ Integrated in dashboard + web |
| Cloudinary | ❌ Not yet integrated (image upload pending) |
| Framer Motion | ✅ Installed and used in apps/web |
| Tiptap | ✅ Editor in apps/dashboard; JSON renderer in apps/web |

## Completed Phases

| Phase | Description | Status |
|---|---|---|
| 0 | Foundation & Design System | ✅ Done |
| 1 | Story Platform — Reader Experience | ✅ Done |
| 2 | Creator Dashboard — Content Management | ✅ Done |
| 3 | Team Workspace — Kanban, Chat, Tasks | ✅ Done |
| 4 | Global Identity Sync (Clerk ↔ Supabase users table) | ✅ Done |
| 5 | Public Story Reader (stories listing, wired player, CTA links) | ✅ Done |

## Key Decisions

- **USER-DECIDED:** No mobile app (Expo excluded from scope)
- **USER-DECIDED:** Design reference = FoxStory screenshot (3-panel cinematic dark layout)
- **USER-DECIDED:** Platform name = "Fungga Wari Lab" (Meetei Fireplace Folk Stories)
- **AI-SUGGESTED:** Use Supabase for real-time backend (chat, tasks, stories)
- **AI-SUGGESTED:** Use Clerk for auth (team roles: admin/editor/viewer)
- **AI-SUGGESTED:** Use Cloudinary for media (illustrations + audio) — PENDING
- **AI-SUGGESTED:** Two apps: `apps/web` (reader) + `apps/dashboard` (creator workspace)
- **DESIGN:** Zen Brutalist — deep cobalt blue primary, oklch design tokens, DM Sans heading, JetBrains Mono
- **ARCHITECTURE:** `teamMembers` table merged into `users` table (role field added)
- **ARCHITECTURE:** `SyncUserStore` component silently syncs Clerk user into Supabase on every login

## Next Steps

Priority order for Phase 6:

1. **Cloudinary image upload** — wire `onImageUpload` in the Tiptap editor to a Supabase/Cloudinary upload action
2. **Admin role management** — UI in Settings to promote users from viewer → editor → admin
3. **Story description field** — add `description` field to the `stories` schema for reader-facing summaries
4. **Reader app auth** — allow readers to bookmark scenes (requires minor Clerk setup in `apps/web`)
5. **Full-text search** — Supabase search index on story title + content

## Blockers

None currently.
