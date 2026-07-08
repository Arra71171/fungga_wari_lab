---
name: Fungga Wari Lab
version: "1.0"
colors:
  background: "oklch(0.96 0.022 75)"
  foreground: "oklch(0.10 0.03 45)"
  card: "oklch(0.99 0.010 72)"
  card-foreground: "oklch(0.10 0.03 45)"
  primary: "oklch(0.58 0.21 43)"
  primary-foreground: "oklch(0.99 0.005 72)"
  secondary: "oklch(0.89 0.04 70)"
  secondary-foreground: "oklch(0.15 0.04 48)"
  muted: "oklch(0.89 0.04 70)"
  muted-foreground: "oklch(0.38 0.06 52)"
  accent: "oklch(0.89 0.04 70)"
  destructive: "oklch(0.58 0.22 25)"
  border: "oklch(0.68 0.04 62)"
  cinematic-bg: "oklch(0.97 0.015 75)"
  cinematic-panel: "oklch(0.93 0.018 75)"
  cinematic-text: "oklch(0.10 0.03 45)"
  cinematic-accent: "oklch(0.58 0.21 43)"
  cinematic-border: "oklch(0.75 0.025 65)"
typography:
  sans:
    fontFamily: var(--font-sans)
  display:
    fontFamily: var(--font-display)
  heading:
    fontFamily: var(--font-heading)
  mono:
    fontFamily: var(--font-mono)
rounded:
  base: 0px
spacing:
  base: 4px
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. The UI evokes a premium matte finish — a high-end broadsheet or contemporary gallery. The aesthetic is strictly Nordic Minimalist, orthogonal, clean, and highly structured with zero curves.

## Colors

The palette is rooted in a warm ivory/manuscript base with a single saturated accent color (Amber fire).

- **Background:** Warm ivory, not cold flat white.
- **Foreground:** Rich near-black ink for high contrast readability.
- **Primary:** Saturated amber fire (Brand Ember), acting as the sole driver for primary interactions.
- **Cinematic Reader:** A specialized dark/parchment theme specifically tuned for immersive reading, adhering to strict chroma and lightness ladders.

## Typography

Typography prioritizes clarity, utilizing explicit display fonts for hero text, heading fonts for structural hierarchies, sans-serif for body copy, and mono for technical details.

## Layout

Mobile-first responsive design based on Tailwind v4. The content area is constrained for optimal reading length.

## Elevation & Depth

Shadows are soft, diffuse, and elegant (e.g., `0 4px 20px 0 oklch(0 0 0 / 0.05)`). They create subtle depth layers without harsh borders. We do not use brutalist, solid, offset drop-shadows.

## Shapes

We employ an elegant, modern aesthetic. Action buttons and primary CTA elements are pill-shaped (`rounded-full`). Large image frames and illustration containers use soft, large radii (`rounded-2xl` or `rounded-3xl`).

Do not use sharp, rigid boxes for primary interactive elements.

## Do's and Don'ts

- **DO** use semantic Tailwind utilities (`bg-primary`, `text-foreground`).
- **DO** use the `cinematic-*` token subsystem correctly for reader surfaces.
- **DON'T** hardcode hex, rgb, or hsl colors. Never use `oklch(...)` raw values in component inline styles.
- **DON'T** use generic Tailwind colors like `red-500` or `blue-600`.
- **DON'T** use a border token as a hover background.
