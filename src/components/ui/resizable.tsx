import * as React from "react"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

interface PanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical"
}

const ResizablePanelGroup = ({
  className,
  direction = "horizontal",
  ...props
}: PanelGroupProps) => (
  <div
    className={cn(
      "flex h-full w-full",
      direction === "vertical" && "flex-col",
      className
    )}
    data-panel-group-direction={direction}
    {...props}
  />
)

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number
  minSize?: number
  maxSize?: number
}

const ResizablePanel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grow overflow-auto", className)}
      data-panel=""
      {...props}
    >
      {children}
    </div>
  )
)
ResizablePanel.displayName = "ResizablePanel"

interface PanelResizeHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean
  direction?: "horizontal" | "vertical"
}

const ResizableHandle = ({
  withHandle,
  className,
  direction = "horizontal",
  ...props
}: PanelResizeHandleProps) => (
  <div
    data-panel-resize-handle-direction={direction}
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      direction === "vertical" && "h-px w-full after:left-0 after:h-1 after:w-full after:-translate-y-1/2 after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
