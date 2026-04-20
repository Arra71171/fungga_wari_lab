"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-foreground" />,
        warning: <TriangleAlertIcon className="size-4 text-primary" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group font-mono text-xs bg-cinematic-panel border-2 border-border text-foreground shadow-none rounded-none",
          title: "font-mono text-xs font-bold uppercase tracking-widest",
          description: "font-mono text-fine text-muted-foreground tracking-wide",
          actionButton:
            "font-mono text-fine uppercase tracking-widest bg-primary text-primary-foreground rounded-none",
          cancelButton:
            "font-mono text-fine uppercase tracking-widest bg-muted text-muted-foreground rounded-none",
          closeButton:
            "border border-border bg-cinematic-panel text-muted-foreground hover:text-foreground rounded-none",
          success: "border-primary/40",
          error: "border-destructive/40",
          warning: "border-primary/30",
          info: "border-border",
          loading: "border-primary/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
