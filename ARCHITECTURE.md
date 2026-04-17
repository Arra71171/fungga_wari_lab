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

All design tokens are defined in `packages/ui/src/styles/globals.css`.
- **Colors:** We use OKLCH colors exclusively. Hardcoded HEX, RGB, or standard Tailwind colors (e.g., `text-red-500`) are forbidden.
- **Portraits:** Story media must follow the aspect ratio of `3/4` (`aspect-[3/4]`). No `aspect-video` or `aspect-square`.
