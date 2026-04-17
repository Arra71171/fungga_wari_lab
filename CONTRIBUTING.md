# Contributing to Fungga Wari Lab

Welcome to the Fungga Wari Lab project! We are building an immersive digital storytelling platform for Meitei folk narratives. 

## 🛠 Getting Started

1. **Clone and Install:**
   ```bash
   git clone <repo-url>
   cd fungga-wari-lab
   pnpm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env.local` in `apps/web` and `apps/dashboard` and populate the necessary Supabase, Clerk, and Cloudinary keys.

3. **Start Local Development:**
   Start the Supabase backend:
   ```bash
   pnpm supabase start
   pnpm supabase db reset
   ```
   Start the development servers:
   ```bash
   pnpm run dev
   ```

## 📋 Commit Convention

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Every commit message must be structured as follows:

```
<type>(<scope>): <subject>

<body>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation
- `migration`: Database schema changes (Supabase)

**Scopes:**
Use the package or app name: `web`, `dashboard`, `ui`, `supabase`, `auth`.

## 🧪 Testing and Verification

- **Linting:** Ensure your code passes the strict linter rules. `pnpm run lint`
- **Type Checking:** Ensure your code passes strict TypeScript checks. `pnpm run typecheck`
- Never submit a pull request with known `any` types or `@ts-ignore` comments without justification.

## 🛑 Iron Laws Verification

Before creating a PR, verify you haven't broken any core rules:
1. Did you use CSS Modules? (Forbidden)
2. Did you hardcode a color instead of using an OKLCH design token? (Forbidden)
3. Are you using `any`? (Forbidden)
4. Did you put a shared component in `apps/web/components` instead of `packages/ui`? (Forbidden)
