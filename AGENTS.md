# AGENTS.md — Fungga Wari Lab Project Rules

This file defines strict rules that the AI agent MUST follow in every conversation and for every task in this repository.

> **MANDATORY:** Read this file fully at the start of every conversation before writing any code.

---

## 1. Repository Architecture

This is a **pnpm monorepo** managed with **Turborepo**.

```
fungga-wari-lab/
├── apps/
│   ├── web/          — Next.js 15 (App Router) — Public Reader (immersive player)
│   └── dashboard/    — Next.js 15 (App Router) — Creator Studio CMS (management)
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
| `--background` | `oklch(0.98 0.01 60)` | `oklch(0.12 0.03 50)` | Page background |
| `--foreground` | `oklch(0.14 0.02 50)` | `oklch(0.96 0.02 60)` | Primary text |
| `--primary` | `oklch(0.60 0.18 45)` | `oklch(0.65 0.20 45)` | Brand amber/ochre fire |
| `--primary-foreground` | `oklch(0.98 0.01 60)` | `oklch(0.12 0.03 50)` | Text on primary |
| `--secondary` | `oklch(0.94 0.04 60)` | `oklch(0.20 0.06 50)` | Secondary surfaces |
| `--muted` | `oklch(0.94 0.04 60)` | `oklch(0.20 0.06 50)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.55 0.06 50)` | `oklch(0.70 0.06 50)` | Subtle text |
| `--destructive` | `oklch(0.60 0.20 25.0)` | `oklch(0.60 0.20 25.0)` | Errors/danger |
| `--destructive-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | Text on destructive elements |
| `--border` | `oklch(0.90 0.03 60)` | `oklch(1 0 0 / 15%)` | Borders |
| `--brand-ember` | `oklch(0.60 0.18 45)` | `oklch(0.65 0.20 45)` | Fire accent (= primary) |
| `--brand-ochre` | `oklch(0.65 0.16 65)` | `oklch(0.70 0.18 65)` | Warm ochre highlight |
| `--cinematic-bg` | —  | `oklch(0.10 0.02 50)` | Immersive reader background |
| `--cinematic-panel` | — | `oklch(0.14 0.03 50)` | Panel surfaces in reader |
| `--cinematic-accent` | — | `oklch(0.65 0.20 50)` | Accent in cinematic mode |

**Brand Identity:** Primary is **amber/ochre fire** (oklch hue ~45). This is the brand color — warm, folk-story fire against dark, ash-toned backgrounds. The cinematic reader uses `cinematic-bg`/`cinematic-panel` tokens for deep immersive darkness. The system aesthetic is Zen Brutalist: raw borders, monospace typography, intentional minimalism.

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
| `middleware.ts` | `proxy.ts` (Next.js 16.x convention) |

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

---

## 12. Antigravity Master Workflow — GSD × Superpowers

The entirety of this repository's operational mechanics revolves around a single, consolidated master skill that now fuses **Get Shit Done (GSD)** context-engineering with **Superpowers** composable skills.

| Skill | Location | Trigger |
|---|---|---|
| `antigravity-master-workflow` | `.agents/skills/antigravity-master-workflow/SKILL.md` | **ACTIVE ON EVERY TASK.** Incorporates TDD, Debugging, Verification, GSD context-engineering and Convex domain rules. |

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

---

## 14. GitHub & CI/CD Rules

### Mandatory Macroscope Review
- **EVERY** Pull Request must trigger a Macroscope review.
- **NEVER** bypass or delete the `@macroscope-app review` comment requirement.
- The automated workflow `.github/workflows/macroscope-review.yml` is the source of truth for this trigger.
- If the automation fails, the contributor MUST manually comment `@macroscope-app review` on the PR.

---

## 15. Illustration & Content Guidelines

> **Governed by the `antigravity-master-workflow` skill.**
> Do not bypass these rules when working with visual assets.

### Cultural Theme — Non-Negotiable
- **ALL** story illustrations, cover images, and scene artwork MUST depict stories rooted in **Asian folk traditions**.
- When the story is Meitei/Kangleipak, characters MUST reflect Meitei heritage: traditional phanek/potloi attire, Northeast Indian features, culturally authentic settings.
- Broader Asian folklore (Mongolian, Japanese, Thai, Cambodian, etc.) is permitted for non-Meitei content.
- ❌ **NEVER** use generic stock photography or Western-styled imagery as story covers.
- ❌ **NEVER** use Unsplash landscape photography for story cover images.
- ❌ **NEVER** use AI image generation for final asset coverage. AI models consistently fail to generate authentic Meitei/Manipuri cultural aesthetics securely (frequently generating generic Hindu styles instead). Always use dummy placeholders (`https://placehold.co/600x800...`) until a human uploads the authentic asset via the CMS.

### Orientation — Iron Law
```
ALL STORY ILLUSTRATIONS ARE PORTRAIT. NO EXCEPTIONS.
```
- **Aspect ratio:** `3:4` (width:height) for all story cards, covers, and scene art.
- **NEVER** use `aspect-video`, `aspect-[16/9]`, or any landscape ratio for story imagery.
- Use `aspect-[3/4]` in Tailwind for all cover containers.
- In the story reader, always use the `PortraitFrame` component from `@workspace/ui/components/PortraitFrame`.

### Visual Style
- Zen Brutalist folk-art aesthetic: ink-brush textures, high contrast, raw edges, ochre/amber dominance (OKLCH hue ~45), ash-tone dark backgrounds.
- Characters rendered with dignity and cultural accuracy.
- Primary palette follows design system tokens — no hardcoded colors in illustrations.

### Asset Storage
- Authentic illustrations are managed via Cloudinary (CMS upload).
- Use `next/image` with `fill` + `object-cover` for all illustration rendering.

### Canonical Components
| Use Case | Component |
|---|---|
| Story reader scene illustration | `PortraitFrame` from `@workspace/ui/components/PortraitFrame` |
| Story archive card cover | `aspect-[3/4]` `div` wrapping `next/image` with `fill` |
| Shared story card (dashboard + reader) | `StoryCard` from `@workspace/ui/components/StoryCard` |

### Forbidden Illustration Patterns
| Pattern | Instead Use |
|---|---|
| `aspect-video` on story image | `aspect-[3/4]` |
| `aspect-[16/9]` on story image | `aspect-[3/4]` |
| Unsplash URLs in `coverImageUrl` | Native CMS `coverImageUrl` or `placehold.co` |
| Fixed `h-[Npx]` landscape containers | `aspect-[3/4]` fluid container |
| Raw `<img>` for illustrations | `<Image>` from `next/image` |

---

## 16. Convex Storage Ban (Iron Law)

The project is strictly prohibited from using Convex `_storage` for media assets.

- **NO** `ctx.storage.store()` or `generateUploadUrl()` for images, audio, or video.
- **ALWAYS** use the Cloudinary integration for all media uploads.
- **ALWAYS** store external Cloudinary URLs in the database.
- **REASON**: Convex Free Plan bandwidth and storage limits are easily exceeded by binary assets.

## 17. Data Retention & Cleanup Policy

To maintain Database Storage and Document Count limits:

- **Interactions (Analytics)**: High-resolution logs are kept for **30 days**. Historical totals are denormalized in the `stories` table.
- **Messages (Team Chat)**: Stored for **7 days**.
- **Automation**: `convex/crons.ts` executes daily purges via `utility:cleanupOldInteractions` and `utility:cleanupOldMessages`.
- **Constraint**: Do NOT disable these crons or increase these windows without manual audit of storage growth.

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->