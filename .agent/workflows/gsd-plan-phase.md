---
description: Research and create atomic XML implementation plans for a phase. Run after gsd-discuss-phase.
---

# GSD: Plan Phase

Creates detailed, atomic task plans for a phase. Each plan fits in a single context window.

## Steps

// turbo-all

1. **Read** the following files before doing anything:
   - `.planning/ROADMAP.md` — phase goals
   - `.planning/phases/{N}-CONTEXT.md` — implementation preferences
   - `.planning/REQUIREMENTS.md` — what must be delivered
   - `.planning/memory/MEMORY.md` (if exists) — long-term decisions
   - `AGENTS.md` — project rules

2. **Style anchoring** — read existing code in the relevant area:
   - Read 2-3 existing components or files that are closest to what will be built
   - Note their patterns: naming, export style, import order, CVA usage, etc.

3. **Research** (use tools):
   - Use `search_web` or `mcp_exa_crawling_exa` for technical approaches
   - Verify any external API before using in a plan — tag [HIGH/MEDIUM/LOW]
   - Document findings in `.planning/phases/{N}-RESEARCH.md`

4. **Create atomic plans** — each plan covers 1-3 tightly related tasks:

   **`.planning/phases/{N}-{M}-PLAN.md`**
   ```xml
   # Phase {N} — Plan {M}: [Short Title]

   ## Context
   This plan implements: [what requirement]
   Dependencies: [plan numbers this needs completed first, or "none"]

   ## Tasks

   <task type="auto">
     <name>[Task name]</name>
     <files>[File paths to create/modify]</files>
     <style-reference>[Existing file to match patterns from]</style-reference>
     <action>
       [Precise, unambiguous instructions. Reference existing patterns.
       Do NOT use generic colors. Use design tokens.
       Follow AGENTS.md rules strictly.]
     </action>
     <verify>[Command or check to verify this task is done]</verify>
     <done>[Specific pass criterion]</done>
   </task>

   <task type="auto">
     ...
   </task>

   ## Acceptance Criteria
   - [ ] [Criterion 1]
   - [ ] [Criterion 2]
   ```

5. **Verify plans** against requirements:
   - Do the combined plans deliver everything in the phase?
   - Are dependencies correctly ordered?
   - Does each plan obey AGENTS.md rules (tokens, named exports, cn(), etc.)?

6. Present plans to user for review. Wait for approval.

7. When approved: "Plans approved. Run `/gsd:execute-phase {N}` to begin execution."

## Plan Size Guidelines

| Complexity | Tasks per Plan | Files per Plan |
|---|---|---|
| Simple | 1-2 | 1-2 |
| Standard | 2-4 | 2-5 |
| Complex | 3-5 | 3-7 |

Keep plans small enough to execute in a fresh context. If a plan touches > 7 files, split it.
