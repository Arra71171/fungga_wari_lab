"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

interface ExpandableCardProps {
  layoutId: string
  trigger: React.ReactNode
  expandedContent: React.ReactNode
  className?: string
  overlayClassName?: string
  contentClassName?: string
  onExpandedChange?: (isExpanded: boolean) => void
}

/**
 * A Nordic-compliant expandable card primitive.
 * Enforces zero-curves and stark borders.
 */
export function ExpandableCard({
  layoutId,
  trigger,
  expandedContent,
  className,
  overlayClassName,
  contentClassName,
  onExpandedChange,
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleSetActive = React.useCallback(
    (newState: boolean) => {
      setActive(newState)
      if (onExpandedChange) {
        onExpandedChange(newState)
      }
    },
    [onExpandedChange]
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleSetActive(false)
      }
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleSetActive(false)
      }
    }

    if (active) {
      window.addEventListener("keydown", onKeyDown)
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
      // Prevent scrolling on body when expanded
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [active, handleSetActive])

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] h-full w-full bg-background/80 backdrop-blur-sm",
              overlayClassName
            )}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[110] grid place-items-center p-4 sm:p-10 pointer-events-none">
            <motion.div
              layoutId={layoutId}
              ref={cardRef}
              className={cn(
                "relative flex h-full max-h-[90vh] w-full max-w-[850px] flex-col overflow-auto bg-card shadow-nordic rounded-none border border-border pointer-events-auto [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none]",
                contentClassName
              )}
            >
              {expandedContent}

              {/* Close Button */}
              <motion.button
                aria-label="Close card"
                layoutId={`button-${layoutId}`}
                className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-none border border-border bg-background text-foreground transition-colors hover:bg-secondary hover:text-primary focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSetActive(false)
                }}
              >
                <X className="size-4" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        layoutId={layoutId}
        onClick={() => handleSetActive(true)}
        className={cn("cursor-pointer rounded-none group/expandable", className)}
      >
        {trigger}
      </motion.div>
    </>
  )
}
