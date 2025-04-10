import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskManager from '@/components/TaskManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Brain, 
  BrainCircuit, 
  Battery, 
  Coffee, 
  Clock, 
  Zap, 
  CheckSquare, 
  ListTodo, 
  TimerReset,
  Sparkles,
  Medal,
  Flame,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  AlertCircle, 
  HelpCircle, 
  X,
  ListRestart,
  CalendarDays,
  ArrowUpDown,
  SlidersHorizontal,
  Radio,
  CircleDashed,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import confetti from 'canvas-confetti';
import { Task } from '@/types/task';
import { format, parseISO, startOfDay, endOfDay, isSameDay, subDays } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Microtask } from '@/types/task';

// Define available energy levels
type EnergyLevel = 'high' | 'medium' | 'low';

// Define task grouping methods
type TaskGrouping = 'energy' | 'priority' | 'time' | 'none';

// Update task streak calculation helper
const calculateStreak = async (userId: string, trulyCompletedToday: Task[]): Promise<number> => {
  let streak = trulyCompletedToday.length > 0 ? 1 : 0;
  let currentDate = subDays(new Date(), 1);
  let hasGap = false;

  while (!hasGap && streak < 30) { // Cap at 30 days for performance
    const dayStart = startOfDay(currentDate).toISOString();
    const dayEnd = endOfDay(currentDate).toISOString();

    try {
      const dayTasks = await apiGet<Task[]>('/rest/v1/focus_tasks', {
        params: {
          select: 'id,updated_at',
          user_id: `eq.${userId}`,
          status: 'eq.completed',
          'updated_at.gte': dayStart,
          'updated_at.lte': dayEnd,
        }
      });

      if (dayTasks.length > 0) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        hasGap = true;
      }
    } catch (error) {
      console.error('Error fetching historical tasks:', error);
      hasGap = true;
    }
  }

  return streak;
};

// Add task suggestion based on energy level
const suggestNextTask = (tasks: Task[], currentEnergyLevel: EnergyLevel): Task | null => {
  if (!tasks.length) return null;

  // Filter tasks by energy level match
  const matchingTasks = tasks.filter(task => 
    task.status === 'todo' && 
    task.estimated_load === currentEnergyLevel
  );

  if (matchingTasks.length) {
    // Sort by priority and cognitive load
    return matchingTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'low'];
      const bPriority = priorityOrder[b.priority || 'low'];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // If same priority, compare cognitive load
      return (b.cognitive_load_estimate || 0) - (a.cognitive_load_estimate || 0);
    })[0];
  }

  return null;
};

// Add progress tracking
const ProgressTracker: React.FC<{
  completedToday: number;
  currentStreak: number;
  isLoadingStats: boolean;
}> = ({ completedToday, currentStreak, isLoadingStats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Medal className="h-5 w-5 mr-2 text-primary" />
          Your Progress
        </CardTitle>
        <CardDescription>Track your task completion progress</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <span className="text-2xl font-bold">{isLoadingStats ? '...' : completedToday}</span>
          <span className="text-sm text-muted-foreground">Tasks Today</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <span className="text-2xl font-bold">{isLoadingStats ? '...' : currentStreak}</span>
          <span className="text-sm text-muted-foreground">Day Streak</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Add focus timer component
const FocusTimerCard: React.FC<{
  focusTimer: number;
  isTimerRunning: boolean;
  toggleFocusTimer: () => void;
  resetFocusTimer: () => void;
  formatTime: (seconds: number) => string;
}> = ({ focusTimer, isTimerRunning, toggleFocusTimer, resetFocusTimer, formatTime }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Focus Timer
        </CardTitle>
        <CardDescription>Track your focus sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-mono text-center">
          {formatTime(focusTimer)}
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant={isTimerRunning ? "destructive" : "default"}
            onClick={toggleFocusTimer}
          >
            {isTimerRunning ? "Stop" : "Start"} Focus
          </Button>
          <Button
            variant="outline"
            onClick={resetFocusTimer}
            disabled={focusTimer === 0}
          >
            <TimerReset className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get status icon and color
const getTaskStatusIcon = (task: Task) => {
  switch (task.status) {
    case 'todo':
      return { Icon: Radio, color: "text-gray-500" };
    case 'in_progress':
      return { Icon: CircleDashed, color: "text-blue-500" };
    case 'completed':
      return { Icon: CheckCircle2, color: "text-green-500" };
    default:
      return { Icon: Radio, color: "text-gray-500" };
  }
};

// Type for Task Card Props
interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onToggleComplete: (taskId: string, currentStatus: Task['status']) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isDragging: boolean;
  provided: any; // from react-beautiful-dnd
}

const ADHDFriendlyTaskManager: React.FC = () => {
  const { user } = useAuth();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [taskGrouping, setTaskGrouping] = useState<TaskGrouping>('energy');
  const [useVisualCues, setUseVisualCues] = useState(true);
  const [showCelebrations, setShowCelebrations] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [focusTimer, setFocusTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Fetch today's completed tasks count and calculate streak
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setIsLoadingStats(false);
        return;
      }
      
      setIsLoadingStats(true);
      try {
        const todayStart = startOfDay(new Date()).toISOString();
        const todayEnd = endOfDay(new Date()).toISOString();
        
        // Fetch tasks completed today using apiGet
        const completedTasks = await apiGet<Task[]>('/rest/v1/focus_tasks', {
          params: {
            select: 'id,updated_at,status',
            user_id: `eq.${user.id}`,
            status: 'eq.completed',
            'updated_at.gte': todayStart,
            'updated_at.lte': todayEnd,
          }
        });

        // Filter again client-side just to be safe with date boundaries
        const trulyCompletedToday = completedTasks.filter(task => 
          task.updated_at && isSameDay(parseISO(task.updated_at), new Date())
        );
        
        setCompletedToday(trulyCompletedToday.length);
        
        // Calculate streak
        setCurrentStreak(await calculateStreak(user.id, trulyCompletedToday));

      } catch (error) {
        console.error('Error fetching completed tasks stats via API:', error);
        setCompletedToday(0);
        setCurrentStreak(0);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, [user?.id]);
  
  // Start/stop focus timer
  const toggleFocusTimer = () => {
    if (isTimerRunning) {
      if (timerId) clearInterval(timerId);
      setIsTimerRunning(false);
      setTimerId(null);
    } else {
      const id = setInterval(() => {
        setFocusTimer(prev => prev + 1);
      }, 1000);
      setIsTimerRunning(true);
      setTimerId(id);
    }
  };
  
  // Reset focus timer
  const resetFocusTimer = () => {
    if (timerId) clearInterval(timerId);
    setFocusTimer(0);
    setIsTimerRunning(false);
    setTimerId(null);
  };
  
  // Format timer display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle task completion celebration
  const handleTaskCompletion = () => {
    if (showCelebrations) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    // Optimistically update count, or refetch after task completion
    setCompletedToday(prev => prev + 1);
    // Streak update would also happen here or after refetch
  };
  
  // Get energy level icon
  const getEnergyIcon = () => {
    switch (energyLevel) {
      case 'high':
        return <BatteryFull className="h-5 w-5 text-green-500" />;
      case 'medium':
        return <BatteryMedium className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <BatteryLow className="h-5 w-5 text-red-500" />;
      default:
        return <Battery className="h-5 w-5" />;
    }
  };
  
  // COMMENTED OUT - Mock task fetching logic
  // useEffect(() => {
  //   if (user?.id) {
  //     console.log("Mock fetching tasks for user:", user.id);
  //     // const loadedTasks = await fetchTasks(user.id);
  //     // setTasks(loadedTasks || []); 
  //     // setTasks(mockTasks); // Error: mockTasks undefined
  //   }
  // }, [user?.id]);

  // Function to handle task completion (moved from TaskCard, but needs tasks state)
  const handleToggleComplete = useCallback((taskId: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    setTasks(prevTasks => 
      prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
    if (newStatus === 'completed') {
      handleTaskCompletion(); // Call original completion handler (for confetti, stats)
    }
    // TODO: Add API call to update task status
  }, [handleTaskCompletion]); // Added handleTaskCompletion dependency

  // Filter, Sort, and Group tasks
  const filteredSortedGroupedTasks = useMemo(() => {
    // 1. Filter Tasks
    let filtered = tasks.filter((task: Task) => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.dueDate) {
        const dueDate = task.due_date ? startOfDay(parseISO(task.due_date)) : null;
        const filterDate = startOfDay(filter.dueDate);
        if (!dueDate || !isSameDay(dueDate, filterDate)) return false;
      }
      if (filter.searchTerm && !task.title.toLowerCase().includes(filter.searchTerm.toLowerCase())) return false;
      return true;
    });

    // 2. Sort Tasks
    let sorted = [...filtered].sort((a, b) => {
      if (sort.key === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'low'] || 0;
        const bPriority = priorityOrder[b.priority || 'low'] || 0;
        return sort.direction === 'asc' ? aPriority - bPriority : bPriority - aPriority;
      } else if (sort.key === 'due_date') {
        const aDate = a.due_date ? parseISO(a.due_date).getTime() : Infinity;
        const bDate = b.due_date ? parseISO(b.due_date).getTime() : Infinity;
        return sort.direction === 'asc' ? aDate - bDate : bDate - aDate;
      } else if (sort.key === 'title') {
        return sort.direction === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0; // Default: no specific sort
    });

    // 3. Group Tasks
    const grouped: Record<string, Task[]> = {};
    sorted.forEach(task => {
      let groupKey: string;
      if (taskGrouping === 'status') {
        groupKey = task.status;
      } else if (taskGrouping === 'priority') {
        groupKey = task.priority || 'none';
      } else if (taskGrouping === 'energy') {
        groupKey = task.estimated_load || 'none'; // Assuming estimated_load maps to energy
      } else { // default or 'none'
        groupKey = 'all';
      }
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    return grouped;

  }, [tasks, filter, sort, taskGrouping]); // Added filter, sort, taskGrouping to dependencies

  return (
    <div className="space-y-6">
      {/* Energy Level & Task Grouping Controls */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
              Current Energy Level
            </CardTitle>
            <CardDescription>
              Set your energy level to get appropriate task recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup type="single" value={energyLevel} onValueChange={(value) => value && setEnergyLevel(value as EnergyLevel)}>
              <ToggleGroupItem value="high" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                High
              </ToggleGroupItem>
              <ToggleGroupItem value="medium" className="flex-1">
                <Coffee className="h-4 w-4 mr-2" />
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem value="low" className="flex-1">
                <Battery className="h-4 w-4 mr-2" />
                Low
              </ToggleGroupItem>
            </ToggleGroup>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Energy-appropriate tasks will be highlighted</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <ListTodo className="h-5 w-5 mr-2 text-primary" />
              Task Organization
            </CardTitle>
            <CardDescription>
              Choose how to organize your tasks for better focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup type="single" value={taskGrouping} onValueChange={(value) => value && setTaskGrouping(value as TaskGrouping)}>
              <ToggleGroupItem value="energy" className="flex-1">
                <Brain className="h-4 w-4 mr-2" />
                By Energy
              </ToggleGroupItem>
              <ToggleGroupItem value="priority" className="flex-1">
                <Flame className="h-4 w-4 mr-2" />
                By Priority
              </ToggleGroupItem>
              <ToggleGroupItem value="time" className="flex-1">
                <Clock className="h-4 w-4 mr-2" />
                By Time
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      </section>
      
      {/* Progress and Timer Section */}
      <section className="grid md:grid-cols-2 gap-4">
        <ProgressTracker
          completedToday={completedToday}
          currentStreak={currentStreak}
          isLoadingStats={isLoadingStats}
        />
        <FocusTimerCard
          focusTimer={focusTimer}
          isTimerRunning={isTimerRunning}
          toggleFocusTimer={toggleFocusTimer}
          resetFocusTimer={resetFocusTimer}
          formatTime={formatTime}
        />
      </section>
      
      {/* ADHD Support Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ADHD Support Features</CardTitle>
          <CardDescription>Customize your task management experience</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="visual-cues">Visual Cues</Label>
              <span className="text-sm text-muted-foreground">
                Use colors and icons to highlight important tasks
              </span>
            </div>
            <Switch 
              id="visual-cues" 
              checked={useVisualCues} 
              onCheckedChange={setUseVisualCues} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="celebrations">Completion Celebrations</Label>
              <span className="text-sm text-muted-foreground">
                Show visual celebration when completing tasks
              </span>
            </div>
            <Switch 
              id="celebrations" 
              checked={showCelebrations} 
              onCheckedChange={setShowCelebrations}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Main Task Manager Component - Removed props */}
      <TaskManager />
    </div>
  );
};

export default ADHDFriendlyTaskManager; 