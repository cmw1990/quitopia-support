import React from 'react';
import { cn } from "../../lib/utils";
import { motion } from 'framer-motion';
import { useAnimation } from "../../contexts/AnimationContext";

type LoaderVariant = 'pulse' | 'spinner' | 'dots' | 'progress' | 'skeleton';
type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LoaderColors = 'primary' | 'secondary' | 'accent' | 'muted' | 'custom';

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: LoaderColors;
  className?: string;
  text?: string;
  progress?: number;
  customColor?: string;
  fullScreen?: boolean;
  delayMs?: number;
}

export function Loader({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  className,
  text,
  progress = 0,
  customColor,
  fullScreen = false,
  delayMs = 0
}: LoaderProps) {
  const { getTransition, prefersReducedMotion } = useAnimation();
  const [showLoader, setShowLoader] = React.useState(delayMs === 0);
  
  React.useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => setShowLoader(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (!showLoader) return null;

  // Size mapping for loaders
  const sizeMap = {
    xs: { container: 'h-4 w-4', spinner: 'h-4 w-4', text: 'text-xs' },
    sm: { container: 'h-6 w-6', spinner: 'h-6 w-6', text: 'text-sm' },
    md: { container: 'h-8 w-8', spinner: 'h-8 w-8', text: 'text-base' },
    lg: { container: 'h-12 w-12', spinner: 'h-12 w-12', text: 'text-lg' },
    xl: { container: 'h-16 w-16', spinner: 'h-16 w-16', text: 'text-xl' }
  };

  // Color mapping
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
    custom: customColor ? customColor : 'text-primary'
  };

  // Animation mapping
  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const spinnerAnimation = {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  };

  const dotVariants = {
    initial: { scale: 0.5, opacity: 0.3 },
    animate: (i: number) => ({
      scale: [0.5, 1, 0.5],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  // Loader container with full screen option
  const containerClass = cn(
    'flex items-center justify-center',
    fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    className
  );

  // Render different loader variants
  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-current',
              sizeMap[size].container,
              colorMap[color]
            )}
            animate={prefersReducedMotion ? {} : pulseAnimation}
          />
        );
        
      case 'spinner':
        return (
          <motion.div
            className={cn(
              'rounded-full border-t-2 border-b-2 border-current',
              sizeMap[size].spinner, 
              colorMap[color]
            )}
            animate={prefersReducedMotion ? {} : spinnerAnimation}
          />
        );
        
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                custom={i}
                variants={dotVariants}
                initial="initial"
                animate={prefersReducedMotion ? "initial" : "animate"}
                className={cn(
                  'rounded-full bg-current',
                  colorMap[color],
                  size === 'xs' ? 'h-1.5 w-1.5' :
                  size === 'sm' ? 'h-2 w-2' :
                  size === 'md' ? 'h-2.5 w-2.5' :
                  size === 'lg' ? 'h-3 w-3' :
                  'h-4 w-4'
                )}
              />
            ))}
          </div>
        );
        
      case 'progress':
        return (
          <div className="w-full max-w-xs">
            <div className={cn('h-1.5 w-full bg-muted rounded-full overflow-hidden')}>
              <motion.div
                className={cn('h-full', colorMap[color])}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={getTransition()}
              />
            </div>
            {typeof progress === 'number' && (
              <p className={cn('mt-2 text-center', colorMap[color], sizeMap[size].text)}>
                {progress}%
              </p>
            )}
          </div>
        );
        
      case 'skeleton':
        return (
          <div className="w-full">
            <motion.div
              className={cn('h-4 bg-muted/80 rounded-md w-full')}
              animate={prefersReducedMotion ? {} : {
                opacity: [0.5, 0.8, 0.5],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          </div>
        );
        
      default:
        return (
          <motion.div
            className={cn(
              'rounded-full border-2 border-t-current border-r-transparent border-b-transparent border-l-transparent',
              sizeMap[size].spinner, 
              colorMap[color]
            )}
            animate={prefersReducedMotion ? {} : spinnerAnimation}
          />
        );
    }
  };

  // Main container with optional text
  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center">
        {renderLoader()}
        {text && (
          <motion.p 
            className={cn('mt-2', colorMap[color], sizeMap[size].text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, ...getTransition() }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
} 