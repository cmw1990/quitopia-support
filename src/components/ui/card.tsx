import * as React from "react"
import { cn } from "../../lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

// Animation variants
const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 10,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  tap: {
    y: -2,
    boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  interactive?: boolean;
  delay?: number;
  glowBorder?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animated = false, interactive = false, delay = 0, glowBorder = false, ...props }, ref) => {
    const commonClassNames = cn(
      "relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
      glowBorder && "before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-primary/20 before:opacity-0 before:transition-opacity hover:before:opacity-100",
      interactive && !animated && "hover:-translate-y-1 hover:shadow-md active:-translate-y-0.5 active:shadow cursor-pointer",
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={commonClassNames}
          initial="initial"
          animate="animate"
          variants={cardVariants}
          custom={delay}
          {...(interactive ? { 
            whileHover: "hover", 
            whileTap: "tap"
          } : {})}
          {...props as HTMLMotionProps<"div">}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={commonClassNames}
        {...props}
      />
    );
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
