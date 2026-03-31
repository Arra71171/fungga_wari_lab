import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@workspace/ui/components/TaskCard";

export function DraggableTask({ task, assignee }: { task: any; assignee: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        className="cursor-grab"
        title={task.title}
        description={task.description}
        status={task.status}
        priority={task.priority}
        assigneeName={assignee?.name}
        assigneeAvatar={assignee?.avatarUrl}
      />
    </div>
  );
}
