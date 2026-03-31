---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior — including hydration errors, Convex function failures, TypeScript errors, and UI regressions. ALWAYS find root cause before attempting fixes.
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- TypeScript errors / type failures
- Next.js hydration mismatches
- Convex function failures / schema validation errors
- React rendering bugs / infinite loops
- Build failures (`pnpm run build`)
- Tailwind classes not applying
- Authentication issues (Clerk tokens, session state)
- UI layout / style regressions

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Don't skip when:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)

---

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes
   - For Convex: check the Convex dashboard logs AND the browser console

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - Does it happen every time?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed that could cause this?
   - `git diff`, `git log --oneline -10`
   - New dependencies, config changes
   - Schema changes in `convex/schema.ts`

4. **Gather Evidence in Multi-Component Systems**

   **Our system has many component boundaries:**
   ```
   Browser → Next.js App Router → Server Components → Convex queries → DB
   ```

   **BEFORE proposing fixes, add diagnostic instrumentation:**
   ```typescript
   // Server Component — add console.log to see what's being fetched
   // Client Component — check React DevTools for prop values
   // Convex function — add console.log in the handler, check dashboard logs
   // Network — check Network tab for failed requests
   ```

   **Stack-specific diagnostic patterns:**

   ```bash
   # TypeScript errors — get the full error, not just the first line
   pnpm run typecheck 2>&1 | head -50

   # Build errors — full output
   pnpm run build 2>&1 | tail -80

   # Lint errors
   pnpm run lint

   # Check which package has the error
   pnpm --filter web run typecheck
   pnpm --filter @workspace/ui run typecheck
   ```

   ```typescript
   // Convex — run a one-off query to inspect data state
   // Use the Convex dashboard or mcp_convex-mcp_runOneoffQuery tool

   // Hydration fix — narrow down which component causes mismatch
   // Comment out children until hydration error disappears
   ```

5. **Trace Data Flow**

   For deeply nested errors, trace backward:
   - Where does the bad value originate?
   - What called this with the bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working code in the same codebase
   - What works that's similar to what's broken?
   - Check `packages/ui/src/components/` for correct component patterns

2. **Compare Against References**
   - If implementing a pattern, read the reference implementation COMPLETELY
   - Don't skim — read every line
   - For shadcn components: check `@workspace/ui/components/` source
   - For Convex: check `convex/_generated/api.d.ts` for correct function signatures

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small

4. **Understand Dependencies**
   - What Tailwind classes / design tokens does this need?
   - What Convex functions / tables does this touch?
   - What Clerk auth state is required?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

4. **When You Don't Know**
   - Say "I don't understand X"
   - Don't pretend to know
   - Ask for help / research more

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible (Vitest, Playwright)
   - One-off verification script if no framework
   - MUST have before fixing
   - Use the `test-driven-development` skill

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify Fix**

   ```bash
   # Run the full verification suite:
   pnpm run typecheck
   pnpm run lint
   pnpm run build   # only if needed to confirm
   ```

   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If ≥ 3: STOP and question the architecture (step 5 below)**
   - DON'T attempt Fix #4 without architectural discussion

5. **If 3+ Fixes Failed: Question Architecture**

   **Pattern indicating architectural problem:**
   - Each fix reveals new shared state/coupling/problem in a different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals:**
   - Is this pattern fundamentally sound?
   - Should we refactor architecture vs. continue fixing symptoms?

   **Discuss with the user before attempting more fixes.**

---

## Stack-Specific Quick Reference

| Issue Type | First Check | Diagnostic Command |
|---|---|---|
| TypeScript error | Read the full error message | `pnpm run typecheck` |
| Hydration mismatch | Check for `typeof window` conditionals, date formatting, random values | Browser console Network tab |
| Convex schema error | Check `convex/schema.ts` field types | `mcp_convex-mcp_logs` tool |
| Tailwind class not applying | Check `@theme inline` in `globals.css` | Browser DevTools computed styles |
| Import error | Check AGENTS.md import rules, no barrel files | `grep` for the import path |
| Build failure | Read the FULL output, find the first error | `pnpm run build 2>&1` |
| Auth issue (Clerk) | Check session token in browser, check middleware | Clerk dashboard events |

---

## Red Flags — STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)
- Each fix reveals new problem in a different place

**ALL of these mean: STOP. Return to Phase 1.**

---

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

---

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare against our design system | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix root cause, verify with `typecheck + lint` | Bug resolved, suite passes |
