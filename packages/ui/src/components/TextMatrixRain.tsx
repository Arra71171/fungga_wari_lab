"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

type TextMatrixRainProps = {
  children: string;
  className?: string;
  /** Total decode duration in seconds (default: 2.5) */
  duration?: number;
  /** Whether to loop the animation (default: false) */
  repeat?: boolean;
  /** Re-trigger the full scramble→decode on mouse hover (default: false) */
  hoverRescramble?: boolean;
};

/**
 * TextMatrixRain — decodes scrambled katakana/numeric text into the final
 * string using per-character setInterval scrambling + setTimeout lock timing.
 *
 * Adapted from pixel-perfect.space text-matrix-rain without GSAP,
 * using CSS variable tokens (--primary, --foreground) instead of hex.
 * Characters are grouped into word-level wrappers to prevent mid-word
 * line breaks.
 */
function TextMatrixRain({
  children,
  className = "",
  duration = 2.5,
  repeat = false,
  hoverRescramble = false,
}: TextMatrixRainProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  // Incrementing this causes the useEffect to re-run the full animation
  const [triggerCount, setTriggerCount] = React.useState(0);

  const handleInteraction = React.useCallback(() => {
    if (hoverRescramble) {
      setTriggerCount((c) => c + 1);
    }
  }, [hoverRescramble]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const finalText = children;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = finalText;
      return;
    }
    const matrixChars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

    const intervals: ReturnType<typeof setInterval>[] = [];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const runAnimation = () => {
      el.innerHTML = "";

      // ── Build word-level wrapper spans + per-char spans ──────────────────
      // Split text into tokens: words (non-whitespace) and whitespace runs
      const tokens = finalText.match(/\S+|\s+/g) ?? [];

      // Flat record of every animatable character span
      const charEntries: Array<{ span: HTMLSpanElement; finalChar: string }> = [];

      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          // Whitespace → plain text node so the browser collapses/expands naturally
          el.appendChild(document.createTextNode(token));
          return;
        }

        // Non-whitespace word → nowrap wrapper so chars never break mid-word
        const wordWrap = document.createElement("span");
        wordWrap.style.whiteSpace = "nowrap";
        wordWrap.style.display = "inline";

        token.split("").forEach((char) => {
          const span = document.createElement("span");
          span.style.display = "inline-block";
          span.style.color = "var(--primary)";
          span.style.textShadow = "0 0 10px var(--primary)";
          span.style.transition = "color 0.2s ease-out, text-shadow 0.5s ease-out";
          span.textContent =
            matrixChars[Math.floor(Math.random() * matrixChars.length)] || char;
          wordWrap.appendChild(span);
          charEntries.push({ span, finalChar: char });
        });

        el.appendChild(wordWrap);
      });

      // ── Schedule scramble + lock for each character ──────────────────────
      const charStates = new Array(charEntries.length).fill(false);
      const maxDelay = duration * 0.78;

      charEntries.forEach(({ span, finalChar }, i) => {
        const positionalDelay = (i / charEntries.length) * maxDelay;
        const lockDelay = positionalDelay + Math.random() * 0.35;

        const scrambleInterval = setInterval(() => {
          if (!charStates[i]) {
            span.textContent =
              matrixChars[Math.floor(Math.random() * matrixChars.length)] || finalChar;
          }
        }, 50);
        intervals.push(scrambleInterval);

        const lockTimeout = setTimeout(() => {
          clearInterval(scrambleInterval);
          charStates[i] = true;
          span.textContent = finalChar;

          // Lock flash: settle to foreground with amber glow
          span.style.color = "var(--foreground)";
          span.style.textShadow =
            "0 0 18px var(--primary), 0 0 36px var(--primary)";

          // Glow fades after a short settle period
          const settleTimeout = setTimeout(() => {
            span.style.textShadow = "none";
            span.style.color = "inherit";
          }, 380);
          timeouts.push(settleTimeout);
        }, lockDelay * 1000);
        timeouts.push(lockTimeout);
      });
    };

    runAnimation();

    let repeatInterval: ReturnType<typeof setInterval> | undefined;
    if (repeat) {
      repeatInterval = setInterval(() => {
        intervals.forEach(clearInterval);
        timeouts.forEach(clearTimeout);
        intervals.length = 0;
        timeouts.length = 0;
        runAnimation();
      }, (duration + 2) * 1000);
    }

    return () => {
      if (repeatInterval) clearInterval(repeatInterval);
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [children, duration, repeat, triggerCount]);

  return (
    /*
     * Outer span carries the aria-label so screen readers read the
     * final text immediately without waiting for the animation.
     *
     * Layout strategy:
     *   - invisible placeholder span → establishes intrinsic height/width
     *   - animated span (absolute inset-0) → overlays the placeholder
     *
     * This avoids CLS (cumulative layout shift) on mount.
     */
    <span
      className={cn("relative inline-block cursor-default", className)}
      aria-label={children}
      aria-live="off"
      onMouseEnter={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Invisible text — gives the container its natural dimensions pre-JS */}
      <span className="invisible select-none pointer-events-none" aria-hidden="true">
        {children}
      </span>
      {/* Animated character container */}
      <span
        ref={containerRef}
        className="absolute inset-0 inline"
        aria-hidden="true"
      />
    </span>
  );
}

export { TextMatrixRain };
