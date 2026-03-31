# Anti-Hallucination Reference

Rules the AI agent must follow to avoid fabricating information.

## The Core Contract

> **"If you don't know for certain, research before stating."**

Never pattern-match to what *seems* probably true. Verify it.

## Source Verification Hierarchy

When making technical claims, verify them in this order:

| Confidence | Source | Tag |
|---|---|---|
| **HIGH** | Official docs URL read via `read_url_content` or `mcp_exa_crawling_exa` | `[HIGH]` |
| **MEDIUM** | Cited from known documentation (without live read) | `[MEDIUM]` |
| **LOW** | Reasoned from code patterns + general knowledge | `[LOW]` |

Always tag research findings with their confidence level.

## Mandatory Verification Gates

### Before Writing Code
- ✅ Read the target file(s) before modifying them
- ✅ Read the `<style-reference>` files listed in the plan
- ✅ Verify any external library API against docs before using it

### During Execution
- ✅ Re-read files at execution time — don't rely on memory from planning
- ✅ If a command might fail silently, read its output explicitly

### After Writing Code
- ✅ Run `pnpm run typecheck` — check for type errors
- ✅ Run `pnpm run lint` — check for lint errors
- ✅ Verify the `<verify>` criteria from the plan
- ✅ WAIT for user confirmation before marking tests as passed

## What NOT to Do

### ❌ Auto-Passing Tests

```
// WRONG
"I've run the tests and they pass." (without actually running them)

// RIGHT
"Running pnpm run typecheck now..."
[shows actual output]
"Type check passed. Output: [output]"
```

### ❌ Fabricating File Existence

```
// WRONG
"The file apps/web/lib/auth.ts already exists and exports..."
(without reading it)

// RIGHT
"Let me read that file first..." 
[reads file]
"The file exists and exports: [actual exports]"
```

### ❌ Inventing API Signatures

```
// WRONG
"The useQuery hook accepts { queryKey, queryFn, staleTime } options."
(from memory, unverified)

// RIGHT
"Let me verify the TanStack Query API..." 
[reads docs]
"Confirmed: useQuery accepts { queryKey, queryFn, staleTime, ... }"
```

### ❌ Assuming Build Success

```
// WRONG
"The component should compile without errors."

// RIGHT
"Running build now..." 
[runs pnpm run build]
"Build succeeded. Output: [output]"
```

## Uncertainty Protocol

When uncertain about something:

1. **State the uncertainty:** "I'm not certain about the exact API for X."
2. **Research:** Use `search_web`, `read_url_content`, or `mcp_exa_crawling_exa`
3. **Verify:** Read the actual source/docs
4. **State confidence:** "Verified [HIGH] — the API is..."

Never say "I believe it works like this" without a `[LOW]` confidence tag and an offer to verify.

## Multi-Model Safety

Because Antigravity may rotate between Claude, Gemini, GPT, and others:

| Model | Common Issue | Mitigation |
|---|---|---|
| Claude | Polite hallucination — agrees with wrong assumptions | Decision capture, no leading questions |
| Gemini | Plausible synthesis — mixes real + fabricated info | Source verification, URL checking |
| GPT | Confident fabrication — invents APIs | Library verification gates before use |
| OSS Models | Higher baseline hallucination | Extra structural guardrails, mandatory file re-reads |

**Style anchoring** is the #1 defense: always read existing code before writing new code, regardless of model.
