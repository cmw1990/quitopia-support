import React from 'react';
import { DashboardCard } from '@/pages/app/DashboardPage';
import { Lightbulb } from 'lucide-react';

interface FocusStrategiesWidgetProps {
    className?: string;
}

export const FocusStrategiesWidget: React.FC<FocusStrategiesWidgetProps> = ({ className }) => {
    // TODO: Fetch and display actual focus strategies
    const strategies = [
        "Try the Pomodoro Technique (25 min focus, 5 min break)",
        "Use the Two-Minute Rule to start small tasks immediately",
        "Schedule dedicated deep work blocks",
    ];
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];

    return (
        <DashboardCard title="Focus Strategy Tip" className={className}>
            <div className="p-4 text-sm text-muted-foreground flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
                <span>{randomStrategy}</span>
            </div>
        </DashboardCard>
    );
}; 