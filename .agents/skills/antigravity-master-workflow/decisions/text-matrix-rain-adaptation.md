# Decision: TextMatrixRain Adaptation

## Context
The user requested integrating `text-matrix-rain.json` from `pixel-perfect.space` for the landing page hero H1 title. 
The component's raw JSON listed `framer-motion` as a dependency, but its actual implementation source code used `gsap` and `@gsap/react`, with hardcoded hex colors (`#00ff00`) and arbitrary configuration.

## Rationale
To comply with our strict project guidelines:
1. **No Unnecessary Dependencies:** The monorepo already uses `framer-motion@12` extensively. Adding `gsap` (plus its specific react wrapper) adds massive bundle bloat for a single typography decoding animation.
2. **Zen Brutalist Aesthetics:** The matrix green (`#00ff00`) and pure white (`#ffffff`) are discordant with our warm, cultural, amber folk-fire palette (`var(--brand-ember)` -> `var(--primary)`).
3. **Shared UI Doctrine:** Components fetched for the web app must live in `@workspace/ui/components` so they can be reused across the monorepo context.

## Implementation Details
- Hand-authored a replacement `TextMatrixRain.tsx` in `packages/ui/src/components/`.
- **GSAP Elimination:** Used purely vanilla React primitives (`useEffect`, `setInterval`, `setTimeout`) to replicate the exact scramble-and-lock behavior, decoupling it from GSAP timelines.
- **Tokens Over Hex:** Applied `var(--primary)` for the scrambling text/glow, and `var(--foreground)` for the resolved frame, respecting dark/light cascades without any hardcoding.
- **Accessibility:** Appended an `aria-label` encapsulating `children`, accompanied by a visually hidden span containing the target text to act as a fallback before JS binds.
- **Reduced Motion:** Integrated `prefers-reduced-motion: reduce` respect, immediately aborting the random ticks for users with motion sensitivity.

## Conclusion
The component is fully functional, styled per standard, entirely type-safe via strict checking, and does not demand any registry pollution.
