import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DashboardCard } from '@/pages/app/DashboardPage'; // Assuming DashboardCard is exported or recreate similar

interface DailyGoalWidgetProps {
    profile: { daily_focus_goal_minutes?: number } | null;
    stats: { totalMinutes: number };
    isLoadingProfile: boolean;
    className?: string;
}

export const DailyGoalWidget: React.FC<DailyGoalWidgetProps> = ({
    profile,
    stats,
    isLoadingProfile,
    className,
}) => {
    const dailyGoalMinutes = profile?.daily_focus_goal_minutes ?? 0;
    const totalMinutesToday = stats.totalMinutes;
    const progressValue = dailyGoalMinutes > 0 ? Math.min(100, (totalMinutesToday / dailyGoalMinutes) * 100) : 0;

    return (
        <DashboardCard title="Daily Goal Progress" className={className}>
            <div className="p-4 text-center">
                {isLoadingProfile ? (
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                ) : dailyGoalMinutes > 0 ? (
                    <>
                        <p className="text-lg font-semibold">
                            Goal: {dailyGoalMinutes} min
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Today's focus: {totalMinutesToday} min
                        </p>
                        <Progress value={progressValue} className="mt-2 h-2" />
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Set a daily goal in settings to track your progress!</p>
                )}
            </div>
        </DashboardCard>
    );
}; 