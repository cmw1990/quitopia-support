import React, { useState } from 'react';
import { 
  Battery, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull,
  Plus,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Edit,
  Trash,
  BarChart,
  ListChecks,
  Zap,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface Task {
  id: string;
  name: string;
  energyLevel: 'high' | 'medium' | 'low';
  timeOfDay: string;
  duration: number;
  importance: number;
  completed: boolean;
}

interface EnergyPattern {
  day: string;
  hours: {
    hour: number;
    level: 'high' | 'medium' | 'low';
  }[];
}

const EnergyScheduler: React.FC = () => {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Write project proposal',
      energyLevel: 'high',
      timeOfDay: 'morning',
      duration: 90,
      importance: 3,
      completed: false
    },
    {
      id: '2',
      name: 'Check and respond to emails',
      energyLevel: 'medium',
      timeOfDay: 'afternoon',
      duration: 45,
      importance: 2,
      completed: false
    },
    {
      id: '3',
      name: 'Organize files and documents',
      energyLevel: 'low',
      timeOfDay: 'evening',
      duration: 30,
      importance: 1,
      completed: false
    },
    {
      id: '4',
      name: 'Team meeting',
      energyLevel: 'medium',
      timeOfDay: 'morning',
      duration: 60,
      importance: 3,
      completed: true
    }
  ]);

  // State for new task
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    energyLevel: 'medium',
    timeOfDay: 'morning',
    duration: 30,
    importance: 2
  });

  // Energy patterns
  const [energyPatterns, setEnergyPatterns] = useState<EnergyPattern[]>([
    {
      day: 'Monday',
      hours: [
        { hour: 8, level: 'medium' },
        { hour: 9, level: 'high' },
        { hour: 10, level: 'high' },
        { hour: 11, level: 'high' },
        { hour: 12, level: 'medium' },
        { hour: 13, level: 'low' },
        { hour: 14, level: 'low' },
        { hour: 15, level: 'medium' },
        { hour: 16, level: 'medium' },
        { hour: 17, level: 'low' },
        { hour: 18, level: 'low' },
        { hour: 19, level: 'medium' },
        { hour: 20, level: 'medium' }
      ]
    },
    {
      day: 'Tuesday',
      hours: [
        { hour: 8, level: 'medium' },
        { hour: 9, level: 'high' },
        { hour: 10, level: 'high' },
        { hour: 11, level: 'high' },
        { hour: 12, level: 'medium' },
        { hour: 13, level: 'low' },
        { hour: 14, level: 'low' },
        { hour: 15, level: 'medium' },
        { hour: 16, level: 'medium' },
        { hour: 17, level: 'low' },
        { hour: 18, level: 'low' },
        { hour: 19, level: 'medium' },
        { hour: 20, level: 'medium' }
      ]
    }
  ]);

  // Current day for viewing
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Selected time of day for filtering tasks
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('all');
  
  // Add new task
  const handleAddTask = () => {
    if (!newTask.name) return;
    
    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name || '',
      energyLevel: newTask.energyLevel || 'medium',
      timeOfDay: newTask.timeOfDay || 'morning',
      duration: newTask.duration || 30,
      importance: newTask.importance || 2,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      name: '',
      energyLevel: 'medium',
      timeOfDay: 'morning',
      duration: 30,
      importance: 2
    });
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  // Delete task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Filter tasks based on time of day
  const filteredTasks = tasks.filter(task => 
    selectedTimeOfDay === 'all' || task.timeOfDay === selectedTimeOfDay
  );
  
  // Get energy level icon
  const getEnergyIcon = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return <BatteryFull className="h-4 w-4" />;
      case 'medium':
        return <BatteryMedium className="h-4 w-4" />;
      case 'low':
        return <BatteryLow className="h-4 w-4" />;
      default:
        return <Battery className="h-4 w-4" />;
    }
  };
  
  // Get energy level class
  const getEnergyClass = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Energy-Based Task Scheduler</h1>
        <p className="text-muted-foreground">Match tasks to your energy levels for optimal productivity</p>
      </div>
      
      <Tabs defaultValue="schedule">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="schedule">
            <ListChecks className="h-4 w-4 mr-2" />
            Task Schedule
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <BarChart className="h-4 w-4 mr-2" />
            Energy Patterns
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </TabsTrigger>
        </TabsList>
        
        {/* Task Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>Filter by time:</Label>
              <Select 
                value={selectedTimeOfDay} 
                onValueChange={setSelectedTimeOfDay}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All times</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <BatteryFull className="h-4 w-4 text-green-500" />
                High Energy Tasks
              </h3>
              <span className="text-xs text-muted-foreground">
                {tasks.filter(t => t.energyLevel === 'high' && !t.completed).length} tasks
              </span>
            </div>
            
            <ScrollArea className="h-[120px]">
              {filteredTasks
                .filter(task => task.energyLevel === 'high' && !task.completed)
                .map(task => (
                  <Card key={task.id} className="mb-2 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <BatteryFull className="h-4 w-4 text-green-500" />
                        </Button>
                        <span>{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.duration} min
                        </Badge>
                        <Badge variant="outline">{task.timeOfDay}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </ScrollArea>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <BatteryMedium className="h-4 w-4 text-yellow-500" />
                Medium Energy Tasks
              </h3>
              <span className="text-xs text-muted-foreground">
                {tasks.filter(t => t.energyLevel === 'medium' && !t.completed).length} tasks
              </span>
            </div>
            
            <ScrollArea className="h-[120px]">
              {filteredTasks
                .filter(task => task.energyLevel === 'medium' && !task.completed)
                .map(task => (
                  <Card key={task.id} className="mb-2 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <BatteryMedium className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <span>{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.duration} min
                        </Badge>
                        <Badge variant="outline">{task.timeOfDay}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </ScrollArea>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <BatteryLow className="h-4 w-4 text-red-500" />
                Low Energy Tasks
              </h3>
              <span className="text-xs text-muted-foreground">
                {tasks.filter(t => t.energyLevel === 'low' && !t.completed).length} tasks
              </span>
            </div>
            
            <ScrollArea className="h-[120px]">
              {filteredTasks
                .filter(task => task.energyLevel === 'low' && !task.completed)
                .map(task => (
                  <Card key={task.id} className="mb-2 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <BatteryLow className="h-4 w-4 text-red-500" />
                        </Button>
                        <span>{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.duration} min
                        </Badge>
                        <Badge variant="outline">{task.timeOfDay}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </ScrollArea>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Completed Tasks</h3>
            <ScrollArea className="h-[150px]">
              {filteredTasks
                .filter(task => task.completed)
                .map(task => (
                  <Card key={task.id} className="mb-2 p-3 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <span className="line-through text-muted-foreground">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-muted-foreground">
                          {task.energyLevel}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </ScrollArea>
          </div>
        </TabsContent>
        
        {/* Energy Patterns Tab */}
        <TabsContent value="patterns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Energy Patterns</CardTitle>
              <CardDescription>
                Track your energy levels throughout the day to optimize task scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <Select 
                  value={selectedDay} 
                  onValueChange={setSelectedDay}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-xs">Low</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-[200px] border-b border-l">
                {/* Hours labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-3">
                  {[8, 10, 12, 14, 16, 18, 20].map(hour => (
                    <span key={hour} className="text-xs text-muted-foreground">
                      {hour}:00
                    </span>
                  ))}
                </div>
                
                {/* Energy level visualization */}
                <div className="absolute inset-0 flex items-end">
                  {energyPatterns
                    .find(pattern => pattern.day === selectedDay)
                    ?.hours.map(hour => {
                      const height = hour.level === 'high' 
                        ? 80 
                        : hour.level === 'medium' 
                          ? 50 
                          : 20;
                      
                      const color = hour.level === 'high'
                        ? 'bg-green-500'
                        : hour.level === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500';
                          
                      return (
                        <div 
                          key={hour.hour} 
                          className="flex-1 flex flex-col items-center"
                          title={`${hour.hour}:00 - ${hour.level} energy`}
                        >
                          <div 
                            className={`w-full ${color} rounded-t-sm`} 
                            style={{ height: `${height}%` }} 
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <ArrowUp className="h-4 w-4 text-green-500" />
                      Peak Energy Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">9:00 AM - 11:00 AM</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best for creative work, problem-solving, and challenging tasks
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <ArrowRight className="h-4 w-4 text-yellow-500" />
                      Moderate Energy Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">2:00 PM - 4:00 PM, 7:00 PM - 8:00 PM</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Good for meetings, emails, and organizational tasks
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <ArrowDown className="h-4 w-4 text-red-500" />
                      Low Energy Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">1:00 PM - 2:00 PM, 5:00 PM - 6:00 PM</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best for simple tasks, routine work, and low-concentration activities
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Update Energy Pattern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Add Task Tab */}
        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
              <CardDescription>
                Add a task and match it to your energy levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input 
                  id="task-name" 
                  placeholder="Enter task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="energy-level">Energy Level Required</Label>
                  <Select 
                    value={newTask.energyLevel} 
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setNewTask({ ...newTask, energyLevel: value })
                    }
                  >
                    <SelectTrigger id="energy-level">
                      <SelectValue placeholder="Select energy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <BatteryFull className="h-4 w-4 text-green-500" />
                          High Energy
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <BatteryMedium className="h-4 w-4 text-yellow-500" />
                          Medium Energy
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <BatteryLow className="h-4 w-4 text-red-500" />
                          Low Energy
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-of-day">Best Time of Day</Label>
                  <Select 
                    value={newTask.timeOfDay} 
                    onValueChange={(value) => setNewTask({ ...newTask, timeOfDay: value })}
                  >
                    <SelectTrigger id="time-of-day">
                      <SelectValue placeholder="Select time of day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-duration">Duration (minutes)</Label>
                  <Select 
                    value={newTask.duration?.toString()} 
                    onValueChange={(value) => setNewTask({ ...newTask, duration: parseInt(value) })}
                  >
                    <SelectTrigger id="task-duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="task-importance">Importance</Label>
                  <Select 
                    value={newTask.importance?.toString()} 
                    onValueChange={(value) => setNewTask({ ...newTask, importance: parseInt(value) })}
                  >
                    <SelectTrigger id="task-importance">
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">High Priority</SelectItem>
                      <SelectItem value="2">Medium Priority</SelectItem>
                      <SelectItem value="1">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleAddTask}
                disabled={!newTask.name}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Task Scheduling Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">High Energy Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Creative work, learning new concepts, problem-solving, 
                  complex decision-making, important meetings, challenging coding tasks
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Medium Energy Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Emails, routine meetings, planning, administrative work, 
                  reviewing documents, light research, organizing
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Low Energy Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Filing, data entry, organizing files, simple updates,
                  routine tasks, low-stakes communication, easy maintenance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnergyScheduler; 