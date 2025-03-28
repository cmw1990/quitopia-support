import React from "react";
import { cn } from "@/lib/utils";
import { Star, StarHalf } from "lucide-react";

export interface ProductRatingProps {
  value: number;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  precision?: "half" | "full";
  onChange?: (newValue: number) => void;
  className?: string;
  showCount?: boolean;
  count?: number;
}

export function ProductRating({
  value,
  maxValue = 5,
  size = "md",
  interactive = false,
  precision = "half",
  onChange,
  className,
  showCount = false,
  count = 0
}: ProductRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  // Size-based styles
  const getSizeStyles = () => {
    switch(size) {
      case "sm": return { star: "w-3.5 h-3.5", text: "text-xs" };
      case "lg": return { star: "w-6 h-6", text: "text-sm" };
      case "md":
      default: return { star: "w-5 h-5", text: "text-xs" };
    }
  };
  
  const sizeStyles = getSizeStyles();
  
  // Generate star components based on the rating value
  const renderStars = () => {
    const stars = [];
    const displayValue = hoverValue !== null ? hoverValue : value;
    
    for (let i = 1; i <= maxValue; i++) {
      const difference = displayValue - i + 1;
      
      let starComponent;
      
      if (difference >= 1) {
        // Full star
        starComponent = (
          <Star 
            key={i} 
            className={cn(
              sizeStyles.star, 
              "fill-primary text-primary",
              interactive && "transition-transform hover:scale-110"
            )} 
          />
        );
      } else if (difference > 0 && precision === "half") {
        // Half star
        starComponent = (
          <StarHalf 
            key={i} 
            className={cn(
              sizeStyles.star, 
              "fill-primary text-primary",
              interactive && "transition-transform hover:scale-110"
            )} 
          />
        );
      } else {
        // Empty star
        starComponent = (
          <Star 
            key={i} 
            className={cn(
              sizeStyles.star, 
              "text-muted-foreground",
              interactive && "transition-transform hover:scale-110"
            )} 
          />
        );
      }
      
      if (interactive) {
        const starValue = precision === "half" ? 
          (i - 0.5) : i;
          
        // Wrap with interactive handlers
        stars.push(
          <div 
            key={i}
            className="cursor-pointer relative"
            onClick={() => onChange?.(i)}
            onMouseEnter={() => setHoverValue(i)}
            onMouseLeave={() => setHoverValue(null)}
          >
            {precision === "half" && (
              <div 
                className="absolute inset-0 w-1/2 h-full cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(i - 0.5);
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setHoverValue(i - 0.5);
                }}
              />
            )}
            {starComponent}
          </div>
        );
      } else {
        stars.push(starComponent);
      }
    }
    
    return stars;
  };
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">{renderStars()}</div>
      
      {/* Show the numeric value and/or review count */}
      {(value > 0 || showCount) && (
        <div className={cn("flex items-center gap-1", sizeStyles.text)}>
          {value > 0 && (
            <span className="font-medium">{value.toFixed(precision === "half" ? 1 : 0)}</span>
          )}
          
          {showCount && count > 0 && (
            <span className="text-muted-foreground whitespace-nowrap">
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>
      )}
    </div>
  );
} 