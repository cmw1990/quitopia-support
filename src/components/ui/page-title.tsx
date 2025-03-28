import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { useAnimation } from "../../contexts/AnimationContext";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  decorative?: boolean;
  colorScheme?: "default" | "primary" | "secondary" | "gradient";
}

export function PageTitle({
  title,
  subtitle,
  className,
  align = "left",
  size = "md",
  animated = true,
  icon,
  actions,
  decorative = true,
  colorScheme = "default"
}: PageTitleProps) {
  const { prefersReducedMotion, getTransition } = useAnimation();
  const shouldAnimate = animated && !prefersReducedMotion;

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        ...getTransition(),
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: getTransition()
    }
  };

  // Title line decoration animation
  const lineVariants = {
    initial: { width: "0%", opacity: 0 },
    animate: { 
      width: decorative ? "40px" : "0px", 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  };

  // Text gradient variants based on colorScheme
  const getTextColorClasses = () => {
    switch (colorScheme) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary-foreground";
      case "gradient":
        return "text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70";
      default:
        return "text-foreground";
    }
  };

  // Generate size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          title: "text-xl md:text-2xl font-bold",
          subtitle: "text-sm",
          icon: "w-5 h-5 md:w-6 md:h-6"
        };
      case "lg":
        return {
          title: "text-3xl md:text-4xl font-bold",
          subtitle: "text-lg",
          icon: "w-8 h-8 md:w-10 md:h-10"
        };
      default:
        return {
          title: "text-2xl md:text-3xl font-bold",
          subtitle: "text-base",
          icon: "w-6 h-6 md:w-8 md:h-8"
        };
    }
  };

  // Create alignment classes
  const getAlignClasses = () => {
    switch (align) {
      case "center":
        return "text-center items-center";
      case "right":
        return "text-right items-end";
      default:
        return "text-left items-start";
    }
  };

  const sizeClasses = getSizeClasses();
  const alignClasses = getAlignClasses();
  const titleColorClasses = getTextColorClasses();

  // Container component based on animation preference
  const Container = shouldAnimate ? motion.div : "div";
  const Item = shouldAnimate ? motion.div : "div";
  const Line = shouldAnimate ? motion.div : "div";

  // Animation props only applied when shouldAnimate is true
  const containerProps = shouldAnimate ? {
    variants: containerVariants,
    initial: "initial",
    animate: "animate",
  } : {};

  const itemProps = shouldAnimate ? {
    variants: itemVariants
  } : {};

  const lineProps = shouldAnimate ? {
    variants: lineVariants
  } : {};

  return (
    <Container 
      className={cn(
        "flex flex-col gap-2 mb-4 relative", 
        alignClasses,
        className
      )}
      {...containerProps}
    >
      {decorative && (
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-70 z-0" />
      )}
      
      <div className="flex items-center gap-3 z-10">
        {icon && (
          <Item 
            className={cn("text-primary flex-shrink-0", sizeClasses.icon)}
            {...itemProps}
          >
            {icon}
          </Item>
        )}
        
        <div>
          <Item {...itemProps}>
            <h1 
              className={cn(
                sizeClasses.title,
                titleColorClasses,
                "leading-tight tracking-tight"
              )}
            >
              {title}
            </h1>
          </Item>

          {subtitle && (
            <Item 
              {...itemProps}
              className="flex flex-col gap-1"
            >
              <p className={cn("text-muted-foreground", sizeClasses.subtitle)}>
                {subtitle}
              </p>
              
              {decorative && (
                <Line 
                  className="h-1 bg-primary rounded-full opacity-80"
                  {...lineProps}
                />
              )}
            </Item>
          )}
        </div>
        
        {actions && (
          <Item 
            className="ml-auto flex-shrink-0"
            {...itemProps}
          >
            {actions}
          </Item>
        )}
      </div>
    </Container>
  );
} 