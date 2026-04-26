"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { useState, type FormEvent } from "react"
import { sendTaskEmail } from "@/actions/emailActions"
import { toast } from "sonner"

type User = {
  id: string
  name?: string | null
  email?: string | null
}

type SendTaskEmailDialogProps = {
  taskId: string
  taskTitle: string
  priority: "high" | "medium" | "low"
  users: User[]
}

export function SendTaskEmailDialog({
  taskId,
  taskTitle,
  priority,
  users,
}: SendTaskEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  const usersWithEmail = users.filter((u) => !!u.email)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const recipientId = formData.get("recipientId") as string
    const message = formData.get("message") as string

    const recipient = usersWithEmail.find((u) => u.id === recipientId)
    if (!recipient?.email) {
      toast.error("Selected user has no email address")
      return
    }

    setSending(true)
    try {
      const emailRes = await sendTaskEmail({
        taskId,
        taskTitle,
        toEmail: recipient.email,
        toName: recipient.name ?? "Team Member",
        priority,
        message,
      })
      
      if (!emailRes.success) {
        toast.error("Dispatch failed", {
          description: emailRes.error || "Unknown SMTP error",
        })
      } else {
        toast.success("Brief dispatched", {
          description: `Sent to ${recipient.name ?? recipient.email}`,
        })
        setOpen(false)
        setSelectedUserId("")
      }
    } catch (err) {
      toast.error("Dispatch failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Reset recipient selection whenever the dialog closes
        if (!nextOpen) setSelectedUserId("")
        setOpen(nextOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Send brief email about task: ${taskTitle}`}
          className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-brand-ember hover:bg-brand-ember/10 rounded-none font-mono text-xs tracking-widest uppercase"
        >
          <Mail className="size-3" />
          Brief
        </Button>
      </DialogTrigger>

      <DialogContent
        data-slot="send-task-email-dialog"
        className="max-w-md bg-bg-panel border-border rounded-none shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-tighter text-xl text-brand-ochre border-b border-border-subtle pb-4 pr-8">
            Dispatch Brief
          </DialogTitle>
          <DialogDescription className="sr-only">
            Send an email brief about this task to a team operative.
          </DialogDescription>
        </DialogHeader>

        {/* Task context pill */}
        <div className="flex items-start gap-3 bg-bg-surface border border-border-subtle p-3">
          <CheckCircle className="size-4 text-brand-ochre/60 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5">
              Task Brief
            </p>
            <p className="text-sm font-heading text-foreground leading-tight truncate">
              {taskTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Recipient */}
          <div className="space-y-2">
            <Label
              htmlFor="recipientId"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Recipient Operative
            </Label>
            {usersWithEmail.length === 0 ? (
              <p className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 p-3">
                No team members have a registered email address.
              </p>
            ) : (
              <Select
                name="recipientId"
                required
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger
                  id="recipientId"
                  className="rounded-none bg-bg-surface border-border font-mono text-sm focus-visible:ring-brand-ember/20 focus-visible:border-brand-ember/50"
                >
                  <SelectValue placeholder="Select operative..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border bg-bg-panel">
                  {usersWithEmail.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                      <span>{u.name ?? u.email}</span>
                      {u.email && u.name && (
                        <span className="ml-2 text-muted-foreground text-xs opacity-70">
                          {u.email}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label
              htmlFor="task-brief-message"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Brief Message
            </Label>
            <Textarea
              id="task-brief-message"
              name="message"
              required
              className="rounded-none bg-bg-surface border-border min-h-[100px] resize-y font-mono text-sm focus-visible:ring-brand-ember/20 focus-visible:border-brand-ember/50"
              placeholder="Describe what you need from this operative..."
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
            <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
              via Gmail SMTP
            </p>
            <Button
              type="submit"
              disabled={sending || usersWithEmail.length === 0 || !selectedUserId}
              className="bg-brand-ember hover:bg-brand-ember/80 text-primary-foreground font-mono uppercase tracking-widest text-xs rounded-none gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Mail className="size-3" />
                  Send Brief
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
