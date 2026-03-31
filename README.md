# Fungga Wari Lab

[![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Arra71171/fungga_wari_lab?utm_source=oss&utm_medium=github&utm_campaign=Arra71171%2Ffungga_wari_lab&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)](https://coderabbit.ai)

A premium, Zen Brutalist storytelling platform built on a pnpm monorepo with Next.js 15, Convex, and Clerk.

---

## Architecture

```
fungga-wari-lab/
├── apps/
│   ├── web/          — Next.js 15 (App Router) marketing site
│   └── dashboard/    — Next.js 15 (App Router) story editor
├── packages/
│   ├── ui/           — Shared component library (@workspace/ui)
│   ├── auth/         — Shared Clerk + Convex auth utilities
│   ├── eslint-config/— Shared ESLint configuration
│   └── typescript-config/ — Shared TypeScript configuration
├── convex/           — Convex backend (queries, mutations, schema)
├── .agents/          — AI agent skills library (Superpowers framework)
├── .agent/           — GSD workflow definitions
├── pnpm-workspace.yaml
└── turbo.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Backend | Convex |
| Auth | Clerk |
| UI Library | shadcn/ui + Radix UI |
| Styling | Tailwind v4 (OKLCH design tokens) |
| Monorepo | pnpm + Turborepo |
| Language | TypeScript (strict) |

## Development

```bash
# Install dependencies
pnpm install

# Start all dev servers
pnpm run dev

# Type check
pnpm run typecheck

# Lint
pnpm run lint

# Build all packages
pnpm run build
```

## Adding UI Components

```bash
# Add a shadcn component to the shared library
pnpm dlx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components/` and imported via:

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Agent Skills

This project uses the [Superpowers](https://github.com/obra/superpowers) agentic skills framework. Skills live in `.agents/skills/` and activate automatically:

| Skill | When it activates |
|---|---|
| `systematic-debugging` | Any bug, TypeScript error, hydration issue |
| `test-driven-development` | Before writing any implementation code |
| `verification-before-completion` | Before claiming work is done |
| `requesting-code-review` | After new features, before merging |

See `AGENTS.md` for the full project rules and conventions.

## License

Private — All rights reserved.
