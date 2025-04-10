import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Focus, ListChecks, Users } from 'lucide-react';
import { DashboardCard } from '@/pages/app/DashboardPage';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QuickStartWidgetProps {
    navigate: Function; // Consider using useNavigate hook directly if refactoring later
    className?: string;
}

export const QuickStartWidget: React.FC<QuickStartWidgetProps> = ({ navigate, className }) => (
    <DashboardCard title="Quick Start" className={className}>
        <TooltipProvider delayDuration={100}>
            <div className="p-4 grid grid-cols-2 gap-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => navigate('/app/pomodoro')} className="flex items-center justify-center gap-2 h-12">
                            <Clock className="h-5 w-5 flex-shrink-0" />
                            <span>Pomodoro</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Start a Pomodoro focus session</p>
                    </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => navigate('/app/sessions')} className="flex items-center justify-center gap-2 h-12">
                            <Focus className="h-5 w-5 flex-shrink-0" />
                            <span>New Session</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Start a custom focus session</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => navigate('/app/tasks')} className="flex items-center justify-center gap-2 h-12">
                            <ListChecks className="h-5 w-5 flex-shrink-0" />
                            <span>Add Task</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add a new task to your list</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => navigate('/app/community')} className="flex items-center justify-center gap-2 h-12">
                            <Users className="h-5 w-5 flex-shrink-0" />
                            <span>Body Double</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Find or start a body doubling session</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    </DashboardCard>
); 