import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

/**
 * Enhanced Button component with multiple variants
 * 
 * Uses class-variance-authority for style variants
 * Supports different visual styles, sizes, states, and animations
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.99]",
        gradient: 
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow hover:shadow-md hover:from-primary hover:to-primary/90 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      animation: {
        none: "",
        subtle: "transition-all duration-300",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        shimmer: "animate-shimmer",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animated?: boolean;
  ripple?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    animated = false,
    ripple = false,
    icon,
    iconPosition = "left",
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [coords, setCoords] = React.useState({ x: -1, y: -1 });
    const [isRippling, setIsRippling] = React.useState(false);

    // Handle ripple effect
    React.useEffect(() => {
      if (coords.x !== -1 && coords.y !== -1) {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 500);
      } else {
        setIsRippling(false);
      }
    }, [coords]);

    React.useEffect(() => {
      if (!isRippling) setCoords({ x: -1, y: -1 });
    }, [isRippling]);

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    // Framer motion animation variants
    const buttonMotionVariants = {
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
      tap: {
        scale: 0.98,
        transition: {
          duration: 0.1,
        }
      },
      hover: {
        y: -2,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: {
          duration: 0.2,
        }
      }
    };

    // Content with optional icons
    const contentWithIcons = (
      <>
        {iconPosition === "left" && icon && <span className="mr-2">{icon}</span>}
        {children}
        {iconPosition === "right" && icon && <span className="ml-2">{icon}</span>}
        {ripple && isRippling && (
          <span
            className="absolute rounded-full bg-white/30 animate-ripple"
            style={{
              left: coords.x,
              top: coords.y,
              width: '100px',
              height: '100px',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </>
    );

    if (animated) {
      return (
        <motion.button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={cn(buttonVariants({ variant, size, animation, className }))}
          onClick={(e) => {
            handleRipple(e as React.MouseEvent<HTMLButtonElement>);
            if (props.onClick) {
              (props.onClick as React.MouseEventHandler<HTMLButtonElement>)(
                e as unknown as React.MouseEvent<HTMLButtonElement>
              );
            }
          }}
          initial="initial"
          animate="animate"
          whileTap="tap"
          whileHover="hover"
          variants={buttonMotionVariants}
          {...(props as Omit<HTMLMotionProps<"button">, "onClick">)}
        >
          {contentWithIcons}
        </motion.button>
      )
    }
    
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, animation, className }))}
        onClick={handleRipple}
        {...props}
      >
        {contentWithIcons}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
