import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Battery, 
  BatteryMedium, 
  BatteryLow, 
  Zap, 
  Brain, 
  CheckCircle2,
  Calculator,
  FileText,
  BookOpen,
  MessageSquare,
  Coffee
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { energyLevelsApi, productivityToolsApi } from '@/api/supabase-rest';

// Task energy level mapping
const ENERGY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Task types mapping
const TASK_TYPES = {
  CREATIVE: 'creative',
  ANALYTICAL: 'analytical',
  ADMINISTRATIVE: 'administrative',
  LEARNING: 'learning',
  COMMUNICATION: 'communication'
};

// Time of day mapping
const TIME_OF_DAY = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

interface Task {
  id: string;
  title: string;
  description?: string;
  energy_requirement: string;
  task_type: string;
  estimated_minutes: number;
  priority: number;
  is_completed: boolean;
  context?: string;
}

interface EnergyPattern {
  day_of_week: number;
  hour: number;
  average_energy: number;
  sample_count: number;
}

interface OptimizedSchedule {
  date: Date;
  slots: ScheduleSlot[];
}

interface ScheduleSlot {
  start_time: Date;
  end_time: Date;
  task_id?: string;
  energy_level: string;
  is_break: boolean;
}

// Add missing API functions
// Extend the energyLevelsApi object with the missing methods
const enhancedEnergyLevelsApi = {
  ...energyLevelsApi,
  getEnergyPatterns: async (userId: string, session: any): Promise<EnergyPattern[]> => {
    try {
      // This is a placeholder implementation - in a real app, you would call the Supabase REST API
      console.log('Fetching energy patterns for user:', userId);
      // Return mock data for now
      return [];
    } catch (error) {
      console.error('Error fetching energy patterns:', error);
      throw error;
    }
  },
  generateOptimizedSchedule: async (
    userId: string, 
    date: string, 
    energyLevel: number, 
    scheduleType: 'day' | 'week', 
    session: any
  ): Promise<OptimizedSchedule> => {
    try {
      // This is a placeholder implementation - in a real app, you would call the Supabase REST API
      console.log('Generating optimized schedule for user:', userId);
      // Create a simple schedule using the createManualSchedule function from the component
      const selectedDate = new Date(date);
      // Return mock data that matches the OptimizedSchedule interface
      return {
        date: selectedDate,
        slots: []
      };
    } catch (error) {
      console.error('Error generating optimized schedule:', error);
      throw error;
    }
  }
};

const EnergyScheduler: React.FC = () => {
  const session = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [energyPatterns, setEnergyPatterns] = useState<EnergyPattern[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<OptimizedSchedule | null>(null);
  const [userEnergyLevel, setUserEnergyLevel] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(true);
  const [scheduleType, setScheduleType] = useState<'day' | 'week'>('day');
  
  // Load tasks and energy patterns
  useEffect(() => {
    if (session) {
      loadTasks();
      loadEnergyPatterns();
    }
  }, [session]);
  
  const loadTasks = async () => {
    if (!session) return;
    
    try {
      const fetchedTasks = await productivityToolsApi.getTasks(session?.user?.id || '', session);
      setTasks(fetchedTasks.filter((task: Task) => !task.is_completed));
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  };
  
  const loadEnergyPatterns = async () => {
    if (!session) return;
    
    try {
      const patterns = await enhancedEnergyLevelsApi.getEnergyPatterns(session?.user?.id || '', session);
      setEnergyPatterns(patterns);
    } catch (error) {
      console.error('Error loading energy patterns:', error);
      toast.error('Failed to load energy patterns');
    }
  };
  
  const generateSchedule = async () => {
    setIsLoading(true);
    
    try {
      if (!session) {
        toast.error('You need to be logged in to generate a schedule');
        return;
      }
      
      // If using AI, call the backend API
      if (useAI) {
        const generatedSchedule = await enhancedEnergyLevelsApi.generateOptimizedSchedule(
          session?.user?.id || '',
          selectedDate.toISOString(),
          userEnergyLevel,
          scheduleType,
          session
        );
        
        setSchedule(generatedSchedule);
        toast.success('Schedule generated successfully!');
      } else {
        // Simple algorithm for scheduling based on energy level
        const newSchedule = createManualSchedule();
        setSchedule(newSchedule);
        toast.success('Schedule created based on your current energy level');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error('Failed to generate schedule');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createManualSchedule = (): OptimizedSchedule => {
    // Start at 9 AM
    const startHour = 9;
    const slots: ScheduleSlot[] = [];
    const date = new Date(selectedDate);
    date.setHours(0, 0, 0, 0);
    
    // Create slots for the day
    const highEnergyTasks = tasks.filter(t => t.energy_requirement === ENERGY_LEVELS.HIGH);
    const mediumEnergyTasks = tasks.filter(t => t.energy_requirement === ENERGY_LEVELS.MEDIUM);
    const lowEnergyTasks = tasks.filter(t => t.energy_requirement === ENERGY_LEVELS.LOW);
    
    // Sort tasks by priority
    const sortByPriority = (a: Task, b: Task) => a.priority - b.priority;
    highEnergyTasks.sort(sortByPriority);
    mediumEnergyTasks.sort(sortByPriority);
    lowEnergyTasks.sort(sortByPriority);
    
    // Map energy level to the time of day based on user's current energy level
    let morningEnergy = ENERGY_LEVELS.HIGH;
    let afternoonEnergy = ENERGY_LEVELS.MEDIUM;
    let eveningEnergy = ENERGY_LEVELS.LOW;
    
    // Adjust based on user's current energy level
    if (userEnergyLevel <= 3) {
      morningEnergy = ENERGY_LEVELS.MEDIUM;
      afternoonEnergy = ENERGY_LEVELS.LOW;
      eveningEnergy = ENERGY_LEVELS.LOW;
    } else if (userEnergyLevel <= 6) {
      morningEnergy = ENERGY_LEVELS.HIGH;
      afternoonEnergy = ENERGY_LEVELS.MEDIUM;
      eveningEnergy = ENERGY_LEVELS.LOW;
    }
    
    // Create morning slots (9 AM - 12 PM)
    for (let hour = startHour; hour < 12; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(slotDate);
      endDate.setHours(hour + 1, 0, 0, 0);
      
      // Determine task to assign based on energy level
      let taskId: string | undefined;
      if (morningEnergy === ENERGY_LEVELS.HIGH && highEnergyTasks.length > 0) {
        taskId = highEnergyTasks.shift()?.id;
      } else if (morningEnergy === ENERGY_LEVELS.MEDIUM && mediumEnergyTasks.length > 0) {
        taskId = mediumEnergyTasks.shift()?.id;
      } else if (lowEnergyTasks.length > 0) {
        taskId = lowEnergyTasks.shift()?.id;
      }
      
      slots.push({
        start_time: slotDate,
        end_time: endDate,
        task_id: taskId,
        energy_level: morningEnergy,
        is_break: false
      });
    }
    
    // Add break for lunch
    const lunchStart = new Date(date);
    lunchStart.setHours(12, 0, 0, 0);
    const lunchEnd = new Date(date);
    lunchEnd.setHours(13, 0, 0, 0);
    slots.push({
      start_time: lunchStart,
      end_time: lunchEnd,
      energy_level: ENERGY_LEVELS.LOW,
      is_break: true
    });
    
    // Create afternoon slots (1 PM - 5 PM)
    for (let hour = 13; hour < 17; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(slotDate);
      endDate.setHours(hour + 1, 0, 0, 0);
      
      // Add a short break at 3 PM
      if (hour === 15) {
        slots.push({
          start_time: slotDate,
          end_time: endDate,
          energy_level: ENERGY_LEVELS.LOW,
          is_break: true
        });
        continue;
      }
      
      // Determine task to assign based on energy level
      let taskId: string | undefined;
      if (afternoonEnergy === ENERGY_LEVELS.HIGH && highEnergyTasks.length > 0) {
        taskId = highEnergyTasks.shift()?.id;
      } else if (afternoonEnergy === ENERGY_LEVELS.MEDIUM && mediumEnergyTasks.length > 0) {
        taskId = mediumEnergyTasks.shift()?.id;
      } else if (lowEnergyTasks.length > 0) {
        taskId = lowEnergyTasks.shift()?.id;
      } else if (mediumEnergyTasks.length > 0) {
        taskId = mediumEnergyTasks.shift()?.id;
      } else if (highEnergyTasks.length > 0) {
        taskId = highEnergyTasks.shift()?.id;
      }
      
      slots.push({
        start_time: slotDate,
        end_time: endDate,
        task_id: taskId,
        energy_level: afternoonEnergy,
        is_break: false
      });
    }
    
    // Create evening slots (5 PM - 8 PM)
    for (let hour = 17; hour < 20; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(slotDate);
      endDate.setHours(hour + 1, 0, 0, 0);
      
      // Determine task to assign based on energy level
      let taskId: string | undefined;
      if (eveningEnergy === ENERGY_LEVELS.HIGH && highEnergyTasks.length > 0) {
        taskId = highEnergyTasks.shift()?.id;
      } else if (eveningEnergy === ENERGY_LEVELS.MEDIUM && mediumEnergyTasks.length > 0) {
        taskId = mediumEnergyTasks.shift()?.id;
      } else if (lowEnergyTasks.length > 0) {
        taskId = lowEnergyTasks.shift()?.id;
      } else if (mediumEnergyTasks.length > 0) {
        taskId = mediumEnergyTasks.shift()?.id;
      } else if (highEnergyTasks.length > 0) {
        taskId = highEnergyTasks.shift()?.id;
      }
      
      // Add dinner break at 6 PM
      if (hour === 18) {
        slots.push({
          start_time: slotDate,
          end_time: endDate,
          energy_level: ENERGY_LEVELS.LOW,
          is_break: true
        });
        continue;
      }
      
      slots.push({
        start_time: slotDate,
        end_time: endDate,
        task_id: taskId,
        energy_level: eveningEnergy,
        is_break: false
      });
    }
    
    return {
      date,
      slots
    };
  };
  
  const getTaskById = (id?: string): Task | undefined => {
    if (!id) return undefined;
    return tasks.find(task => task.id === id);
  };
  
  const getEnergyIcon = (level: string) => {
    switch (level) {
      case ENERGY_LEVELS.HIGH:
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case ENERGY_LEVELS.MEDIUM:
        return <BatteryMedium className="h-4 w-4 text-blue-500" />;
      case ENERGY_LEVELS.LOW:
        return <BatteryLow className="h-4 w-4 text-gray-500" />;
      default:
        return <Battery className="h-4 w-4" />;
    }
  };
  
  const getTaskTypeIcon = (type?: string) => {
    switch (type) {
      case TASK_TYPES.CREATIVE:
        return <Brain className="h-4 w-4 text-purple-500" />;
      case TASK_TYPES.ANALYTICAL:
        return <Calculator className="h-4 w-4 text-blue-500" />;
      case TASK_TYPES.ADMINISTRATIVE:
        return <FileText className="h-4 w-4 text-gray-500" />;
      case TASK_TYPES.LEARNING:
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case TASK_TYPES.COMMUNICATION:
        return <MessageSquare className="h-4 w-4 text-pink-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getEnergyLevelText = (level: string): string => {
    switch (level) {
      case ENERGY_LEVELS.HIGH:
        return 'High Energy';
      case ENERGY_LEVELS.MEDIUM:
        return 'Medium Energy';
      case ENERGY_LEVELS.LOW:
        return 'Low Energy';
      default:
        return 'Unknown';
    }
  };
  
  const getEnergyLevelColor = (level: string): string => {
    switch (level) {
      case ENERGY_LEVELS.HIGH:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ENERGY_LEVELS.MEDIUM:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ENERGY_LEVELS.LOW:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Energy-Optimized Scheduler</h1>
          <p className="text-muted-foreground">Plan your day based on energy levels and task requirements</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={scheduleType}
            onValueChange={(value: 'day' | 'week') => setScheduleType(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Schedule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateSchedule} 
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Schedule'}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Parameters
          </CardTitle>
          <CardDescription>
            Configure your schedule settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-picker">Select Date</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="date-picker"
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setSelectedDate(newDate);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="energy-level">Your Current Energy Level</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Low</span>
                    <span className="text-xs text-muted-foreground">High</span>
                  </div>
                  <Slider
                    id="energy-level"
                    value={[userEnergyLevel]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(values) => setUserEnergyLevel(values[0])}
                  />
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="mt-2">
                      Level {userEnergyLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-ai">Use AI-Powered Scheduling</Label>
                  <p className="text-xs text-muted-foreground">
                    AI considers your past performance and energy patterns
                  </p>
                </div>
                <Switch
                  id="use-ai"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label>Available Tasks</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {tasks.length} incomplete tasks available for scheduling
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {tasks.filter(t => t.energy_requirement === ENERGY_LEVELS.HIGH).length} high energy
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {tasks.filter(t => t.energy_requirement === ENERGY_LEVELS.MEDIUM).length} medium energy
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                      {tasks.filter(t => t.energy_requirement === ENERGY_LEVELS.LOW).length} low energy
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Optimized Schedule
            </CardTitle>
            <CardDescription>
              {new Date(schedule.date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.slots.map((slot, index) => {
                const task = getTaskById(slot.task_id);
                
                return (
                  <div 
                    key={index}
                    className={`rounded-lg border p-4 ${slot.is_break ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          {slot.is_break ? (
                            <Coffee className="h-4 w-4 text-primary" />
                          ) : (
                            getEnergyIcon(slot.energy_level)
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {formatTime(new Date(slot.start_time))} - {formatTime(new Date(slot.end_time))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {slot.is_break ? (
                              'Break time'
                            ) : task ? (
                              task.title
                            ) : (
                              'Free time'
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getEnergyLevelColor(slot.energy_level)}>
                          {getEnergyLevelText(slot.energy_level)}
                        </Badge>
                        
                        {task && task.task_type && (
                          <Badge variant="outline">
                            <span className="flex items-center gap-1">
                              {getTaskTypeIcon(task.task_type)}
                              {task.task_type}
                            </span>
                          </Badge>
                        )}
                        
                        {slot.is_break && (
                          <Badge variant="outline" className="bg-gray-100">
                            Break
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {task && task.description && (
                      <div className="mt-2 text-sm text-muted-foreground pl-11">
                        {task.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-sm text-muted-foreground">
              Schedule optimized based on your energy level and task requirements
            </p>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default EnergyScheduler; 