"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { PlusCircle } from "lucide-react";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FormEvent, useState } from "react";
import { createTask } from "@/actions/taskActions";
import type { Database } from "@workspace/ui/types/supabase";

type User = {
  id: string;
  name?: string | null;
  clerk_id?: string | null;
  email?: string | null;
};

type CreateTaskDialogProps = {
  users: User[];
  storyId?: string;
  onCreated?: () => void;
};

export function CreateTaskDialog({ users, storyId, onCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const priority = formData.get("priority") as Database["public"]["Enums"]["task_priority"];
    const assigneeId = formData.get("assigneeId") as string;

    const descText = formData.get("description") as string;
    const description = descText
      ? {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: descText }] }],
        }
      : undefined;

    await createTask({
      title,
      description,
      status: "lore_gathering",
      priority,
      assigneeId: assigneeId === "none" ? undefined : assigneeId,
      storyId,
    });

    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shrink-0">
          <PlusCircle className="size-4" />
          <span>New Task</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-bg-panel border-border rounded-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-tighter text-xl text-brand-ochre border-b border-border-subtle pb-4 pr-8">
            Initialize Operation
          </DialogTitle>
          <DialogDescription className="sr-only">
            Fill out the form below to initialize a new task operation and dispatch it to the team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Task Designation
            </Label>
            <Input
              id="title"
              name="title"
              required
              className="rounded-none bg-bg-surface border-border focus-visible:ring-brand-ember/20 focus-visible:border-brand-ember/50 font-mono text-sm"
              placeholder="e.g., Translate Chapter 4..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Priority
              </Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger id="priority" className="rounded-none bg-bg-surface border-border font-mono text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border bg-bg-panel">
                  <SelectItem value="high" className="font-mono text-sm focus:bg-brand-ember/20">High</SelectItem>
                  <SelectItem value="medium" className="font-mono text-sm">Medium</SelectItem>
                  <SelectItem value="low" className="font-mono text-sm">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigneeId" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Assign To
              </Label>
              <Select name="assigneeId" defaultValue="none">
                <SelectTrigger id="assigneeId" className="rounded-none bg-bg-surface border-border font-mono text-sm">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border bg-bg-panel">
                  <SelectItem value="none" className="font-mono text-sm italic opacity-50">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.clerk_id ?? u.id} className="font-mono text-sm">
                      {u.name ?? u.email ?? "Unknown User"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Briefing (Optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              className="rounded-none bg-bg-surface border-border min-h-[100px] resize-y font-mono text-sm"
              placeholder="Provide operation details..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <Button
              type="submit"
              className="bg-brand-ember hover:bg-brand-ember/80 text-foreground font-mono uppercase tracking-widest text-xs rounded-none"
            >
              Dispatch Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
