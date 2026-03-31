---
name: test-driven-development
description: Use when implementing any feature or bugfix in this project, before writing implementation code. Enforces RED-GREEN-REFACTOR for Vitest (unit), Playwright (E2E), and Convex function tests.
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask the user):**
- Throwaway prototypes
- Generated code (Convex schema mutations)
- CSS/Tailwind-only visual changes

Thinking "skip TDD just this once"? Stop. That's rationalization.

---

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Delete means delete

---

## Red-Green-Refactor

```
RED   → Write failing test → Verify it fails for the RIGHT reason
GREEN → Write minimal code to pass → Verify test passes + no regressions
REFACTOR → Clean up → Verify still green
REPEAT
```

---

## Our Test Stack

### Unit Tests — Vitest

**Location:** Co-located next to source file OR in `__tests__/` alongside component.

```bash
# Run all tests
pnpm run test

# Run specific file
pnpm --filter web run test path/to/file.test.ts

# Watch mode during TDD cycle
pnpm --filter web run test --watch
```

**Naming:** `ComponentName.test.tsx` or `util.test.ts`

```typescript
// RED — write this first
import { describe, it, expect } from 'vitest'
import { formatStoryDate } from '@/lib/format'

describe('formatStoryDate', () => {
  it('formats unix timestamp as human readable date', () => {
    const result = formatStoryDate(1711929600000)  // 2024-04-01
    expect(result).toBe('April 1, 2024')
  })

  it('returns "No date" for null input', () => {
    expect(formatStoryDate(null)).toBe('No date')
  })
})
```

### Component Tests — React Testing Library + Vitest

```typescript
// RED — write this first
import { render, screen } from '@testing-library/react'
import { BrandLogo } from '@workspace/ui/components/BrandLogo'

it('renders the brand name', () => {
  render(<BrandLogo />)
  expect(screen.getByText('Fungga Wari')).toBeInTheDocument()
})
```

### E2E Tests — Playwright

**Location:** `apps/web/e2e/` or `apps/dashboard/e2e/`

```bash
# Run E2E
pnpm --filter web run test:e2e
```

```typescript
// RED — write this first
import { test, expect } from '@playwright/test'

test('user can create a story', async ({ page }) => {
  await page.goto('/stories/new')
  await page.fill('[data-testid="story-title"]', 'My Test Story')
  await page.click('[data-testid="create-button"]')
  await expect(page.getByText('My Test Story')).toBeVisible()
})
```

### Convex Function Tests

For Convex mutations/queries, use the Convex test framework or verify via the MCP tools:

```typescript
// Use mcp_convex-mcp_run to test a function
// Or write an isolated test using convex/testing library
```

---

## The TDD Steps

### Step 1: RED — Write Failing Test

Write one minimal test showing what SHOULD happen.

**Good test:**
```typescript
it('rejects story creation when title is empty', async () => {
  const result = await createStory({ title: '', content: 'body' })
  expect(result.error).toBe('Title is required')
})
```

**Bad test:**
```typescript
it('story test', async () => {
  const mock = vi.fn().mockResolvedValue({ id: '1' })
  await mock({ title: '' })
  expect(mock).toHaveBeenCalled()  // tests the mock, not the code
})
```

**Requirements:**
- One behavior per test
- Clear descriptive name (`it('does X when Y')`)
- Tests real code — avoid mocks unless absolutely necessary
- TypeScript typed — no `any`

### Step 2: Verify RED — Watch It Fail

**MANDATORY. Never skip.**

```bash
pnpm run test path/to/file.test.ts
```

Confirm:
- Test **fails** (not errors with import/syntax issue)
- Failure message makes sense
- Fails because the feature is missing, not because of a typo

**Test passes?** You're testing existing behavior. Fix test.
**Test errors?** Fix the error (import, syntax), re-run until it fails correctly.

### Step 3: GREEN — Minimal Code

Write the SIMPLEST code that makes the test pass.

```typescript
// Good — just enough
function validateStory(data: { title: string }): { error?: string } {
  if (!data.title.trim()) return { error: 'Title is required' }
  return {}
}
```

```typescript
// Bad — over-engineered for the current test
function validateStory(data: StoryInput, options?: ValidationOptions): ValidationResult {
  // 80 lines of premature generalization
}
```

**Don't add:** features, refactoring, improvements beyond the test.

### Step 4: Verify GREEN — Watch It Pass

**MANDATORY.**

```bash
pnpm run test path/to/file.test.ts
# Then run the full suite to check for regressions:
pnpm run test
```

Confirm:
- Test passes
- Other tests still pass
- No TypeScript errors: `pnpm run typecheck`

**Test fails?** Fix code, not test.
**Other tests fail?** Fix regressions now.

### Step 5: REFACTOR — Clean Up

After green only:
- Remove duplication
- Improve names
- Extract helpers
- Apply `cn()` properly
- Follow AGENTS.md conventions

Keep tests green. Don't add behavior.

### Step 6: REPEAT

Next failing test for next feature.

---

## Verification Checklist

Before marking work complete:

- [ ] Every new function/component has a test
- [ ] Watched each test **fail** before implementing
- [ ] Each test failed for the expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass: `pnpm run test`
- [ ] No TypeScript errors: `pnpm run typecheck`
- [ ] No lint errors: `pnpm run lint`
- [ ] Tests use real code (mocks only when unavoidable, e.g. Clerk auth)
- [ ] Edge cases covered (null, empty, invalid input)

Can't check all boxes? You skipped TDD. Start over.

---

## Red Flags — STOP and Start Over

- Code before test
- Test added after implementation is "done"
- Test passes immediately (first run)
- Can't explain why the test failed
- Rationalizing "just this once"
- "The component is purely visual, no need to test"
- "Convex handles validation"
- "I'll add tests in a later phase"
- "Tests after achieve the same purpose"

**All of these: Delete code. Start over with TDD.**

---

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Already manually tested in browser" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Convex validates at runtime" | That's production validation, not a test. |
| "It's a UI component" | UI components have behavior. Render tests are valid. |
| "TDD will slow me down" | TDD is faster than debugging. Always. |

---

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test a Server Component | Test the underlying utility function it calls |
| Hard to test Convex mutation | Use `mcp_convex-mcp_run` to call it directly, or test the validator logic |
| Test requires too much setup | Design is too coupled — simplify the interface |
| Must mock everything | Too much coupling — use dependency injection |
| Clerk auth makes testing hard | Wrap auth checks in a utility, test the utility |
