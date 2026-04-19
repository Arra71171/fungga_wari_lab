"use client";

import React from "react";
import { type CardComponentProps } from "nextstepjs";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export function CustomTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  // Step 0 has no selector — nextstepjs renders it centered.
  // In that case we want a wider welcome modal with no arrow pointer.
  const isCentered = !step.selector || step.selector === "";

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-bg-panel text-foreground shadow-brutal",
        isCentered ? "w-[520px] max-w-[95vw]" : "w-[400px] max-w-[90vw]"
      )}
    >
      {/* Ember accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-ember via-brand-ochre to-brand-glow" />

      {/* Brand watermark — decorative ember glow behind content */}
      <div
        className="pointer-events-none absolute right-0 top-0 size-48 translate-x-12 -translate-y-12 rounded-full bg-brand-ember opacity-[0.06] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {step.icon && (
              <div className="flex size-9 shrink-0 items-center justify-center border border-brand-ember/30 bg-brand-ember/10 text-base">
                {step.icon}
              </div>
            )}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-brand-ember mb-1">
                Step {currentStep + 1} of {totalSteps}
              </p>
              <h3 className="font-heading text-xl font-bold tracking-tight text-foreground leading-tight">
                {step.title}
              </h3>
            </div>
          </div>

          {step.showSkip && (
            <button
              onClick={skipTour}
              aria-label="Skip tour"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Content — accepts React nodes for rich layouts */}
        <div className="text-sm text-muted-foreground leading-relaxed font-sans">
          {step.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-[5px] rounded-full transition-all duration-300",
                  i === currentStep
                    ? "w-7 bg-brand-ember"
                    : i < currentStep
                      ? "w-[5px] bg-brand-ember/40"
                      : "w-[5px] bg-border-strong"
                )}
              />
            ))}
          </div>

          {step.showControls && (
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="h-8 w-8 border-border-subtle bg-transparent p-0 hover:bg-bg-surface hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous</span>
                </Button>
              )}
              <Button
                size="sm"
                onClick={nextStep}
                className="h-8 rounded-none bg-brand-ember px-5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-brand-ember/90"
              >
                {currentStep === totalSteps - 1 ? "Get Started" : "Next"}
                {currentStep !== totalSteps - 1 && (
                  <ChevronRight className="ml-1 size-3" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Arrow — hidden for centered welcome step */}
      <span className={cn("absolute", isCentered && "hidden")}>{arrow}</span>
    </div>
  );
}
