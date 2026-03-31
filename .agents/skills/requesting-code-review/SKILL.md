---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements and follows AGENTS.md conventions.
---

# Requesting Code Review

**Core principle:** Review early, review often. Catch issues before they compound.

---

## When to Request Review

**Mandatory:**
- After completing a major feature or GSD phase
- Before merging a branch to main
- After fixing a complex bug
- When a plan task touches > 3 files

**Optional but valuable:**
- When stuck (fresh perspective often unblocks)
- Before refactoring (get a baseline assessment)
- After a difficult debugging session

---

## Pre-Review Checklist (Run Before Requesting)

Before asking for review, verify you've done your part:

```bash
# 1. All types clean
pnpm run typecheck

# 2. All lint rules pass (incl. import order, no forbidden patterns)
pnpm run lint

# 3. Tests pass
pnpm run test

# 4. No console errors in dev server
pnpm run dev  # check browser console manually
```

**Also check:**
- [ ] No hardcoded hex/rgb/hsl colors → use semantic tokens
- [ ] No barrel imports → direct imports only
- [ ] No `export default` from components
- [ ] No raw `<a>` or `<img>` → use `Link` / `Image`
- [ ] No `style={{ ... }}` → use Tailwind only
- [ ] All interactive elements have `aria-label`
- [ ] Only `"use client"` where actually needed

---

## How to Request Review

**1. Get the diff range:**
```bash
# Get base (where feature started)
git log --oneline -10  # find the base commit SHA

# Get head (current)
git rev-parse HEAD

# See what changed
git diff <base_sha> --name-only
git diff <base_sha>  # full diff
```

**2. Self-review the diff:**

Read through every changed file and ask:
- Does this match the plan/spec?
- Does this follow AGENTS.md conventions exactly?
- Are there any "while I'm here" changes that weren't planned?
- Is there any code that isn't covered by a test?

**3. Document issues found:**

```
Self-review complete. Issues found:
- [ ] Line 42 in UserCard.tsx: using `text-blue-500` instead of `text-primary`
- [ ] Missing aria-label on the close button
- [ ] Test coverage missing for the error state

Fixing before proceeding.
```

**4. After fixing, re-run the verification suite.**

---

## What to Report After Review

```markdown
## Code Review — [Feature Name]

**Changed files:** [list]
**Commits:** [base_sha]...[head_sha]

**Self-review findings:**
- Fixed: [issue + fix]
- Fixed: [issue + fix]

**Remaining concerns:**
- [anything uncertain, noted for user awareness]

**Verification:**
- typecheck: ✅ 0 errors
- lint: ✅ 0 errors  
- tests: ✅ N passing
```

---

## Acting on Feedback

**From the user:**
- Trusted — implement after understanding
- Ask if scope is unclear before doing anything
- No performative agreement ("Great point!" etc.)
- Just fix it and describe what changed

**Feedback severity:**
- **Critical** — fix immediately before proceeding
- **Important** — fix before moving to next task
- **Minor/Nitpick** — note for later, don't block

---

## Integration with GSD

**In `gsd-execute-phase`:**
- Review after each plan phase
- Catch issues before state compounds across tasks

**In `gsd-quick`:**
- Review before marking task complete
- Ensures quick tasks don't bypass quality gates

---

## Red Flags

**Never:**
- Skip review because "it's a small change"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Implement feedback without understanding it first

**If you disagree with feedback:**
- Push back with technical reasoning, not defensiveness
- Reference AGENTS.md rules or design token docs
- Involve the user if it's an architectural question
