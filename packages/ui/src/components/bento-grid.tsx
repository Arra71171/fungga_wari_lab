import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HTMLMotionProps } from "framer-motion"
import { SpotlightCard } from "./SpotlightCard"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

interface BentoGridProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
  className?: string
}

interface BentoCardProps extends HTMLMotionProps<"div"> {
  name: string
  className?: string
  background: React.ReactNode
  Icon: React.ElementType
  description: string
  href?: string
  cta?: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <SpotlightCard
    key={name}
    layoutId={`bento-card-${name}`}
    data-slot="bento-card"
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden",
      // Nordic Strict Zero Curves
      "rounded-none",
      // Nordic Surfaces & Borders (Grid borders are handled by parent, so we do bottom and right)
      "bg-card border-b border-r border-border transition-all duration-500",
      // Subtle Hover Surface
      "hover:bg-accent/10 hover:shadow-nordic z-10 hover:z-20",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 pointer-events-none -z-10">{background}</div>
    <div className="p-6 relative z-10 flex flex-col h-full justify-end">
      <div className="pointer-events-none flex transform-gpu flex-col gap-2 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="size-10 origin-left transform-gpu text-muted-foreground transition-all duration-300 ease-in-out group-hover:scale-90 group-hover:text-primary" />
        <h3 className="text-xl font-heading font-black tracking-tight text-foreground uppercase">
          {name}
        </h3>
        <p className="max-w-lg text-sm text-muted-foreground font-sans leading-relaxed">{description}</p>
      </div>

      {href && cta && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 flex w-full translate-y-4 transform-gpu flex-row items-center p-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <Button
            variant="link"
            asChild
            size="sm"
            className="pointer-events-auto p-0 text-brand-ember font-medium"
          >
            <Link href={href}>
              {cta}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-primary/5" />
  </SpotlightCard>
)

export { BentoCard, BentoGrid }
