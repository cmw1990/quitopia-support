import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTodo, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { Task } from '@/types/tasks'; // Import shared Task type
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const UpcomingTasksWidget: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await supabaseRequest<Task[]>(
                    'focus_tasks', // Corrected string
                    'GET',         // Corrected string
                    {
                        filters: { user_id: user.id, status: 'todo' },
                        orderBy: { column: 'order', ascending: true },
                        limit: 3
                    }
                );
                setTasks(data || []);
            } catch (err: any) {
                console.error("Error fetching upcoming tasks:", err); // Corrected string
                setError(err.message || 'Failed to load task data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [user?.id]);

    return (
        <Card>
            <CardHeader className="pb-2">
                 <CardTitle className="text-base font-medium flex items-center gap-2">
                     <ListTodo size={18} className="text-blue-500"/> Upcoming Tasks
                 </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                 {isLoading ? (
                     <div className="space-y-3">
                         <Skeleton className="h-5 w-full"/><Skeleton className="h-5 w-5/6"/><Skeleton className="h-5 w-3/4"/>
                     </div>
                 ) : error ? (
                     <p className="text-xs text-destructive"><Info size={14} className="inline mr-1"/>{error}</p>
                 ) : tasks.length > 0 ? (
                     <ul className="space-y-2">
                         {tasks.map(task => (
                             <li key={task.id} className="flex justify-between items-center text-sm border-b pb-1.5 last:border-b-0 last:pb-0">
                                 <span className="truncate mr-2" title={task.title}>{task.title}</span>
                                 <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs px-1.5 py-0.5 capitalize">
                                     {task.priority || 'low'}
                                 </Badge>
                             </li>
                         ))}
                     </ul>
                 ) : (
                     <p className="text-sm text-muted-foreground">(No upcoming tasks)</p>
                 )}
            </CardContent>
            {!isLoading && !error && (
                 <CardFooter className="pt-3">
                      <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                           <Link to="/app/tasks"><ExternalLink size={12} className="mr-1.5"/> View All Tasks</Link>
                      </Button>
                 </CardFooter>
             )}
        </Card>
    );
}; 