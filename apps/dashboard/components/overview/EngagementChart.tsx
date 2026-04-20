"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@workspace/ui/components/chart";

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--brand-ember)",
  },
  reads: {
    label: "Reads",
    color: "var(--brand-ochre)",
  },
} satisfies ChartConfig;

export function EngagementChart({ data, isLoading }: { data?: { date: string; views: number; reads: number }[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="w-full h-[350px] bg-bg-surface border border-border-subtle animate-pulse flex items-center justify-center">
        <div className="text-muted-foreground/30 font-mono text-sm uppercase tracking-widest">
          Loading Metrics...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[350px] bg-bg-surface border border-border-subtle flex items-center justify-center">
        <div className="text-muted-foreground/50 font-mono text-sm uppercase tracking-widest">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-border-subtle bg-bg-surface p-4 md:p-6 relative group overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-ember/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="mb-4 md:mb-6 flex flex-col items-start gap-1">
        <h3 className="font-heading text-xl text-foreground/90">Engagement Trends</h3>
        <p className="text-[10px] md:text-fine font-mono tracking-label uppercase text-muted-foreground/70">
          Views & Reads over time
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart accessibilityLayer data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid vertical={false} strokeOpacity={0.2} strokeDasharray="4 4" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={12}
            minTickGap={32}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickCount={5}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="fillReads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-reads)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-reads)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            dataKey="reads"
            type="natural"
            fill="url(#fillReads)"
            fillOpacity={0.4}
            stroke="var(--color-reads)"
            strokeWidth={2}
          />
          <Area
            dataKey="views"
            type="natural"
            fill="url(#fillViews)"
            fillOpacity={0.4}
            stroke="var(--color-views)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
