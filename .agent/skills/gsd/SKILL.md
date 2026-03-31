---
name: gsd
description: Get Shit Done (GSD) spec-driven development framework for Antigravity. Activates automatically for complex feature builds, phase planning, multi-step tasks, debugging, codebase mapping, and any task requiring structured planning → execution → verification. Use for any task that isn't a quick one-liner.
---

# GSD for Antigravity — Combined Framework

A spec-driven, context-engineered, anti-hallucination workflow system that combines the Get Shit Done methodology with Antigravity's native skills architecture.

> **Read this fully before starting any medium-to-complex task.**

---

## Core Philosophy

- **Complexity is in the system, not the workflow.** Behind the scenes: context engineering, structured plans, state management. What you see: a few clear steps that just work.
- **Solve context rot.** Quality degrades as context fills. This system keeps context fresh and focused through structured artifacts and new conversation boundaries.
- **Anti-hallucination first.** Never fabricate. Never assume. Verify before stating. Re-read files before acting on them.
- **Style anchoring.** Always read existing code before writing new code. Match patterns exactly.

---

## When to Use This Skill

| Trigger | Action |
|---|---|
| "Build a feature", "add X to Y" (non-trivial) | Full GSD workflow |
| "Debug this", "why is X broken" | `/gsd-debug` mode |
| "Map the codebase" / understanding existing code | Codebase mapping phase |
| Quick ad-hoc task (< 2 files, clear scope) | Quick Mode |
| User explicitly invokes `/gsd:*` | Corresponding workflow step |

---

## The Lifecycle

### Phase 0: Project Initialization (New Projects / Milestones)

When starting a new project or milestone:

1. **Questions** — Ask until the goal, constraints, tech preferences, and edge cases are fully understood
2. **Research** — Investigate the domain, stack, and patterns (use `search_web` + `read_url_content`)
3. **Requirements** — Extract what's V1, V2, and out of scope
4. **Roadmap** — Create phases mapped to requirements

**Creates:** `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`

---

### Phase 1: Discuss

Before planning anything non-trivial, capture implementation preferences:

- **Visual features** → Layout, density, interactions, empty states, component choices
- **APIs/Data** → Response format, error handling, loading states
- **Naming** → File naming, component naming, variable conventions
- **Scope** → What's in this task, what's explicitly out

**Output:** `{phase_num}-CONTEXT.md` — this feeds directly into planning.

---

### Phase 2: Plan

1. **Research:** Use tools (`search_web`, `read_url_content`) to verify technical approaches. Tag findings as `HIGH` (URL-verified), `MEDIUM` (doc-cited), or `LOW` (reasoned).
2. **Style Anchoring:** Read 2-3 existing files in the relevant area before writing any plan. Reference their patterns explicitly.
3. **Create atomic task plans** using XML structure (see below). Each plan = one fresh context window of work.
4. **Verify** plans against requirements before committing to execution.

**XML Plan Structure:**
```xml
<task type="auto">
  <name>Create UserCard component</name>
  <files>apps/web/components/UserCard.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Build UserCard using @workspace/ui pattern.
    Use CVA for variants. Follow exact same export pattern as button.tsx.
    Import from @workspace/ui/lib/utils for cn().
  </action>
  <verify>Component renders without errors. Variants work. Exports match pattern.</verify>
  <done>UserCard renders correctly with all variants in Storybook or dev server.</done>
</task>
```

**Creates:** `.planning/phases/{N}-RESEARCH.md`, `.planning/phases/{N}-{M}-PLAN.md`

---

### Phase 3: Execute

1. **Read the plan fully** before writing a single line of code.
2. **Re-read every file** listed in `<files>` — never rely on memory.
3. **Read the `<style-reference>` files** — match patterns exactly.
4. Execute the task. Write clean, typed, tested code.
5. **Verify the `<verify>` criteria** — run the actual command or check the actual output.
6. **Atomic commit** after each task completes: `feat(phase-N): task description`
7. Update `.planning/STATE.md` with what was done and any decisions made.

**Anti-Hallucination Rules During Execution:**
- ❌ Never mark a test as passing without running it
- ❌ Never claim a file exists without reading it first
- ❌ Never fabricate API signatures — verify against docs or source
- ❌ Never skip the `<verify>` step
- ✅ If unsure: say so, then research before proceeding

---

### Phase 4: Verify

After execution, perform structured verification:

1. **Automated checks:** Run linting, type checking, build (`pnpm run typecheck`, `pnpm run lint`).
2. **Functional verification:** Test each deliverable against the `<verify>` criteria.
3. **Gap analysis:** If something fails, create a fix plan before retrying.
4. **Human checkpoint:** WAIT for user confirmation on functional tests — never auto-pass.

**Creates:** `.planning/phases/{N}-VERIFICATION.md`, `.planning/phases/{N}-UAT.md`

---

### Quick Mode

For small, clear-scope tasks (< 2 files, obvious approach):

1. State what you're doing and why
2. Read target files before modifying
3. Make change
4. Verify change
5. Commit atomically

No planning artifacts needed. Skip directly to execution.

---

## Project Memory

After major architectural decisions, call `/gsd-commit-memory`:

Save to `.planning/memory/MEMORY.md`:
```markdown
## [Date] — [Decision Topic]
**Decision:** [What was decided]
**Rationale:** [Why]
**Impact:** [What it affects going forward]
```

AI workflows should **read `.planning/memory/MEMORY.md` first** in every new conversation.

---

## Anti-Hallucination Engine

| Safeguard | What it prevents |
|---|---|
| **File-First Context** | Re-read files before acting — never use memory of them |
| **Source Verification** | Verify technical claims via docs before using in plans |
| **Confidence Tagging** | Research tagged HIGH/MEDIUM/LOW by verification source |
| **Verification Gates** | Every task verified — output read, not assumed |
| **No Auto-Pass** | Tests never marked passed without user confirmation |
| **Decision Attribution** | Track USER-decided vs AI-suggested decisions |
| **Checkpoint Integrity** | WAIT for user — never invent completion |

---

## Model Resilience (Multi-Model Safety)

Antigravity may rotate between models (Claude, Gemini, GPT). Quality must stay consistent:

| Strategy | What It Does |
|---|---|
| **XML Plans** | Instructions so detailed any model can follow correctly |
| **Style Anchoring** | Read existing code first, match patterns exactly |
| **Code Pattern Refs** | Plans reference existing files as style templates |
| **Atomic Task Sizing** | One function per task — less room for quality drift |
| **Verification Suite** | `typecheck + lint + build` after every task |

---

## Planning Directory Structure

```
.planning/
├── PROJECT.md          — Vision, goals, tech stack
├── REQUIREMENTS.md     — Scoped V1/V2 requirements
├── ROADMAP.md          — Phases and progress
├── STATE.md            — Current position, decisions, blockers
├── memory/
│   └── MEMORY.md       — Long-term architectural decisions
├── research/           — Domain research from initialization
└── phases/
    ├── 01-phase-name/
    │   ├── 01-CONTEXT.md
    │   ├── 01-RESEARCH.md
    │   ├── 01-01-PLAN.md
    │   ├── 01-01-SUMMARY.md
    │   ├── 01-VERIFICATION.md
    │   └── 01-UAT.md
    └── 02-phase-name/
```

---

## Commit Convention

Every task gets its own atomic commit:
```
feat(phase-N): add user registration flow
fix(phase-N): resolve auth token expiry bug
docs(phase-N): update API endpoint documentation
refactor(phase-N): extract shared button to @workspace/ui
```

---

## Commands Reference

| Command | What it does |
|---|---|
| `/gsd:new-project` | Initialize project: questions → research → requirements → roadmap |
| `/gsd:discuss-phase N` | Capture preferences before planning phase N |
| `/gsd:plan-phase N` | Research + XML plans for phase N |
| `/gsd:execute-phase N` | Execute all plans in phase N with verification |
| `/gsd:verify-work N` | User acceptance testing with gap analysis |
| `/gsd:quick [desc]` | Ad-hoc task with GSD quality guarantees |
| `/gsd:progress` | Current state, roadblocks, next steps |
| `/gsd:commit-memory` | Save major decision to long-term memory |
| `/gsd:debug [desc]` | Systematic debugging with persistent state |
| `/gsd:help` | Full command reference |

---

## Start of Every Conversation

1. Check if `.planning/memory/MEMORY.md` exists → read it
2. Check if `.planning/STATE.md` exists → read it
3. Check if there are incomplete phases in `.planning/ROADMAP.md`
4. Then respond to the user's request with full context
