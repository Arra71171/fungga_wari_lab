# Design Token Reference

Complete reference for design tokens defined in `packages/ui/src/styles/globals.css`.

## Color Tokens

### Core Palette

| CSS Variable | Tailwind Class | Light Value | Dark Value | Purpose |
|---|---|---|---|---|
| `--background` | `bg-background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page background |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--primary` | `bg-primary` | `oklch(0.518 0.253 323.949)` | `oklch(0.452 0.211 324.591)` | Brand pink/magenta |
| `--primary-foreground` | `text-primary-foreground` | `oklch(0.977 0.017 320.058)` | same | Text on primary |
| `--secondary` | `bg-secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Secondary surfaces |
| `--secondary-foreground` | `text-secondary-foreground` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Text on secondary |
| `--muted` | `bg-muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted backgrounds |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Subtle/secondary text |
| `--accent` | `bg-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Accent surfaces |
| `--accent-foreground` | `text-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent |
| `--destructive` | `text-destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error/danger |
| `--border` | `border-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borders |
| `--input` | `border-input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `ring-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus rings |

### Card Tokens
| CSS Variable | Tailwind Class | Purpose |
|---|---|---|
| `--card` | `bg-card` | Card background |
| `--card-foreground` | `text-card-foreground` | Card text |
| `--popover` | `bg-popover` | Popover background |
| `--popover-foreground` | `text-popover-foreground` | Popover text |

### Sidebar Tokens
| CSS Variable | Tailwind Class | Purpose |
|---|---|---|
| `--sidebar` | `bg-sidebar` | Sidebar background |
| `--sidebar-foreground` | `text-sidebar-foreground` | Sidebar text |
| `--sidebar-primary` | `bg-sidebar-primary` | Active items |
| `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` | Active item text |
| `--sidebar-accent` | `bg-sidebar-accent` | Sidebar hover states |
| `--sidebar-border` | `border-sidebar-border` | Sidebar borders |

## Border Radius Tokens

| CSS Variable | Tailwind Class | Value |
|---|---|---|
| `--radius` (base) | — | `0.625rem` |
| `--radius-sm` | `rounded-sm` | `calc(0.625rem * 0.6)` |
| `--radius-md` | `rounded-md` | `calc(0.625rem * 0.8)` |
| `--radius-lg` | `rounded-lg` | `0.625rem` |
| `--radius-xl` | `rounded-xl` | `calc(0.625rem * 1.4)` |
| `--radius-2xl` | `rounded-2xl` | `calc(0.625rem * 1.8)` |

> **Note:** Button component intentionally uses `rounded-none` — orthogonal design decision.

## Typography Tokens

| CSS Variable | Tailwind Class | Source |
|---|---|---|
| `--font-heading` | `font-heading` | Defined in `apps/web/app/layout.tsx` |
| `--font-mono` | `font-mono` | Defined in `apps/web/app/layout.tsx` |

## Chart Colors

| Token | Usage |
|---|---|
| `--chart-1` through `--chart-5` | Data visualization only |

## Adding New Tokens

When you need a new color or token:

1. **Add to `:root` in `globals.css`:**
```css
:root {
  --your-new-token: oklch(0.5 0.1 250);
}
```

2. **Add dark mode variant:**
```css
.dark {
  --your-new-token: oklch(0.7 0.1 250);
}
```

3. **Register in `@theme inline`:**
```css
@theme inline {
  --color-your-new-token: var(--your-new-token);
}
```

4. **Use in components:**
```tsx
className="bg-your-new-token text-your-new-token-foreground"
```

## Opacity Modifiers

Use Tailwind's opacity modifier syntax with tokens:
```tsx
className="bg-primary/90"      // 90% opacity primary
className="text-foreground/70" // 70% opacity foreground
className="border-border/50"   // 50% opacity border
```

## Dark Mode

Dark mode is applied via the `.dark` class:
```tsx
// Automatic — tokens handle dark mode
className="bg-background text-foreground"

// Manual dark overrides (rarely needed)
className="bg-white dark:bg-black"  // ❌ Avoid — use tokens instead
```
