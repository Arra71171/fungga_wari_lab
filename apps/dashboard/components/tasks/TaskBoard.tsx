"use client";

import React, { useEffect, useState } from "react";
import { getAllTasks } from "@/actions/taskActions";
import { getAllUsers } from "@/actions/userActions";

import { TaskCard } from "./TaskCard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";
import { Loader2, Users } from "lucide-react";
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge";

type Task = Awaited<ReturnType<typeof getAllTasks>>[number];
type User = Awaited<ReturnType<typeof getAllUsers>>[number];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const loadData = () => {
    Promise.all([getAllTasks(), getAllUsers()]).then(([t, u]) => {
      setTasks(t);
      setUsers(u);
    });
  };

  useEffect(() => { loadData(); }, []);

  if (tasks === null) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-6 text-brand-ochre animate-spin" />
      </div>
    );
  }

  const renderedGroups = [
    ...users.map((user) => ({
      id: user.id,
      name: user.name ?? "Unknown Operative",
      user,
      avatarUrl: user.avatar_url ?? undefined,
      tasks: tasks.filter(
        (t) => t.assignee_id === user.id
      ),
    })),
    {
      id: "unassigned",
      name: "Unassigned Protocols",
      user: null as null,
      avatarUrl: undefined,
      tasks: tasks.filter((t) => !t.assignee_id),
    },
  ].filter((group) => group.tasks.length > 0);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-strong pb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-4xl font-display text-foreground drop-shadow-lg tracking-tight">
            Studio Tasks
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-2">
            Active directives and team assignments
          </p>
        </div>
        <CreateTaskDialog users={users} onCreated={loadData} />
      </div>

      {renderedGroups.length === 0 ? (
        <BrutalistCard variant="panel" className="flex-1 border-dashed flex flex-col items-center justify-center p-10">
          <Users className="size-10 text-muted-foreground/30 mb-4" />
          <p className="text-fine font-mono tracking-label text-muted-foreground uppercase">
            No active tasks discovered
          </p>
        </BrutalistCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 items-start pb-8">
          {renderedGroups.map((group) => (
            <div key={group.id} className="flex flex-col space-y-4">
              {/* Group Header */}
              <div className="flex items-center gap-4 border-b border-border-strong pb-4 bg-bg-base/80 sticky top-0 z-10 backdrop-blur-sm">
                {group.user ? (
                  <AvatarBadge src={group.avatarUrl} alt={group.name} size="default" />
                ) : (
                  <div className="size-10 rounded-full border border-dashed border-border-strong bg-bg-surface flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">?</span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-heading text-lg text-foreground/90 truncate">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block size-1.5 bg-brand-ochre rounded-full" />
                    <p className="text-fine font-mono text-muted-foreground/80 tracking-widest uppercase">
                      {group.tasks.length} Active {group.tasks.length === 1 ? "Task" : "Tasks"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="flex flex-col gap-3">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task as never}
                    onDeleted={(id) =>
                      setTasks((prev) => prev?.filter((t) => t.id !== id) ?? null)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
