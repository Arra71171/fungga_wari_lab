# State — Fungga Wari Lab

## Current Position

- **Phase:** Post Phase 6 — Active hardening, testing, and feature expansion
- **Last Session:** 2026-04-24
- **Active App:** `apps/web` (full public reader + landing) + `apps/dashboard` (creator studio)

## Workspace Status

| Item | Status |
|---|---|
| Monorepo (pnpm + Turborepo) | ✅ Configured |
| `apps/web` (Next.js 15) | ✅ Full landing page, story reader, paywall, TTS, AI chatbot |
| `apps/dashboard` (Next.js 15) | ✅ Full creator workspace with auth, Tiptap editor, Kanban, chat |
| `packages/ui` | ✅ Full design system (buttons, cards, editor, kanban, marquee, MagneticButton, SplitText, TextMatrixRain, BorderBeam, EmberParticles, SectionDivider, ScrollReveal, WiseEpu, RichTextRenderer, PaywallOverlay, BrandLogo, etc.) |
| `packages/auth` | ✅ Clerk + Supabase provider + SyncUserStore |
| Supabase backend | ✅ Fully integrated (stories, chapters, scenes, users, tasks, messages, global_content, bookmarks, choices, interactions, assets) |
| Clerk auth | ✅ Integrated in dashboard + web |
| Cloudinary | ✅ Used for cover images, CTA backgrounds, hero videos; Tiptap inline upload pending |
| ElevenLabs TTS | ✅ George voice (free tier), play/pause in reader |
| WiseEpu AI chatbot | ✅ OpenRouter + Gemma-3-27b-it streaming |
| Stripe / Razorpay paywall | ✅ Lifetime access gate on chapters 2+ |
| Framer Motion | ✅ Installed and used in apps/web |
| Tiptap | ✅ Editor in apps/dashboard; JSON renderer in apps/web |
| GSAP ScrollTrigger | ✅ Used for bento grid + capability cells animations |
| TestSprite E2E | ✅ 15/15 high-priority web tests run; 11 pass, 1 fixed (TC005), 3 paywall-gated |

## Completed Phases

| Phase | Description | Status |
|---|---|---|
| 0 | Foundation & Design System (OKLCH tokens, Zen Brutalist, shared UI) | ✅ Done |
| 1 | Story Platform — Reader Experience (3-panel cinematic layout) | ✅ Done |
| 2 | Creator Dashboard — Content Management (Tiptap, story CRUD, publish) | ✅ Done |
| 3 | Team Workspace — Kanban, Chat, Tasks, Real-time | ✅ Done |
| 4 | Global Identity Sync (Clerk ↔ Supabase auth.uid() alignment) | ✅ Done |
| 5 | Public Story Reader (landing, story listing, cinematic player, wired CTA) | ✅ Done |
| 5.1 | Stripe paywall integration + Lifetime Access gate | ✅ Done |
| 5.2 | ElevenLabs TTS (George voice) + AI narration player | ✅ Done |
| 5.3 | WiseEpu AI chatbot (OpenRouter, streaming, lore-keeper persona) | ✅ Done |
| 5.4 | Cinematic reader theme audit + OKLCH token alignment | ✅ Done |
| 5.5 | Meitei brand logo (ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ) integration | ✅ Done |
| 5.6 | Chapter audio narration file upload support | ✅ Done |
| 6.0 | Security hardening (Zod validation, RLS audit, identity alignment) | ✅ Done |
| 6.1 | Accessibility fixes (ARIA attrs on progress bars) | ✅ Done |

## Key Decisions

- **USER-DECIDED:** No mobile app (Expo excluded from scope)
- **USER-DECIDED:** Design reference = FoxStory screenshot (3-panel cinematic dark layout)
- **USER-DECIDED:** Platform name = "Fungga Wari Lab" (Meetei Fireplace Folk Stories)
- **AI-SUGGESTED:** Use Supabase for real-time backend (chat, tasks, stories) ✅ Implemented
- **AI-SUGGESTED:** Use Clerk for auth (team roles: admin/editor/viewer) ✅ Implemented
- **AI-SUGGESTED:** Use Cloudinary for media (illustrations + audio) ✅ Partially implemented
- **AI-SUGGESTED:** Two apps: `apps/web` (reader) + `apps/dashboard` (creator workspace) ✅ Done
- **DESIGN:** Zen Brutalist — amber/ochre/ember primary, OKLCH design tokens, font-heading/mono/display
- **ARCHITECTURE:** `teamMembers` table merged into `users` table (role field added)
- **ARCHITECTURE:** `SyncUserStore` component silently syncs Clerk user into Supabase on every login
- **ARCHITECTURE:** `auth.uid()` used for RLS, not `auth.jwt()->>'sub'` (Supabase native auth)
- **PAYWALL:** Lifetime access (₹899) gates all chapters except the first; `has_lifetime_access` on `users` table

## Next Steps

Priority order for Phase 7:

1. **Tiptap image upload to Cloudinary** — wire `onImageUpload` in scene editor to Cloudinary signed upload
2. **Admin role management UI** — settings page to promote users from viewer → editor → admin
3. **Full-text server-side search** — Supabase `tsvector` search index already exists on `stories` table (`search_vector` column); expose as search action
4. **Reader scene bookmark persistence** — save `{story_id, chapter_id, scene_id}` to Supabase `bookmarks` table for signed-in readers
5. **Dashboard TestSprite** — bootstrap and run E2E tests on `apps/dashboard` (port 3000)
6. **Production test run** — run all 29 TestSprite web tests in production mode (`pnpm build && pnpm start`)

## Blockers

None currently.
