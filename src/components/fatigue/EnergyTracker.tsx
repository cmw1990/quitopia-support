import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from '../ui/calendar';
import { format, set, parse, isToday, subDays, startOfDay } from 'date-fns';
import { Battery, BatteryCharging, Clock, Coffee, ArrowDownCircle, ArrowUpCircle, Save, Activity, Sun, Laptop, Utensils, Moon, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';

interface EnergyEntry {
  id: string;
  date: string; // ISO string
  time: string; // HH:MM
  level: number; // 1-10
  activity?: string;
  notes?: string;
  factors: string[];
}

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", 
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00", "23:30"
];

const ACTIVITIES = [
  { value: "work", label: "Work", icon: <Laptop className="h-4 w-4" /> },
  { value: "meeting", label: "Meeting", icon: <Clock className="h-4 w-4" /> },
  { value: "exercise", label: "Exercise", icon: <Activity className="h-4 w-4" /> },
  { value: "meal", label: "Meal", icon: <Utensils className="h-4 w-4" /> },
  { value: "break", label: "Break", icon: <Coffee className="h-4 w-4" /> },
  { value: "morning", label: "Morning", icon: <Sun className="h-4 w-4" /> },
  { value: "evening", label: "Evening", icon: <Moon className="h-4 w-4" /> }
];

const ENERGY_FACTORS = [
  { id: "sleep", label: "Sleep Quality", icon: <Moon className="h-4 w-4" /> },
  { id: "nutrition", label: "Nutrition", icon: <Utensils className="h-4 w-4" /> },
  { id: "hydration", label: "Hydration", icon: <Coffee className="h-4 w-4" /> },
  { id: "exercise", label: "Exercise", icon: <Activity className="h-4 w-4" /> },
  { id: "stress", label: "Stress Level", icon: <Activity className="h-4 w-4" /> },
  { id: "caffeine", label: "Caffeine", icon: <Coffee className="h-4 w-4" /> },
  { id: "screenTime", label: "Screen Time", icon: <Laptop className="h-4 w-4" /> }
];

export function EnergyTracker() {
  const [date, setDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<EnergyEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<EnergyEntry>>({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    time: format(new Date(), 'HH:mm'),
    level: 5,
    factors: []
  });
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('log');
  const { toast } = useToast();

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('energyEntries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Failed to parse saved entries', error);
      }
    }
  }, []);

  // Save entries to localStorage when they change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('energyEntries', JSON.stringify(entries));
    }
  }, [entries]);

  // Reset current entry when date changes
  useEffect(() => {
    setCurrentEntry({
      id: crypto.randomUUID(),
      date: date.toISOString(),
      time: format(new Date(), 'HH:mm'),
      level: 5,
      factors: []
    });
    setEditingEntry(null);
  }, [date]);

  // Helper function to format date for display
  const formatDate = (date: Date): string => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };
  
  // Get entries for the selected date
  const getDayEntries = (): EnergyEntry[] => {
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    return entries
      .filter(entry => entry.date.startsWith(selectedDateStr))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Load entry data for editing
  const editEntry = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setCurrentEntry({ ...entry });
      setEditingEntry(entryId);
    }
  };

  // Delete an entry
  const deleteEntry = (entryId: string) => {
    setEntries(entries.filter(e => e.id !== entryId));
    if (editingEntry === entryId) {
      setEditingEntry(null);
      setCurrentEntry({
        id: crypto.randomUUID(),
        date: date.toISOString(),
        time: format(new Date(), 'HH:mm'),
        level: 5,
        factors: []
      });
    }
    toast({
      title: "Entry deleted",
      description: "Your energy level entry has been removed"
    });
  };

  // Toggle a factor in the current entry
  const toggleFactor = (factorId: string) => {
    const factors = currentEntry.factors || [];
    if (factors.includes(factorId)) {
      setCurrentEntry({
        ...currentEntry,
        factors: factors.filter(f => f !== factorId)
      });
    } else {
      setCurrentEntry({
        ...currentEntry,
        factors: [...factors, factorId]
      });
    }
  };

  // Save current entry
  const saveEntry = () => {
    if (!currentEntry.level) {
      toast({
        title: "Energy level required",
        description: "Please indicate your energy level",
        variant: "destructive"
      });
      return;
    }

    const newEntry: EnergyEntry = {
      id: currentEntry.id || crypto.randomUUID(),
      date: currentEntry.date || new Date().toISOString(),
      time: currentEntry.time || format(new Date(), 'HH:mm'),
      level: currentEntry.level,
      activity: currentEntry.activity,
      notes: currentEntry.notes,
      factors: currentEntry.factors || []
    };

    if (editingEntry) {
      // Update existing entry
      setEntries(entries.map(e => e.id === editingEntry ? newEntry : e));
      setEditingEntry(null);
      toast({
        title: "Entry updated",
        description: "Your energy level entry has been updated"
      });
    } else {
      // Add new entry
      setEntries([...entries, newEntry]);
      toast({
        title: "Entry saved",
        description: "Your energy level has been recorded"
      });
    }

    // Reset form
    setCurrentEntry({
      id: crypto.randomUUID(),
      date: date.toISOString(),
      time: format(new Date(), 'HH:mm'),
      level: 5,
      factors: []
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingEntry(null);
    setCurrentEntry({
      id: crypto.randomUUID(),
      date: date.toISOString(),
      time: format(new Date(), 'HH:mm'),
      level: 5,
      factors: []
    });
  };

  // Prepare data for the chart
  const getChartData = () => {
    const dayEntries = getDayEntries();
    
    if (dayEntries.length === 0) return [];
    
    return dayEntries.map(entry => ({
      time: entry.time,
      energy: entry.level,
      activity: entry.activity || 'unspecified'
    }));
  };

  // Get the color for energy level
  const getEnergyColor = (level: number): string => {
    if (level <= 3) return 'text-red-500';
    if (level <= 6) return 'text-amber-500';
    return 'text-green-500';
  };

  // Get the icon for energy level
  const getEnergyIcon = (level: number) => {
    if (level <= 3) return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
    if (level <= 6) return <Battery className="h-5 w-5 text-amber-500" />;
    return <BatteryCharging className="h-5 w-5 text-green-500" />;
  };

  // Get activity label and icon
  const getActivityInfo = (activityValue: string | undefined) => {
    if (!activityValue) return { label: 'Unspecified', icon: <Clock className="h-4 w-4" /> };
    const activity = ACTIVITIES.find(a => a.value === activityValue);
    return activity || { label: 'Unspecified', icon: <Clock className="h-4 w-4" /> };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Energy Level Tracker
        </CardTitle>
        <CardDescription>
          Track your energy levels throughout the day to identify patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 flex flex-col border rounded-md p-4">
            <div className="text-sm font-medium mb-2">Select Date</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1 flex flex-col border rounded-md p-4">
            <div className="text-sm font-medium mb-2">Today's Average</div>
            <div className="flex items-center space-x-2">
              {getDayEntries().length > 0 ? (
                <>
                  {getEnergyIcon(
                    Math.round(
                      getDayEntries().reduce((sum, entry) => sum + entry.level, 0) / 
                      getDayEntries().length
                    )
                  )}
                  <span className="text-2xl font-bold">
                    {(
                      getDayEntries().reduce((sum, entry) => sum + entry.level, 0) / 
                      getDayEntries().length
                    ).toFixed(1)}
                    <span className="text-sm text-muted-foreground ml-1">/ 10</span>
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">No entries today</span>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Log Energy</TabsTrigger>
            <TabsTrigger value="chart">Energy Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log" className="space-y-6 mt-4">
            <div className="space-y-6">
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Energy Level ({currentEntry.level}/10)</Label>
                    <div className="flex items-center space-x-2">
                      {getEnergyIcon(currentEntry.level || 5)}
                      <span className="font-medium">{currentEntry.level}</span>
                    </div>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[currentEntry.level || 5]}
                    onValueChange={(value) => setCurrentEntry({ ...currentEntry, level: value[0] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select
                  value={currentEntry.time}
                  onValueChange={(value) => setCurrentEntry({ ...currentEntry, time: value })}
                >
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Current Activity</Label>
                <Select
                  value={currentEntry.activity}
                  onValueChange={(value) => setCurrentEntry({ ...currentEntry, activity: value })}
                >
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="What are you doing?" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITIES.map((activity) => (
                      <SelectItem key={activity.value} value={activity.value}>
                        <div className="flex items-center">
                          {activity.icon}
                          <span className="ml-2">{activity.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Influencing Factors</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ENERGY_FACTORS.map((factor) => (
                    <Badge
                      key={factor.id}
                      variant={currentEntry.factors?.includes(factor.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFactor(factor.id)}
                    >
                      {factor.icon}
                      <span className="ml-1">{factor.label}</span>
                      {currentEntry.factors?.includes(factor.id) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details about your energy level..."
                  value={currentEntry.notes || ''}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={saveEntry}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
                {editingEntry && (
                  <Button 
                    variant="outline" 
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {getDayEntries().length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium">Today's Entries</h3>
                <div className="space-y-2">
                  {getDayEntries().map((entry) => (
                    <Card key={entry.id} className="flex items-center p-3">
                      <div className="flex-1 flex items-center">
                        <div className="mr-3">
                          {getEnergyIcon(entry.level)}
                        </div>
                        <div>
                          <div className="font-medium">{entry.time}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            {getActivityInfo(entry.activity).icon}
                            <span className="ml-1">{getActivityInfo(entry.activity).label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mr-4">
                        <span className={`text-xl font-bold ${getEnergyColor(entry.level)}`}>
                          {entry.level}
                        </span>
                      </div>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editEntry(entry.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            {getChartData().length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getChartData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}/10`, 
                        name === 'energy' ? 'Energy Level' : name
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Energy Level" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No energy data</h3>
                <p>Log your energy levels to see your daily patterns.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Tracking your energy patterns can help you identify when you're most productive and when you should take breaks.
        </p>
      </CardFooter>
    </Card>
  );
} 