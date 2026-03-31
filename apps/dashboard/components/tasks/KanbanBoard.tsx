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
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Id } from "@/../../convex/_generated/dataModel";
import { DroppableColumn } from "./DroppableColumn";
import { DraggableTask } from "./DraggableTask";
import { TaskCard } from "@workspace/ui/components/TaskCard";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export const STATUSES: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export function KanbanBoard() {
  const tasks = useQuery(api.tasks.getAll);
  const teamMembers = useQuery(api.teamMembers.getAll);
  const updateTaskStatus = useMutation(api.tasks.updateStatus);

  // Local state for optimistic updates during drag
  const [activeId, setActiveId] = React.useState<Id<"tasks"> | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (tasks === undefined || teamMembers === undefined) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspace...</div>;
  }

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;
  const activeAssignee = activeTask && activeTask.assigneeId
    ? teamMembers.find(m => m.userId === activeTask.assigneeId)
    : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as Id<"tasks">);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const taskId = active.id as Id<"tasks">;
    const overId = over.id as TaskStatus | string;

    // Is it dropping over a column?
    const isOverColumn = STATUSES.some(s => s.id === overId);
    let newStatus: TaskStatus | undefined;
    
    if (isOverColumn) {
      newStatus = overId as TaskStatus;
    } else {
      // Could be dropping over another task
      const overTask = tasks?.find(t => t._id === overId);
      if (overTask) {
        newStatus = overTask.status as TaskStatus;
      }
    }

    if (newStatus) {
      const activeTask = tasks?.find(t => t._id === taskId);
      if (activeTask && activeTask.status !== newStatus) {
        // Optimistic UI updates are handled automatically by Convex reactivity typically,
        // but since we want it instant across Dnd-kit, we rely on Convex finishing the patch quickly.
        await updateTaskStatus({ taskId, status: newStatus });
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
              <SortableContext items={columnTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 min-h-[150px]">
                  {columnTasks.map((task) => {
                    const assignee = task.assigneeId
                      ? teamMembers.find(m => m.userId === task.assigneeId)
                      : undefined;
                    return (
                      <DraggableTask
                        key={task._id}
                        task={task}
                        assignee={assignee}
                      />
                    );
                  })}
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
              description={activeTask.description}
              status={activeTask.status as any}
              priority={activeTask.priority as any}
              assigneeName={activeAssignee?.name}
              assigneeAvatar={activeAssignee?.avatarUrl}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
