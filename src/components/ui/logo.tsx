import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("flex items-center", className)}
        {...props}
      >
        <div className="relative h-8 w-8">
          <Brain className="h-8 w-8 text-primary absolute top-0 left-0" />
          <Zap className="h-5 w-5 text-yellow-500 absolute bottom-0 right-0" />
        </div>
      </div>
    );
  }
);
Logo.displayName = "Logo";

export default Logo; 