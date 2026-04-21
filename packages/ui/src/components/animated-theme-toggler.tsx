"use client";

import * as React from "react";
import { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export function AnimatedThemeToggler({
  className,
  duration = 600, // Slightly longer duration to match Zen Brutalist relaxed pacing
  ...props
}: AnimatedThemeTogglerProps) {
  const { setTheme, resolvedTheme } = useTheme();
  // We use a regular HTMLButtonElement ref mapped to the shadcn Button via forwardRef under the hood.
  // We cast to any here to satisfy typescript if Button doesn't strictly export it, but Button uses forwardRef.
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button) {
      // Fallback if ref isn't attached
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    
    // Calculate hypotenuse to the furthest corner
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const isDark = resolvedTheme === "dark";

    const applyTheme = () => {
      setTheme(isDark ? "light" : "dark");
    };

    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        applyTheme();
      });
    });

    const ready = transition?.ready;
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)", // Zen brutalist ease
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    }
  }, [resolvedTheme, setTheme, duration]);

  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true) }, []);

  // Clean, brutalist interactions without spinning
  return (
    <Button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className={cn(
        "relative size-10 rounded-none border-border bg-background shadow-brutal-sm hover:bg-secondary focus-visible:ring-1 focus-visible:ring-primary transition-all active:scale-95",
        className
      )}
      aria-label="Toggle theme"
      {...props}
    >
      {/* Defer icon rendering until client is mounted to prevent hydration mismatch */}
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" aria-hidden />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
