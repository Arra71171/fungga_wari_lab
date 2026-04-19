import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Eye, BookCheck, CheckCircle2, ArrowDownToDot } from "lucide-react";

type Activity = {
  _id: string;
  storyId: string;
  type: string;
  userId?: string;
  timestamp: number;
  storyTitle: string;
  storySlug: string;
};

export function ActivityFeed({ activities, isLoading }: { activities?: Activity[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[300px] border border-border bg-background p-6 animate-pulse" />
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view": return <Eye className="size-4 text-muted-foreground" />;
      case "read": return <BookCheck className="size-4 text-brand-ochre" />;
      case "complete": return <CheckCircle2 className="size-4 text-brand-ember" />;
      case "drop_off": return <ArrowDownToDot className="size-4 text-destructive" />;
      default: return <Eye className="size-4 text-muted-foreground" />;
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case "view": return "viewed";
      case "read": return "read";
      case "complete": return "completed";
      case "drop_off": return "dropped off from";
      default: return type;
    }
  };

  return (
    <div className="w-full h-[400px] border border-border-subtle bg-bg-surface p-6 flex flex-col relative group overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-ember/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="mb-6 flex flex-col items-start gap-1">
        <h3 className="font-heading text-xl text-foreground">Recent Activity</h3>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
          Real-Time Interaction Log
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-6">
          {!activities || activities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground font-mono text-xs uppercase tracking-widest">
              No recent activity.
            </div>
          ) : activities.map((activity) => (
            <div key={activity._id} className="group relative flex gap-4">
              <div className="relative z-10 flex size-8 items-center justify-center bg-background border border-border">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm font-heading text-foreground leading-tight">
                  <span className="text-muted-foreground">
                    Someone {getActionText(activity.type)}
                  </span>
                  <span className="font-semibold text-foreground ml-1">
                    {activity.storyTitle}
                  </span>
                </p>
                <time className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </time>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
