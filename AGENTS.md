# AGENTS.md — Fungga Wari Lab Project Rules

This file defines strict rules that the AI agent MUST follow in every conversation and for every task in this repository.

> **MANDATORY:** Read this file fully at the start of every conversation before writing any code.

---

## 1. Repository Architecture

This is a **pnpm monorepo** managed with **Turborepo**.

```
fungga-wari-lab/
├── apps/
│   └── web/          — Next.js 15 (App Router) application
├── packages/
│   ├── ui/           — Shared component library (@workspace/ui)
│   ├── eslint-config/— Shared ESLint configuration
│   └── typescript-config/ — Shared TypeScript configuration
├── pnpm-workspace.yaml
└── turbo.json
```

### Rules
- **NEVER** install packages in `apps/web/` that belong in `packages/ui/`
- **NEVER** write UI components in `apps/web/components/` that should be in `packages/ui/src/components/`
- **ALWAYS** run commands from the workspace root (`c:\Wari\fungga-wari-lab`) unless explicitly targeting a specific package

---

## 2. Shared UI Component Library (`@workspace/ui`)

**Location:** `packages/ui/src/components/`
**Import alias:** `@workspace/ui/components/{component-name}`

### Critical Rule: Shared-First Components

Before creating any UI component in `apps/web/`, ask:
> "Will this component ever be used in more than one app, or is it a base UI primitive?"

- **YES →** Build it in `packages/ui/src/components/`
- **NO →** It can live in `apps/web/components/` but must still import from `@workspace/ui`

### Component Authoring Pattern

Follow the exact pattern of `packages/ui/src/components/button.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

// 1. Define variants with cva
const componentVariants = cva("base-classes", {
  variants: { ... },
  defaultVariants: { ... }
})

// 2. Use function declaration (not arrow function)
function ComponentName({ className, variant, asChild = false, ...props }: Props) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="component-name"
      data-variant={variant}
      className={cn(componentVariants({ variant, className }))}
      {...props}
    />
  )
}

// 3. Named export only — no default exports
export { ComponentName, componentVariants }
```

### Mandatory `cn()` Usage
- **ALWAYS** use `cn()` from `@workspace/ui/lib/utils` for class merging
- **NEVER** use template literals or string concatenation for Tailwind classes
- **NEVER** inline conditional classes without `cn()`

---

## 3. Design System & Color Tokens

The design system lives in `packages/ui/src/styles/globals.css`.

### Color Palette (OKLCH)
| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.12 0.03 260)` | Page background |
| `--foreground` | `oklch(0.14 0.02 260)` | `oklch(0.98 0.02 260)` | Primary text |
| `--primary` | `oklch(0.40 0.18 260)` | `oklch(0.55 0.20 260)` | Brand deep blue |
| `--primary-foreground` | `oklch(0.98 0.01 260)` | `oklch(0.10 0.03 260)` | Text on primary |
| `--secondary` | `oklch(0.96 0.02 260)` | `oklch(0.18 0.05 260)` | Secondary surfaces |
| `--muted` | `oklch(0.96 0.02 260)` | `oklch(0.18 0.05 260)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.55 0.04 260)` | `oklch(0.70 0.05 260)` | Subtle text |
| `--destructive` | `oklch(0.60 0.20 25.0)` | `oklch(0.60 0.20 25.0)` | Errors/danger |
| `--destructive-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | Text on destructive elements |
| `--border` | `oklch(0.92 0.03 260)` | `oklch(1 0 0 / 15%)` | Borders |

**Brand Identity:** Primary is a deep, mystical cobalt blue (oklch hue ~260). This is the brand color, complemented by cool, ice-blue neutral tones designed for a premium, zen brutalist aesthetic.

### Strict Color Rules
- ❌ **NEVER** hardcode hex, rgb, or hsl color values in components
- ❌ **NEVER** use Tailwind generic colors (`red-500`, `blue-600`, etc.)
- ✅ **ALWAYS** use CSS custom properties: `bg-primary`, `text-foreground`, `border-border`, etc.
- ✅ **ALWAYS** use the semantic token names from the design system
- ✅ When adding new colors, add them to `globals.css` as CSS variables first

### Border Radius
- `--radius: 0.625rem` (base)
- Use: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, etc. (mapped to radius token multiples)
- **Exception:** The Button component uses `rounded-none` intentionally (orthogonal design system)

### Typography
- Font tokens: `--font-heading`, `--font-mono` (defined at app level in layout)
- Use Tailwind font utilities: `font-heading`, `font-mono`
- Tracking Scale: Use `--tracking-tight` through `--tracking-widest` for precise cinematic letter-spacing.

---

## 4. Tech Stack & Import Rules

### Next.js (App Router)
- All pages use the **App Router** (`apps/web/app/`)
- Favor **Server Components** by default
- Only add `"use client"` when using hooks, browser events, or client-only APIs
- Use `next/image` for all images, never raw `<img>`
- Use `next/link` for all internal navigation, never raw `<a>`

### Icons
- **Library: Lucide React** (`lucide-react`)
- **NEVER** use heroicons, react-icons, or SVGs from other sources
- Import directly: `import { ChevronRight } from "lucide-react"`
- Size via Tailwind: `className="size-4"` (NOT `width`/`height` props)

### Shadcn/UI
- Style: `radix-lyra` (configured in `components.json`)
- Base color: `neutral`
- All radix primitives come from the `radix-ui` package
- Import shadcn components from `@workspace/ui/components/`

### State Management
- Server state: Prefer **React Server Components + Server Actions**
- Client state: **React `useState`/`useReducer`** for local state
- No Redux, Zustand, or external state management unless explicitly approved

### Validation
- **Zod** for all schema validation (`zod` is in `@workspace/ui` dependencies)

### Data Fetching
- Prefer Server Components with `async/await` fetch
- Use React `Suspense` boundaries for streaming
- Client-side: only when realtime/interactive data is needed

---

## 5. Code Style Rules

### TypeScript
- **Strict mode always** — no `any`, no `// @ts-ignore` without explanation
- Prefer `type` over `interface` for component props
- Export types co-located with components
- Use `React.ComponentProps<"tag">` spread for HTML prop forwarding

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Utilities/hooks: `camelCase.ts` (e.g., `useDebounce.ts`)
- Pages: `page.tsx`, `layout.tsx` (Next.js convention)
- No index barrel files — import directly from source

### Imports Order (enforced by ESLint)
1. React
2. Next.js
3. Third-party packages
4. `@workspace/*` packages
5. Local `@/` aliases
6. Relative imports

### Exports
- **Named exports only** — no default exports from components
- Exception: Next.js pages and layouts require default exports

---

## 6. Tailwind Rules

- Tailwind v4 is used (PostCSS-based, not config-file-based)
- All custom tokens are defined in `globals.css` using `@theme inline`
- Mobile-first responsive design: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode via `.dark` class (`@custom-variant dark (&:is(.dark *))`)
- **NEVER** use arbitrary values (`w-[347px]`) unless absolutely unavoidable
- **NEVER** write CSS-in-JS or inline styles — use Tailwind only

---

## 7. Accessibility Rules

- Every interactive element must have an accessible label (`aria-label`, `aria-labelledby`, or visible text)
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`
- Keyboard navigation: all interactive elements reachable via Tab
- Focus styles: always visible (use `focus-visible:` not `focus:`)
- Use `role` and `aria-*` attributes where semantic HTML is insufficient

---

## 8. Performance Rules

- **No barrel imports** — always import directly from the source file
- Use `next/dynamic` for large client-only components
- Use `React.Suspense` with meaningful fallbacks
- Images: always use `next/image` with explicit `width`/`height` or `fill`
- Avoid `useEffect` for data that can be fetched server-side

---

## 9. Git Commit Rules

Follow Conventional Commits:
```
feat(scope): add user authentication
fix(scope): resolve token refresh race condition
refactor(scope): extract shared button to @workspace/ui
docs(scope): add component usage examples
chore(scope): update pnpm lockfile
```

- **Atomic commits:** one logical change per commit
- **Scope:** use the app or package name (`web`, `ui`, `api`)
- **No WIP commits** in shared branches

---

## 10. Running Commands

Always run from the workspace root unless targeting a specific package:

```bash
# Root-level (preferred)
pnpm run dev          # Start all dev servers
pnpm run build        # Build all packages
pnpm run lint         # Lint all packages
pnpm run typecheck    # Type-check all packages

# Package-specific
pnpm --filter @workspace/ui run build
pnpm --filter web run dev
```

---

## 11. Forbidden Patterns

| Pattern | Instead Use |
|---|---|
| `import { X } from "@workspace/ui"` | `import { X } from "@workspace/ui/components/x"` |
| `style={{ color: "#ff0000" }}` | `className="text-destructive"` |
| `import { X } from "react-icons/*"` | `import { X } from "lucide-react"` |
| `<a href="/page">` | `<Link href="/page">` |
| `<img src="..." />` | `<Image src="..." />` from next/image |
| `export default function Component()` | `export function Component()` (named) |
| `const fn = () => {}` for React components | `function Component()` |
| Arbitrary Tailwind values `w-[347px]` | Use design token multiples |
| Hard-coded colors in className | Use semantic tokens like `text-primary` |

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

---

## 12. Agent Skills Library

The following skills live in `.agents/skills/` and **activate automatically** when their trigger condition is met. Read the full `SKILL.md` before acting.

### Development Quality Skills (from Superpowers framework)

| Skill | Location | Trigger |
|---|---|---|
| `systematic-debugging` | `.agents/skills/systematic-debugging/SKILL.md` | Any bug, test failure, TypeScript error, hydration issue, unexpected behavior |
| `test-driven-development` | `.agents/skills/test-driven-development/SKILL.md` | Before writing any implementation code for a feature or bugfix |
| `verification-before-completion` | `.agents/skills/verification-before-completion/SKILL.md` | Before claiming any work is done, fixed, or passing |
| `requesting-code-review` | `.agents/skills/requesting-code-review/SKILL.md` | After major features, before merging, after complex bug fixes |

### Convex Backend Skills

| Skill | Location | Trigger |
|---|---|---|
| `convex-quickstart` | `.agents/skills/convex-quickstart/SKILL.md` | Setting up Convex in a new app |
| `convex-setup-auth` | `.agents/skills/convex-setup-auth/SKILL.md` | Adding authentication to Convex |
| `convex-create-component` | `.agents/skills/convex-create-component/SKILL.md` | Building a new Convex component |
| `convex-migration-helper` | `.agents/skills/convex-migration-helper/SKILL.md` | Schema migrations, data backfills |
| `convex-performance-audit` | `.agents/skills/convex-performance-audit/SKILL.md` | Slow queries, OCC conflicts, read limits |

---

## 13. Iron Laws (Non-Negotiable)

These rules apply in EVERY task, with NO exceptions:

### Debugging Iron Law
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```
- Never propose a fix before completing Phase 1 of `systematic-debugging`
- After 3 failed fixes: STOP — question the architecture, not the symptom
- "Just try changing X" is not debugging

### TDD Iron Law
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```
- Write the test → watch it fail → write minimal code → watch it pass
- Code written before the test? Delete it. Start over.
- Exceptions require explicit user approval

### Verification Iron Law
```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```
- Run `pnpm run typecheck && pnpm run lint` before every commit
- Never say "done", "fixed", or "passing" without the command output to prove it
- "Should work" is not evidence

### No-Placeholder Law
```
EVERY PLAN STEP MUST CONTAIN THE ACTUAL CODE/COMMAND NEEDED
```
- No "TBD", "TODO", "implement later", "handle edge cases"
- No "similar to Task N" — repeat the code, tasks may be read out of order
- No steps that describe WHAT to do without showing HOW
- Spec self-review: scan for these patterns after writing any plan and fix them inline
