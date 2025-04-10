import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { Activity, Battery, BatteryCharging, Calendar, Check, ChevronDown, ChevronUp, Clock, Download, Edit, Plus, Save, Trash, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { ScrollArea } from '../ui/scroll-area';

interface ScheduledActivity {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  energyRequirement: number; // 1-10
  type: 'focus' | 'rest' | 'social' | 'creative' | 'routine';
  notes?: string;
}

interface DailySchedule {
  date: string; // ISO string
  activities: ScheduledActivity[];
}

const ACTIVITY_TYPES = [
  { value: 'focus', label: 'Focus Work', icon: <Zap className="h-4 w-4 text-blue-500" /> },
  { value: 'rest', label: 'Rest/Recovery', icon: <Battery className="h-4 w-4 text-green-500" /> },
  { value: 'social', label: 'Social/Meetings', icon: <Activity className="h-4 w-4 text-purple-500" /> },
  { value: 'creative', label: 'Creative Work', icon: <BatteryCharging className="h-4 w-4 text-amber-500" /> },
  { value: 'routine', label: 'Routine Tasks', icon: <Clock className="h-4 w-4 text-gray-500" /> },
];

// Generate time options in 30-minute increments
const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function FatigueScheduler() {
  const [date, setDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<DailySchedule | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<ScheduledActivity>>({
    id: crypto.randomUUID(),
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    energyRequirement: 5,
    type: 'focus'
  });
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [energyData, setEnergyData] = useState<{times: string[], levels: number[]}>({
    times: [],
    levels: []
  });

  // Load schedules and energy data on mount
  useEffect(() => {
    // Load schedules from localStorage
    const savedSchedules = localStorage.getItem('fatigueSchedules');
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (error) {
        console.error('Failed to parse saved schedules', error);
      }
    }
    
    // Load energy data from localStorage to provide recommendations
    loadEnergyData();
  }, []);

  // Load energy data for recommendations
  const loadEnergyData = () => {
    const energyEntries = localStorage.getItem('energyEntries');
    if (energyEntries) {
      try {
        const entries = JSON.parse(energyEntries);
        
        // Aggregate energy data by time slot
        const timeMap = new Map<string, number[]>();
        
        entries.forEach((entry: any) => {
          const time = entry.time;
          if (!timeMap.has(time)) {
            timeMap.set(time, []);
          }
          timeMap.get(time)?.push(entry.level);
        });
        
        // Calculate average energy for each time slot
        const times: string[] = [];
        const levels: number[] = [];
        
        Array.from(timeMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([time, energyLevels]) => {
          const avg = energyLevels.reduce((sum, val) => sum + val, 0) / energyLevels.length;
          times.push(time);
          levels.push(avg);
        });
        
        setEnergyData({ times, levels });
      } catch (error) {
        console.error('Failed to parse energy data', error);
      }
    }
  };

  // Save schedules to localStorage
  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem('fatigueSchedules', JSON.stringify(schedules));
    }
  }, [schedules]);

  // Update current schedule when date changes
  useEffect(() => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingSchedule = schedules.find(s => s.date.startsWith(dateStr));
    
    if (existingSchedule) {
      setCurrentSchedule(existingSchedule);
    } else {
      setCurrentSchedule({
        date: new Date(dateStr).toISOString(),
        activities: []
      });
    }
  }, [date, schedules]);

  // Format date for display
  const formatDateDisplay = (date: Date): string => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Handle add/update activity
  const handleSaveActivity = () => {
    if (!currentActivity.title || !currentActivity.startTime || !currentActivity.endTime) {
      // Show error
      return;
    }
    
    const activity: ScheduledActivity = {
      id: currentActivity.id || crypto.randomUUID(),
      title: currentActivity.title || '',
      startTime: currentActivity.startTime || '09:00',
      endTime: currentActivity.endTime || '10:00',
      energyRequirement: currentActivity.energyRequirement || 5,
      type: currentActivity.type as 'focus' | 'rest' | 'social' | 'creative' | 'routine',
      notes: currentActivity.notes
    };
    
    if (!currentSchedule) return;
    
    let updatedSchedule: DailySchedule;
    
    if (editingActivity) {
      // Update existing activity
      updatedSchedule = {
        ...currentSchedule,
        activities: currentSchedule.activities.map(a => 
          a.id === editingActivity ? activity : a
        )
      };
    } else {
      // Add new activity
      updatedSchedule = {
        ...currentSchedule,
        activities: [...currentSchedule.activities, activity]
      };
    }
    
    // Sort activities by start time
    updatedSchedule.activities.sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    // Update schedules
    setSchedules(prev => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existingIndex = prev.findIndex(s => s.date.startsWith(dateStr));
      
      if (existingIndex >= 0) {
        return prev.map((s, i) => i === existingIndex ? updatedSchedule : s);
      } else {
        return [...prev, updatedSchedule];
      }
    });
    
    setCurrentSchedule(updatedSchedule);
    resetForm();
  };

  // Edit an activity
  const handleEditActivity = (id: string) => {
    if (!currentSchedule) return;
    
    const activity = currentSchedule.activities.find(a => a.id === id);
    if (activity) {
      setCurrentActivity(activity);
      setEditingActivity(id);
      setShowForm(true);
    }
  };

  // Delete an activity
  const handleDeleteActivity = (id: string) => {
    if (!currentSchedule) return;
    
    const updatedSchedule = {
      ...currentSchedule,
      activities: currentSchedule.activities.filter(a => a.id !== id)
    };
    
    setSchedules(prev => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existingIndex = prev.findIndex(s => s.date.startsWith(dateStr));
      
      if (existingIndex >= 0) {
        return prev.map((s, i) => i === existingIndex ? updatedSchedule : s);
      } else {
        return prev;
      }
    });
    
    setCurrentSchedule(updatedSchedule);
    
    if (editingActivity === id) {
      resetForm();
    }
  };

  // Reset the form
  const resetForm = () => {
    setCurrentActivity({
      id: crypto.randomUUID(),
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      energyRequirement: 5,
      type: 'focus'
    });
    setEditingActivity(null);
    setShowForm(false);
  };

  // Get recommended activities for a specific energy level
  const getRecommendedActivities = (energyLevel: number): string[] => {
    if (energyLevel >= 7) {
      return ['Focus on complex tasks', 'Creative problem-solving', 'Important meetings', 'Learning new skills'];
    } else if (energyLevel >= 4) {
      return ['Administrative work', 'Team collaboration', 'Routine tasks', 'Regular meetings'];
    } else {
      return ['Low-energy tasks', 'Documentation', 'Email/messaging', 'Planning/organizing'];
    }
  };

  // Get recommended time slots based on activity type and energy requirement
  const getRecommendedTimeSlots = (): string[] => {
    if (!currentActivity.type || !currentActivity.energyRequirement || energyData.times.length === 0) {
      return [];
    }
    
    const requiredEnergy = currentActivity.energyRequirement;
    const type = currentActivity.type;
    
    // Find time slots with suitable energy levels
    const recommendations: string[] = [];
    
    energyData.times.forEach((time, index) => {
      const energyLevel = energyData.levels[index];
      
      // Match energy requirements
      let matches = false;
      
      if (type === 'focus' && energyLevel >= requiredEnergy) {
        matches = true;
      } else if (type === 'creative' && energyLevel >= requiredEnergy - 1) {
        matches = true;
      } else if (type === 'social' && energyLevel >= requiredEnergy - 2) {
        matches = true;
      } else if (type === 'routine' && Math.abs(energyLevel - requiredEnergy) <= 2) {
        matches = true;
      } else if (type === 'rest' && energyLevel <= requiredEnergy) {
        matches = true;
      }
      
      if (matches) {
        recommendations.push(time);
      }
    });
    
    return recommendations;
  };

  // Get activity type info
  const getActivityTypeInfo = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[0];
  };

  // Format time period
  const formatTimePeriod = (start: string, end: string): string => {
    return `${start} - ${end}`;
  };

  // Get energy level color
  const getEnergyLevelColor = (level: number): string => {
    if (level <= 3) return 'text-red-500';
    if (level <= 6) return 'text-amber-500';
    return 'text-green-500';
  };

  // Recommend a daily schedule based on energy patterns
  const recommendSchedule = () => {
    if (!currentSchedule || energyData.times.length === 0) return;
    
    // Sample times from energy data or use defaults
    const morningTimes = energyData.times.filter(t => t >= '07:00' && t <= '12:00');
    const afternoonTimes = energyData.times.filter(t => t > '12:00' && t <= '17:00');
    const eveningTimes = energyData.times.filter(t => t > '17:00' && t <= '22:00');
    
    // Get energy levels for these times
    const morningEnergy = Math.max(...morningTimes.map(t => {
      const index = energyData.times.findIndex(time => time === t);
      return index >= 0 ? energyData.levels[index] : 5;
    }), 5);
    
    const afternoonEnergy = Math.max(...afternoonTimes.map(t => {
      const index = energyData.times.findIndex(time => time === t);
      return index >= 0 ? energyData.levels[index] : 5;
    }), 4);
    
    const eveningEnergy = Math.max(...eveningTimes.map(t => {
      const index = energyData.times.findIndex(time => time === t);
      return index >= 0 ? energyData.levels[index] : 3;
    }), 3);
    
    // Create a recommended schedule
    const activities: ScheduledActivity[] = [
      {
        id: crypto.randomUUID(),
        title: 'Morning Focus Block',
        startTime: '09:00',
        endTime: '11:00',
        energyRequirement: 7,
        type: 'focus',
        notes: 'Schedule your most demanding cognitive tasks here based on your energy pattern'
      },
      {
        id: crypto.randomUUID(),
        title: 'Break & Recovery',
        startTime: '11:00',
        endTime: '11:30',
        energyRequirement: 2,
        type: 'rest',
        notes: 'Take a short break to prevent fatigue buildup'
      },
      {
        id: crypto.randomUUID(),
        title: morningEnergy >= 6 ? 'Creative Work Session' : 'Administrative Tasks',
        startTime: '11:30',
        endTime: '12:30',
        energyRequirement: morningEnergy >= 6 ? 6 : 4,
        type: morningEnergy >= 6 ? 'creative' : 'routine',
        notes: 'Aligned with your typical energy levels for this time period'
      },
      {
        id: crypto.randomUUID(),
        title: 'Lunch Break',
        startTime: '12:30',
        endTime: '13:30',
        energyRequirement: 3,
        type: 'rest',
        notes: 'Take a proper break, away from screens if possible'
      },
      {
        id: crypto.randomUUID(),
        title: afternoonEnergy >= 5 ? 'Collaborative Work' : 'Independent Tasks',
        startTime: '13:30',
        endTime: '15:30',
        energyRequirement: afternoonEnergy,
        type: afternoonEnergy >= 5 ? 'social' : 'routine',
        notes: 'Aligned with your post-lunch energy levels'
      },
      {
        id: crypto.randomUUID(),
        title: 'Afternoon Reset',
        startTime: '15:30',
        endTime: '16:00',
        energyRequirement: 2,
        type: 'rest',
        notes: 'Short break to combat afternoon energy dip'
      },
      {
        id: crypto.randomUUID(),
        title: afternoonEnergy >= 6 ? 'Second Focus Block' : 'Planning & Organization',
        startTime: '16:00',
        endTime: '17:30',
        energyRequirement: afternoonEnergy >= 6 ? 7 : 4,
        type: afternoonEnergy >= 6 ? 'focus' : 'routine',
        notes: 'Tailored to your typical afternoon energy pattern'
      },
      {
        id: crypto.randomUUID(),
        title: eveningEnergy >= 5 ? 'Evening Learning Session' : 'Relaxation & Recovery',
        startTime: '19:00',
        endTime: '20:30',
        energyRequirement: eveningEnergy,
        type: eveningEnergy >= 5 ? 'creative' : 'rest',
        notes: 'Based on your typical evening energy levels'
      }
    ];
    
    const updatedSchedule = {
      ...currentSchedule,
      activities
    };
    
    setSchedules(prev => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existingIndex = prev.findIndex(s => s.date.startsWith(dateStr));
      
      if (existingIndex >= 0) {
        return prev.map((s, i) => i === existingIndex ? updatedSchedule : s);
      } else {
        return [...prev, updatedSchedule];
      }
    });
    
    setCurrentSchedule(updatedSchedule);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Fatigue-Aware Schedule Planner
        </CardTitle>
        <CardDescription>
          Plan your day based on your energy patterns to optimize productivity and prevent fatigue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-between items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateDisplay(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {/* This would ideally be a calendar component */}
                <div className="p-4">
                  {/* Simplified date picker */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => setDate(new Date())}>Today</Button>
                    <Button variant="outline" onClick={() => setDate(new Date(date.setDate(date.getDate() + 1)))}>Tomorrow</Button>
                    <Button variant="outline" onClick={() => setDate(new Date(date.setDate(date.getDate() - 1)))}>Yesterday</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Badge variant="outline" className="text-xs">
              {currentSchedule?.activities.length || 0} activities
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={recommendSchedule}
              disabled={energyData.times.length === 0}
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Recommend Schedule
            </Button>
            
            <Button 
              variant={showForm ? "secondary" : "default"}
              size="sm"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm ? 'Cancel' : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Activity
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Add/Edit Activity Form */}
        {showForm && (
          <Card className="border border-primary/50 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-title">Activity Title</Label>
                <Input
                  id="activity-title"
                  placeholder="E.g., Deep work session, Team meeting, Break"
                  value={currentActivity.title}
                  onChange={(e) => setCurrentActivity({ ...currentActivity, title: e.target.value })}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select
                    value={currentActivity.startTime}
                    onValueChange={(value) => setCurrentActivity({ ...currentActivity, startTime: value })}
                  >
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select
                    value={currentActivity.endTime}
                    onValueChange={(value) => setCurrentActivity({ ...currentActivity, endTime: value })}
                  >
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select
                  value={currentActivity.type}
                  onValueChange={(value) => setCurrentActivity({ ...currentActivity, type: value as any })}
                >
                  <SelectTrigger id="activity-type">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Energy Requirement ({currentActivity.energyRequirement}/10)</Label>
                  <span className={cn(
                    "font-medium",
                    getEnergyLevelColor(currentActivity.energyRequirement || 5)
                  )}>
                    {currentActivity.energyRequirement === 1 && 'Very Low'}
                    {currentActivity.energyRequirement === 2 && 'Low'}
                    {currentActivity.energyRequirement === 3 && 'Low-Medium'}
                    {currentActivity.energyRequirement === 4 && 'Medium-Low'}
                    {currentActivity.energyRequirement === 5 && 'Medium'}
                    {currentActivity.energyRequirement === 6 && 'Medium-High'}
                    {currentActivity.energyRequirement === 7 && 'High'}
                    {currentActivity.energyRequirement === 8 && 'Very High'}
                    {currentActivity.energyRequirement === 9 && 'Extreme'}
                    {currentActivity.energyRequirement === 10 && 'Maximum'}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[currentActivity.energyRequirement || 5]}
                  onValueChange={(value) => setCurrentActivity({ ...currentActivity, energyRequirement: value[0] })}
                />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Low Energy</span>
                  <span>Medium Energy</span>
                  <span>High Energy</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add additional details about this activity"
                  value={currentActivity.notes || ''}
                  onChange={(e) => setCurrentActivity({ ...currentActivity, notes: e.target.value })}
                  rows={2}
                />
              </div>
              
              {/* Recommendations */}
              {getRecommendedTimeSlots().length > 0 && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    Recommended Time Slots
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {getRecommendedTimeSlots().map(time => (
                      <Badge key={time} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setCurrentActivity({ ...currentActivity, startTime: time })}>
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveActivity}>
                  <Save className="mr-1.5 h-4 w-4" />
                  {editingActivity ? 'Update' : 'Add'} Activity
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Schedule Display */}
        {currentSchedule?.activities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities scheduled</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add activities to plan your day according to your energy levels and prevent fatigue buildup
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add First Activity
              </Button>
              <Button variant="outline" onClick={recommendSchedule} disabled={energyData.times.length === 0}>
                <Zap className="mr-1.5 h-4 w-4" />
                Generate Recommendations
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {currentSchedule?.activities.map((activity: ScheduledActivity, index: number) => (
                <Card key={activity.id} className="relative overflow-hidden border-l-4" style={{
                  borderLeftColor: activity.type === 'focus' ? '#3b82f6' : 
                                  activity.type === 'rest' ? '#22c55e' : 
                                  activity.type === 'social' ? '#8b5cf6' : 
                                  activity.type === 'creative' ? '#f59e0b' : '#6b7280'
                }}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4">
                      {/* Time column */}
                      <div className="col-span-3 md:col-span-2">
                        <div className="text-sm font-medium">{formatTimePeriod(activity.startTime, activity.endTime)}</div>
                        <div className="flex items-center mt-1">
                          {getActivityTypeInfo(activity.type).icon}
                          <span className="text-xs text-muted-foreground ml-1">
                            {getActivityTypeInfo(activity.type).label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content column */}
                      <div className="col-span-7 md:col-span-8">
                        <div className="font-medium">{activity.title}</div>
                        {activity.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {activity.notes}
                          </div>
                        )}
                      </div>
                      
                      {/* Energy column */}
                      <div className="col-span-2 md:col-span-2 flex items-start justify-end space-x-2">
                        <div className="text-right">
                          <div className={cn(
                            "text-lg font-bold",
                            getEnergyLevelColor(activity.energyRequirement)
                          )}>
                            {activity.energyRequirement}
                          </div>
                          <div className="text-xs text-muted-foreground">energy</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditActivity(activity.id)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteActivity(activity.id)}>
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {/* Energy Insights */}
        {energyData.times.length > 0 && (
          <Card className="bg-muted/40 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <BatteryCharging className="h-4 w-4 mr-2 text-primary" />
                Energy Pattern Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="bg-transparent">
                  <CardContent className="p-3">
                    <div className="text-xs font-medium text-muted-foreground">Morning Energy</div>
                    <div className="font-medium flex items-center mt-1">
                      {energyData.times.some(t => t >= '07:00' && t <= '12:00') ? (
                        <>
                          <BatteryCharging className="h-4 w-4 text-green-500 mr-1.5" />
                          <span>Peak Productivity</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
                          <span>No data available</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      Best for focused, demanding tasks
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-transparent">
                  <CardContent className="p-3">
                    <div className="text-xs font-medium text-muted-foreground">Afternoon Energy</div>
                    <div className="font-medium flex items-center mt-1">
                      {energyData.times.some(t => t > '12:00' && t <= '17:00') ? (
                        <>
                          <Battery className="h-4 w-4 text-amber-500 mr-1.5" />
                          <span>Moderate Energy</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
                          <span>No data available</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      Good for collaborative work
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-transparent">
                  <CardContent className="p-3">
                    <div className="text-xs font-medium text-muted-foreground">Evening Energy</div>
                    <div className="font-medium flex items-center mt-1">
                      {energyData.times.some(t => t > '17:00' && t <= '22:00') ? (
                        <>
                          <Battery className="h-4 w-4 text-blue-500 mr-1.5" />
                          <span>Wind-down Period</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
                          <span>No data available</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      Best for lighter tasks & planning
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Planning your day around energy levels helps prevent fatigue buildup
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => {
              const blob = new Blob([JSON.stringify(currentSchedule, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `schedule-${format(date, 'yyyy-MM-dd')}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export Schedule
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 