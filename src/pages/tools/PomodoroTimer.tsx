import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Play,
  Pause,
  SkipForward,
  Settings,
  BarChart,
  ClipboardList,
  CheckCircle,
  Bell,
  Timer,
  RefreshCw,
  PieChart,
  Sparkles,
  Sliders,
  Clock,
  Calendar,
  Info,
  Volume2,
  VolumeX,
  Plus,
  X,
  AlarmClock,
  Coffee,
  ListChecks,
  Zap
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const PomodoroTimer = () => {
  // State for timer settings
  const [workDuration, setWorkDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60); // 15 minutes in seconds
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("timer");
  const [showSettings, setShowSettings] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // State for timer control
  const [timerActive, setTimerActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<'work' | 'break' | 'longBreak'>('work');
  const [timeRemaining, setTimeRemaining] = useState(workDuration);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Reference for audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Toast for notifications
  const { toast } = useToast();

  // Current task
  const [currentTask, setCurrentTask] = useState("");
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean; pomodoros: number }[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalPomodoros: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    startDate: new Date().toISOString(),
  });

  // Set up the timer
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining === 0) {
      // Timer completed
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);

  // Play sound when timer completes
  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play();
    }
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    playSound();
    
    if (currentMode === 'work') {
      // Increment completed sessions
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPomodoros: prev.totalPomodoros + 1,
        totalWorkTime: prev.totalWorkTime + workDuration,
      }));

      // Check if we need a long break
      if (newCompletedSessions % sessionsBeforeLongBreak === 0) {
        setCurrentMode('longBreak');
        setTimeRemaining(longBreakDuration);
        toast({
          title: "Long break time!",
          description: `Great job! Take a ${longBreakDuration / 60} minute break.`,
        });
      } else {
        setCurrentMode('break');
        setTimeRemaining(breakDuration);
        toast({
          title: "Break time!",
          description: `Great job! Take a ${breakDuration / 60} minute break.`,
        });
      }

      // Show signup prompt after a few sessions
      if (newCompletedSessions === 2) {
        setShowSignupPrompt(true);
      }

      // Auto-start break if enabled
      setTimerActive(autoStartBreaks);
    } else {
      // Break is over, start new work session
      setCurrentMode('work');
      setTimeRemaining(workDuration);
      
      // Update stats for break time
      setStats(prev => ({
        ...prev,
        totalBreakTime: prev.totalBreakTime + (currentMode === 'break' ? breakDuration : longBreakDuration),
      }));
      
      toast({
        title: "Break over!",
        description: "Time to focus again.",
      });
      
      // Auto-start work session if enabled
      setTimerActive(autoStartPomodoros);
    }
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Control functions
  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    if (currentMode === 'work') {
      setTimeRemaining(workDuration);
    } else if (currentMode === 'break') {
      setTimeRemaining(breakDuration);
    } else {
      setTimeRemaining(longBreakDuration);
    }
  };

  const skipToNext = () => {
    if (currentMode === 'work') {
      setCurrentMode('break');
      setTimeRemaining(breakDuration);
    } else {
      setCurrentMode('work');
      setTimeRemaining(workDuration);
    }
    setTimerActive(false);
  };

  // Apply settings
  const applySettings = (settings: any) => {
    setWorkDuration(settings.workDuration * 60);
    setBreakDuration(settings.breakDuration * 60);
    setLongBreakDuration(settings.longBreakDuration * 60);
    setSessionsBeforeLongBreak(settings.sessionsBeforeLongBreak);
    setAutoStartBreaks(settings.autoStartBreaks);
    setAutoStartPomodoros(settings.autoStartPomodoros);
    setSoundEnabled(settings.soundEnabled);
    
    // Reset the current timer if needed
    if (currentMode === 'work') {
      setTimeRemaining(settings.workDuration * 60);
    } else if (currentMode === 'break') {
      setTimeRemaining(settings.breakDuration * 60);
    } else {
      setTimeRemaining(settings.longBreakDuration * 60);
    }
    
    setShowSettings(false);
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    if (currentMode === 'work') {
      return 100 - (timeRemaining / workDuration * 100);
    } else if (currentMode === 'break') {
      return 100 - (timeRemaining / breakDuration * 100);
    } else {
      return 100 - (timeRemaining / longBreakDuration * 100);
    }
  };

  // Add task
  const addTask = () => {
    if (!currentTask.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      text: currentTask,
      completed: false,
      pomodoros: 0,
    };
    
    setTasks([...tasks, newTask]);
    setCurrentTask('');
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Remove task
  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Increment pomodoros for a task
  const incrementTaskPomodoros = (id: string) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task
      )
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="text-muted-foreground">
          Boost productivity with focused work sessions and regular breaks.
        </p>
      </div>

      {showSignupPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center space-x-3">
            <Info className="h-6 w-6 text-primary flex-shrink-0" />
            <p className="font-medium">Create an account to save your Pomodoro sessions, track progress, and access advanced features.</p>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setShowSignupPrompt(false)}>
              Later
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up Free</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>
                      {currentMode === 'work' ? 'Focus Time' : currentMode === 'break' ? 'Short Break' : 'Long Break'}
                    </CardTitle>
                    <CardDescription>
                      {currentMode === 'work' ? 'Stay focused on your task' : 'Take a moment to relax'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6">
                <div className="w-64 h-64 rounded-full border-8 border-primary/20 flex items-center justify-center relative mb-6">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 120}
                      strokeDashoffset={2 * Math.PI * 120 * (1 - getProgress() / 100)}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="text-5xl font-bold z-10">{formatTime(timeRemaining)}</div>
                </div>
                
                <div className="flex gap-4 w-full max-w-xs">
                  <Button 
                    className="flex-1" 
                    onClick={toggleTimer}
                  >
                    {timerActive ? (
                      <><Pause className="mr-2 h-4 w-4" /> Pause</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" /> Start</>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={resetTimer}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={skipToNext}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Session {completedSessions + 1}
                  </Badge>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge variant="outline" className="text-xs">
                    {sessionsBeforeLongBreak - (completedSessions % sessionsBeforeLongBreak)} until long break
                  </Badge>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Current Task</CardTitle>
                <CardDescription>
                  What are you focusing on right now?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your task"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                  />
                  <Button onClick={addTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {tasks.length > 0 ? (
                    <ScrollArea className="h-[220px]">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border-b last:border-0">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleTaskCompletion(task.id)}
                              className="mr-2"
                            >
                              {task.completed ? (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2" />
                              )}
                            </Button>
                            <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                              {task.text}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {task.pomodoros}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTask(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks added yet. Add a task to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Plan your tasks and allocate pomodoros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Enhanced Task Management</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Create task lists, set priorities, estimate pomodoros, and sync with your favorite task management apps.
                </p>
                <Button asChild>
                  <Link to="/register">Unlock Task Management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Stats</CardTitle>
              <CardDescription>
                Track your focus time and analyze patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Advanced Statistics</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  View detailed insights, productivity trends, and personalized recommendations based on your Pomodoro usage.
                </p>
                <Button asChild>
                  <Link to="/register">Unlock Statistics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogDescription>
              Customize your Pomodoro timer settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Work Duration (minutes)</Label>
              <Slider
                defaultValue={[workDuration / 60]}
                min={1}
                max={60}
                step={1}
                onValueChange={(value) => {
                  setWorkDuration(value[0] * 60);
                  if (currentMode === 'work') {
                    setTimeRemaining(value[0] * 60);
                  }
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>30</span>
                <span>60</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Short Break Duration (minutes)</Label>
              <Slider
                defaultValue={[breakDuration / 60]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => {
                  setBreakDuration(value[0] * 60);
                  if (currentMode === 'break') {
                    setTimeRemaining(value[0] * 60);
                  }
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Long Break Duration (minutes)</Label>
              <Slider
                defaultValue={[longBreakDuration / 60]}
                min={5}
                max={60}
                step={1}
                onValueChange={(value) => {
                  setLongBreakDuration(value[0] * 60);
                  if (currentMode === 'longBreak') {
                    setTimeRemaining(value[0] * 60);
                  }
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>30</span>
                <span>60</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sessions Before Long Break</Label>
              <Select 
                defaultValue={sessionsBeforeLongBreak.toString()}
                onValueChange={(value) => setSessionsBeforeLongBreak(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sessions" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} sessions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Auto-start Breaks</Label>
              <Switch 
                checked={autoStartBreaks}
                onCheckedChange={setAutoStartBreaks}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Auto-start Pomodoros</Label>
              <Switch 
                checked={autoStartPomodoros}
                onCheckedChange={setAutoStartPomodoros}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Sound Notifications</Label>
              <Switch 
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Background audio element for notifications */}
      <audio 
        ref={audioRef}
        src="/sounds/bell.mp3"
        preload="auto"
      />
    </div>
  );
};

export default PomodoroTimer; 