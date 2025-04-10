import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Plus, Target, Clock, Zap, ListTodo, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter, 
} from "@/components/ui/dialog";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  supabaseGet, 
  supabasePost, 
  supabasePatch
} from '@/lib/supabaseApiService'; 
import { generateId, calculateFocusScore } from "@/lib/utils";

interface FocusTask {
  id: string;
  title: string;
  completed: boolean;
}

interface FocusSessionData {
  id: string;
  user_id: string;
  session_type: "pomodoro" | "deep";
  start_time: string;
  end_time: string;
  duration_minutes: number;
  tasks_completed: number;
  tasks_total: number;
  distractions_count: number;
  focus_score: number;
  notes: string;
  date: string;
}

interface FocusStatData {
  id: string;
  user_id: string;
  date: string;
  total_focus_time: number;
  sessions_count: number;
  tasks_completed: number;
  distractions_count: number;
  focus_score: number;
}

export function FocusSession() {
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionType, setSessionType] = useState<"pomodoro" | "deep">("pomodoro");
  const [distractions, setDistractions] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [completedIntervals, setCompletedIntervals] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "deep" || type === "pomodoro") {
      setSessionType(type);
    }
    setSessionStartTime(new Date());
  }, [searchParams]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    setTasks([
      ...tasks,
      {
        id: generateId(),
        title: newTaskTitle,
        completed: false,
      },
    ]);
    setNewTaskTitle("");
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDistraction = () => {
    setDistractions(distractions + 1);
  };

  const handleSessionComplete = (data: { duration: number; completedIntervals: number }) => {
    setSessionDuration(data.duration);
    setCompletedIntervals(data.completedIntervals);
  };

  const endSession = async () => {
    if (!user?.id) {
      toast({
        title: "You're not logged in",
        description: "Log in to save your focus session",
        variant: "destructive",
      });
      return;
    }
    const userId = user.id;

    try {
      setIsSaving(true);

      const completedTasks = tasks.filter((task) => task.completed).length;
      const sessionEndTime = new Date();
      const durationMinutes = Math.round(
        (sessionEndTime.getTime() - sessionStartTime.getTime()) / 60000
      );
      const focusScore = calculateFocusScore(
        durationMinutes,
        distractions,
        completedTasks
      );

      // Save session to database using supabasePost
      const sessionPayload: Omit<FocusSessionData, 'id'> = {
          user_id: userId,
          session_type: sessionType,
          start_time: sessionStartTime.toISOString(),
          end_time: sessionEndTime.toISOString(),
          duration_minutes: durationMinutes,
          tasks_completed: completedTasks,
          tasks_total: tasks.length,
          distractions_count: distractions,
          focus_score: focusScore,
          notes: sessionNotes,
          date: sessionEndTime.toISOString().split("T")[0],
        };
        
      const { data: sessionDataArr, error: sessionError } = await supabasePost<FocusSessionData>(
        'focus_sessions',
        [sessionPayload],
        'representation'
      );

      if (sessionError) throw sessionError;
      const insertedSession = sessionDataArr?.[0]; 

      // Save individual tasks using supabasePost
      if (tasks.length > 0) {
        const sessionId = insertedSession?.id;
        if (!sessionId) {
           console.warn("Could not get session ID after insert, cannot save tasks.");
        } else {
          const tasksToInsert = tasks.map((task) => ({
            session_id: sessionId,
            user_id: userId,
            title: task.title,
            completed: task.completed,
          }));

          const { error: tasksError } = await supabasePost(
            "focus_tasks",
            tasksToInsert
          );

          if (tasksError) {
            console.error("Error saving tasks:", tasksError);
          }
        }
      }

      // Check/Update daily stats
      const today = sessionEndTime.toISOString().split("T")[0];
      
      const { data: existingStatsArr, error: statsGetError } = await supabaseGet<FocusStatData>(
        "focus_stats",
        `user_id=eq.${userId}&date=eq.${today}&limit=1`
      );

      if (statsGetError) {
         console.error("Error checking stats:", statsGetError);
      }

      const existingStats = existingStatsArr?.[0];

      if (existingStats) {
        // Correct supabasePatch call: (tableName, data, queryParams)
        const statsUpdatePayload = {
            total_focus_time: (existingStats.total_focus_time || 0) + durationMinutes,
            sessions_count: (existingStats.sessions_count || 0) + 1,
            tasks_completed: (existingStats.tasks_completed || 0) + completedTasks,
            distractions_count: (existingStats.distractions_count || 0) + distractions,
            focus_score: Math.round(((existingStats.focus_score || 0) + focusScore) / 2),
          };
        const statsQueryParams = `id=eq.${existingStats.id}`;

        const { error: statsPatchError } = await supabasePatch(
          "focus_stats",
          statsUpdatePayload,
          statsQueryParams
        );
         if (statsPatchError) {
            console.error("Error updating stats:", statsPatchError);
         }
      } else {
        // Create new stats record using supabasePost
         const statsInsertPayload = {
            user_id: userId,
            date: today,
            total_focus_time: durationMinutes,
            sessions_count: 1,
            tasks_completed: completedTasks,
            distractions_count: distractions,
            focus_score: focusScore,
          };
        const { error: statsPostError } = await supabasePost(
          "focus_stats",
          [statsInsertPayload]
        );
         if (statsPostError) {
            console.error("Error inserting new stats:", statsPostError);
         }
      }

      toast({
        title: "Session saved",
        description: `Focus score: ${focusScore}/100`,
        variant: "success",
      });

      // Redirect to dashboard with success
      navigate("/app/dashboard", { 
        state: { 
          sessionComplete: true,
          focusScore,
          sessionDuration: durationMinutes
        } 
      });
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error saving session",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowEndDialog(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => setShowEndDialog(true)}
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Session
        </Button>
        <div className="flex items-center gap-2">
          {sessionType === "pomodoro" ? (
            <Clock className="h-5 w-5 text-primary" />
          ) : (
            <Zap className="h-5 w-5 text-primary" />
          )}
          <h2 className="text-xl font-bold">
            {sessionType === "pomodoro" ? "Pomodoro" : "Deep Work"} Session
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timer Section */}
        <div className="space-y-6">
          {sessionType === "pomodoro" ? (
            <PomodoroTimer 
              onSessionComplete={handleSessionComplete}
              onDistraction={handleDistraction}
            />
          ) : (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Deep Work Session
                </CardTitle>
                <CardDescription>
                  Minimize distractions and focus deeply on your tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="text-6xl font-bold text-primary">
                    {Math.floor(sessionDuration / 60)}:{String(sessionDuration % 60).padStart(2, "0")}
                  </div>
                  <p className="text-muted-foreground mt-2">Session Duration</p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    className="text-red-500 border border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleDistraction}
                  >
                    Log Distraction ({distractions})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
              <CardDescription>
                Jot down any thoughts or insights during your session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your session notes here..."
                className="min-h-[150px]"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Session Tasks
                </div>
                <span className="text-sm text-muted-foreground">
                  {tasks.filter(t => t.completed).length}/{tasks.length} completed
                </span>
              </CardTitle>
              <CardDescription>
                Focus on completing these tasks during your session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a task for this session..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask();
                    }}
                  />
                  <Button onClick={addTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-3 rounded-lg border"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                          id={`task-${task.id}`}
                        />
                        <Label
                          htmlFor={`task-${task.id}`}
                          className={`flex-1 cursor-pointer ${
                            task.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task.title}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No tasks added yet</p>
                      <p className="text-sm">
                        Add tasks to track during your focus session
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-muted-foreground text-sm">Distractions</p>
                  <p className="text-2xl font-bold">{distractions}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-muted-foreground text-sm">Tasks Completed</p>
                  <p className="text-2xl font-bold">{tasks.filter(t => t.completed).length}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-muted-foreground text-sm">Session Time</p>
                  <p className="text-2xl font-bold">{Math.floor(sessionDuration / 60)}m</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-muted-foreground text-sm">Intervals</p>
                  <p className="text-2xl font-bold">{completedIntervals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Focus Session?</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to end your focus session? Your progress will be saved.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Continue Session
            </Button>
            <Button onClick={endSession} disabled={isSaving}>
              {isSaving ? "Saving..." : "End & Save Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FocusSession; 