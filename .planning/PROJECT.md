# Fungga Wari Lab — Project Definition

## Vision

**Fungga Wari** (ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ) — Meetei for "Fireplace Folk Stories" — is a platform where wise grandparents pass down stories to children gathered around the hearth. This digital platform preserves, publishes, and brings those stories to life through rich multimedia, AI-enhanced narration, and a collaborative creator workspace.

The system is **two products in one**:
1. **The Story Platform** (`apps/web`) — a cinematic, dark-themed public reader where Meetei folk stories are experienced with illustrations, branching paths, and AI storytelling assistance.
2. **The Creator Dashboard** (`apps/dashboard`) — a full-featured internal workspace for the Fungga Wari team: upload stories + illustrations, manage content, assign tasks to team members, track progress, and use AI tools to enhance content.

## Core Identity

| Property | Value |
|---|---|
| Brand Name | Fungga Wari Lab |
| Language / Culture | Meitei (Manipuri) / Northeast India |
| Aesthetic | Dark, warm, firelight-inspired. Deep amber/ochre accents. Like sitting around a fire at night. |
| Reading Model | Cinematic story player (FoxStory-inspired: 3-column layout — chapters, story canvas, progress/tools) |
| Design Reference | FoxStory screenshot: dark sidebar + central content + right panel with AI tools |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) — Server Components default |
| Monorepo | pnpm + Turborepo |
| UI Library | `@workspace/ui` (shadcn/radix-lyra, Tailwind v4, OKLCH tokens) |
| Language | TypeScript (strict) |
| Icons | Lucide React ONLY |
| Fonts | DM Sans (heading), Geist (body), JetBrains Mono (code) |
| Styling | Tailwind v4 + semantic OKLCH CSS tokens — NO hardcoded colors |
| Backend | Convex (real-time, serverless — replaces API routes for data) |
| Auth | Convex Auth (built-in — email/password + OAuth, roles via Convex schema) |
| Media Storage | Cloudinary (illustration uploads) |
| AI | Vercel AI SDK + OpenAI GPT-4.1 (narration, story enhancement, task assist) |
| Animations | Framer Motion |
| Rich Text Editor | Tiptap (for CMS story content editing) |
| State (Client) | React useState/useReducer + Zustand for story playback only |
| Realtime Chat | Convex live queries (team workspace chat) |

## Key Constraints

- **AGENTS.md is law** — every component must follow the strict monorepo, component, color, and import rules
- **Shared-first UI** — all reusable UI primitives go to `packages/ui/src/components/`
- **No mobile app** — web-only (per project-planning.md: "we will not build mobile app")
- **Dark mode is primary** — the storytelling experience should be deeply cinematic and warm
- **Cultural authenticity** — Meitei folklore, language elements, and visual motifs are core to the brand
- **Design akin to FoxStory screenshot** — 3-panel layout: left sidebar (chapters/navigation), center canvas (story content), right panel (progress, AI tools)
- **No barrel imports** — always import directly from source files
- **Named exports only** — no default exports except Next.js pages/layouts

## Target Users

| User Type | Description |
|---|---|
| Story Readers | Public visitors discovering Meetei folk stories |
| Content Creators | Team members uploading stories and illustrations |
| Team Admins | Manage team, assign tasks, track progress, use AI tools |
| AI-Assisted Authors | Team members using AI to enhance, translate, or narrate stories |
