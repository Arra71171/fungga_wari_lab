# Phase 0 — Plan 1: Core UI Primitives

## Context
This plan implements: Core shared UI components (`Badge`, `AvatarBadge`, `ProgressBar`) required for Phase 0 (R26). These are base primitives needed by more complex components.
Dependencies: none

## Tasks

<task type="auto">
  <name>Create Badge Component</name>
  <files>packages/ui/src/components/badge.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create a `Badge` component in `@workspace/ui` using `cva`.
    Variants should include: `default`, `secondary`, `destructive`, `outline`.
    Use `text-xs font-medium px-2.5 py-0.5 rounded-full border`.
    Adhere strictly to `AGENTS.md` (use semantic tokens like `bg-primary`, `text-primary-foreground`, exported `badgeVariants`, and `cn()`).
  </action>
  <verify>Check exports and variants match the established component pattern.</verify>
  <done>Badge component is created with standard variants and correctly uses Tailwind tokens.</done>
</task>

<task type="auto">
  <name>Create AvatarBadge Component</name>
  <files>packages/ui/src/components/avatar-badge.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create an `AvatarBadge` component mapping to a circular avatar with an optional notification/status dot.
    It should compose `@radix-ui/react-avatar` (which should be installed in `@workspace/ui` if not present).
    Alternatively, build a simple HTML-based avatar primitive using standard `cva` and `cn`. Include `size` variants (`sm`, `md`, `lg`).
    Ensure fallback handling for missing images (displaying initials text with `font-heading`).
  </action>
  <verify>Ensure valid React component structure and exports.</verify>
  <done>AvatarBadge component is implemented and exported from `@workspace/ui/components`.</done>
</task>

<task type="auto">
  <name>Create ProgressBar Component</name>
  <files>packages/ui/src/components/progress-bar.tsx</files>
  <style-reference>packages/ui/src/components/button.tsx</style-reference>
  <action>
    Create a `ProgressBar` component to show reading/task progress.
    Accepts a `value` (0-100) and an optional `label`.
    Use an outer `bg-secondary` container and an inner `bg-primary` bar whose width tracks the `value`.
    Ensure height is minimal (e.g., `h-2` or `h-3`) but customizable via `className`.
    Apply `rounded-full` or brutalist `rounded-none` depending on design standard (stick to `rounded-sm` as base radius from `AGENTS.md` is `0.625rem`).
  </action>
  <verify>Check prop types (`value: number`) and Tailwind classes.</verify>
  <done>ProgressBar is fully typed and uses exact percent width inline styles `w-[${value}%]` for the indicator.</done>
</task>

## Acceptance Criteria
- [ ] `Badge`, `AvatarBadge`, and `ProgressBar` components are implemented in `@workspace/ui`.
- [ ] All components use `cva`, `cn`, and export named components.
- [ ] No arbitrary colors are used; only design tokens (e.g., `primary`, `secondary`, `destructive`).
