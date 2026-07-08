import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@workspace/ui/lib/utils";


interface DroppableColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function DroppableColumn({ id, title, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-none bg-muted/30">
      <div className="flex h-12 items-center px-4 font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </div>
      <div
        ref={setNodeRef}
        className={cn("flex-1 rounded-none p-3 transition-colors", isOver ? "bg-muted/50" : "bg-transparent")}
      >
        {children}
      </div>
    </div>
  );
}
