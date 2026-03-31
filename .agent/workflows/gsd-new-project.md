---
description: Initialize a new project or milestone with GSD — questions, research, requirements, and roadmap generation
---

# GSD: New Project / Milestone

Use this workflow to initialize a new project or start a new milestone. Creates the full planning structure.

## Steps

1. **Ask clarifying questions** until the following are understood:
   - Core goal and vision
   - Target user / audience
   - Tech constraints (already using Next.js 15, pnpm monorepo, @workspace/ui)
   - Must-haves vs nice-to-haves
   - Out-of-scope items

2. **Research the domain** (optional but recommended):
   - Search for relevant patterns, libraries, pitfalls
   - Tag findings as [HIGH], [MEDIUM], or [LOW] confidence
   - Summarize into `.planning/research/`

3. **Extract requirements:**
   - V1 (must ship)
   - V2 (next milestone)
   - Out of scope (explicitly excluded)

4. **Create roadmap:**
   - Group requirements into 3-7 phases
   - Each phase: 1-2 sentence description + key deliverables
   - Estimated complexity: Simple / Medium / Complex

5. **Write planning artifacts:**

   **`.planning/PROJECT.md`**
   ```markdown
   # [Project Name]
   
   ## Vision
   [What are we building and why]
   
   ## Tech Stack
   - Framework: Next.js 15 (App Router)
   - Monorepo: pnpm + Turborepo
   - UI: @workspace/ui (shadcn, Tailwind v4, OKLCH tokens)
   - Lang: TypeScript strict mode
   
   ## Key Constraints
   [List constraints]
   ```

   **`.planning/REQUIREMENTS.md`**
   ```markdown
   # Requirements
   
   ## V1 — Must Ship
   - [ ] R1: [Requirement]
   
   ## V2 — Next Milestone
   - [ ] R2: [Requirement]
   
   ## Out of Scope
   - [X] [Item explicitly excluded]
   ```

   **`.planning/ROADMAP.md`**
   ```markdown
   # Roadmap — [Project Name]
   
   ## Phase 1: [Name]
   **Status:** Not Started
   **Requirements:** R1, R2
   [Description]
   
   ## Phase 2: [Name]
   ...
   ```

   **`.planning/STATE.md`**
   ```markdown
   # State — [Project Name]
   
   ## Current Position
   Phase: Not started
   Last Session: [Date]
   
   ## Key Decisions
   [None yet]
   
   ## Blockers
   [None]
   ```

6. **Present roadmap to user** — wait for approval before proceeding.

7. When approved, say: "Roadmap approved. Run `/gsd:discuss-phase 1` to capture preferences before planning."
