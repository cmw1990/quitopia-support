import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

// Define the core Breadcrumb component
const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn(
      "flex flex-wrap items-center text-sm text-muted-foreground",
      className
    )}
    aria-label="breadcrumb"
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

// Define the BreadcrumbList component
const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

// Define the BreadcrumbItem component
const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

// Define the BreadcrumbLink component
const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn(
        "transition-colors hover:text-foreground hover:underline",
        className
      )}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

// Define the BreadcrumbPage component for the current/active page
const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-foreground", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

// Define the BreadcrumbSeparator component
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    className={cn("text-muted-foreground", className)}
    {...props}
  >
    {children || <ChevronRight className="h-4 w-4" />}
  </span>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

// Export all components
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} 