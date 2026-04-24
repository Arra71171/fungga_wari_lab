# Architecture Guidelines

This document outlines the architectural decisions, structure, and boundaries of the Fungga Wari Lab monorepo.

## 🏗 Monorepo Structure

We use Turborepo to manage our packages and applications.

```
fungga-wari-lab/
├── apps/
│   ├── web/          # Public-facing application (Next.js App Router)
│   └── dashboard/    # Internal Creator Studio (Next.js App Router)
├── packages/
│   ├── ui/           # Shared UI components and styles
│   ├── auth/         # Shared authentication context/wrappers
│   ├── eslint-config/# Shared linting rules
│   └── typescript-config/ # Shared type checking rules
└── supabase/         # Database migrations and seed data
```

## 🔌 Technology Stack

- **Framework:** Next.js (App Router, Server Components default)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **Storage/CDN:** Cloudinary
- **Styling:** Tailwind CSS v4 (OKLCH tokens)
- **Components:** Shadcn/UI (radix-lyra)

## ⚖️ Core Tenets (Iron Laws)

1. **No Mixed State Management**
   - Use Server Actions / Server Components for data mutations and fetching.
   - Use local `useState`/`useReducer` for UI state.
   - Global client state libraries (Redux, Zustand) are strictly forbidden unless explicitly approved.

2. **Supabase First**
   - All backend data lives in Supabase.
   - All database interactions must use `@supabase/ssr` or `supabase-js`.
   - Convex is legacy. Any lingering convex code is for reference only and must not be used in new development.

3. **Strict Type Safety**
   - The TypeScript compiler runs in `strict` mode.
   - `any` is strictly forbidden. Use `unknown` and type-narrow.
   - `@ts-ignore` must be accompanied by a documented reason and a plan for removal.

4. **Zero-Tolerance UI Reuse**
   - If a component is used in both `web` and `dashboard`, it **must** live in `packages/ui`.
   - The `apps/web/components` and `apps/dashboard/components` directories are strictly for app-specific, non-reusable layout wrappers.

## 🎨 Design System

**Source of truth:** `packages/ui/src/styles/globals.css`

All design tokens are defined in `:root` and `.dark` using **OKLCH**. Every component consumes these tokens via Tailwind utilities — never raw CSS values.

### Color Architecture

- **Colors:** OKLCH exclusively. Hardcoded HEX, RGB, HSL, or standard Tailwind colors (e.g., `text-red-500`) are forbidden.
- **Portraits:** Story media must follow `aspect-[3/4]` (`aspect-portrait` utility). No `aspect-video` or `aspect-square`.
- **Shadows:** Zen Brutalist drop-shadows via `shadow-brutal` and `shadow-brutal-sm` tokens.

### Cinematic Reader Token Subsystem

The reader uses a dedicated `--cinematic-*` token family that provides theme-adaptive surfaces:

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--cinematic-bg` | `oklch(0.97 0.015 75)` | `oklch(0.10 0.02 50)` | Reading surface |
| `--cinematic-panel` | `oklch(0.93 0.018 75)` | `oklch(0.14 0.03 50)` | Sidebar/panel surfaces |
| `--cinematic-text` | `oklch(0.10 0.03 45)` | `oklch(0.90 0.02 60)` | Body text |
| `--cinematic-border` | `oklch(0.75 0.025 65)` | `oklch(1 0 0 / 8%)` | Warm borders |

**Invariants:**
1. All cinematic surfaces share **one hue family** (±2 degrees)
2. Chroma increases progressively: `bg < panel < border`
3. Lightness decreases progressively (light mode) or increases (dark mode)
4. Light-mode borders use warm-toned oklch values, **never** cold black opacity
5. Nested inset elements use `bg-cinematic-bg/N` inside panel parents — never panel-on-panel

### Custom Utilities (defined in `globals.css`)

| Utility | Purpose |
|---|---|
| `illustration-gradient-overlay` | Always-dark gradient for chapter illustration fades |
| `scanline-overlay` | CRT-style horizontal lines for AI narration visualiser |
| `aspect-portrait` | `aspect-ratio: 3/4` for story media |
| `bg-radial-primary-glow` | Ambient radial glow effect |

### Full Token Reference

See `AGENTS.md` Section 3 for the complete token table with all light/dark values and Tailwind class mappings.
