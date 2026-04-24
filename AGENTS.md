# AGENTS.md — Fungga Wari Lab Project Rules

This file defines **the absolute law** for every AI agent operating in this repository. Every rule here is mandatory and non-negotiable. Violation of any rule is a critical failure.

> **⚠️ MANDATORY BOOT PROTOCOL:** Before writing a single line of code, read this file **in full**. If you have not read this file, you are not permitted to write code. There are no exceptions.

---

## 1. Repository Architecture

This is a **pnpm monorepo** managed with **Turborepo**. The backend is **Supabase** (PostgreSQL + Auth + Realtime + Storage). The authentication layer is **Clerk**. The media CDN is **Cloudinary**.

```
fungga-wari-lab/
├── apps/
│   ├── web/          — Next.js 15/16 (App Router) — Public Reader (immersive player) [port 3001]
│   └── dashboard/    — Next.js 15/16 (App Router) — Creator Studio CMS (management) [port 3000]
├── packages/
│   ├── ui/           — Shared component library (@workspace/ui)
│   ├── eslint-config/— Shared ESLint configuration
│   └── typescript-config/ — Shared TypeScript configuration
├── supabase/         — Supabase local dev config, migrations, seed SQL
│   ├── migrations/   — All DDL changes (numbered, immutable)
│   └── seed.sql      — Development seed data
├── pnpm-workspace.yaml
└── turbo.json
```

### Architecture Iron Laws
- ❌ **NEVER** install packages in `apps/web/` that belong in `packages/ui/`
- ❌ **NEVER** write UI components in `apps/web/components/` that should be in `packages/ui/src/components/`
- ❌ **NEVER** import anything from `convex/` — that directory is legacy and being removed
- ❌ **NEVER** call any `convex` SDK function, hook, or type in new code
- ✅ **ALWAYS** run commands from the workspace root (`c:\Wari\fungga-wari-lab`) unless explicitly targeting a specific package
- ✅ **ALWAYS** use Supabase for all new backend functionality

---

## 2. Shared UI Component Library (`@workspace/ui`)

**Location:** `packages/ui/src/components/`
**Import alias:** `@workspace/ui/components/{component-name}`

### Critical Rule: Shared-First Components

Before creating any UI component in `apps/web/`, you MUST ask:
> "Will this component ever be used in more than one app, or is it a base UI primitive?"

- **YES →** Build it in `packages/ui/src/components/`. No exceptions.
- **NO →** It can live in `apps/web/components/` but must still import primitives from `@workspace/ui`

### ❌ Enforcement: If a component is built in the wrong place, delete it and rebuild it in the correct location. Do not leave it where it is.

### Component Authoring Pattern (Iron Law)

Every component MUST follow the canonical pattern of `packages/ui/src/components/button.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

// 1. Define variants with cva — always typed
const componentVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "md" }
})

type ComponentNameProps = React.ComponentProps<"div"> &
  VariantProps<typeof componentVariants> & {
    asChild?: boolean
  }

// 2. Use function declaration — NOT arrow function
function ComponentName({ className, variant, size, asChild = false, ...props }: ComponentNameProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="component-name"
      data-variant={variant}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// 3. Named export only — NEVER default export
export { ComponentName, componentVariants }
export type { ComponentNameProps }
```

### Mandatory `cn()` Rules
- ✅ **ALWAYS** use `cn()` from `@workspace/ui/lib/utils` for ALL class merging
- ❌ **NEVER** use template literals for Tailwind classes: `\`bg-${color}\`` is forbidden
- ❌ **NEVER** inline conditional classes without `cn()`
- ❌ **NEVER** use `clsx` or `classnames` directly — they must go through `cn()`

---

## 3. Design System & Color Tokens

**Source of truth:** `packages/ui/src/styles/globals.css`

All tokens are defined in `:root` and `.dark` using **OKLCH**. Every component consumes these tokens via Tailwind utilities — never raw CSS values.

### Full Color Token Reference

| Token | Light | Dark | Tailwind Class | Usage |
|---|---|---|---|---|
| `--background` | `oklch(0.98 0.01 60)` | `oklch(0.10 0.02 50)` | `bg-background` | Page background |
| `--foreground` | `oklch(0.14 0.02 50)` | `oklch(0.96 0.02 60)` | `text-foreground` | Primary text |
| `--card` | `oklch(0.98 0.01 60)` | `oklch(0.15 0.04 50)` | `bg-card` | Card surfaces |
| `--card-foreground` | `oklch(0.14 0.02 50)` | `oklch(0.96 0.02 60)` | `text-card-foreground` | Text on cards |
| `--primary` | `oklch(0.60 0.18 45)` | `oklch(0.65 0.20 45)` | `bg-primary` | Brand amber/ochre fire |
| `--primary-foreground` | `oklch(0.98 0.01 60)` | `oklch(0.12 0.03 50)` | `text-primary-foreground` | Text on primary |
| `--secondary` | `oklch(0.94 0.04 60)` | `oklch(0.20 0.06 50)` | `bg-secondary` | Secondary surfaces |
| `--muted` | `oklch(0.94 0.04 60)` | `oklch(0.20 0.06 50)` | `bg-muted` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.55 0.06 50)` | `oklch(0.70 0.06 50)` | `text-muted-foreground` | Subtle/deemphasized text |
| `--accent` | `oklch(0.94 0.04 60)` | `oklch(0.20 0.06 50)` | `bg-accent` | Hover/focus surfaces |
| `--destructive` | `oklch(0.60 0.20 25.0)` | `oklch(0.60 0.20 25.0)` | `bg-destructive` | Errors/danger |
| `--destructive-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | `text-destructive-foreground` | Text on destructive |
| `--border-subtle` | `oklch(0.88 0.01 50)` | `oklch(0.22 0.01 50)` | `border-border-subtle` | Light borders |
| `--border-default` | `oklch(0.78 0.02 50)` | `oklch(0.32 0.02 50)` | `border-border` | Standard borders |
| `--border-strong` | `oklch(0.65 0.03 50)` | `oklch(0.48 0.04 50)` | `border-border-strong` | Emphasis borders |
| `--ring` | `oklch(0.70 0.10 50)` | `oklch(0.65 0.20 45)` | `ring-ring` | Focus rings |
| `--brand-ember` | `oklch(0.60 0.18 45)` | `oklch(0.65 0.20 45)` | `text-brand-ember` | Fire accent ≡ primary |
| `--brand-ochre` | `oklch(0.65 0.16 65)` | `oklch(0.70 0.18 65)` | `text-brand-ochre` | Warm ochre highlight |
| `--brand-glow` | `oklch(0.85 0.15 55)` | `oklch(0.85 0.15 55)` | `text-brand-glow` | Ember glow halos |
| `--cinematic-bg` | `oklch(0.97 0.015 75)` | `oklch(0.10 0.02 50)` | `bg-cinematic-bg` | Immersive reader reading surface |
| `--cinematic-panel` | `oklch(0.93 0.018 75)` | `oklch(0.14 0.03 50)` | `bg-cinematic-panel` | Reader panel surfaces (sidebars) |
| `--cinematic-text` | `oklch(0.10 0.03 45)` | `oklch(0.90 0.02 60)` | `text-cinematic-text` | Reader body text |
| `--cinematic-accent` | `oklch(0.58 0.21 43)` | `oklch(0.65 0.20 45)` | `text-cinematic-accent` | Accent in cinematic mode |
| `--cinematic-border` | `oklch(0.75 0.025 65)` | `oklch(1 0 0 / 8%)` | `border-cinematic-border` | Reader borders (warm brown in light) |
| `--bg-base` | `oklch(0.97 0.01 60)` | `oklch(0.10 0.02 50)` | `bg-bg-base` | Deepest background |
| `--bg-panel` | `oklch(0.95 0.01 60)` | `oklch(0.14 0.03 50)` | `bg-bg-panel` | Panel layer |
| `--bg-surface` | `oklch(0.98 0.01 60)` | `oklch(0.18 0.04 50)` | `bg-bg-surface` | Card/content layer |
| `--bg-overlay` | `oklch(0.99 0.005 60)` | `oklch(0.22 0.05 50)` | `bg-bg-overlay` | Overlay/modals |
| `--shadow-brutal` | `4px 4px 0px 0px oklch(0.14 0.02 50)` | `4px 4px 0px 0px var(--primary)` | `shadow-brutal` | Brutalist drop shadow |
| `--shadow-brutal-sm` | `2px 2px 0px 0px oklch(0.14 0.02 50)` | `2px 2px 0px 0px var(--primary)` | `shadow-brutal-sm` | Small brutal shadow |

### Border Radius Tokens
| Token | Value | Tailwind |
|---|---|---|
| `--radius` (base) | `0.625rem` | — |
| `--radius-sm` | `calc(var(--radius) * 0.6)` | `rounded-sm` |
| `--radius-md` | `calc(var(--radius) * 0.8)` | `rounded-md` |
| `--radius-lg` | `var(--radius)` | `rounded-lg` |
| `--radius-xl` | `calc(var(--radius) * 1.4)` | `rounded-xl` |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` | `rounded-2xl` |
> ⚡ **Exception:** The Button component uses `rounded-none` intentionally — orthogonal Zen Brutalist design.

### Typography Tokens
| Token | Tailwind | Usage |
|---|---|---|
| `--font-heading` | `font-heading` | Section headers, titles |
| `--font-mono` | `font-mono` | Code, metadata, labels |
| `--font-sans` | `font-sans` | Body copy |
| `--font-display` | `font-display` | Hero/cinematic display text |
| `--tracking-tighter` | `tracking-tighter` | Compressed display type |
| `--tracking-tight` | `tracking-tight` | Headings |
| `--tracking-normal` | `tracking-normal` | Body (default 0.02em) |
| `--tracking-wide` | `tracking-wide` | Labels/caps |
| `--tracking-widest` | `tracking-widest` | Eyebrow text |

### ❌ Strict Color Enforcement (Zero Tolerance)
- ❌ **NEVER** hardcode hex (`#F59E0B`), rgb (`rgb(245, 158, 11)`), or hsl colors
- ❌ **NEVER** use Tailwind generic colors: `red-500`, `blue-600`, `yellow-400`, `gray-800`, etc.
- ❌ **NEVER** use `oklch(...)` raw values in component className props
- ❌ **NEVER** use `style={{ color: "..." }}` for any color
- ✅ **ALWAYS** use semantic Tailwind utilities that map to tokens: `bg-primary`, `text-foreground`, `border-border`, etc.
- ✅ When you need a new color not in the token set → add it to `globals.css` first → then use its Tailwind class

### ❌ Strict Design Enforcement
- ❌ **NEVER** use `aspect-video` or `aspect-[16/9]` for story imagery
- ❌ **NEVER** use `aspect-square` for story covers
- ✅ **ALWAYS** use `aspect-[3/4]` for all story cards, covers, and illustrations
- ❌ **NEVER** add a new component without adding `data-slot="component-name"` on the root element

### Cinematic Reader Token Rules (Iron Law)

The cinematic reader has its own token subsystem (`--cinematic-*`) that maps to `bg-cinematic-bg`, `bg-cinematic-panel`, etc. These tokens MUST follow these invariants:

1. **Hue Unity Rule:** All `--cinematic-*` surface tokens (bg, panel) MUST share the same hue angle (±2). Different hues = different colour families = visual discord.

2. **Chroma Ladder Rule:** Surface chroma MUST increase progressively: `bg < panel < border`. The reading surface has the lowest chroma (cleanest), the border has the most (most visible).

3. **Lightness Ladder Rule:** Surface lightness MUST decrease progressively: `bg > panel > border` in light mode, `bg < panel < border` in dark mode.

4. **No Cold Blacks:** `--cinematic-border` in light mode MUST NOT use `oklch(0 0 0 / N%)`. Use a warm-toned oklch value matching the panel hue family.

5. **Token Separation Law:** Border tokens define LINE colors. Background tokens define FILL colors.
   - ❌ **NEVER** use a border token as a hover background (`hover:bg-cinematic-border` is FORBIDDEN)
   - ✅ Use `hover:bg-accent`, `hover:bg-secondary`, or `hover:bg-cinematic-panel/60` instead

6. **Depth Stacking Rule:** Nested elements inside a panel (`bg-cinematic-panel`) MUST use the reading surface token (`bg-cinematic-bg/N`) — NOT the panel token. This creates a recessed "paper inset" effect. Panel-on-panel = zero contrast = broken depth.

7. **Illustration Overlay Independence:** The `illustration-gradient-overlay` utility and `--illustration-*` tokens are ALWAYS dark regardless of theme.
   - ❌ **NEVER** use `from-cinematic-bg` on illustration overlays
   - ✅ Use the `illustration-gradient-overlay` utility class

8. **Opacity Discipline:** When using `cinematic-panel/N` or `cinematic-bg/N`, the opacity MUST be chosen so the element is VISUALLY DISTINCT from its parent in BOTH light and dark modes. Test both themes before committing.

9. **Illustration Halo Rule:** The blurred background halo behind chapter illustrations MUST use very low opacity in light mode (`opacity-10` max) paired with a `bg-cinematic-bg/60` warm tint overlay. Dark illustrations (night scenes, shadows) will otherwise create a cold murky wash over the parchment surface. The dark mode halo can be higher opacity (`opacity-20`) since both the background and illustration are dark.
   - ❌ **NEVER** use `opacity-30` or higher for the illustration halo in light mode
   - ✅ Use `opacity-10 dark:opacity-20` + a `bg-cinematic-bg/60 dark:bg-transparent` tint overlay

### Custom Utilities Reference
| Utility | File | Purpose |
|---|---|---|
| `illustration-gradient-overlay` | `globals.css` | Always-dark gradient for chapter illustration fades |
| `scanline-overlay` | `globals.css` | CRT-style horizontal lines for AI narration visualiser |
| `aspect-portrait` | `globals.css` | `aspect-ratio: 3/4` shorthand |
| `bg-radial-primary-glow` | `globals.css` | Radial primary colour glow for ambient effects |
| `bg-fade-to-card` | `globals.css` | Bottom-to-card gradient fade |

---

## 4. Tech Stack & Import Rules

### Next.js (App Router) — Strict Rules
- All pages use the **App Router** (`apps/*/app/`)
- **Default to Server Components** — add `"use client"` only when you must
- `"use client"` is ONLY permitted for: hooks, browser events, browser-only APIs, Supabase Realtime subscriptions
- ✅ `next/image` for ALL images — no raw `<img>`
- ✅ `next/link` for ALL internal navigation — no raw `<a>`
- ✅ `proxy.ts` NOT `middleware.ts` — Next.js 16.x convention

### Icons (Strict Library Discipline)
- **Library: Lucide React** (`lucide-react`) — the only permitted icon library
- ❌ **NEVER** use heroicons, react-icons, `@remixicon/react`, Font Awesome, or inline SVGs from external sources
- Import: `import { ChevronRight } from "lucide-react"`
- Size: `className="size-4"` — NOT `width={16}` or `height={16}` props

### Shadcn/UI & Radix
- Style: `radix-lyra` (configured in `components.json`)
- Base color: `neutral`
- All Radix primitives come from the `radix-ui` package
- Import shadcn components from `@workspace/ui/components/{component-name}` — no direct `@/components/ui` imports

### State Management (Strict)
- Server state: **React Server Components + Server Actions** — preferred always
- Client state: **React `useState`/`useReducer`** — for local UI state only
- ❌ **NEVER** use Redux, MobX, Zustand, Jotai, Recoil, or any external state library
- Exception: must be explicitly approved with justification

### Validation
- **Zod** for all schema validation — 100% coverage on API boundaries
- Use `z.infer<typeof schema>` for derived types — never type manually what Zod can derive

### Data Fetching (Supabase-First Rules)
- Prefer Server Components with `async/await` + Supabase server client (`createServerClient`)
- Client components: use `createBrowserClient` from `@supabase/ssr`
- Use `React.Suspense` with meaningful skeleton fallbacks — never `null` or "Loading..."
- Realtime: subscribe in `useEffect` on the client, unsubscribe on cleanup

---

## 5. Code Style Rules

### TypeScript (Zero Tolerance)
- **Strict mode always** — `strict: true` in tsconfig. No exceptions.
- ❌ **NEVER** use `any` — use `unknown` and narrow, or derive from Zod/Supabase types
- ❌ **NEVER** use `// @ts-ignore` without a two-line comment explaining why and when it can be removed
- ❌ **NEVER** use `// @ts-expect-error` without the same comment requirement
- ✅ Prefer `type` over `interface` for component props
- ✅ Export types co-located with their components
- ✅ Use `React.ComponentProps<"tag">` for HTML prop forwarding
- ✅ Use Supabase generated types from `@/types/supabase.ts` — never write database types manually

### File Naming (Iron Law)
| Content | Convention | Example |
|---|---|---|
| Components | `PascalCase.tsx` | `StoryCard.tsx` |
| Utilities / Hooks | `camelCase.ts` | `useDebounce.ts` |
| Supabase clients | `camelCase.ts` or `server.ts/client.ts` | `supabase/server.ts` |
| Server Actions | `camelCase.ts` | `storyActions.ts` |
| Pages / Layouts | Next.js convention | `page.tsx`, `layout.tsx` |
| Types | `camelCase.ts` | `supabase.ts`, `database.types.ts` |
- ❌ **NEVER** use index barrel files (`index.ts`) — import directly from source

### Import Order (ESLint-enforced)
1. `react` and `react/*`
2. `next` and `next/*`
3. Third-party packages (alphabetical)
4. `@workspace/*` packages
5. `@/` aliases (local app)
6. Relative imports (`./`, `../`)

### Exports (Iron Law)
- **Named exports only** from components and utilities
- ❌ `export default function Component()` — forbidden for non-Next.js files
- ✅ `export function Component()` — required
- Exception: Next.js `page.tsx`, `layout.tsx`, `route.ts` — require `export default`

---

## 6. Tailwind Rules

- **Tailwind v4** — PostCSS-based, no `tailwind.config.js`
- All custom tokens defined in `globals.css` via `@theme inline`
- Dark mode via `.dark` class: `@custom-variant dark (&:is(.dark *))`
- Mobile-first: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- ❌ **NEVER** use arbitrary values (`w-[347px]`, `h-[93px]`) — always use design-token multiples
- ❌ **NEVER** write CSS-in-JS or inline `style={}` for layout — use Tailwind only
- ❌ **NEVER** create new CSS classes outside of `globals.css` (no `*.module.css`, no `<style>` blocks in JSX)
- ✅ Exception: `globals.css` may have targeted overrides for third-party libraries (Clerk, ProseMirror)

---

## 7. Accessibility Rules (WCAG AA Minimum)

- Every interactive element MUST have an accessible label (`aria-label`, `aria-labelledby`, or visible text)
- ✅ Semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`, `<article>`
- ✅ Keyboard navigation: all interactive elements reachable via Tab in logical order
- ✅ Focus styles: always visible — use `focus-visible:ring-2 focus-visible:ring-ring` (never `focus:outline-none` alone)
- ✅ Use `role` and `aria-*` where semantic HTML is insufficient
- ❌ **NEVER** remove focus outlines without replacement focus-visible styles
- ❌ **NEVER** use color alone to communicate state (add icon or text)
- ✅ All images require meaningful `alt` text or `alt=""` for decorative images

---

## 8. Performance Rules

- ❌ **No barrel imports** — always import directly from source file
- ✅ `next/dynamic` for all large client-only components (TipTap editor, rich charts, audio players)
- ✅ `React.Suspense` with meaningful skeleton fallbacks — never raw spinners or `null`
- ✅ `next/image` with explicit `width`/`height` or `fill` + `sizes` — always
- ❌ **NEVER** use `useEffect` to fetch data that can be fetched server-side
- ❌ **NEVER** import a full library when only one function is needed (e.g., import { format } from 'date-fns', not the whole thing)
- ✅ Supabase queries: always select only the columns you need (`select('id, title, slug')`) — never `select('*')` in production code

---

## 9. Git Commit Rules

Follow **Conventional Commits** strictly:
```
feat(scope): add user authentication
fix(scope): resolve token refresh race condition
refactor(scope): extract shared button to @workspace/ui
docs(scope): add Supabase RLS policy documentation
chore(scope): update pnpm lockfile
migration(scope): add stories table with RLS
```

### Rules
- ✅ **Atomic commits:** one logical change per commit
- ✅ **Scope:** use the app or package name (`web`, `dashboard`, `ui`, `supabase`)
- ❌ **No WIP commits** on shared/main branches
- ❌ **No "fix lint"/"fix types" commits** — fix these before the feature commit
- ✅ Supabase migrations get their own commit: `migration(supabase): create stories table`

---

## 10. Running Commands

Always run from the workspace root unless targeting a specific package:

```bash
# Root-level (preferred)
pnpm run dev          # Start all dev servers (web + dashboard)
pnpm run build        # Build all packages
pnpm run lint         # Lint all packages
pnpm run typecheck    # Type-check all packages

# Supabase
pnpm supabase start            # Start local Supabase
pnpm supabase db reset         # Reset local DB + run migrations
pnpm supabase migration new <name>  # Create a new migration file
pnpm supabase gen types typescript --local > packages/ui/src/types/supabase.ts

# Package-specific
pnpm --filter @workspace/ui run build
pnpm --filter web run dev
pnpm --filter dashboard run dev
```

---

## 11. Forbidden Patterns (Zero Tolerance Table)

| ❌ Forbidden Pattern | ✅ Required Instead |
|---|---|
| `import { X } from "@workspace/ui"` | `import { X } from "@workspace/ui/components/x"` |
| `style={{ color: "#ff0000" }}` | `className="text-destructive"` |
| `import { X } from "react-icons/*"` | `import { X } from "lucide-react"` |
| `import { X } from "@remixicon/react"` | `import { X } from "lucide-react"` |
| `<a href="/page">` | `<Link href="/page">` |
| `<img src="..." />` | `<Image src="..." />` from `next/image` |
| `export default function Component()` | `export function Component()` (named) |
| `const Comp = () => <div/>` | `function Comp()` |
| `w-[347px]` arbitrary Tailwind | Design token multiples |
| Hard-coded colors in className | Semantic tokens: `text-primary`, etc. |
| `middleware.ts` | `proxy.ts` (Next.js 16.x) |
| `import { createClient } from "convex/..."` | `import { createClient } from "@/lib/supabase/server"` |
| `useQuery`, `useMutation` from convex | Supabase server actions / `useEffect` + `supabase.from()` |
| `v.string()`, `v.id()`, Convex validators | Zod schemas (`z.string()`, `z.uuid()`) + Supabase types |
| `ctx.storage.store()` | Cloudinary upload + store URL in Supabase |
| `generateUploadUrl()` | Cloudinary direct upload with signed preset |
| `select('*')` in Supabase queries | `select('id, title, slug, ...')` — explicit columns |
| Bypassing RLS with service role in client code | Never expose service role key to browser |
| `hover:bg-cinematic-border` | `hover:bg-accent` or `hover:bg-secondary` |
| `bg-cinematic-panel/N` inside a `bg-cinematic-panel` parent | `bg-cinematic-bg/N` (recessed inset) |
| Raw `oklch(...)` in component inline `style={}` | `@utility` in `globals.css` or a CSS custom property |

---

## 12. Antigravity Master Workflow — GSD × Superpowers

The entirety of this repository's operational mechanics revolves around a single, consolidated master skill that fuses **Get Shit Done (GSD)** context-engineering with **Superpowers** composable skills.

| Skill | Location | Trigger |
|---|---|---|
| `antigravity-master-workflow` | `.agents/skills/antigravity-master-workflow/SKILL.md` | **ACTIVE ON EVERY TASK.** Incorporates TDD, Debugging, Verification, GSD context-engineering and Supabase domain rules. |

You **MUST** read this single `SKILL.md` entirely before acting. It encompasses the **6-phase execution model**:
1. **Phase 0:** Brainstorming & Context Capture (`$gsd-discuss`) — Spec before code. Always.
2. **Phase 1:** Deep Discovery (`$deep-interview`) — Clarify intent, check opensrc
3. **Phase 2:** Planning & Approval (`$ralplan` + GSD XML task format) — ULTRATHINK active
4. **Phase 3:** Test-Driven Execution (`$ralph` loops) — RED → GREEN → REFACTOR
5. **Phase 4:** Systematic Debugging (`$systematic-debug`) — 4-phase root cause, never symptom-fix
6. **Phase 5:** Verification First (`$verify`) — `typecheck && lint` before any completion claim

### GSD Skills (73 installed in `.agent/skills/`)

GSD v1.36.0 is installed locally at `.agent/`. Core workflow commands:

| Command | What It Does |
|---|---|
| `/gsd-new-project` | Full initialization: questions → research → requirements → roadmap |
| `/gsd-map-codebase` | Analyze existing codebase before starting new features |
| `/gsd-discuss-phase N` | Capture implementation decisions before planning |
| `/gsd-plan-phase N` | Research + atomic XML plans + verification loop |
| `/gsd-execute-phase N` | Execute plans in parallel waves, fresh contexts |
| `/gsd-verify-work N` | Manual UAT + auto-diagnose failures → fix plans |
| `/gsd-quick` | Ad-hoc task with GSD guarantees (no full planning) |
| `/gsd-debug` | Systematic debugging with persistent state |
| `/gsd-ship N` | Create PR from verified phase work |
| `/gsd-next` | Auto-detect and run next logical step |
| `/gsd-progress` | Where am I? What's next? |
| `/gsd-ui-phase N` | Generate UI-SPEC.md for frontend phases |
| `/gsd-ui-review N` | 6-pillar visual audit of implemented frontend code |
| `/gsd-secure-phase N` | Security enforcement, threat-model-anchored verification |
| `/gsd-complete-milestone` | Archive milestone, tag release |
| `/gsd-help` | Show all commands |

### GSD State Files (for complex multi-phase work)

| File | What it does |
|---|---|
| `PROJECT.md` | Project vision, always loaded |
| `REQUIREMENTS.md` | Scoped v1/v2 requirements with phase traceability |
| `ROADMAP.md` | Where you're going, what's done |
| `STATE.md` | Decisions, blockers, position — memory across sessions |
| `{phase}-PLAN.md` | Atomic XML tasks with verification steps |
| `{phase}-SUMMARY.md` | What happened, committed to history |

---

## 13. Iron Laws (Non-Negotiable — Zero Exceptions)

These laws apply to **EVERY** task. They cannot be waived, softened, or deferred. If you violate an Iron Law, the task fails.

### 🔴 Debugging Iron Law
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```
- Never propose a fix before completing Phase 4.1 (Root Cause Investigation)
- After 3 failed fixes: **STOP** — question the architecture, not the symptom
- "Just try changing X" is not debugging — it is guessing
- Evidence of root cause MUST be stated before any fix is written

### 🔴 TDD Iron Law
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```
- Write the test → watch it fail → write minimal code → watch it pass
- Code written before the test? **Delete it. Start over.**
- Exceptions require explicit written user approval in the conversation

### 🔴 Verification Iron Law
```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```
- Run `pnpm run typecheck; pnpm run lint` before every commit
- Never say "done", "fixed", or "passing" without pasting the command output
- "Should work" and "looks correct" are NOT evidence

### 🔴 No-Placeholder Law
```
EVERY PLAN STEP MUST CONTAIN THE ACTUAL CODE/COMMAND NEEDED
```
- No "TBD", "TODO", "implement later", "handle edge cases here"
- No "similar to Task N" — repeat the actual code
- No steps that describe WHAT without showing HOW

### 🔴 Supabase-First Law
```
ALL NEW BACKEND CODE USES SUPABASE. CONVEX IS LEGACY.
```
- Any new feature touching data → Supabase
- Any new auth check → Clerk + Supabase RLS
- Any schema change → new migration file in `supabase/migrations/`
- The `convex/` directory is READ-ONLY for migration reference — never add to it

### 🔴 RLS Law
```
EVERY SUPABASE TABLE MUST HAVE ROW LEVEL SECURITY ENABLED
```
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` in EVERY migration that creates a table
- No table is readable/writable without an explicit RLS policy
- Never use the `service_role` key client-side — only in secure server environments
- Always verify RLS with `/gsd-secure-phase` after schema migrations

### 🔴 Cloudinary-Only Media Law
```
ALL MEDIA (IMAGES, AUDIO, VIDEO) GOES THROUGH CLOUDINARY
```
- Never store binary files in Supabase Storage for this project
- Never use `supabase.storage.from().upload()` for story media
- Store only the Cloudinary delivery URL in the database column
- Exception: user avatars may use Supabase Storage if <100KB

### 🔴 Context-Freshness Law (GSD)
```
COMPLEX TASKS EXECUTE IN FRESH SUB-CONTEXTS
```
- Break large features into atomic plans each executable in a fresh 200k context
- Orchestrator context stays lean (30-40%); implementation in subagents
- Never accumulate implementation state in the planning context

---

## 14. Supabase Backend Rules

**Project:** `funnga-wari-labs` | **ID:** `ticxgnziqlumiivzdebz` | **Region:** `ap-northeast-2`
**Status:** `ACTIVE_HEALTHY` | **Postgres:** `17.6.1`

### Authentication Architecture
- **Auth Provider:** Clerk handles all authentication flows (sign-in, sign-up, SSO)
- **Supabase Auth:** NOT used for end-user auth — Clerk is the single source of truth
- **Supabase RLS:** Uses Clerk JWT to authorize database operations
- JWT configuration: Clerk issues JWT → Supabase verifies via JWKS endpoint

### Supabase Client Setup (Strict Pattern)

**Server Client** (Server Components, Server Actions, Route Handlers):
```typescript
// apps/*/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**Browser Client** (Client Components with real-time):
```typescript
// apps/*/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
```

### Supabase Environment Variables
```
# In .env.local — ALREADY CONFIGURED
NEXT_PUBLIC_SUPABASE_PROJECT_URL=https://ticxgnziqlumiivzdebz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_f4WrXiK1PZ-uy05ZByntsg_GH-3QhTC

# Legacy anon key — only for backward compat, prefer publishable key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY3hnbnppcWx1bWlpdnpkZWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjk5NzMsImV4cCI6MjA5MTk0NTk3M30.QuRWG3MUCLI8lAJJXZj_MlXB_m_mNBmLF8HQDvThr08

# Server-only — NEVER expose to browser, NEVER prefix NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=<kept in secure vault — never committed>
```

### Migration Discipline (Iron Law)
- Every schema change → a new numbered migration file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- Migrations are **immutable** — never edit a committed migration
- To fix a migration: create a new migration that corrects it
- Every new table must include:
  ```sql
  ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;
  ```
- All migrations must be reviewed by `/gsd-secure-phase` before merging

### RLS Policy Patterns

**Authenticated read, owner write:**
```sql
-- Read: authenticated users
CREATE POLICY "authenticated_read" ON stories
  FOR SELECT TO authenticated USING (true);

-- Write: only the owner (via Clerk JWT sub claim)
CREATE POLICY "owner_write" ON stories
  FOR ALL TO authenticated
  USING (author_id = auth.jwt()->>'sub')
  WITH CHECK (author_id = auth.jwt()->>'sub');
```

**Public read:**
```sql
CREATE POLICY "public_read" ON stories
  FOR SELECT TO anon, authenticated
  USING (status = 'published');
```

### Supabase Query Patterns (Performance Rules)
- ✅ Always use the typed client: `supabase.from<Database['public']['Tables']['stories']['Row']>('stories')`
- ✅ Always select explicit columns: `.select('id, title, slug, status')`
- ❌ Never `.select('*')` in production — creates overfetch and breaks type narrowing
- ✅ Always handle errors: `const { data, error } = await supabase.from(...); if (error) throw error`
- ✅ Use `.order()`, `.limit()`, `.range()` — never fetch unbounded result sets
- ✅ Use Supabase full-text search (`to_tsvector`) for story search, not LIKE
- ✅ Realtime subscriptions: always unsubscribe in cleanup (`useEffect` return)

### Data Retention Policy (Supabase Edition)
- **Interactions (Analytics)**: High-resolution logs kept **30 days** via `pg_cron` job
- **Messages (Team Chat)**: Kept **7 days** via `pg_cron` job
- **Implementation**: `pg_cron` extension + scheduled SQL functions (not application-layer crons)
- ❌ Never disable cleanup jobs without auditing storage growth first

### Type Generation (Mandatory After Migrations)
```bash
pnpm supabase gen types typescript --project-id ticxgnziqlumiivzdebz > packages/ui/src/types/supabase.ts
```
Run this after EVERY migration. Commit the updated types immediately.

---

## 15. GitHub & CI/CD Rules

### Mandatory Macroscope Review
- ❌ **EVERY** Pull Request MUST trigger a Macroscope review — no exceptions
- ❌ **NEVER** bypass or delete the `@macroscope-app review` comment requirement
- The automated workflow `.github/workflows/macroscope-review.yml` is the source of truth
- If automation fails: manually comment `@macroscope-app review` on the PR before merging

### CI Requirements before merge
- ✅ `pnpm run typecheck` — zero errors
- ✅ `pnpm run lint` — zero errors
- ✅ All Supabase migrations are valid SQL
- ✅ RLS is enabled on all new tables
- ✅ Supabase types file is up-to-date with latest migration

---

## 16. Illustration & Content Guidelines

> **Governed by the `antigravity-master-workflow` skill. These rules cannot be bypassed.**

### Cultural Theme — Non-Negotiable
- **ALL** story illustrations, cover images, and scene artwork MUST depict **Asian folk traditions**
- Meitei/Kangleipak stories: characters MUST reflect Meitei heritage — traditional phanek/potloi attire, Northeast Indian features, culturally authentic settings
- Broader Asian folklore (Mongolian, Japanese, Thai, Cambodian) is permitted for non-Meitei content
- ❌ **NEVER** use generic stock photography or Western-styled imagery as story covers
- ❌ **NEVER** use Unsplash landscape photography for story cover images
- ❌ **NEVER** use AI image generation for final cover assets (AI fails Meitei cultural authenticity)
- ✅ Use `https://placehold.co/600x800/1a1408/F59E0B?text=Story+Cover` until a human uploads the authentic asset

### Orientation — Iron Law
```
ALL STORY ILLUSTRATIONS ARE PORTRAIT. NO EXCEPTIONS.
```
- **Aspect ratio:** `3:4` (width:height) for all story cards, covers, and scene art
- ❌ **NEVER** use `aspect-video`, `aspect-[16/9]`, `aspect-square` for story imagery
- ✅ `aspect-[3/4]` in Tailwind for all cover containers
- ✅ Story reader: always use `PortraitFrame` from `@workspace/ui/components/PortraitFrame`

### Visual Style
- **Aesthetic:** Zen Brutalist folk-art: ink-brush textures, high contrast, raw edges, ochre/amber dominance (OKLCH hue ~45), ash-tone dark backgrounds
- Characters rendered with dignity and cultural accuracy
- All illustrations reference the design system tokens — no hardcoded palette

### Asset Storage (Cloudinary via Supabase URL reference)
- Authentic illustrations uploaded via CMS → stored in Cloudinary
- Cloudinary delivery URL stored in `stories.cover_image_url` (Supabase column)
- Render with `<Image src={story.cover_image_url} fill className="object-cover" />`

### Canonical Components
| Use Case | Component |
|---|---|
| Story reader scene illustration | `PortraitFrame` from `@workspace/ui/components/PortraitFrame` |
| Story archive card cover | `<div className="aspect-[3/4] relative overflow-hidden">` + `<Image fill .../>` |
| Shared story card (dashboard + reader) | `StoryCard` from `@workspace/ui/components/StoryCard` |

### Forbidden Illustration Patterns
| ❌ Forbidden | ✅ Required |
|---|---|
| `aspect-video` on story image | `aspect-[3/4]` |
| `aspect-[16/9]` on story image | `aspect-[3/4]` |
| `aspect-square` on story image | `aspect-[3/4]` |
| Unsplash URLs in `cover_image_url` | Cloudinary URL or `placehold.co` |
| Fixed `h-[Npx]` landscape containers | `aspect-[3/4]` fluid container |
| Raw `<img>` | `<Image>` from `next/image` |

---

## 17. Convex Deprecation (Migration Status)

> **⚠️ MIGRATION IN PROGRESS: Convex → Supabase**

The project is actively migrating from Convex to Supabase as the backend.

### Rules During Migration
- ❌ **NEVER** add new features to any file in `convex/`
- ❌ **NEVER** install new packages that depend on `convex` SDK
- ✅ The `convex/` directory is **READ-ONLY reference** for understanding existing data structures
- ✅ Use the Convex schema (`convex/schema.ts`) to understand the data model — then recreate equivalent tables in Supabase migrations
- ✅ All new code that previously would use Convex now uses Supabase

### Migration Table Reference (Convex → Supabase)
| Was (Convex) | Now (Supabase) |
|---|---|
| `convex/schema.ts` table definition | `supabase/migrations/XXX_create_table.sql` |
| `export const query = ...` | `async function` in Server Component or Server Action |
| `export const mutation = ...` | Server Action with `"use server"` |
| `useQuery(api.stories.list)` | `supabase.from('stories').select(...)` in RSC |
| `useMutation(api.stories.update)` | Server Action called via form/button |
| `ctx.auth.getUserIdentity()` | `auth()` from Clerk + Supabase RLS |
| `v.id("stories")` foreign key | `UUID REFERENCES stories(id)` in SQL |
| `v.optional(v.string())` | `TEXT` (nullable column in SQL) |
| Convex indexes | PostgreSQL indexes in migration SQL |
| `convex/crons.ts` | `pg_cron` extension in Supabase |

### Packages to Remove (After Migration Complete)
```
convex (root devDependency)
convex (apps/web dependency)
convex (apps/dashboard dependency)
@auth/core (if only used for Convex auth adapter)
```
Do NOT remove these until the full migration is verified and all code references are gone.

---

## 18. Source Code Reference (opensrc)

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Key Supabase-related sources to check before implementation:
```
Supabase SSR     → npx opensrc @supabase/ssr
Supabase JS      → npx opensrc @supabase/supabase-js
Clerk NextJS     → opensrc/repos/github.com/clerk/javascript/packages/nextjs
Zod              → opensrc/repos/github.com/colinhacks/zod
```

### Fetching Additional Source Code
```bash
npx opensrc <package>           # npm package
npx opensrc <owner>/<repo>      # GitHub repo
```

<!-- opensrc:start -->
<!-- opensrc:end -->