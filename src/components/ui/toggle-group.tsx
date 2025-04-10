import * as React from "react"
import { cva } from "class-variance-authority"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Define toggle variants directly here since we can't import from toggle.tsx
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
        outline:
          "bg-transparent border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Updated ToggleGroup context to include value and handler
interface ToggleGroupContextProps extends VariantProps<typeof toggleVariants> {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextProps | null>(null);

// Updated ToggleGroupProps to manage state if needed (or receive from parent)
interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof toggleVariants> {
  type?: "single"; // Only handle single for now
  defaultValue?: string;
  value?: string; // Controlled state
  onValueChange?: (value: string) => void;
}

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  ToggleGroupProps
>(({ 
    className, 
    variant, 
    size, 
    children, 
    type = "single", // Default to single
    defaultValue, 
    value: valueProp, // Rename to avoid conflict
    onValueChange, 
    ...props 
}, ref) => {
    
  // Internal state for uncontrolled component
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  
  // Determine the current value (controlled or uncontrolled)
  const currentValue = valueProp !== undefined ? valueProp : internalValue;

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    // Update internal state only if component is uncontrolled
    if (valueProp === undefined) {
      setInternalValue(newValue);
    }
  };
  
  return (
    <div
      ref={ref}
      role="group"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      {/* Pass down current value and handler */}
      <ToggleGroupContext.Provider 
        value={{
          variant,
          size,
          value: currentValue,
          onValueChange: handleValueChange
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </div>
  )
})

ToggleGroup.displayName = "ToggleGroup"

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof toggleVariants> {
  value: string; // Item value is mandatory
}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, children, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  if (!context) {
    // Should ideally not happen if used correctly
    throw new Error("ToggleGroupItem must be used within a ToggleGroup");
  }
  
  const isSelected = context.value === value;

  return (
    <button
      ref={ref}
      type="button" // Ensure it's not treated as submit
      role="radio" // Use appropriate role for single selection
      aria-checked={isSelected}
      data-state={isSelected ? "on" : "off"}
      data-value={value}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground", // Add selected styles
        className
      )}
      // Call context handler on click
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
