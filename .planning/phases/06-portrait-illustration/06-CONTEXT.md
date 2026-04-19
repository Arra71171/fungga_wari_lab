# Phase 6 Context — Portrait Illustration Standard

## Session Date
2026-04-02

## Intent
Establish "Portrait-First Illustration" as the platform-wide standard for all
story art across Fungga Wari Lab. Every image surface — story archive grid,
story reader, hero panel, CMS card — must enforce Asian folk-art illustrations
in a 3:4 portrait orientation.

---

## Audit Findings

### Surfaces Where Illustrations Appear

| Surface | File | Current Aspect | Issue |
|---|---|---|---|
| **Story Archive Grid** (`/stories`) | `apps/web/app/stories/page.tsx` | `aspect-[16/9]` on `StoryCard` | ❌ Landscape — breaks portrait layout |
| **Story Archive Skeleton** | same | `aspect-[16/9]` | ❌ Landscape skeleton |
| **Story Archive — shared `StoryCard`** | `packages/ui/src/components/StoryCard.tsx` | `aspect-video` | ❌ Landscape 16:9 |
| **Story Reader — Scene Illustration** | `apps/web/components/story/StoryCenter.tsx` | Fixed `h-[420px]` container, `fill` image | ✅ Already works well but NOT enforced as portrait |
| **Story Reader — StoryCanvas** | `apps/web/components/story/StoryCanvas.tsx` | Uses `PortraitFrame` | ✅ Correct — uses `aspect-[3/4]` via PortraitFrame |
| **PortraitFrame Component** | `packages/ui/src/components/PortraitFrame.tsx` | `aspect-[3/4]` inner card | ✅ Correct — is the canonical portrait container |
| **Landing Page Hero** | `apps/web/app/page.tsx` line ~402 | `aspect-[3/4]` with video | ✅ Already portrait |
| **Landing Page CTA BG** | `apps/web/app/page.tsx` (`Closing-CTA.png`) | `fill` full-bleed | ⚠️ Background use, no strict orientation needed |
| **Landing Page Feature Bento F1** | `apps/web/app/page.tsx` (`Folk-Stories-Archive.png`) | `fill` decorative panel | ⚠️ Background panel — no strict requirement |
| **Dashboard Story List** | `apps/dashboard/app/(dashboard)/stories/page.tsx` | Uses `StoryCard` with `aspect-video` | ❌ Landscape via shared component |
| **Dashboard Login BG** | `apps/dashboard/app/login/` | `login-bg.png`, `login-hero.png` | ⚠️ BG/decorative use, not constrained |

### Root Cause
The shared `StoryCard` in `packages/ui/src/components/StoryCard.tsx` uses `aspect-video`
(16:9 landscape). This flows into both the public web archive AND the dashboard story list.
The local `StoryCard` in `apps/web/app/stories/page.tsx` (used as an inline component)
also uses `aspect-[16/9]`.

The `PortraitFrame.tsx` component already exists and is used correctly in `StoryCanvas.tsx`.
It is the canonical solution — it needs to be applied everywhere.

### What Already Works
- `PortraitFrame` — correct `aspect-[3/4]` portrait card with blur-bg effect
- `StoryCanvas.tsx` — already uses `PortraitFrame`
- Landing hero — already uses `aspect-[3/4]`

### What Needs Fixing
1. `packages/ui/src/components/StoryCard.tsx` — `aspect-video` → `aspect-[3/4]`
2. `apps/web/app/stories/page.tsx` (inline `StoryCard`) — `aspect-[16/9]` → `aspect-[3/4]`
3. Skeleton card in same file — `aspect-[16/9]` → `aspect-[3/4]`
4. `StoryCenter.tsx` — currently uses a fixed `h-[460px]` landscape-leaning container;
   should be refactored to use `PortraitFrame` for consistency
5. Seed data & database — `coverImageUrl` fields should point to portrait illustrations
6. Portrait illustrations — all three stories need portrait-format illustration assets

---

## Implementation Preferences (USER-DECIDED)
- **Aspect Ratio:** `3:4` (width:height). Confirmed preferred over 9:16 for grid readability.
- **Illustration Theme:** Asian folk stories — specifically Meitei/Kangleipak tradition.
- **Documentation:** `AGENTS.md` must be updated with a new Section 15: Illustration & Content Guidelines.
- **Skill:** A new skill file `.agents/skills/portrait-illustration/SKILL.md` should be created.

---

## Scope

### In Scope (Phase 6)
- Fix all `aspect-video` / `aspect-[16/9]` cover containers → `aspect-[3/4]`
- Refactor `StoryCenter.tsx` to use `PortraitFrame`
- Generate new portrait illustrations for all 3 seed stories
- Update `AGENTS.md` with Section 15
- Create `.agents/skills/portrait-illustration/SKILL.md`
- Update `.planning/phases/06-portrait-illustration/` with full plans

### Out of Scope (Phase 6)
- Cloudinary upload integration (tracked in STATE.md as next-priority)
- Admin CMS illustration upload flow changes (separate phase)
- Reader app auth
