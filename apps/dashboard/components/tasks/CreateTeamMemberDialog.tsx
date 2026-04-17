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
import { FormEvent, useState, useTransition } from "react";
import { createTeamMember } from "@/actions/userActions";

export function CreateTeamMemberDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    startTransition(async () => {
      try {
        await createTeamMember({
          name,
          email: email || undefined,
          phone: phone || undefined,
        });
        setOpen(false);
      } catch (error) {
        console.error("Failed to create team member:", error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2 rounded-none bg-bg-surface border-dashed text-xs text-muted-foreground font-mono uppercase tracking-widest px-2">
          <PlusCircle className="size-3 mr-2 shrink-0" />
          <span className="truncate">New Operative</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-xs bg-bg-panel border-border rounded-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-tighter text-lg text-brand-ochre border-b border-border-subtle pb-3">
            Register Operative
          </DialogTitle>
          <DialogDescription className="sr-only">
            Register a new team member to assign tasks to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              className="rounded-none bg-bg-surface border-border focus-visible:ring-brand-ember/20 focus-visible:border-brand-ember/50 font-mono text-sm"
              placeholder="e.g., Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              className="rounded-none bg-bg-surface border-border focus-visible:ring-brand-ember/20 focus-visible:border-brand-ember/50 font-mono text-sm"
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Phone (Optional)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              className="rounded-none bg-bg-surface border-border focus-visible:ring-brand-ember/20 focus-visible:border-brand-ember/50 font-mono text-sm"
              placeholder="+1234567890"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border-subtle">
            <Button
              type="submit"
              className="bg-brand-ember hover:bg-brand-ember/80 text-foreground font-mono uppercase tracking-widest text-xs rounded-none"
            >
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
