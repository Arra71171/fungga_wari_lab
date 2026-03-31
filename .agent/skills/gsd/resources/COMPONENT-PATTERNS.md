# Component Authoring Reference

Quick reference for building components in `packages/ui/src/components/`.

## Decision Tree

```
Need a component?
│
├── Is it a base UI primitive, or used in 2+ places?
│   ├── YES → packages/ui/src/components/ComponentName.tsx
│   └── NO  → apps/web/components/ComponentName.tsx
│
└── Does it import shared tokens/utils?
    └── ALWAYS → import { cn } from "@workspace/ui/lib/utils"
```

## Required Anatomy

Every shared component MUST have:
1. CVA variant definition
2. Function declaration (not const arrow)
3. `data-slot` attribute for CSS targeting
4. `data-variant` for variant-based CSS
5. Named export only

## Color Token Quick Reference

```tsx
// ✅ Correct
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"
className="border-border"
className="text-destructive"

// ❌ Wrong
className="bg-pink-500"
style={{ color: "#7c3aed" }}
className="bg-[#f0f0f0]"
```

## Import Order

```tsx
import * as React from "react"                    // 1. React
import Link from "next/link"                       // 2. Next.js
import { cva } from "class-variance-authority"    // 3. Third-party
import { Slot } from "radix-ui"                   // 3. Third-party
import { cn } from "@workspace/ui/lib/utils"      // 4. @workspace
import { Button } from "@workspace/ui/components/button" // 4. @workspace
import { useCustomHook } from "@/hooks/custom"    // 5. Local @/
import { helper } from "./helpers"                // 6. Relative
```

## Anti-Patterns to Avoid

```tsx
// ❌ No default exports for components
export default function Button() {}

// ✅ Named export
export function Button() {}
export { Button, buttonVariants }

// ❌ No arrow component declarations
const Button = () => {}

// ✅ Function declarations
function Button() {}

// ❌ No barrel imports
import { Button } from "@workspace/ui"

// ✅ Direct source imports
import { Button } from "@workspace/ui/components/button"
```

## CVA Pattern

```tsx
const componentVariants = cva(
  // Base classes — always applied
  "inline-flex items-center rounded-none border-transparent",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border-border bg-background",
        ghost: "hover:bg-muted hover:text-foreground",
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2",
        lg: "h-9 px-3",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```
