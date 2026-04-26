"use client";

import { Trash2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { deleteTask } from "@/actions/taskActions";
import type { Database } from "@workspace/ui/types/supabase";
import { SendTaskEmailDialog } from "./SendTaskEmailDialog";

import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee_id?: string | null;
  };
  users?: User[];
  onDeleted?: (id: string) => void;
};

export function TaskCard({ task, users = [], onDeleted }: TaskCardProps) {
  const handleDelete = async () => {
    await deleteTask(task.id);
    onDeleted?.(task.id);
  };

  return (
    <BrutalistCard
      variant="interactive"
      className={cn(
        "group relative p-5",
        task.priority === "high"
          ? "border-brand-ember/60 hover:border-brand-ember"
          : ""
      )}
    >
      {/* Priority Indicator Line */}
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-[2px] transition-colors",
          task.priority === "high"
            ? "bg-brand-ember"
            : task.priority === "medium"
            ? "bg-brand-ochre/70"
            : "bg-muted-foreground/20"
        )}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <h4 className="font-heading text-lg text-foreground leading-snug break-words pr-6 group-hover:text-brand-ochre transition-colors">
          {task.title}
        </h4>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive absolute top-4 right-4 bg-bg-base/80 p-1 md:backdrop-blur"
          aria-label="Delete task"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground/80">
            {task.priority === "high" && <AlertCircle className="size-3.5 text-brand-ember" />}
            {task.priority === "medium" && <Clock className="size-3.5 text-brand-ochre" />}
            {task.priority === "low" && (
              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            )}
            <span className="uppercase tracking-widest text-nano font-bold">{task.priority}</span>
          </div>
          <SendTaskEmailDialog
            taskId={task.id}
            taskTitle={task.title}
            priority={task.priority}
            users={users}
          />
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 border text-nano uppercase tracking-label font-bold",
            task.status === "done"
              ? "border-brand-ember/30 text-brand-ember bg-brand-ember/10"
              : task.status === "lore_gathering"
              ? "border-brand-ochre/30 text-brand-ochre bg-brand-ochre/10"
              : task.status === "illustrating"
              ? "border-brand-ochre/50 text-brand-ochre bg-brand-ochre/10"
              : "border-border-strong text-muted-foreground/80 bg-bg-base"
          )}
        >
          {task.status === "done" && <CheckCircle2 className="size-3" />}
          <span>{task.status.replace(/_/g, " ")}</span>
        </div>
      </div>
    </BrutalistCard>
  );
}
