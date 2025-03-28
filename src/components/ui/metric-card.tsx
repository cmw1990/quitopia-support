import React from "react";
import { cn } from "../../lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
  };
  footer?: React.ReactNode;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  description,
  icon,
  trend,
  footer,
  className,
  ...props
}: MetricCardProps) => {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm",
        className
      )} 
      {...props}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        {icon && <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">{icon}</div>}
      </div>
      
      <div className="flex items-baseline">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </h3>
        
        {trend && (
          <span className={cn(
            "text-xs ml-2 px-1.5 py-0.5 rounded-full",
            trend.positive 
              ? "text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
              : "text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
          )}>
            {trend.positive ? "+" : "-"}{trend.value}%
          </span>
        )}
      </div>
      
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {footer && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}; 