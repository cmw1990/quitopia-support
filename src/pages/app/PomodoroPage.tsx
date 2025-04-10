import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFocusSession } from '@/contexts/FocusSessionContext';
import { 
  Clock, 
  Pause, 
  Play, 
  StopCircle,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  ListChecks
} from 'lucide-react';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabaseGet } from '@/lib/supabaseApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Task as TaskType } from '@/types/tasks';
import { Helmet } from 'react-helmet-async';

const PomodoroPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentSession, 
    isRunning, 
    remainingTime, 
    startFocusSession, 
    startBreakSession, 
    pauseSession, 
    resumeSession, 
    stopSession,
    sessions,
    requestNotificationPermission,
    hasNotificationPermission,
    toggleSoundEnabled,
    isSoundEnabled,
  } = useFocusSession();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const fetchTasks = useCallback(async () => {
      if (!user?.id) return;
      setIsLoadingTasks(true);
      try {
          const { data: fetchedTasks, error: fetchError } = await supabaseGet<TaskType>(
              'tasks',
              `user_id=eq.${user.id}&status=neq.completed&order=created_at.asc`
          );
          if (fetchError) throw fetchError;
          setTasks(fetchedTasks || []);
      } catch (err: any) {
          console.error("Error fetching tasks for pomodoro:", err);
          setTasks([]);
      } finally {
          setIsLoadingTasks(false);
      }
  }, [user?.id]);

  useEffect(() => {
      fetchTasks();
  }, [fetchTasks]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (!currentSession || !currentSession.target_duration_seconds) return 0;
    const elapsed = currentSession.target_duration_seconds - remainingTime;
    return Math.min(100, (elapsed / currentSession.target_duration_seconds) * 100);
  };

  const timerLabel = currentSession 
                      ? (currentSession.type === 'focus' ? 'Focus' : 'Break') 
                      : 'Ready';

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl"> 
      <Helmet>
          <title>Pomodoro Timer - Easier Focus</title>
      </Helmet>

      <Card className="w-full shadow-lg border-primary/20 dark:border-primary/40">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">
            {timerLabel}
          </CardTitle>
          {currentSession?.task_id && tasks.find(t=>t.id === currentSession.task_id) && (
              <CardDescription className="text-sm text-muted-foreground mt-1">
                  Focusing on: {tasks.find(t=>t.id === currentSession.task_id)?.title}
              </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <CircularProgress percentage={calculateProgress()} size={240} strokeWidth={12}>
              <div className="text-center">
                  <div className="text-6xl font-bold font-mono text-foreground mb-1">
                    {formatTime(remainingTime)}
                  </div>
                  {currentSession && (
                       <div className="text-xs text-muted-foreground">
                            Target: {currentSession.target_duration_seconds ? Math.round(currentSession.target_duration_seconds / 60) : 0} min
                       </div>
                  )}
              </div>
          </CircularProgress>

          {!currentSession && (
             <div className="w-full max-w-xs space-y-2">
                 <Label htmlFor="task-select" className="flex items-center gap-1 text-sm"><ListChecks className="h-4 w-4"/> Select Task (Optional)</Label>
                 <Select 
                    value={selectedTaskId || ""} 
                    onValueChange={(value) => setSelectedTaskId(value === "none" ? null : value)}
                    disabled={isLoadingTasks}
                 >
                    <SelectTrigger id="task-select">
                        <SelectValue placeholder={isLoadingTasks ? "Loading tasks..." : "Link to a task..."} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No specific task</SelectItem>
                        {tasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                        ))}
                        {tasks.length === 0 && !isLoadingTasks && (
                            <SelectItem value="no-tasks" disabled>No pending tasks found</SelectItem>
                        )}
                    </SelectContent>
                 </Select>
             </div>
          )}
          
          <div className="flex space-x-3 justify-center w-full">
            {!currentSession ? (
              <>
                <Button 
                  onClick={() => startFocusSession(undefined, selectedTaskId)} 
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="mr-2 h-5 w-5" /> Start Focus
                </Button>
                <Button 
                  onClick={() => startBreakSession()} 
                  size="lg"
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="mr-2 h-5 w-5" /> Start Break
                </Button>
              </>
            ) : (
              <>
                {isRunning ? (
                  <Button 
                    onClick={pauseSession} 
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    <Pause className="mr-2 h-5 w-5" /> Pause
                  </Button>
                ) : (
                  <Button 
                    onClick={resumeSession} 
                    size="lg"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="mr-2 h-5 w-5" /> Resume
                  </Button>
                )}
                <Button 
                  onClick={stopSession} 
                  size="lg"
                  variant="destructive"
                  className="flex-1"
                >
                  <StopCircle className="mr-2 h-5 w-5" /> Stop
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4 pt-4 border-t w-full max-w-sm">
              {!hasNotificationPermission && Notification.permission !== 'denied' && (
                 <Button variant="ghost" size="sm" onClick={requestNotificationPermission} className="text-muted-foreground hover:text-foreground">
                     <Bell className="mr-1 h-4 w-4"/> Enable Notifications
                 </Button>
              )}
               {hasNotificationPermission && (
                 <span className="text-xs text-green-600 flex items-center gap-1"><Bell className="h-3 w-3"/> Notifs On</span>
               )}
               {Notification.permission === 'denied' && (
                  <span className="text-xs text-red-600 flex items-center gap-1"><BellOff className="h-3 w-3"/> Notifs Blocked</span>
               )}
              <Button variant="ghost" size="sm" onClick={toggleSoundEnabled} className="text-muted-foreground hover:text-foreground">
                  {isSoundEnabled ? <Volume2 className="mr-1 h-4 w-4"/> : <VolumeX className="mr-1 h-4 w-4"/>}
                  Sound {isSoundEnabled ? 'On' : 'Off'}
              </Button>
          </div>
        </CardContent>
      </Card>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Recent Sessions
        </h2>
        {sessions.length > 0 ? (
            <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
                <Card key={session.id} className="bg-muted/50 dark:bg-muted/30 border-l-4 
                    ${session.status === 'completed' ? (session.type === 'focus' ? 'border-green-500' : 'border-blue-500') : 'border-gray-400'}">
                <CardContent className="p-3 flex justify-between items-center">
                    <div>
                        <span className={`font-medium capitalize ${session.type === 'focus' ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
                            {session.type}
                            {session.status === 'interrupted' && ' (Stopped)'}
                        </span>
                        <p className="text-xs text-muted-foreground">
                            {new Date(session.start_time).toLocaleString()} - {session.duration_minutes} min
                        </p>
                        {session.task_id && tasks.find(t=>t.id === session.task_id) && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Task: {tasks.find(t=>t.id === session.task_id)?.title}
                            </p>
                        )}
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        ) : (
            <p className="text-muted-foreground text-sm">No recent sessions recorded yet.</p>
        )}
      </section>
    </div>
  );
};

export default PomodoroPage;
