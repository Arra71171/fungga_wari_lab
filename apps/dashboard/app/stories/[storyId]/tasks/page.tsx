"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, CheckSquare, Clock } from "lucide-react";
import Link from "next/link";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { getTasksByStoryId, updateTaskStatus } from "@/actions/taskActions";
import { getAllUsers } from "@/actions/userActions";
import { getStoryById } from "@/actions/storyActions";
import type { Database } from "@workspace/ui/types/supabase";

type Task = Awaited<ReturnType<typeof getTasksByStoryId>>[number];
type TaskStatus = Database["public"]["Enums"]["task_status"];
type TeamMember = Awaited<ReturnType<typeof getAllUsers>>[number];

export default function StoryTasksPage() {
  const params = useParams();
  const rawStoryId = params?.storyId;
  const storyId =
    typeof rawStoryId === "string" && rawStoryId.length > 0 && !rawStoryId.startsWith("[")
      ? rawStoryId
      : null;

  const [storyTitle, setStoryTitle] = React.useState<string>("");
  const [tasks, setTasks] = React.useState<Task[] | undefined>(undefined);
  const [users, setUsers] = React.useState<TeamMember[]>([]);

  React.useEffect(() => {
    if (!storyId) return;

    getStoryById(storyId).then((s) => setStoryTitle(s?.title ?? ""));
    getTasksByStoryId(storyId).then(setTasks).catch(() => setTasks([]));
    getAllUsers().then(setUsers).catch(() => setUsers([]));
  }, [storyId]);

  const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === "done" ? "lore_gathering" : "done";
    // Optimistic update
    setTasks((prev) =>
      prev?.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev?.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
      );
    }
  };

  const onTaskCreated = () => {
    if (!storyId) return;
    getTasksByStoryId(storyId).then(setTasks).catch(() => setTasks([]));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-in fade-in duration-500">

      {/* Top Nav Area */}
      <header className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <Link
            href={storyId ? `/stories/${storyId}` : "/stories"}
            className="text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="size-8 rounded-full bg-cinematic-border border border-border flex items-center justify-center group-hover:bg-bg-overlay group-hover:border-brand-ember/50">
              <ArrowLeft className="size-4" />
            </div>
          </Link>
          <div className="h-4 w-px bg-border/20" />
          <span className="font-mono text-xs uppercase tracking-label text-brand-ember/80 font-bold">
            Workflow Engine
          </span>
          <span className="text-muted-foreground/30 px-2">/</span>
          <span className="font-heading text-sm text-foreground/80">
            {storyTitle || "Loading..."}
          </span>
        </div>
        <div>
          <CreateTaskDialog
            users={users}
            storyId={storyId ?? ""}
            onCreated={onTaskCreated}
          />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-12">
        <div className="space-y-12">

          <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between border-b border-border-subtle pb-8">
            <div className="space-y-2">
              <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground drop-shadow-lg">
                Team Assignments
              </h1>
              <p className="text-muted-foreground font-mono text-xs max-w-lg leading-relaxed mix-blend-plus-lighter tracking-subtle uppercase">
                Coordinate the transcription and illustration pipeline.
              </p>
            </div>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-fine font-mono uppercase tracking-label text-muted-foreground">
              <div className="col-span-5">Directive</div>
              <div className="col-span-3">Operative</div>
              <div className="col-span-2">Deadline</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Rows */}
            {tasks === undefined ? (
              <div className="px-6 py-5 border border-border-subtle text-muted-foreground font-mono text-sm text-center">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="px-6 py-5 border border-border-subtle text-muted-foreground font-mono text-sm text-center">
                No tasks initialized for this story yet.
              </div>
            ) : (
              tasks.map((task) => {
                const assignee = task.assignee_id
                  ? users.find((u) => u.id === task.assignee_id)
                  : null;
                const assigneeName = assignee
                  ? (assignee.alias ?? assignee.name ?? "Unknown Operative")
                  : "Unassigned";

                const statusLabel = task.status.replace("_", " ");
                const isDone = task.status === "done";
                const isInProgress = task.status !== "done" && task.status !== "lore_gathering";

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 bg-bg-overlay/20 border border-border-subtle rounded-sm hover:border-brand-ember/30 hover:bg-bg-overlay/40 transition-all group items-center"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status as TaskStatus)}
                        aria-label={isDone ? "Mark task incomplete" : "Mark task complete"}
                        className="focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember rounded-sm group-hover:scale-110 transition-transform"
                      >
                        <CheckSquare
                          className={cn(
                            "size-4",
                            isDone ? "text-brand-ember" : "text-muted-foreground/30 hover:text-brand-ember/50"
                          )}
                        />
                      </button>
                      <span
                        className={cn(
                          "font-heading text-sm",
                          isDone ? "line-through text-muted-foreground/50" : "text-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <span
                       className={cn(
                          "inline-flex items-center px-2 py-1 text-fine font-mono tracking-widest uppercase border",
                          task.assignee_id
                            ? "border-brand-ember/20 bg-brand-ember/5 text-brand-ember/80"
                            : "border-dashed border-border-strong text-muted-foreground/50"
                        )}
                      >
                        {assigneeName}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2 text-xs font-mono text-muted-foreground/70">
                      <Calendar className="size-3" />
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Deadline"}
                    </div>

                    <div className="col-span-2 text-right flex justify-end">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 px-2.5 py-1 text-fine font-mono tracking-relaxed uppercase border",
                          isDone
                            ? "border-brand-ember/50 text-brand-ember bg-brand-ember/10"
                            : isInProgress
                            ? "border-brand-ochre/30 text-brand-ochre bg-brand-ochre/10"
                            : "border-border text-muted-foreground/60 bg-cinematic-border"
                        )}
                      >
                        {isInProgress && <Clock className="size-3 animate-pulse" />}
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
