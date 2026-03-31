import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const createTask = useMutation(api.tasks.create);
  const teamMembers = useQuery(api.tasks.getTeamMembers);
  
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState("lore_gathering");
  const [priority, setPriority] = React.useState("medium");
  const [assigneeId, setAssigneeId] = React.useState<string>("unassigned");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitle("");
      setStatus("lore_gathering");
      setPriority("medium");
      setAssigneeId("unassigned");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        status,
        priority,
        assigneeId: assigneeId === "unassigned" ? undefined : assigneeId,
        // Description starts undefined, they can add rich text in the detail view
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Task</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Add a new item to the team Kanban board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="gap-6 flex flex-col pt-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="title" className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Translate 'The Tiger and the Cat'"
              className="bg-secondary/20"
              autoFocus
              required
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Label htmlFor="status" className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="bg-secondary/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lore_gathering">Lore Gathering</SelectItem>
                <SelectItem value="translating">Translation</SelectItem>
                <SelectItem value="illustrating">Illustration</SelectItem>
                <SelectItem value="review">Final Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="priority" className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="bg-secondary/20 capitalize">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="assignee" className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger id="assignee" className="bg-secondary/20">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
