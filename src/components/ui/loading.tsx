import React from 'react';
import { cn } from '@/lib/utils';

type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: LoadingSize;
  text?: string;
  spinnerOnly?: boolean;
}

/**
 * Loading spinner component with customizable size and optional text
 */
export function Loading({
  size = 'md',
  text,
  spinnerOnly = false,
  className,
  ...props
}: LoadingProps) {
  // Size mappings
  const sizeMap: Record<LoadingSize, string> = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const containerClass = cn(
    'flex flex-col items-center justify-center gap-4',
    className
  );

  const spinnerClass = cn(
    'animate-spin rounded-full border-solid border-primary border-r-transparent',
    sizeMap[size]
  );

  if (spinnerOnly) {
    return <div className={spinnerClass} {...props} />;
  }

  return (
    <div className={containerClass} {...props}>
      <div className={spinnerClass} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
}

// Default export for compatibility
export default Loading;
