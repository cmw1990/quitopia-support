import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Focus, Play, ArrowRight } from 'lucide-react';
import { parseISO, differenceInSeconds } from 'date-fns';
import { DashboardCard } from '@/pages/app/DashboardPage';
import { cn } from '@/lib/utils';

// Assuming FocusSession type is defined elsewhere, e.g., in types/sessions.ts or fetched type
interface FocusSession {
    id: string;
    start_time?: string | null;
    end_time?: string | null;
    status?: string | null;
    technique?: string | null;
    planned_duration_seconds?: number | null;
    // Add other relevant fields if needed
}

interface ActiveSessionWidgetProps {
    session: FocusSession | undefined;
    navigate: Function; // Or use useNavigate hook directly if possible
    className?: string;
}

const formatTimeLeft = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export const ActiveSessionWidget: React.FC<ActiveSessionWidgetProps> = ({
    session,
    navigate,
    className,
}) => {
    if (!session) {
        return (
            <DashboardCard title="Active Session" className={className}>
                <div className="p-4 text-sm text-muted-foreground flex flex-col items-center text-center gap-3 h-full justify-center">
                    <Focus size={32} className="text-gray-400 mb-2" />
                    <span>No active focus session found.</span>
                    <Button size="sm" variant="outline" onClick={() => navigate('/app/pomodoro')}>
                        <Play className="mr-2 h-4 w-4" /> Start Pomodoro
                    </Button>
                </div>
            </DashboardCard>
        );
    }

    const startTime = session.start_time ? parseISO(session.start_time) : new Date();
    const plannedDuration = session.planned_duration_seconds || 0;
    const elapsedSeconds = differenceInSeconds(new Date(), startTime);
    const remainingSeconds = Math.max(0, plannedDuration - elapsedSeconds);
    const progress = plannedDuration > 0 ? Math.min(100, (elapsedSeconds / plannedDuration) * 100) : 0;

    return (
        <DashboardCard 
            title="Active Session" 
            description={session.technique || 'Focusing...'}
            className={className}
        >
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Time Remaining:</span>
                    <span className="text-lg font-semibold text-primary dark:text-primary-foreground">
                        {formatTimeLeft(remainingSeconds)}
                    </span>
                </div>
                <Progress value={progress} className="w-full h-2" />
                <div className="flex justify-center mt-3">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-primary hover:bg-primary/10 dark:text-primary-foreground dark:hover:bg-primary/90" 
                        onClick={() => navigate('/app/pomodoro')}
                    >
                        Go to Session <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </DashboardCard>
    );
}; 