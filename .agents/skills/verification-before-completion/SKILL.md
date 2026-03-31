---
name: verification-before-completion
description: Use before claiming any work is complete, fixed, or passing. Run actual verification commands and confirm output before any success claim. Evidence before assertions, always.
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

---

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in THIS message, you cannot claim it passes.

---

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

---

## Our Verification Suite

**Run these before claiming anything is done:**

```bash
# TypeScript — no type errors
pnpm run typecheck

# ESLint — no lint violations
pnpm run lint

# Tests — all passing
pnpm run test

# Build — compiles successfully (run when uncertain)
pnpm run build
```

**For UI changes, also verify:**
- The dev server renders without errors (`pnpm run dev`)
- No hydration warnings in browser console
- Dark mode classes apply correctly

**For Convex changes, also verify:**
- `pnpm run dev` shows Convex functions push successfully
- No errors in Convex dashboard logs
- Use `mcp_convex-mcp_logs` to check for failures

---

## Common Failure Patterns

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| "TypeScript passes" | `pnpm run typecheck` output: 0 errors | "Looks correct to me" |
| "Tests pass" | `pnpm run test` output: 0 failures | "Should pass" |
| "Lint clean" | `pnpm run lint` output: 0 errors | "I used `cn()` correctly" |
| "Build succeeds" | `pnpm run build`: exit 0 | "Typecheck passed" |
| "Bug fixed" | Original symptom reproduced and resolved | Code changed, assumed fixed |
| "Convex function works" | Dashboard logs show successful execution | "I wrote the logic correctly" |
| "Component renders" | Dev server running, no console errors | "Looks right in code" |

---

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Done!", "That's it!", "Fixed!")
- About to commit/push without running `pnpm run typecheck`
- Trusting a previous run (re-run fresh each time)
- Relying on partial verification (typecheck ≠ the full suite)
- Thinking "just this once"

---

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident the types are correct" | Confidence ≠ evidence |
| "Typecheck passed last time" | Code changed. Run it again. |
| "It compiled, so lint is fine" | They're separate. Run lint. |
| "Convex auto-validates" | That's runtime, not a test. |
| "Just this once" | No exceptions. |
| "Partial check is enough" | Partial proves nothing. |

---

## Key Patterns

**TypeScript:**
```
✅ [Run pnpm run typecheck] [See: Found 0 errors] "No type errors"
❌ "The types look correct to me"
```

**Tests:**
```
✅ [Run pnpm run test] [See: 12/12 pass, 0 failures] "All tests pass"
❌ "The implementation looks right, tests should pass"
```

**Convex functions:**
```
✅ [mcp_convex-mcp_logs shows no failures] "Function executing successfully"
❌ "The mutation logic is correct"
```

**Component rendering:**
```
✅ [Dev server running] [Browser shows no console errors] "Component renders correctly"
❌ "The JSX looks right"
```

**Build:**
```
✅ [pnpm run build exits 0] "Build succeeds"
❌ "Lint passed, so build should be fine"
```

---

## When To Apply

**ALWAYS before:**
- Saying "done", "fixed", "complete", "working", "passing"
- Any expression of satisfaction about the work state
- Committing code (pre-commit verification)
- Creating a PR or merging
- Moving to the next task in a plan
- Marking a GSD task as `[x]` complete

---

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.
