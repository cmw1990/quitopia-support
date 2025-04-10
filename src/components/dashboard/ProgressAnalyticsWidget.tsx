import React from 'react';
import { DashboardCard } from '@/pages/app/DashboardPage';
import { BarChart3 } from 'lucide-react';

interface ProgressAnalyticsWidgetProps {
    className?: string;
}

export const ProgressAnalyticsWidget: React.FC<ProgressAnalyticsWidgetProps> = ({ className }) => {
    // TODO: Fetch and display actual analytics data (e.g., charts)
    return (
        <DashboardCard title="Progress Analytics" className={className}>
            <div className="p-4 text-sm text-muted-foreground flex flex-col items-center justify-center h-32">
                <BarChart3 className="h-8 w-8 text-green-500 mb-2" />
                <span>Detailed analytics coming soon...</span>
            </div>
        </DashboardCard>
    );
}; 