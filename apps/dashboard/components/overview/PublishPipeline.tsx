"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

const chartConfig = {
  stories: { label: "Manuscripts" },
  Draft: { label: "Draft", color: "oklch(0.55 0.06 50)" },
  "In Translation": { label: "Translating", color: "oklch(0.65 0.16 65)" },
  "In Illustration": { label: "Illustrating", color: "oklch(0.60 0.18 45)" },
  "Published Internally": { label: "Team Review", color: "oklch(0.70 0.20 45)" },
  Live: { label: "Live", color: "oklch(0.65 0.20 45)" },
} satisfies ChartConfig;

type Props = {
  data?: { status: string; count: number; fill: string }[];
  totalStories?: number;
  isLoading?: boolean;
};

export function PublishPipeline({ data, totalStories, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="w-full h-[350px] bg-bg-surface border border-border-subtle animate-pulse flex items-center justify-center">
        <div className="text-muted-foreground/30 font-mono text-sm uppercase tracking-widest">
          Loading Pipeline...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-border-subtle bg-bg-surface p-6 relative group overflow-hidden">
      <div className="mb-2 flex flex-col items-start gap-1">
        <h3 className="font-heading text-xl text-foreground/90">Publish Pipeline</h3>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/70">
          Manuscripts by current stage
        </p>
      </div>

      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  const cx = viewBox.cx as number;
                  const cy = viewBox.cy as number;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={cx}
                        y={cy}
                        className="fill-foreground text-3xl font-bold"
                        fontSize={28}
                        fontWeight="bold"
                      >
                        {totalStories?.toLocaleString() ?? 0}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 22}
                        className="fill-muted-foreground"
                        fontSize={10}
                        letterSpacing="0.15em"
                      >
                        TOTAL
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(data ?? []).filter(d => d.count > 0).map(d => (
          <span key={d.status} className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <span className="inline-block size-2 rounded-none" style={{ backgroundColor: d.fill }} />
            {d.status} ({d.count})
          </span>
        ))}
      </div>
    </div>
  );
}
