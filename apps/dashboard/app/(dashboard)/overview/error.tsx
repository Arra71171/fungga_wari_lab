"use client";

import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { DashboardCard } from "@workspace/ui/components/DashboardCard";
import { TriangleAlert, RefreshCcw } from "lucide-react";

export default function OverviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Overview page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col h-full space-y-6 md:space-y-8 p-4 md:p-8 lg:p-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-display text-foreground tracking-tight">Overview</h1>
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-2">
          Dashboard / Error
        </p>
      </div>

      <DashboardCard variant="panel" className="flex flex-col items-center justify-center p-12 mt-12 border-destructive/20 bg-destructive/5 text-center">
        <TriangleAlert className="size-12 text-destructive mb-6" />
        <h3 className="font-heading text-xl font-semibold mb-2 text-foreground/90">
          Failed to load dashboard data
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md font-sans text-sm leading-relaxed">
          {error.message || "An unexpected error occurred while fetching the latest studio metrics and activity. Please try again."}
        </p>
        <Button
          onClick={() => reset()}
          className="rounded-none bg-background text-foreground hover:bg-secondary/80 border border-border-subtle px-8"
        >
          <RefreshCcw className="size-4 mr-2" />
          Retry Connection
        </Button>
      </DashboardCard>
    </div>
  );
}
