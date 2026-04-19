import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"

const avatarBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted font-medium text-muted-foreground",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface AvatarBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarBadgeVariants> {
  src?: string
  alt?: string
  fallback?: string
}

function AvatarBadge({
  className,
  size,
  src,
  alt = "Avatar",
  fallback,
  ...props
}: AvatarBadgeProps) {
  const imageSize = size === "sm" ? 32 : size === "lg" ? 48 : 40

  return (
    <span
      data-slot="avatar-badge"
      className={cn(avatarBadgeVariants({ size }), className)}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={imageSize}
          height={imageSize}
          sizes={`${imageSize}px`}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground font-heading font-bold uppercase tracking-wider">
          {fallback || alt.charAt(0)}
        </span>
      )}
    </span>
  )
}

export { AvatarBadge, avatarBadgeVariants }
