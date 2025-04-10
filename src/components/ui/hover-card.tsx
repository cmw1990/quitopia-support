import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from '@radix-ui/react-slot'

interface HoverCardContextType {
  open: boolean
  setOpen: (open: boolean) => void
  trigger: React.RefObject<HTMLElement>
}

const HoverCardContext = React.createContext<HoverCardContextType | undefined>(undefined)

interface HoverCardProps {
  children: React.ReactNode
  openDelay?: number
  closeDelay?: number
  defaultOpen?: boolean
}

const HoverCard = ({ 
  children, 
  openDelay = 700, 
  closeDelay = 300,
  defaultOpen = false
}: HoverCardProps) => {
  const [open, setOpen] = React.useState(defaultOpen)
  const trigger = React.useRef<HTMLElement>(null)
  const timeoutRef = React.useRef<number | undefined>()

  const handleOpen = React.useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setOpen(true), openDelay)
  }, [openDelay])

  const handleClose = React.useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setOpen(false), closeDelay)
  }, [closeDelay])

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <HoverCardContext.Provider value={{ open, setOpen, trigger }}>
      <div 
        data-state={open ? "open" : "closed"}
        data-hover-card=""
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  )
}

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error("useHoverCard must be used within a HoverCard")
  }
  return context
}

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  HoverCardTriggerProps
>(({ className, asChild = false, ...props }, ref) => {
  const { trigger } = useHoverCard()
  const Comp = asChild ? Slot : "div"
  
  return (
    <Comp
      {...props}
      ref={ref}
      className={cn("inline-block", className)}
      data-hover-card-trigger=""
    />
  )
})
HoverCardTrigger.displayName = "HoverCardTrigger"

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "center" | "start" | "end"
  sideOffset?: number
  forceMount?: boolean
}

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, forceMount = false, ...props }, ref) => {
  const { open } = useHoverCard()
  
  if (!open && !forceMount) {
    return null
  }
  
  return (
    <div
      ref={ref}
      data-hover-card-content=""
      data-state={open ? "open" : "closed"}
      data-align={align}
      data-side-offset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "absolute top-full left-0 mt-1",
        className
      )}
      {...props}
    />
  )
})
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
