import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
  className?: string;
  tooltipContent?: string;
  maxValue?: number;
  showProgress?: boolean;
}

export const StatusCard = ({
  title,
  value,
  icon,
  description,
  trend = 0,
  trendLabel,
  colorClass = 'bg-primary/10',
  className,
  tooltipContent,
  maxValue = 100,
  showProgress = false,
}: StatusCardProps) => {
  // Calculate numeric value for progress if showProgress is true
  const progressValue = typeof value === 'number' 
    ? (value / maxValue) * 100 
    : typeof value === 'string' && !isNaN(parseFloat(value))
      ? (parseFloat(value) / maxValue) * 100
      : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className={cn("overflow-hidden border", className)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={cn("p-2 rounded-full", colorClass)}>
              {icon}
            </div>
            <div className="flex items-center gap-2">
              {trend !== 0 && (
                <motion.div 
                  className={cn(
                    "flex items-center text-sm font-medium rounded-full px-2 py-0.5",
                    trend > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                    trend < 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  )}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {trend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : trend < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <Minus className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(trend)}%
                </motion.div>
              )}
              
              {tooltipContent && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="rounded-full p-1 hover:bg-muted/50">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      {tooltipContent}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <div className="text-2xl font-semibold">{value}</div>
          
          {trendLabel && (
            <div className="mt-1 text-xs text-muted-foreground">
              {trendLabel}
            </div>
          )}
          
          {showProgress && (
            <div className="mt-3">
              <Progress value={progressValue} className="h-1.5" />
            </div>
          )}
          
          {description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {description}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatusCard; 