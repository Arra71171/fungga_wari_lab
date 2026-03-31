"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Search, Plus, UserPlus, SlidersHorizontal, GripVertical } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { RichTextEditor } from "@workspace/ui/components/editor/rich-text-editor";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";

const COLUMNS = [
  { id: "lore_gathering", title: "Lore Gathering" },
  { id: "translating", title: "Translation" },
  { id: "illustrating", title: "Illustration" },
  { id: "review", title: "Final Review" },
  { id: "done", title: "Done" },
];

function SortableTaskItem({ task, onSelect }: { task: any; onSelect: (task: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-24 bg-secondary/5 border-2 border-dashed border-primary/50 rounded-none opacity-50" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background border border-border/50 rounded-none shadow-sm group hover:border-primary/50 transition-colors flex flex-col"
    >
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-2 border-b border-border/20 cursor-grab active:cursor-grabbing bg-secondary/10 shrink-0"
      >
        <span className="text-[10px] uppercase font-bold tracking-wider text-primary/80 font-mono">#{task._id.slice(-6)}</span>
        <GripVertical className="size-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
      </div>

      <div 
        onClick={() => onSelect(task)}
        className="p-4 cursor-pointer flex-1 flex flex-col"
      >
        <h4 className="text-sm font-medium leading-snug mb-3 group-hover:text-primary transition-colors">{task.title}</h4>
      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {task.assigneeId && (
            <div className="size-6 rounded-none bg-secondary border border-background flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground">
              <UserPlus className="size-3" />
            </div>
          )}
        </div>
        {task.priority && (
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-none capitalize">
            {task.priority}
          </span>
        )}
      </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const allTasks = useQuery(api.tasks.getAll);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const updateTaskDetails = useMutation(api.tasks.updateDetails);
  
  const [activeTask, setActiveTask] = React.useState<any | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks?.find((t: any) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    
    if (!over) return;
    
    // Check if we dropped over a column id or another sortable item
    const targetStatus = COLUMNS.find(c => c.id === over.id)?.id || 
                         allTasks?.find((t: any) => t._id === over.id)?.status;
                         
    if (targetStatus && allTasks) {
      const activeTaskData = allTasks.find((t: any) => t._id === active.id);
      if (activeTaskData && activeTaskData.status !== targetStatus) {
        // Optimistic update could go here
        await updateStatus({ taskId: activeTaskData._id as any, status: targetStatus });
      }
    }
  };

  // Memoize grouped tasks
  const groupedTasks = React.useMemo(() => {
    if (!allTasks) return {};
    
    const groups: Record<string, any[]> = {};
    COLUMNS.forEach((col) => {
      groups[col.id] = allTasks
        .filter((t: any) => t.status === col.id)
        .filter((t: any) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    return groups;
  }, [allTasks, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-6 shrink-0">
        <div>
          <h1 className="font-display text-4xl italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Team Workflow
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Track translation, illustration, and review progress across stories.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9 h-10 bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 px-3 bg-secondary/50 border-border/50">
            <SlidersHorizontal className="size-4 mr-2 text-muted-foreground" /> View
          </Button>
          <Button className="h-10 px-4 shadow-sm shadow-brand-ember/20">
            <Plus className="size-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max pb-4">
            {COLUMNS.map((column) => {
              const items = groupedTasks[column.id] || [];
              
              return (
                <div 
                  key={column.id} 
                  className="flex flex-col w-80 bg-secondary/10 border border-border/40 rounded-none overflow-hidden shadow-sm"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/20 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-sm">{column.title}</h3>
                      <span className="flex items-center justify-center bg-background border border-border/50 text-muted-foreground text-xs rounded-none h-5 px-2 font-mono">
                        {items.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground">
                      <Plus className="size-3" />
                    </Button>
                  </div>

                  {/* Column Content (Scrollable) */}
                  <SortableContext 
                    id={column.id} 
                    items={items.map((t: any) => t._id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 pb-8">
                      {items.length === 0 && (
                        <div className="h-24 w-full border-2 border-dashed border-border/30 rounded-none flex flex-col items-center justify-center text-muted-foreground/50 bg-background/30 text-xs font-mono">
                          Drop tasks here
                        </div>
                      )}
                      
                      {items.map((task: any) => (
                        <SortableTaskItem key={task._id} task={task} onSelect={setSelectedTask} />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 rotate-3 scale-105 cursor-grabbing">
                <div className="p-4 bg-background border border-primary/50 rounded-none shadow-2xl">
                  <h4 className="text-sm font-medium leading-snug">{activeTask.title}</h4>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl border-l border-border/40 bg-background shadow-brutal p-0 flex flex-col rounded-none overflow-hidden">
          {selectedTask && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-border/30 bg-secondary/10 shrink-0">
                <SheetTitle className="font-heading text-xl">{selectedTask.title}</SheetTitle>
                <SheetDescription className="font-mono text-xs flex items-center gap-3">
                  <span>ID: #{selectedTask._id.slice(-6)}</span>
                  <span>|</span>
                  <span className="capitalize text-primary">{selectedTask.status.replace('_', ' ')}</span>
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 bg-secondary/5">
                <div className="space-y-4">
                  <h3 className="text-sm font-mono font-bold text-muted-foreground uppercase tracking-wider mb-2">Lore & Description</h3>
                  <div className="bg-background border border-border/40 min-h-[500px]">
                    <RichTextEditor
                      value={selectedTask.description}
                      onChange={(val) => {
                        setSelectedTask((prev: any) => ({ ...prev, description: val }));
                        updateTaskDetails({ taskId: selectedTask._id as any, description: val });
                      }}
                      className="min-h-[500px] border-none shadow-none p-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
