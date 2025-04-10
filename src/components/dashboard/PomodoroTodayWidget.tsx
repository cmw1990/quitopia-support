import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, CheckCircle } from 'lucide-react';

interface PomodoroTodayWidgetProps {
    completedSessions: number;
    totalMinutes: number;
}

export const PomodoroTodayWidget: React.FC<PomodoroTodayWidgetProps> = ({ 
    completedSessions, 
    totalMinutes 
}) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (
        <Card>
            <CardHeader className="pb-2">
                 <CardTitle className="text-base font-medium flex items-center gap-2">
                     <Timer size={18} className="text-primary"/> Pomodoro Today
                 </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-around pt-4">
                 <div className="text-center">
                     <p className="text-2xl font-bold">{completedSessions}</p>
                     <p className="text-xs text-muted-foreground">Sessions</p>
                 </div>
                 <div className="text-center">
                     <p className="text-2xl font-bold">
                         {hours > 0 && <>{hours}<span className="text-sm">h</span> </>}
                         {minutes}<span className="text-sm">m</span>
                     </p>
                     <p className="text-xs text-muted-foreground">Focus Time</p>
                 </div>
            </CardContent>
        </Card>
    );
}; 