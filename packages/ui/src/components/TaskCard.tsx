import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"
import { Calendar } from "lucide-react"
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge"

const taskCardVariants = cva(
  "flex flex-col gap-3 rounded-none border border-border bg-card p-5 text-card-foreground transition-colors duration-200 hover:border-primary cursor-pointer",
  {
    variants: {
      priority: {
        default: "border-l-4 border-l-border",
        high: "border-l-4 border-l-destructive",
        medium: "border-l-4 border-l-primary",
        low: "border-l-4 border-l-secondary",
      },
    },
    defaultVariants: {
      priority: "default",
    },
  }
)

export interface TaskCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof taskCardVariants> {
  title: string
  description?: string
  assigneeName?: string
  assigneeAvatar?: string
  status: "todo" | "in_progress" | "review" | "done"
  dueDate?: string
}

function TaskCard({
  className,
  priority,
  title,
  description,
  assigneeName,
  assigneeAvatar,
  status,
  dueDate,
  ...props
}: TaskCardProps) {
  const statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
  }

  const statusColors = {
    todo: "bg-muted text-muted-foreground",
    in_progress: "bg-primary/20 text-primary",
    review: "bg-secondary text-secondary-foreground",
    done: "bg-brand-ochre/15 text-brand-ochre",
  }

  return (
    <div
      data-slot="task-card"
      className={cn(taskCardVariants({ priority }), className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-heading font-medium leading-tight">{title}</h3>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-none px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
            statusColors[status]
          )}
        >
          {statusLabels[status]}
        </span>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between pt-4 border-t border-border-strong">
        <div className="flex items-center gap-2">
          {assigneeName ? (
            <>
              <AvatarBadge src={assigneeAvatar} alt={assigneeName} size="sm" />
              <span className="text-xs font-medium text-muted-foreground">{assigneeName}</span>
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground italic">Unassigned</span>
          )}
        </div>
        
        {dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{dueDate}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export { TaskCard, taskCardVariants }
