import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

type TopStory = {
  id: string;
  title: string;
  slug: string;
  view_count: number | null;
  read_count: number | null;
};

export function TopStoriesTable({ stories, isLoading }: { stories?: TopStory[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <BrutalistCard variant="panel" className="w-full h-full min-h-[300px] animate-pulse" />
    );
  }

  return (
    <BrutalistCard variant="panel" className="w-full">
      <div className="mb-4 md:mb-6 flex flex-col items-start gap-1">
        <h3 className="font-heading text-xl text-foreground">Top Manuscripts</h3>
        <p className="text-[10px] md:text-fine font-mono tracking-label uppercase text-muted-foreground">
          Ranked by View Engagement
        </p>
      </div>

      <div className="w-full overflow-x-auto pb-4">

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-fine uppercase tracking-widest text-muted-foreground">Title</TableHead>
            <TableHead className="text-right font-mono text-fine uppercase tracking-widest text-muted-foreground">Views</TableHead>
            <TableHead className="text-right font-mono text-fine uppercase tracking-widest text-muted-foreground">Reads</TableHead>
            <TableHead className="text-right font-mono text-fine uppercase tracking-widest text-muted-foreground">Completion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!stories || stories.length === 0 ? (
            <TableRow className="border-border hover:bg-secondary/50 transition-colors">
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground font-mono text-xs">
                No manuscripts found in archive.
              </TableCell>
            </TableRow>
          ) : stories.map((story) => {
            const views = story.view_count ?? 0;
            const reads = story.read_count ?? 0;
            const completionRate = views > 0 ? Math.round((reads / views) * 100) : 0;
            return (
              <TableRow key={story.id} className="border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                <TableCell className="font-heading font-medium text-foreground">
                  {story.title}
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums text-foreground">
                  {views.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums text-foreground">
                  {reads.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1 bg-border">
                      <div 
                        className="h-full bg-brand-ochre" 
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground w-8">
                      {completionRate}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </BrutalistCard>
  );
}
