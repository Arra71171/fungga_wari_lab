# Fungga Wari Lab

Fungga Wari Lab is an immersive digital storytelling platform dedicated to preserving and reimagining Meitei folk narratives for the digital age. It features branching tales, rich cinematic reading experiences, and a powerful creator studio for managing story assets.

## 🏗 Architecture

This is a modern **Turborepo Monorepo** built for enterprise scale, performance, and developer velocity.

### Core Stack
- **Framework:** Next.js 15/16 (App Router)
- **Database & Backend:** Supabase (PostgreSQL, Realtime, Storage)
- **Authentication:** Clerk
- **Media CDN:** Cloudinary
- **Styling:** Tailwind CSS v4 (with OKLCH design tokens)
- **Component Library:** Shadcn UI + Radix primitives (Shared `@workspace/ui`)
- **Package Manager:** pnpm

### Monorepo Structure

```
fungga-wari-lab/
├── apps/
│   ├── web/          — Public immersive reader platform [port 3001]
│   └── dashboard/    — Creator Studio CMS [port 3000]
├── packages/
│   ├── ui/           — Shared component library (@workspace/ui)
│   ├── auth/         — Shared authentication logic
│   ├── eslint-config/— Shared ESLint configs
│   └── typescript-config/ — Shared TS configs
└── supabase/         — Local DB, migrations, and seed data
```

## ⚡ Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker (for local Supabase instance)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables
Copy the example environment files in both apps:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
```
*Ensure you configure your Supabase, Clerk, and Cloudinary keys.*

### 3. Start Local Supabase
Start the local Supabase stack and apply migrations:
```bash
pnpm supabase start
pnpm supabase db reset
```

### 4. Run Development Servers
Start both the web app and dashboard simultaneously:
```bash
pnpm run dev
```

- **Web App:** http://localhost:3001
- **Dashboard:** http://localhost:3000

## 🎨 Design System: Zen Brutalism

We employ a "Zen Brutalist" aesthetic using CSS variables defined in `packages/ui/src/styles/globals.css`. 
- **Colors:** Defined strictly with `oklch()` values. **Never hardcode hex/rgb colors.**
- **Aspect Ratios:** All story media must adhere to the **Portrait Law (`aspect-[3/4]`)**.
- **Dark Mode:** Native support via Tailwind's `dark:` variant and custom `:is(.dark *)` selectors.

## 📜 Development Rules (Iron Laws)
Before contributing, you **must** read and understand `AGENTS.md` and `ARCHITECTURE.md`.
1. **Supabase First:** All backend logic goes through Supabase. Convex is legacy and forbidden.
2. **Strict TypeScript:** `no-explicit-any` is enforced. Do not use `any`.
3. **Shared Components:** Reusable UI components belong in `packages/ui`, not `apps/web/components`.
4. **Tailwind Only:** No CSS Modules or inline styles for layout.

## 🤝 Contributing
Please read `CONTRIBUTING.md` for details on our code of conduct, commit message formats (Conventional Commits), and the pull request process.
