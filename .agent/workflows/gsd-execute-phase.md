---
description: Execute all plans in a phase with anti-hallucination guards, verification gates, and atomic commits.
---

# GSD: Execute Phase

Executes all plans for a phase with strict verification after each task.

## Pre-Execution Checklist

Before writing any code:

- [ ] Read `.planning/phases/{N}-{M}-PLAN.md` fully
- [ ] Read `.planning/memory/MEMORY.md` if it exists
- [ ] Read `AGENTS.md` — rules are non-negotiable
- [ ] Read every file listed in `<files>` — never rely on memory
- [ ] Read every file listed in `<style-reference>` — match patterns exactly

## Execution Loop (per task)

1. **Re-read** target files — even if you "know" what's in them
2. **Match style** from `<style-reference>` files — do not invent patterns
3. **Execute** the `<action>` precisely
4. **Verify** by running the `<verify>` command and reading output
5. **Commit** atomically: `feat(phase-{N}): [task name]`
6. **Document** in `.planning/phases/{N}-{M}-SUMMARY.md`

## Non-Negotiable Execution Rules

### From AGENTS.md (always apply)
- ✅ Use `cn()` from `@workspace/ui/lib/utils` for all class merging
- ✅ Use design tokens: `bg-primary`, `text-foreground`, `border-border`
- ✅ Named exports only: `export { Component }` not `export default`
- ✅ Function declarations: `function Component()` not `const Component = () =>`
- ✅ Import icons from `lucide-react` only
- ✅ Use `next/link` for navigation, `next/image` for images
- ✅ Shared components go in `packages/ui/src/components/`
- ✅ Strict TypeScript — no `any`, no `@ts-ignore` without justification
- ✅ `"use client"` only when hooks/events require it

### Anti-Hallucination Guards
- ❌ Never mark tests as passing without running them
- ❌ Never claim a file exists without reading it
- ❌ Never use an external API without verifying it against docs
- ❌ Never skip the `<verify>` step
- ✅ If a verification fails: stop, diagnose, create fix plan before retrying

## After Each Plan

Write `.planning/phases/{N}-{M}-SUMMARY.md`:
```markdown
# Phase {N} — Plan {M} Summary

## What Was Done
[List of tasks completed]

## Files Changed
- [file path] — [what changed]

## Commits
- [commit hash]: [message]

## Decisions Made
- [Any non-obvious choices made during execution]

## Issues Found
- [Anything unexpected — bugs, missing context, etc.]
```

## After All Plans Complete

Run the full verification suite:
```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

If all pass: "Phase {N} execution complete. Run `/gsd:verify-work {N}` for user acceptance testing."

If any fail: diagnose, create targeted fix tasks, re-execute.
