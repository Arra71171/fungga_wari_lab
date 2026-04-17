import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface PortraitFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  alt?: string
  renderImage?: (props: { src: string; alt: string; className: string }) => React.ReactNode
}

function PortraitFrame({
  imageUrl,
  alt = "Story illustration",
  renderImage,
  className,
  ...props
}: PortraitFrameProps) {
  const imageElement = renderImage ? (
    renderImage({ src: imageUrl, alt, className: "object-cover w-full h-full" })
  ) : (
    <img src={imageUrl} alt={alt} className="object-cover w-full h-full" />
  )

  const blurElement = renderImage ? (
    renderImage({ src: imageUrl, alt: "", className: "object-cover w-full h-full" })
  ) : (
    <img src={imageUrl} alt="" className="object-cover w-full h-full" />
  )

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden w-full h-[60vh] min-h-[400px]",
        className
      )}
      {...props}
    >
      {/* Blurred background layer */}
      <div className="absolute inset-0 scale-110 opacity-30 blur-[60px] pointer-events-none">
        {blurElement}
      </div>

      {/* Main portrait card */}
      <div className="relative z-10 w-auto h-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50">
        {imageElement}
      </div>

      {/* Narrative blending gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cinematic-bg to-transparent pointer-events-none z-20" />
    </div>
  )
}

export { PortraitFrame }
