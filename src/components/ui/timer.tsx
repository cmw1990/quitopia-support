import * as React from "react";
import { cn } from "../../utils/cn";

interface TimerProps extends React.HTMLAttributes<HTMLDivElement> {
  seconds: number;
  size?: "default" | "sm" | "lg" | "xl";
  variant?: "default" | "success" | "warning" | "danger";
  showControls?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
}

const Timer = React.forwardRef<HTMLDivElement, TimerProps>(
  ({ 
    className, 
    seconds, 
    size = "default", 
    variant = "default", 
    showControls = false,
    onStart,
    onPause,
    onReset,
    isRunning = false,
    ...props 
  }, ref) => {
    const formatTime = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const sizeClasses = {
      sm: "text-xl",
      default: "text-3xl",
      lg: "text-5xl",
      xl: "text-7xl",
    };

    const variantClasses = {
      default: "text-slate-900 dark:text-slate-100",
      success: "text-green-600 dark:text-green-400",
      warning: "text-yellow-600 dark:text-yellow-400",
      danger: "text-red-600 dark:text-red-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center",
          className
        )}
        {...props}
      >
        <div 
          className={cn(
            "font-mono font-bold",
            sizeClasses[size],
            variantClasses[variant]
          )}
        >
          {formatTime(seconds)}
        </div>
        
        {showControls && (
          <div className="mt-4 flex space-x-2">
            {!isRunning ? (
              <button 
                onClick={onStart}
                className="rounded-full bg-green-500 p-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            ) : (
              <button 
                onClick={onPause}
                className="rounded-full bg-yellow-500 p-2 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </button>
            )}
            
            <button 
              onClick={onReset}
              className="rounded-full bg-slate-500 p-2 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v6h6"></path>
                <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                <path d="M21 22v-6h-6"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

Timer.displayName = "Timer";

export { Timer }; 