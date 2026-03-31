---
description: User Acceptance Testing — verify phase deliverables functionally. Run after gsd-execute-phase.
---

# GSD: Verify Work

Human-in-the-loop verification of executed phase work. Catches what automated checks miss.

## Steps

1. **Read** `.planning/phases/{N}-{M}-SUMMARY.md` files to understand what was built.

2. **Extract testable deliverables** from the acceptance criteria in each PLAN.md.

3. **Present deliverables one at a time** to the user:
   ```
   ✅ Deliverable 1: [Describe what should work]
   
   Can you verify this works? (yes / no / describe issue)
   ```

   **IMPORTANT:** WAIT for user response before continuing to the next deliverable.
   Never auto-pass. Never skip.

4. **Document results** in `.planning/phases/{N}-UAT.md`:
   ```markdown
   # Phase {N} — UAT Results

   ## Deliverables
   - [x] D1: [Description] — PASSED
   - [ ] D2: [Description] — FAILED: [Issue description]

   ## Issues Found
   ### Issue 1: [Title]
   **Symptom:** [What the user saw]
   **Expected:** [What should happen]
   **Likely Cause:** [Initial diagnosis]

   ## Fix Plans Needed
   - [ ] Fix Plan for Issue 1
   ```

5. **For any failures:** Create targeted fix plans:
   ```xml
   <task type="auto">
     <name>Fix: [Issue title]</name>
     <files>[Files to investigate]</files>
     <style-reference>[Relevant existing file]</style-reference>
     <action>[Precise fix instructions]</action>
     <verify>[How to confirm it's fixed]</verify>
     <done>[Pass criterion]</done>
   </task>
   ```

6. **When all deliverables pass:**
   "Phase {N} verification complete. All deliverables confirmed by user. Ready for next phase."

   Update `.planning/ROADMAP.md` to mark phase as complete.
   Update `.planning/STATE.md` with new position.
