"use client";

import { useState, useTransition } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Eye, BookCheck, CheckCircle2, ArrowDownToDot, Loader2 } from "lucide-react";
import { DashboardCard } from "@workspace/ui/components/DashboardCard";
import { Button } from "@workspace/ui/components/button";
import { getRecentActivityAction } from "@/actions/interactionActions";

type Activity = {
  _id: string;
  storyId: string;
  type: string;
  userId?: string;
  timestamp: number;
  storyTitle: string;
  storySlug: string;
};

export function ActivityFeed({ activities: initialActivities, isLoading }: { activities?: Activity[], isLoading?: boolean }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities ?? []);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState((initialActivities?.length ?? 0) === 20);

  const loadMore = () => {
    startTransition(async () => {
      const nextLimit = 20;
      const nextOffset = page * nextLimit;
      const newActivities = await getRecentActivityAction(nextLimit, nextOffset);
      
      if (newActivities.length < nextLimit) {
        setHasMore(false);
      }
      setActivities((prev) => [...prev, ...newActivities]);
      setPage((p) => p + 1);
    });
  };

  if (isLoading && activities.length === 0) {
    return (
      <DashboardCard variant="panel" className="w-full h-full min-h-[300px] animate-pulse" />
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
    <DashboardCard variant="panel" className="w-full h-[400px] flex flex-col relative group overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-ember/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="mb-4 md:mb-6 flex flex-col items-start gap-1">
        <h3 className="font-heading text-xl text-foreground">Recent Activity</h3>
        <p className="text-[10px] md:text-fine font-mono tracking-label uppercase text-muted-foreground">
          Real-Time Interaction Log
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="space-y-6 pr-4 pb-4">
          {!activities || activities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground font-sans text-xs tracking-wide">
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
                <time className="text-fine font-sans font-medium tracking-wide text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </time>
              </div>
            </div>
          ))}
          {hasMore && activities.length > 0 && (
            <div className="pt-2 pb-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isPending}
                className="rounded-none border-border-subtle bg-bg-surface text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-widest"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </DashboardCard>
  );
}
