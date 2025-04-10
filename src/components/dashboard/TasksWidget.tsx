import React, { useMemo } from 'react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks, Info, ExternalLink, Loader2 } from 'lucide-react';
import { Task as TaskType, TaskStatus } from '@/types/tasks';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DashboardCard } from '@/pages/app/DashboardPage';

interface TasksWidgetProps {
    tasks: TaskType[] | null;
    handleCheck: (taskId: string, currentStatus: string) => void;
    isLoading: string | null; // ID of the task currently loading
    // Removed fetchTasks prop as it might not be needed if data comes from parent
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ 
    tasks,
    handleCheck,
    isLoading,
}) => {

    // Calculate recent pending tasks (up to 3)
    const recentPending = useMemo(() => 
        (tasks || []).filter(t => t.status !== 'completed').slice(0, 3), 
        [tasks]
    );

    // Calculate total number of pending tasks
    const totalPending = useMemo(() => 
        (tasks || []).filter(t => t.status !== 'completed').length,
        [tasks]
    );

    return (
        <DashboardCard 
            title="Pending Tasks" 
            description={tasks === null ? "Loading..." : `${totalPending} pending`}
            className="lg:col-span-2" // Span 2 columns on large screens
        >
            <CardContent className="pt-4 space-y-3"> {/* Add spacing */}
                {tasks === null ? (
                    // Loading Skeleton
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                ) : recentPending.length > 0 ? (
                    // Display Tasks
                    <ul className="space-y-3">
                        {recentPending.map((task: TaskType) => (
                            <li key={task.id} className="flex items-center gap-3">
                                {isLoading === task.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                    <Checkbox 
                                        id={`dash-task-${task.id}`}
                                        checked={task.status === 'completed'}
                                        onCheckedChange={() => handleCheck(task.id, task.status ?? 'todo')}
                                        aria-label={`Mark task ${task.title} as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
                                    />
                                )}
                                <Label 
                                    htmlFor={`dash-task-${task.id}`} 
                                    className={cn(
                                        "flex-1 truncate text-sm cursor-pointer hover:text-foreground",
                                        task.status === 'completed' && "line-through text-muted-foreground",
                                        isLoading === task.id && "text-muted-foreground/50 cursor-wait"
                                        )}
                                    title={task.title} // Tooltip for full title
                                    >
                                    {task.title}
                                </Label>
                            </li>
                        ))}
                    </ul>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center text-center h-full py-4">
                       <ListChecks size={32} className="text-muted-foreground/50 mb-3" />
                       <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                       <p className="text-xs text-muted-foreground">No pending tasks right now.</p>
                    </div>
                )}
                
                {/* Show "more tasks" count if applicable */}
                {tasks !== null && totalPending > recentPending.length && (
                    <p className="text-xs text-muted-foreground pt-2 text-right">
                        + {totalPending - recentPending.length} more pending
                    </p>
                )}
            </CardContent>
            {tasks !== null && (
                <CardFooter className="pt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                        <Link to="/app/tasks">
                            <ExternalLink size={12} className="mr-1.5"/> View All Tasks
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </DashboardCard>
    );
}; 