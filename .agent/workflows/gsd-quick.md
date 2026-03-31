---
description: Quick ad-hoc task execution with GSD quality guarantees. Use for small, clear-scope tasks that don't need full phase planning.
---

# GSD: Quick Task

For tasks that are small and clear-scope (< 4 files, obvious approach).

## Decision: Use Quick Mode?

| Signal | Action |
|---|---|
| Clear task, < 4 files, single concern | Quick Mode ✅ |
| Unclear scope, multiple concerns | Use `discuss-phase` first |
| New feature spanning multiple files | Full GSD workflow |
| Bug fix with obvious cause | Quick Mode ✅ |

## Quick Execution Steps

1. **State what you're doing:** "I'm going to [X] by [approach]. Files affected: [list]."

2. **Pre-read all target files** — no exceptions.

3. **Check style:**
   - Read 1 existing nearby file for pattern reference
   - Note its imports, exports, naming, token usage

4. **Execute:**
   - Follow AGENTS.md rules (tokens, named exports, cn(), etc.)
   - Keep changes minimal and targeted

5. **Verify:**
   - For code changes: run `pnpm run typecheck` on affected files
   - For component changes: confirm it renders without console errors
   - For utility changes: trace the logic manually and confirm output

6. **Commit atomically:**
   ```
   fix(web): resolve header alignment on mobile
   feat(ui): add ghost variant to badge component
   refactor(ui): extract card header to shared component
   ```

7. **Summarize:** "[Task] complete. Changed: [files]. Committed as: [hash]."

## AGENTS.md Quick Checklist

Before committing any code, confirm:
- [ ] No hardcoded colors (`red-500`, `#fff`, `rgb(...)`)
- [ ] Using `cn()` for all class merging
- [ ] Using design tokens (`bg-primary`, `text-foreground`, etc.)
- [ ] Named exports only (no `export default` for components)
- [ ] Function declarations (not `const Component = () =>`)
- [ ] Icons from `lucide-react` only
- [ ] Shared primitives in `packages/ui/`, app-specific in `apps/web/`
- [ ] No arbitrary Tailwind values (`w-[347px]`)
- [ ] No inline styles
