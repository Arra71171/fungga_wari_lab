"use client";

import * as React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_COLORS: Record<string, string> = {
  creation_myth: "var(--brand-ember)",
  animal_fable: "var(--brand-ochre)",
  historical: "var(--chart-1)",
  legend: "var(--chart-2)",
  moral_tale: "var(--chart-3)",
  romance: "var(--chart-4)",
  adventure: "var(--chart-5)",
  supernatural: "var(--border-strong)",
  other: "var(--muted-foreground)",
};

type CategoryEntry = { category: string; count: number };

function CategoryRadialChart() {
  const [data, setData] = React.useState<CategoryEntry[] | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("stories")
      .select("category")
      .then(({ data: rows }) => {
        if (!rows) { setData([]); return; }
        const counts: Record<string, number> = {};
        for (const row of rows) {
          const cat = row.category ?? "other";
          counts[cat] = (counts[cat] ?? 0) + 1;
        }
        const sorted = Object.entries(counts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);
        setData(sorted);
      });
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-48 border border-dashed border-border bg-secondary/10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          No category data
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  const chartData = data.slice(0, 6).map((d) => ({
    name: d.category.replace(/_/g, " "),
    count: d.count,
    fill: CATEGORY_COLORS[d.category] ?? CATEGORY_COLORS.other,
  }));

  const chartConfig: ChartConfig = chartData.reduce(
    (acc, d) => {
      acc[d.name] = { label: d.name, color: d.fill };
      return acc;
    },
    {} as ChartConfig,
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 px-1">
        <div className="h-[2px] w-4 bg-primary" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          By Category
        </span>
      </div>
      <ChartContainer config={chartConfig} className="flex-1 min-h-[200px]">
        <RadialBarChart
          data={chartData}
          innerRadius="30%"
          outerRadius="100%"
          startAngle={180}
          endAngle={-180}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, maxCount]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="count"
            background={{ fill: "oklch(0.20 0.03 50 / 30%)" }}
            cornerRadius={4}
          />
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        </RadialBarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="size-2 shrink-0" style={{ backgroundColor: d.fill }} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {d.name} ({d.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CategoryRadialChart };
