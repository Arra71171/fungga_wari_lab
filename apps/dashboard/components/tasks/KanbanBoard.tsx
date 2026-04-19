"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DroppableColumn } from "./DroppableColumn";
import { DraggableTask } from "./DraggableTask";
import { TaskCard } from "@workspace/ui/components/TaskCard";
import { getAllTasks, updateTaskStatus } from "@/actions/taskActions";
import type { Database } from "@workspace/ui/types/supabase";

export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type Task = Awaited<ReturnType<typeof getAllTasks>>[number];

export const STATUSES: { id: TaskStatus; title: string }[] = [
  { id: "lore_gathering", title: "Lore Gathering" },
  { id: "translating", title: "Translating" },
  { id: "illustrating", title: "Illustrating" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export function KanbanBoard() {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  React.useEffect(() => {
    getAllTasks().then(setTasks).catch(() => setTasks([]));
  }, []);

  if (tasks === null) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading workspace...
      </div>
    );
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const isOverColumn = STATUSES.some((s) => s.id === overId);
    let newStatus: TaskStatus | undefined;

    if (isOverColumn) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = tasks!.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus) {
      const task = tasks!.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        // Optimistic update
        setTasks((prev) =>
          prev ? prev.map((t) => (t.id === taskId ? { ...t, status: newStatus! } : t)) : prev
        );
        try {
          await updateTaskStatus(taskId, newStatus);
        } catch {
          // Revert on error
          setTasks((prev) =>
            prev ? prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)) : prev
          );
        }
      }
    }
  }

  return (
    <div className="flex h-full w-full gap-6 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status.id);
          return (
            <DroppableColumn key={status.id} id={status.id} title={status.title}>
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3 min-h-[150px]">
                  {columnTasks.map((task) => (
                    <DraggableTask key={task.id} task={task as never} assignee={undefined} />
                  ))}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}

        <DragOverlay>
          {activeId && activeTask ? (
            <TaskCard
              className="opacity-80 rotate-2 scale-105 cursor-grabbing"
              title={activeTask.title}
              description={undefined}
              status={activeTask.status as never}
              priority={activeTask.priority as never}
              assigneeName={undefined}
              assigneeAvatar={undefined}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
