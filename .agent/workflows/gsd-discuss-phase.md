---
description: Discuss a phase to capture implementation preferences before planning. Run before gsd-plan for any non-trivial phase.
---

# GSD: Discuss Phase

Captures implementation preferences before creating a plan. This creates `CONTEXT.md` which feeds into the planner.

## Steps

1. **Read** `.planning/ROADMAP.md` to understand the phase being discussed.

2. **Identify gray areas** based on the phase type:
   - **Visual/UI phases** → Layout, component hierarchy, empty states, responsive behavior, animations
   - **API/Data phases** → Response format, error handling, loading states, caching
   - **Auth phases** → Session strategy, token storage, redirect flows
   - **Refactor phases** → Migration strategy, backward compatibility, deprecation approach

3. **Ask focused questions** — one at a time, not a laundry list:
   - What specific component library approach? (Must use @workspace/ui — but ask about new primitives needed)
   - Are there existing patterns to follow? (Show examples from codebase)
   - Any explicit decisions already made?

4. **Document decisions** in `.planning/phases/{N}-CONTEXT.md`:
   ```markdown
   # Phase {N} Context
   
   ## Implementation Preferences
   
   ### [Area 1 — e.g., Layout]
   - Decision: [What was decided]
   - Source: USER / AI-suggested
   
   ### [Area 2 — e.g., State Management]
   - Decision: [What was decided]
   - Source: USER / AI-suggested
   
   ## Locked Decisions
   [Decisions that must not be revisited in planning]
   
   ## Open Decisions
   [Things still flexible — planner may choose]
   ```

5. When discuss is complete: "Context captured. Run `/gsd:plan-phase {N}` to create implementation plans."
