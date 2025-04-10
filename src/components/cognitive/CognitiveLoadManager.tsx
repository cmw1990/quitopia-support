import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, 
  Activity, 
  Battery, 
  BatteryLow, 
  BatteryCharging, 
  Clock, 
  Zap, 
  AlertCircle,
  Check, 
  X, 
  PanelRightClose, 
  Lightbulb, 
  ListTodo,
  Calendar,
  Clock3,
  Flame,
  Coffee,
  Sparkles,
  Timer
} from 'lucide-react';

// Interfaces for cognitive load management
interface Task {
  id: string;
  title: string;
  estimatedEffort: number; // 1-5 scale
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  completed: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

interface CognitiveState {
  mentalEnergy: number; // 0-100
  focusLevel: number; // 0-100
  stressLevel: number; // 0-100
  timestamp: Date;
}

interface CognitiveCapacity {
  dailyTotal: number; // Max mental energy points per day
  remaining: number;
  restorationRate: number; // Points recovered per hour of rest
}

interface CognitiveZone {
  name: string;
  description: string;
  recommendedTaskTypes: string[];
  minFocusLevel: number;
  maxStressLevel: number;
  icon: React.ReactNode;
  color: string;
}

export const CognitiveLoadManager: React.FC = () => {
  const { toast } = useToast();
  
  // State for cognitive load tracking
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    mentalEnergy: 75,
    focusLevel: 60,
    stressLevel: 35,
    timestamp: new Date()
  });
  
  const [capacity, setCapacity] = useState<CognitiveCapacity>({
    dailyTotal: 100,
    remaining: 75,
    restorationRate: 5
  });
  
  const [tasks, setTasks] = useState<Task[]>([
  {
    id: '1',
      title: 'Deep work: Implement focus timer feature',
      estimatedEffort: 4,
    priority: 'high',
      tags: ['coding', 'creative', 'focus'],
      completed: false,
      timeOfDay: 'morning'
  },
  {
    id: '2',
      title: 'Email replies (batch processing)',
      estimatedEffort: 2,
    priority: 'medium',
      tags: ['communication', 'admin'],
      completed: false,
      timeOfDay: 'afternoon'
  },
  {
    id: '3',
      title: 'Plan tomorrow\'s schedule',
      estimatedEffort: 1,
    priority: 'medium',
      tags: ['planning', 'admin'],
      completed: false,
      timeOfDay: 'evening'
    },
    {
      id: '4',
      title: 'Research new productivity techniques',
      estimatedEffort: 3,
      priority: 'low',
      tags: ['learning', 'reading'],
      completed: false
    }
  ]);
  
  const [selectedView, setSelectedView] = useState('dashboard');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEffort, setNewTaskEffort] = useState(3);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [cognitiveZoneEnabled, setCognitiveZoneEnabled] = useState(true);
  
  // Cognitive zones definition
  const cognitiveZones: CognitiveZone[] = [
    {
      name: 'Deep Focus Zone',
      description: 'Optimal for complex problem-solving and creative work',
      recommendedTaskTypes: ['coding', 'writing', 'design', 'learning', 'creative'],
      minFocusLevel: 70,
      maxStressLevel: 30,
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-100 border-purple-300'
    },
    {
      name: 'Productive Zone',
      description: 'Good for routine tasks that require attention but less creativity',
      recommendedTaskTypes: ['planning', 'admin', 'organization', 'data entry'],
      minFocusLevel: 50,
      maxStressLevel: 50,
      icon: <Activity className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-100 border-blue-300'
    },
    {
      name: 'Communication Zone',
      description: 'Ideal for meetings, emails, and social interaction',
      recommendedTaskTypes: ['communication', 'meetings', 'emails', 'calls'],
      minFocusLevel: 40,
      maxStressLevel: 60,
      icon: <Zap className="h-8 w-8 text-green-500" />,
      color: 'bg-green-100 border-green-300'
    },
    {
      name: 'Rest & Recovery Zone',
      description: 'Take a break to recharge mental energy',
      recommendedTaskTypes: ['break', 'meditation', 'walk', 'rest'],
      minFocusLevel: 0,
      maxStressLevel: 100,
      icon: <BatteryCharging className="h-8 w-8 text-amber-500" />,
      color: 'bg-amber-100 border-amber-300'
    }
  ];
  
  // Determine current cognitive zone
  const getCurrentZone = (): CognitiveZone => {
    if (cognitiveState.focusLevel >= 70 && cognitiveState.stressLevel <= 30) {
      return cognitiveZones[0]; // Deep Focus Zone
    } else if (cognitiveState.focusLevel >= 50 && cognitiveState.stressLevel <= 50) {
      return cognitiveZones[1]; // Productive Zone
    } else if (cognitiveState.focusLevel >= 40 && cognitiveState.stressLevel <= 60) {
      return cognitiveZones[2]; // Communication Zone
    } else {
      return cognitiveZones[3]; // Rest & Recovery Zone
    }
  };
  
  // Update cognitive capacity
  useEffect(() => {
    // Simulate capacity depletion based on time
    const interval = setInterval(() => {
      if (capacity.remaining > 0) {
        setCapacity(prev => ({
          ...prev,
          remaining: Math.max(0, prev.remaining - 0.5)
        }));
      }
    }, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Add new task
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task",
        variant: "destructive"
      });
      return;
    }
    
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
      estimatedEffort: newTaskEffort,
        priority: newTaskPriority,
      tags: [],
      completed: false
      };
      
      setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskEffort(3);
    setNewTaskPriority('medium');
    
    toast({
      title: "Task added",
      description: "New task added to your cognitive load plan"
    });
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    ));
    
    // If completing a task, update cognitive state
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Decrease mental energy based on task effort
      setCognitiveState(prev => ({
        ...prev,
        mentalEnergy: Math.max(0, prev.mentalEnergy - (task.estimatedEffort * 5)),
        timestamp: new Date()
      }));
      
      setCapacity(prev => ({
        ...prev,
        remaining: Math.max(0, prev.remaining - (task.estimatedEffort * 5))
      }));
      
      toast({
        title: "Task completed",
        description: `Used ${task.estimatedEffort * 5} mental energy points`
      });
    }
  };
  
  // Update cognitive state manually
  const updateCognitiveState = (property: keyof Omit<CognitiveState, 'timestamp'>, value: number) => {
    setCognitiveState(prev => ({
      ...prev,
      [property]: value,
      timestamp: new Date()
    }));
  };
  
  // Reset cognitive capacity (simulating a new day or rest period)
  const restoreCognitiveCapacity = () => {
    setCapacity(prev => ({
      ...prev,
      remaining: Math.min(prev.dailyTotal, prev.remaining + 25)
    }));
    
    setCognitiveState(prev => ({
      ...prev,
      mentalEnergy: Math.min(100, prev.mentalEnergy + 25),
      timestamp: new Date()
    }));
    
    toast({
      title: "Energy restored",
      description: "You've recovered 25 mental energy points"
    });
  };
  
  // Get recommended tasks based on current cognitive zone
  const getRecommendedTasks = () => {
    const currentZone = getCurrentZone();
    return tasks.filter(task => 
      !task.completed && 
      (task.estimatedEffort <= Math.ceil(capacity.remaining / 20)) &&
      (task.priority === 'high' || 
       task.tags.some(tag => currentZone.recommendedTaskTypes.includes(tag)))
    );
  };
  
  // Get priority class for visual styling
  const getPriorityClass = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Get effort label
  const getEffortLabel = (effort: number) => {
    switch(effort) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Very High';
      default: return 'Medium';
    }
  };
  
  // Render progress indicator with color
  const renderProgress = (value: number, label: string, icon: React.ReactNode) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <Progress 
        value={value} 
        className="h-2" 
        style={{
          '--progress-foreground': value > 70 ? 'var(--green-9)' : 
                                 value > 40 ? 'var(--amber-9)' : 
                                 'var(--red-9)'
        } as React.CSSProperties}
      />
    </div>
  );
    
    return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
          <h1 className="text-3xl font-bold">Cognitive Load Manager</h1>
          <p className="text-muted-foreground">Optimize your mental energy and focus for peak performance</p>
          </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="cognitive-zone">Cognitive Zone Guidance</Label>
          <Switch 
            id="cognitive-zone" 
            checked={cognitiveZoneEnabled} 
            onCheckedChange={setCognitiveZoneEnabled} 
          />
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* Current Cognitive State Card */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Current Cognitive State</CardTitle>
                <CardDescription>Last updated: {new Date(cognitiveState.timestamp).toLocaleTimeString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderProgress(cognitiveState.mentalEnergy, 'Mental Energy', <Battery className="h-4 w-4 text-blue-500" />)}
                {renderProgress(cognitiveState.focusLevel, 'Focus Level', <Zap className="h-4 w-4 text-purple-500" />)}
                {renderProgress(cognitiveState.stressLevel, 'Stress Level', <Activity className="h-4 w-4 text-orange-500" />)}
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Daily Capacity</span>
                    <span>{capacity.remaining}/{capacity.dailyTotal} points</span>
                  </div>
                  <Progress 
                    value={(capacity.remaining / capacity.dailyTotal) * 100}
                    className="h-2"
                    style={{
                      '--progress-foreground': 'var(--blue-9)'
                    } as React.CSSProperties}
                  />
          </div>
          
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={restoreCognitiveCapacity}
                >
                  <BatteryCharging className="mr-2 h-4 w-4" />
                  Restore Energy
                </Button>
              </CardContent>
            </Card>
            
            {/* Current Cognitive Zone Card */}
            {cognitiveZoneEnabled && (
              <Card className={`border-2 ${getCurrentZone().color}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Current Zone</CardTitle>
                    {getCurrentZone().icon}
                  </div>
                  <CardDescription>
                    <span className="font-bold">{getCurrentZone().name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{getCurrentZone().description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Recommended Activities:</p>
                    <div className="flex flex-wrap gap-1">
                      {getCurrentZone().recommendedTaskTypes.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
            </div>
                </CardContent>
              </Card>
            )}
            
            {/* Recommended Tasks Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Tasks</CardTitle>
                <CardDescription>Based on your current cognitive state</CardDescription>
              </CardHeader>
              <CardContent>
                {getRecommendedTasks().length > 0 ? (
                  <ul className="space-y-2">
                    {getRecommendedTasks().slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-start gap-2 p-2 rounded-md border bg-background">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-5 w-5 rounded-full"
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={getPriorityClass(task.priority)}>
            {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Effort: {getEffortLabel(task.estimatedEffort)}
                            </span>
          </div>
        </div>
                    </li>
                  ))}
                </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No recommended tasks for your current cognitive state</p>
              </div>
            )}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedView('tasks')}>
                  View All Tasks
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setSelectedView('energy')}>
                  <BatteryCharging className="h-6 w-6 mb-2" />
                  <span>Update Energy</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setSelectedView('tasks')}>
                  <ListTodo className="h-6 w-6 mb-2" />
                  <span>Manage Tasks</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-4">
                  <Timer className="h-6 w-6 mb-2" />
                  <span>Start Focus Timer</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-4">
                  <Coffee className="h-6 w-6 mb-2" />
                  <span>Take a Break</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Energy Conservation Tips */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Energy Management Tip</AlertTitle>
            <AlertDescription>
              Schedule high-effort tasks during your peak energy periods. For most people,
              this is in the morning or after a restful break.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          {/* Add New Task */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input 
                    id="task-title" 
                    placeholder="Enter task title" 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="task-effort">Cognitive Effort (1-5)</Label>
                    <span className="text-sm text-muted-foreground">{getEffortLabel(newTaskEffort)}</span>
              </div>
                  <Slider 
                    id="task-effort"
                    min={1} 
                    max={5} 
                    step={1} 
                    value={[newTaskEffort]} 
                    onValueChange={(value) => setNewTaskEffort(value[0])} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant={newTaskPriority === 'low' ? 'default' : 'outline'} 
                      className={newTaskPriority === 'low' ? 'bg-green-600' : ''}
                      onClick={() => setNewTaskPriority('low')}
                    >
                      Low
                    </Button>
                    <Button 
                      type="button" 
                      variant={newTaskPriority === 'medium' ? 'default' : 'outline'} 
                      className={newTaskPriority === 'medium' ? 'bg-yellow-600' : ''}
                      onClick={() => setNewTaskPriority('medium')}
                    >
                      Medium
                    </Button>
                    <Button 
                      type="button" 
                      variant={newTaskPriority === 'high' ? 'default' : 'outline'} 
                      className={newTaskPriority === 'high' ? 'bg-red-600' : ''}
                      onClick={() => setNewTaskPriority('high')}
                    >
                      High
                    </Button>
              </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddTask}>Add Task</Button>
            </CardFooter>
          </Card>
          
          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                {tasks.filter(t => !t.completed).length} pending, {tasks.filter(t => t.completed).length} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pending Tasks</h3>
                  {tasks.filter(t => !t.completed).length > 0 ? (
                    <ul className="space-y-2">
                      {tasks.filter(t => !t.completed).map(task => (
                        <li key={task.id} className="flex items-start gap-2 p-3 rounded-md border">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-5 w-5 rounded-full mt-0.5"
                            onClick={() => toggleTaskCompletion(task.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              <Badge variant="outline" className={getPriorityClass(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline">
                                Effort: {getEffortLabel(task.estimatedEffort)}
                              </Badge>
                              {task.timeOfDay && (
                                <Badge variant="outline">
                                  {task.timeOfDay}
                                </Badge>
                              )}
                </div>
              </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                      <Check className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">All caught up! No pending tasks.</p>
            </div>
                  )}
            </div>
            
                {tasks.filter(t => t.completed).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Completed Tasks</h3>
                      <ul className="space-y-2">
                        {tasks.filter(t => t.completed).map(task => (
                          <li key={task.id} className="flex items-start gap-2 p-3 rounded-md border bg-muted/50">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-5 w-5 rounded-full mt-0.5 bg-green-100"
                              onClick={() => toggleTaskCompletion(task.id)}
                            >
                              <Check className="h-3 w-3 text-green-600" />
              </Button>
                            <div className="flex-1">
                              <p className="font-medium line-through opacity-70">{task.title}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <Badge variant="outline" className="opacity-50">
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className="opacity-50">
                                  Effort: {getEffortLabel(task.estimatedEffort)}
                                </Badge>
            </div>
          </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
        )}
      </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="energy" className="space-y-6">
          {/* Energy Management */}
          <Card>
            <CardHeader>
              <CardTitle>Update Your Cognitive State</CardTitle>
              <CardDescription>
                Adjust these values based on how you're feeling right now
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="mental-energy">Mental Energy</Label>
                    <span className="text-sm font-medium">{cognitiveState.mentalEnergy}%</span>
                  </div>
                  <Slider 
                    id="mental-energy"
                    min={0} 
                    max={100} 
                    step={5} 
                    value={[cognitiveState.mentalEnergy]} 
                    onValueChange={(value) => updateCognitiveState('mentalEnergy', value[0])} 
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How much overall mental energy do you have available?
                  </p>
            </div>
            
              <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="focus-level">Focus Level</Label>
                    <span className="text-sm font-medium">{cognitiveState.focusLevel}%</span>
                  </div>
                  <Slider 
                    id="focus-level"
                    min={0} 
                    max={100} 
                    step={5} 
                    value={[cognitiveState.focusLevel]} 
                    onValueChange={(value) => updateCognitiveState('focusLevel', value[0])} 
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How well can you concentrate on a single task?
                  </p>
              </div>
              
              <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="stress-level">Stress Level</Label>
                    <span className="text-sm font-medium">{cognitiveState.stressLevel}%</span>
                  </div>
                  <Slider 
                    id="stress-level"
                    min={0} 
                    max={100} 
                    step={5} 
                    value={[cognitiveState.stressLevel]} 
                    onValueChange={(value) => updateCognitiveState('stressLevel', value[0])} 
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How stressed or overwhelmed do you feel?
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <Textarea placeholder="Add notes about your current mental state..." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedView('dashboard')}>Cancel</Button>
              <Button onClick={() => {
                toast({
                  title: "Cognitive state updated",
                  description: "Your mental energy profile has been updated"
                });
                setSelectedView('dashboard');
              }}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          {/* Energy Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Energy Management Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cognitiveState.mentalEnergy < 30 && (
                <Alert className="bg-red-50 border-red-200">
                  <BatteryLow className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">Low Mental Energy</AlertTitle>
                  <AlertDescription>
                    Your mental energy is depleted. Consider taking a recovery break:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Take a 20-minute power nap</li>
                      <li>Go for a short walk outside</li>
                      <li>Do a 5-minute meditation</li>
                      <li>Hydrate and have a healthy snack</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {cognitiveState.focusLevel < 40 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-600">Difficulty Focusing</AlertTitle>
                  <AlertDescription>
                    Your focus level is low. Try these techniques to improve concentration:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Clear your workspace of distractions</li>
                      <li>Use noise-cancelling headphones</li>
                      <li>Try the Pomodoro technique (25 min focus, 5 min break)</li>
                      <li>Set a clear, specific goal for your next work session</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {cognitiveState.stressLevel > 70 && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-600">High Stress Detected</AlertTitle>
                  <AlertDescription>
                    Your stress level is elevated. Consider these calming activities:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Practice deep breathing for 2 minutes</li>
                      <li>Stretch or do light movement</li>
                      <li>Write down what's causing stress</li>
                      <li>Break complex tasks into smaller steps</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {(cognitiveState.mentalEnergy >= 30 && cognitiveState.focusLevel >= 40 && cognitiveState.stressLevel <= 70) && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Balanced Cognitive State</AlertTitle>
                  <AlertDescription>
                    Your mental energy, focus, and stress levels are in a healthy range.
                    This is a good time to tackle important tasks or engage in deep work.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Daily Energy Pattern Insight
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on your data, your peak mental energy and focus times are typically:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Morning: 9am - 11am</span>
                    <Badge variant="outline" className="ml-auto">Peak Performance</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Afternoon: 3pm - 4pm</span>
                    <Badge variant="outline" className="ml-auto">Secondary Peak</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <BatteryLow className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Early Afternoon: 1pm - 2pm</span>
                    <Badge variant="outline" className="ml-auto">Energy Dip</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          
        <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle>Cognitive Performance Insights</CardTitle>
                <CardDescription>
                Data and analysis to help you understand your cognitive patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="rounded-lg border p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Brain className="h-12 w-12 text-muted-foreground" />
                  </div>
                <h3 className="text-xl font-medium mb-2">Insights Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on developing detailed analytics and insights for your cognitive patterns.
                  Continue using the Cognitive Load Manager to gather data for personalized insights.
                </p>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
                    </div>
  );
};
