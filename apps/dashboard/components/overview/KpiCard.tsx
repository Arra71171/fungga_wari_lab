"use client";

import { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  isLoading?: boolean;
}

export function KpiCard({ title, value, icon, trend, className, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <BrutalistCard variant="default" className={cn("flex flex-col justify-between min-h-[140px] h-auto animate-pulse", className)}>
        <div className="flex justify-between items-start">
          <div className="h-4 w-24 bg-border/20" />
          <div className="h-5 w-5 bg-border/20" />
        </div>
        <div className="h-10 w-16 bg-border/20 mt-4" />
      </BrutalistCard>
    );
  }

  return (
    <BrutalistCard 
      variant="interactive" 
      className={cn("group relative flex flex-col justify-between min-h-[140px] h-auto cursor-default", className)}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-ember/0 group-hover:via-brand-ember/30 to-transparent transition-colors duration-500" />
      
      <div className="flex justify-between items-start">
        <h3 className="font-mono text-fine tracking-label uppercase text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
          {title}
        </h3>
        <div className="text-muted-foreground/50 group-hover:text-brand-ember/70 transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <span className="font-display text-4xl text-foreground tracking-tighter">
          {value}
        </span>
        {trend && (
          <span className={cn(
            "font-mono text-[10px] md:text-fine tracking-widest uppercase",
            trend.value >= 0 ? "text-brand-ember" : "text-destructive"
          )}>
            {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </BrutalistCard>
  );
}
