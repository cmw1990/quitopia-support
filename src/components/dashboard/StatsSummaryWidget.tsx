import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Clock } from 'lucide-react';
import { DashboardCard } from '@/pages/app/DashboardPage';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatsSummaryWidgetProps {
    streak: number;
    totalMinutes: number;
    isLoading: boolean;
    className?: string;
}

const formatTimeLocal = (minutes: number): string => {
    if (isNaN(minutes) || minutes < 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const StatsSummaryWidget: React.FC<StatsSummaryWidgetProps> = ({
    streak,
    totalMinutes,
    isLoading,
    className,
}) => {
    if (isLoading) {
        return (
            <DashboardCard title="Focus Stats" className={className}>
                <div className="p-4 grid grid-cols-2 gap-4 text-center">
                    {/* Skeletons for the two stats */}
                    <div>
                       <Skeleton className="h-7 w-12 mx-auto mb-1.5 rounded" />
                       <Skeleton className="h-3 w-16 mx-auto rounded" />
                    </div>
                    <div>
                       <Skeleton className="h-7 w-20 mx-auto mb-1.5 rounded" />
                       <Skeleton className="h-3 w-20 mx-auto rounded" />
                    </div>
                </div>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard title="Focus Stats" className={className}>
            <TooltipProvider delayDuration={100}>
                <div className="p-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-semibold text-orange-500 flex items-center justify-center gap-1">
                            {streak}
                            <Flame className="h-5 w-5 opacity-80" />
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground cursor-default">Day Streak</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Consecutive days with focus activity.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold text-blue-500 flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 opacity-80" />
                            {formatTimeLocal(totalMinutes)}
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground cursor-default">Total Focused</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Total minutes recorded in focus sessions.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </TooltipProvider>
        </DashboardCard>
    );
}; 