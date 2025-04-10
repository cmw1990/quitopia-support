import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { Timer, ListChecks, Clock, Zap, PlusCircle, Loader2, BarChartHorizontal, Coffee, Filter, Brain, Book } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FocusTask } from '@/types/task';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Reusing PomodoroSessionRecord fields, consider a dedicated type later
interface FocusSessionRecord {
    id: string;
    user_id: string;
    start_time: string;
    end_time?: string | null;
    duration_minutes: number;
    mode: string; 
    type?: string;
    task_id?: string | null;
    completed: boolean;
}

const FocusSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
  const [taskMap, setTaskMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'focus' | 'break'>('all');

  const fetchSessionsAndTasks = useCallback(async () => {
      if (!user?.id) return;
      setIsLoading(true);
      setTaskMap(new Map());
      try {
          // Fetch recent sessions, ordered, with limit
          const sessionData = await supabaseRequest<FocusSessionRecord[]>(
              'pomodoro_sessions', 
              'GET',
              {
                  filters: { user_id: user.id },
                  orderBy: { column: 'start_time', ascending: false },
                  limit: 50
              }
          );
          const fetchedSessions = sessionData || [];
          setSessions(fetchedSessions);

          // Extract unique task IDs from sessions
          const taskIds = [...new Set(fetchedSessions.map(s => s.task_id).filter(id => !!id))] as string[];

          // Fetch corresponding tasks if there are any linked tasks
          if (taskIds.length > 0) {
              const taskData = await supabaseRequest<FocusTask[]>(
                  'focus_tasks',
                  'GET',
                  {
                      filters: { id: { operator: 'in', value: taskIds } }
                  }
              );
              const newTaskMap = new Map<string, string>();
              (taskData || []).forEach(task => {
                  if (task.id && task.title) {
                    newTaskMap.set(task.id, task.title);
                  }
              });
              setTaskMap(newTaskMap);
          }
      } catch (error: any) {
          console.error('Error fetching focus sessions or tasks:', error);
          toast({ title: 'Error Loading Data', description: error.message, variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  }, [user?.id, toast]);

  useEffect(() => {
      fetchSessionsAndTasks();
  }, [fetchSessionsAndTasks]);

  // Filter sessions based on the selected mode
  const filteredSessions = useMemo(() => {
      if (filterMode === 'all') return sessions;
      if (filterMode === 'focus') return sessions.filter(s => s.mode?.includes('focus'));
      if (filterMode === 'break') return sessions.filter(s => s.mode?.includes('break'));
      return sessions;
  }, [sessions, filterMode]);

  // Function to format duration nicely
  const formatDuration = (minutes: number): string => {
     if (minutes < 1) return '< 1 min';
     if (minutes < 60) return `${minutes} min`;
     const hours = Math.floor(minutes / 60);
     const remainingMinutes = minutes % 60;
     if (remainingMinutes === 0) return `${hours} hr`;
     return `${hours} hr ${remainingMinutes} min`;
   };

  // Updated function to handle starting different session types
  const handleStartSession = (type: 'pomodoro' | 'deep_work' | 'learning') => {
      console.log("Starting session type:", type);
      // TODO: Implement routing/logic based on type
      // - Pomodoro -> /app/pomodoro
      // - Deep Work/Learning -> Navigate to a generic timer/tracker page or component, passing the type
      // For now, all navigate to pomodoro page as placeholder
      if (type === 'pomodoro') {
          navigate('/app/pomodoro');
      } else {
           toast({ title: 'Coming Soon', description: `Starting ${type.replace('_', ' ')} sessions not yet implemented.` });
          // Example placeholder navigation if a generic page existed:
          // navigate(`/app/session/new?type=${type}`); 
      }
  };
  
  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    // Use motion.div for overall page animation
    <motion.div 
        className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
       {/* Header with animation */}
       <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Focus Sessions</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Plan, start, and review your focus periods.
                </p>
           </div>
           <DropdownMenu>
               <DropdownMenuTrigger asChild>
                   <Button size="sm">
                       <PlusCircle className="mr-2 h-4 w-4" /> Start New Session
                   </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                   <DropdownMenuLabel>Choose Session Type</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => handleStartSession('pomodoro')}>
                       <Timer className="mr-2 h-4 w-4 text-red-500"/> Pomodoro Cycle
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleStartSession('deep_work')}>
                        <Brain className="mr-2 h-4 w-4 text-purple-500"/> Deep Work Block
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleStartSession('learning')}>
                       <Book className="mr-2 h-4 w-4 text-blue-500"/> Learning Session
                   </DropdownMenuItem>
               </DropdownMenuContent>
           </DropdownMenu>
       </motion.div>

        {/* Filter Tabs with animation */} 
        <motion.div variants={itemVariants}>
             <Tabs value={filterMode} onValueChange={(value) => setFilterMode(value as any)}>
                 <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                     <TabsTrigger value="all"><ListChecks className="mr-1.5 h-4 w-4"/>All</TabsTrigger>
                     <TabsTrigger value="focus"><Timer className="mr-1.5 h-4 w-4"/>Focus</TabsTrigger>
                     <TabsTrigger value="break"><Coffee className="mr-1.5 h-4 w-4"/>Breaks</TabsTrigger>
                 </TabsList>
             </Tabs>
        </motion.div>

        {/* Session List Card with animation */} 
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Session History</CardTitle>
                     <CardDescription>Your recent {filterMode === 'focus' ? 'focus periods' : filterMode === 'break' ? 'breaks' : 'activity'}.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground mt-2">Loading sessions...</p>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-10">
                             <Clock className="h-12 w-12 text-muted-foreground mx-auto opacity-30 mb-2" />
                            <p className="text-muted-foreground">No {filterMode !== 'all' ? filterMode : ''} sessions recorded yet.</p>
                             {filterMode === 'all' && (
                                 <Button variant="secondary" onClick={() => handleStartSession('pomodoro')} className="mt-4">
                                     Start Your First Session
                                 </Button>
                             )}
                        </div>
                    ) : (
                        // Apply container variants to the list itself for stagger effect
                        <motion.ul 
                            variants={containerVariants} 
                            initial="hidden" 
                            animate="visible" 
                            className="space-y-3"
                        >
                            {/* Use filteredSessions and itemVariants */} 
                            {filteredSessions.map((session) => {
                                const taskTitle = session.task_id ? taskMap.get(session.task_id) : null;
                                const sessionDate = new Date(session.start_time);
                                const icon = session.mode?.includes('focus') ? 
                                             <Timer className="h-5 w-5 text-primary flex-shrink-0" /> : 
                                             <Coffee className="h-5 w-5 text-green-500 flex-shrink-0" />;
                                const label = session.mode?.replace('_', ' ') || 'Session';
                                
                                return (
                                    <motion.li 
                                        key={session.id} 
                                        variants={itemVariants} 
                                        layout // Animate layout changes
                                        className="border p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-grow min-w-0">
                                            {icon}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium capitalize truncate text-sm">
                                                    {label} {session.type ? `(${session.type})`: ''}
                                                </p>
                                                <p className="text-xs text-muted-foreground" title={format(sessionDate, 'PPPpp')}>
                                                    {formatDistanceToNow(sessionDate, { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm flex-shrink-0 pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-none">
                                             {/* Display Task if linked */} 
                                             {taskTitle && (
                                                 <Badge variant="secondary" className="truncate max-w-[150px] sm:max-w-[200px]">
                                                     <ListChecks className="mr-1 h-3 w-3"/>
                                                     {taskTitle}
                                                 </Badge>
                                             )} 
                                            <div className="flex items-center gap-1 text-muted-foreground min-w-[70px] justify-end" title="Duration">
                                                 <Clock className="h-3.5 w-3.5" />
                                                 <span>{formatDuration(session.duration_minutes)}</span>
                                            </div>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </motion.ul>
                    )}
                </CardContent>
            </Card>
        </motion.div>

        {/* Placeholder for Analytics Summary */}
         {/* <Card>
             <CardHeader>
                 <CardTitle>Focus Analytics Overview</CardTitle>
             </CardHeader>
             <CardContent>
                 <p className="text-muted-foreground">Analytics summary coming soon...</p>
                 <Button variant="link" className="p-0 h-auto mt-2">Go to Full Analytics <BarChartHorizontal className="ml-1 h-4 w-4"/></Button>
             </CardContent>
         </Card> */}
    </motion.div>
  );
};

export default FocusSessionsPage; 