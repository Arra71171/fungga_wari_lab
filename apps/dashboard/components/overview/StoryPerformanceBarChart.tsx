"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";
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

type TopStory = {
  id: string;
  title: string;
  slug: string;
  view_count: number | null;
  read_count: number | null;
};

export function StoryPerformanceBarChart({ stories, isLoading }: { stories?: TopStory[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <BrutalistCard variant="panel" className="w-full h-[350px] animate-pulse flex items-center justify-center">
        <div className="text-muted-foreground/30 font-mono text-sm uppercase tracking-widest">
          Loading Performance...
        </div>
      </BrutalistCard>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <BrutalistCard variant="panel" className="w-full h-[350px] flex items-center justify-center">
        <div className="text-muted-foreground/50 font-mono text-sm uppercase tracking-widest">
          No stories available
        </div>
      </BrutalistCard>
    );
  }

  const data = stories.slice(0, 5).map(s => ({
    title: s.title.length > 20 ? s.title.substring(0, 20) + "..." : s.title,
    views: s.view_count || 0,
    reads: s.read_count || 0,
  }));

  return (
    <BrutalistCard variant="panel" className="w-full h-full relative group overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-ochre/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="mb-4 md:mb-6 flex flex-col items-start gap-1">
        <h3 className="font-heading text-xl text-foreground/90">Top Performing Manuscripts</h3>
        <p className="text-[10px] md:text-fine font-mono tracking-label uppercase text-muted-foreground/70">
          Views vs Reads Comparison
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart accessibilityLayer data={data} margin={{ left: -20, right: 10 }} barGap={2} barCategoryGap="20%">
          <CartesianGrid vertical={false} strokeOpacity={0.2} strokeDasharray="4 4" />
          <XAxis 
            dataKey="title" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={12}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickCount={5}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          />
          <ChartTooltip cursor={{ fill: "var(--muted)/10" }} content={<ChartTooltipContent indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="reads" fill="var(--color-reads)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </BrutalistCard>
  );
}
