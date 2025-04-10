import React from 'react';
import { DashboardCard } from '@/pages/app/DashboardPage';
import { Users } from 'lucide-react';

interface CommunityInsightsWidgetProps {
    className?: string;
}

export const CommunityInsightsWidget: React.FC<CommunityInsightsWidgetProps> = ({ className }) => {
    // TODO: Fetch and display actual community insights/stats
    const insights = [
        "5 users are currently in body-doubling sessions.",
        "The most popular focus technique today is Pomodoro.",
        "Community focus streak average: 3 days.",
    ];
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];

    return (
        <DashboardCard title="Community Insights" className={className}>
            <div className="p-4 text-sm text-muted-foreground flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <span>{randomInsight}</span>
            </div>
        </DashboardCard>
    );
}; 