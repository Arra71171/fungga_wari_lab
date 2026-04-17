"use client";

import * as React from "react";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { createClient } from "@/lib/supabase/client";

const DONUT_COLORS = [
  "var(--brand-ember)",      // primary ember — reads
  "var(--muted-foreground)", // muted — remaining
];

function CompletionDonutChart() {
  const [stats, setStats] = React.useState<{
    totalViews: number;
    totalReads: number;
    completionRate: number;
  } | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("stories")
      .select("view_count, read_count")
      .then(({ data }) => {
        if (!data) { setStats(null); return; }
        const totalViews = data.reduce((acc, s) => acc + (s.view_count ?? 0), 0);
        const totalReads = data.reduce((acc, s) => acc + (s.read_count ?? 0), 0);
        const completionRate = totalViews > 0 ? Math.round((totalReads / totalViews) * 100) : 0;
        setStats({ totalViews, totalReads, completionRate });
      });
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-48 border border-dashed border-border bg-secondary/10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          No data yet
        </p>
      </div>
    );
  }

  const reads = stats.totalReads;
  const remaining = Math.max(0, stats.totalViews - reads);

  const chartData = [
    { name: "Completed", value: reads },
    { name: "Started Only", value: remaining },
  ];

  const chartConfig: ChartConfig = {
    completed: { label: "Completed Reads", color: DONUT_COLORS[0] },
    started: { label: "Started Only", color: DONUT_COLORS[1] },
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 px-1">
        <div className="h-[2px] w-4 bg-primary" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Completion Rate
        </span>
      </div>

      <div className="relative flex-1 min-h-[200px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? DONUT_COLORS[0]! : DONUT_COLORS[1]!} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-heading text-3xl font-black text-foreground tabular-nums">
            {stats.completionRate}%
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Completion
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-1 justify-center">
        {chartData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div
              className="size-2 shrink-0"
              style={{ backgroundColor: i === 0 ? DONUT_COLORS[0] : DONUT_COLORS[1] }}
            />
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {d.name} ({d.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CompletionDonutChart };
