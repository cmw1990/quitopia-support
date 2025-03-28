import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  CravingLog,
  CravingAnalytics,
  getCravingLogs,
  addCravingLog,
  updateCravingLog,
  deleteCravingLog,
  getCravingAnalytics
} from '../../../api/cravingService';
import { useNavigate } from 'react-router-dom';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Textarea } from '../../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Checkbox } from '../../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { ScrollArea } from '../../ui/scroll-area';
import { toast } from 'sonner';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';

// Chart components
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

// Icons
import {
  Cigarette,
  Calendar as CalendarIcon,
  AlarmClock,
  MapPin,
  Timer,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
  Shield,
  Activity,
  TrendingDown,
  BarChart as BarChartIcon,
  Target,
  RefreshCw,
  Filter,
  FileText,
  Clock,
  PieChart as PieChartIcon,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ThumbsUp,
  Zap,
  Brain,
  LineChart as LineChartIcon,
  Calendar as CalIcon,
  Loader2
} from 'lucide-react';

import { TriggerPrediction } from '../TriggerIntervention/TriggerPrediction';

interface CravingTrackerProps {
  session: Session | null;
  quitDate?: string;
  className?: string;
}

// Common triggers for cravings
const TRIGGER_OPTIONS = [
  'stress',
  'social situation',
  'boredom',
  'after meal',
  'alcohol',
  'coffee',
  'driving',
  'work break',
  'morning routine',
  'emotional distress',
  'seeing others smoke',
  'smell of smoke',
  'argument',
  'celebration',
  'habit',
  'other'
];

// Common locations
const LOCATION_OPTIONS = [
  'home',
  'work',
  'car',
  'bar/restaurant',
  'friend\'s place',
  'outdoors',
  'public space',
  'other'
];

export const CravingTracker: React.FC<CravingTrackerProps> = ({
  session,
  quitDate,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('log');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Log form state
  const [intensity, setIntensity] = useState<number>(5);
  const [trigger, setTrigger] = useState<string>('');
  const [customTrigger, setCustomTrigger] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [resisted, setResisted] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), 'HH:mm')
  );
  const [moodBefore, setMoodBefore] = useState<number>(5);
  
  // Date filter state for history
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  });

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<CravingLog | null>(null);

  // History filter state
  const [filterTrigger, setFilterTrigger] = useState<string>('');
  const [filterResisted, setFilterResisted] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Time range for analytics
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<string>('30d');

  // Fetch craving logs
  const { data: cravingLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['craving-logs', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      return getCravingLogs(
        session.user.id,
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString(),
        session
      );
    },
    enabled: !!session?.user?.id
  });

  // Fetch analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['craving-analytics', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      return getCravingAnalytics(
        session.user.id,
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString(),
        session
      );
    },
    enabled: !!session?.user?.id
  });

  // Add craving log mutation
  const addCravingMutation = useMutation({
    mutationFn: async (newCraving: Omit<CravingLog, 'id' | 'created_at'>) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      return addCravingLog(newCraving, session);
    },
    onSuccess: () => {
      toast.success('Craving log added successfully');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['craving-logs'] });
      queryClient.invalidateQueries({ queryKey: ['craving-analytics'] });
    },
    onError: (error) => {
      toast.error('Failed to add craving log');
      console.error('Error adding craving log:', error);
    }
  });

  // Update craving log mutation
  const updateCravingMutation = useMutation({
    mutationFn: async ({ id, cravingData }: { id: string; cravingData: Partial<CravingLog> }) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      return updateCravingLog(id, cravingData, session);
    },
    onSuccess: () => {
      toast.success('Craving log updated successfully');
      setEditingLog(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['craving-logs'] });
      queryClient.invalidateQueries({ queryKey: ['craving-analytics'] });
    },
    onError: (error) => {
      toast.error('Failed to update craving log');
      console.error('Error updating craving log:', error);
    }
  });

  // Delete craving log mutation
  const deleteCravingMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      return deleteCravingLog(id, session);
    },
    onSuccess: () => {
      toast.success('Craving log deleted');
      queryClient.invalidateQueries({ queryKey: ['craving-logs'] });
      queryClient.invalidateQueries({ queryKey: ['craving-analytics'] });
    },
    onError: (error) => {
      toast.error('Failed to delete craving log');
      console.error('Error deleting craving log:', error);
    }
  });

  // Reset form fields
  const resetForm = () => {
    setIntensity(5);
    setTrigger('');
    setCustomTrigger('');
    setLocation('');
    setCustomLocation('');
    setDurationMinutes(5);
    setResisted(true);
    setNotes('');
    setSelectedDate(new Date());
    setSelectedTime(format(new Date(), 'HH:mm'));
    setMoodBefore(5);
    setIsSubmitting(false);
  };

  // Set form for editing
  const handleEditLog = (log: CravingLog) => {
    setEditingLog(log);
    setIntensity(log.intensity);
    setTrigger(log.trigger);
    if (!TRIGGER_OPTIONS.includes(log.trigger)) {
      setCustomTrigger(log.trigger);
      setTrigger('other');
    }
    
    setLocation(log.location || '');
    if (log.location && !LOCATION_OPTIONS.includes(log.location)) {
      setCustomLocation(log.location);
      setLocation('other');
    }
    
    setDurationMinutes(log.duration_minutes || 5);
    setResisted(log.resisted);
    setNotes(log.notes || '');
    
    const logDate = new Date(log.timestamp);
    setSelectedDate(logDate);
    setSelectedTime(format(logDate, 'HH:mm'));
    setMoodBefore(log.mood_before || 5);
    
    setActiveTab('log');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('Please sign in to track cravings');
      return;
    }
    
    setIsSubmitting(true);
    
    // Create timestamp from date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const timestamp = new Date(selectedDate);
    timestamp.setHours(hours, minutes, 0, 0);
    
    // Determine final trigger and location values
    const finalTrigger = trigger === 'other' ? customTrigger : trigger;
    const finalLocation = location === 'other' ? customLocation : location;
    
    if (!finalTrigger) {
      toast.error('Please select a trigger');
      setIsSubmitting(false);
      return;
    }
    
    const cravingData = {
      user_id: session.user.id,
      timestamp: timestamp.toISOString(),
      intensity,
      trigger: finalTrigger,
      duration_minutes: durationMinutes,
      location: finalLocation,
      resisted,
      notes: notes || null,
      mood_before: moodBefore
    };
    
    if (editingLog?.id) {
      // Update existing log
      updateCravingMutation.mutate({
        id: editingLog.id,
        cravingData
      });
    } else {
      // Add new log
      addCravingMutation.mutate(cravingData);
    }
  };

  // Handle log deletion
  const handleDeleteLog = (id: string) => {
    if (confirm('Are you sure you want to delete this craving log?')) {
      deleteCravingMutation.mutate(id);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingLog(null);
    resetForm();
  };

  // Filter and sort craving logs
  const filteredLogs = React.useMemo(() => {
    if (!cravingLogs) return [];

    let filtered = [...cravingLogs];

    // Apply date filter - this is already applied in the API call
    
    // Apply trigger filter
    if (filterTrigger) {
      filtered = filtered.filter(log => log.trigger === filterTrigger);
    }
    
    // Apply resistance filter
    if (filterResisted !== 'all') {
      const wasResisted = filterResisted === 'resisted';
      filtered = filtered.filter(log => log.resisted === wasResisted);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'intensity-asc':
        filtered.sort((a, b) => a.intensity - b.intensity);
        break;
      case 'intensity-desc':
        filtered.sort((a, b) => b.intensity - a.intensity);
        break;
      default:
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    return filtered;
  }, [cravingLogs, filterTrigger, filterResisted, sortBy]);

  // Get unique triggers from logs for filter options
  const uniqueTriggers = React.useMemo(() => {
    if (!cravingLogs) return [];
    
    const triggers = new Set<string>();
    cravingLogs.forEach(log => triggers.add(log.trigger));
    return Array.from(triggers).sort();
  }, [cravingLogs]);

  // Format duration for display
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Craving Tracker</h1>
          <p className="text-muted-foreground">
            Log and analyze your smoking cravings to identify patterns and triggers
          </p>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Log Craving</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {editingLog ? 'Edit Craving Log' : 'Log a New Craving'}
              </CardTitle>
              <CardDescription>
                Record details about your cravings to help identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* When and intensity section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">When did you experience this craving?</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Date picker */}
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Time input */}
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <div className="flex items-center">
                        <Input
                          id="time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full"
                        />
                        <AlarmClock className="ml-2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Intensity slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="intensity">Craving Intensity</Label>
                      <span className="text-sm font-medium">{intensity}/10</span>
                    </div>
                    <Slider
                      id="intensity"
                      min={1}
                      max={10}
                      step={1}
                      value={[intensity]}
                      onValueChange={(value) => setIntensity(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>
                
                {/* Trigger section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">What triggered this craving?</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trigger">Trigger</Label>
                    <Select
                      value={trigger}
                      onValueChange={setTrigger}
                    >
                      <SelectTrigger id="trigger">
                        <SelectValue placeholder="Select a trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Show custom trigger input if "other" is selected */}
                  {trigger === 'other' && (
                    <div className="space-y-2">
                      <Label htmlFor="customTrigger">Specify trigger</Label>
                      <Input
                        id="customTrigger"
                        value={customTrigger}
                        onChange={(e) => setCustomTrigger(e.target.value)}
                        placeholder="Describe the trigger"
                      />
                    </div>
                  )}
                </div>
                
                {/* Location and duration */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Location selection */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={location}
                      onValueChange={setLocation}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Where were you?" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Show custom location input if "other" is selected */}
                    {location === 'other' && (
                      <Input
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="Specify location"
                        className="mt-2"
                      />
                    )}
                  </div>
                  
                  {/* Duration input */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      max={60}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                
                {/* Resisted checkbox and mood before */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Resisted checkbox */}
                  <div className="space-y-2">
                    <Label className="text-base">Did you resist this craving?</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="resisted"
                        checked={resisted}
                        onCheckedChange={(checked) => 
                          setResisted(checked === true)
                        }
                      />
                      <label
                        htmlFor="resisted"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Yes, I resisted the urge to smoke
                      </label>
                    </div>
                  </div>
                  
                  {/* Mood before */}
                  <div className="space-y-2">
                    <Label htmlFor="moodBefore">Mood before craving (1-10)</Label>
                    <Input
                      id="moodBefore"
                      type="number"
                      min={1}
                      max={10}
                      value={moodBefore}
                      onChange={(e) => setMoodBefore(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                
                {/* Notes textarea */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional details about this craving..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                {/* Form actions */}
                <div className="flex justify-end space-x-2">
                  {editingLog && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {editingLog ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        {editingLog ? 'Update Log' : 'Save Log'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-lg font-medium">Craving History</CardTitle>
                  <CardDescription>
                    Review and manage your past craving logs
                  </CardDescription>
                </div>
                
                {/* Date range selection */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="ml-auto h-8">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.startDate, 'MMM d')} - {format(dateRange.endDate, 'MMM d')}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-3 space-y-3">
                      <h4 className="font-medium text-sm">Date Range</h4>
                      <div className="grid gap-2">
                        <div className="grid gap-1">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="startDate"
                                variant="outline"
                                className="justify-start text-left font-normal"
                              >
                                {format(dateRange.startDate, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={dateRange.startDate}
                                onSelect={(date) => date && setDateRange({
                                  ...dateRange,
                                  startDate: date
                                })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="endDate">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="endDate"
                                variant="outline"
                                className="justify-start text-left font-normal"
                              >
                                {format(dateRange.endDate, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={dateRange.endDate}
                                onSelect={(date) => date && setDateRange({
                                  ...dateRange,
                                  endDate: date
                                })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            queryClient.invalidateQueries({ 
                              queryKey: ['craving-logs'] 
                            });
                            queryClient.invalidateQueries({ 
                              queryKey: ['craving-analytics'] 
                            });
                            setIsCalendarOpen(false);
                          }}
                        >
                          Apply Range
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Trigger filter */}
                <div className="flex-1">
                  <Select
                    value={filterTrigger}
                    onValueChange={setFilterTrigger}
                  >
                    <SelectTrigger id="filterTrigger" className="h-8">
                      <SelectValue placeholder="Filter by trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Triggers</SelectItem>
                      {uniqueTriggers.map((trigger) => (
                        <SelectItem key={trigger} value={trigger}>
                          {trigger.charAt(0).toUpperCase() + trigger.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Resistance filter */}
                <div className="flex-1">
                  <Select
                    value={filterResisted}
                    onValueChange={setFilterResisted}
                  >
                    <SelectTrigger id="filterResisted" className="h-8">
                      <SelectValue placeholder="Resistance status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="resisted">Resisted Only</SelectItem>
                      <SelectItem value="not-resisted">Gave In Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Sort options */}
                <div className="flex-1">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger id="sortBy" className="h-8">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="intensity-desc">Highest Intensity</SelectItem>
                      <SelectItem value="intensity-asc">Lowest Intensity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Craving logs list */}
              {isLoadingLogs ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Cigarette className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No craving logs found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {cravingLogs?.length ? 'Try adjusting your filters' : 'Start tracking your cravings to see them here'}
                  </p>
                  <Button 
                    onClick={() => setActiveTab('log')} 
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Log a Craving
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {filteredLogs.map((log) => (
                      <Card key={log.id} className="overflow-hidden">
                        <div className={`py-1 text-center text-white text-xs font-medium
                          ${log.resisted 
                            ? 'bg-green-500 dark:bg-green-700' 
                            : 'bg-red-500 dark:bg-red-700'}`}
                        >
                          {log.resisted ? 'Resisted' : 'Gave In'}
                        </div>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(log.timestamp), 'EEEE, MMMM d, yyyy')}
                              </div>
                              <h4 className="text-base font-semibold mt-1">
                                {format(new Date(log.timestamp), 'h:mm a')} - Intensity: {log.intensity}/10
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditLog(log)}
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-xs"
                              >
                                Delete
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => navigate(`/interventions/${log.trigger.toLowerCase().replace(' ', '-')}`)}
                                className="text-xs ml-auto"
                              >
                                Intervene
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Trigger</div>
                              <div className="text-sm font-medium capitalize">{log.trigger}</div>
                            </div>
                            {log.location && (
                              <div>
                                <div className="text-xs text-muted-foreground">Location</div>
                                <div className="text-sm font-medium capitalize">{log.location}</div>
                              </div>
                            )}
                            {log.duration_minutes && (
                              <div>
                                <div className="text-xs text-muted-foreground">Duration</div>
                                <div className="text-sm font-medium">{formatDuration(log.duration_minutes)}</div>
                              </div>
                            )}
                            {log.mood_before && (
                              <div>
                                <div className="text-xs text-muted-foreground">Mood Before</div>
                                <div className="text-sm font-medium">{log.mood_before}/10</div>
                              </div>
                            )}
                          </div>
                          {log.notes && (
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground">Notes</div>
                              <p className="text-sm mt-1">{log.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Craving Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Insights and patterns to help you understand and manage your cravings
              </p>
            </div>
            
            {/* Time range selector */}
            <div>
              <RadioGroup
                value={analyticsTimeRange}
                onValueChange={(value) => {
                  setAnalyticsTimeRange(value);
                  const today = new Date();
                  let startDate = subDays(today, 30);
                  
                  if (value === '7d') {
                    startDate = subDays(today, 7);
                  } else if (value === '90d') {
                    startDate = subDays(today, 90);
                  }
                  
                  setDateRange({
                    startDate,
                    endDate: today
                  });
                  
                  queryClient.invalidateQueries({ 
                    queryKey: ['craving-analytics'] 
                  });
                }}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="7d" id="r1" />
                  <Label htmlFor="r1">Week</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="30d" id="r2" />
                  <Label htmlFor="r2">Month</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="90d" id="r3" />
                  <Label htmlFor="r3">90 Days</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {isLoadingAnalytics ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !analytics || !analytics.totalCravings ? (
            <div className="text-center py-12">
              <Cigarette className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No craving data found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {analytics ? 'Try adjusting your time range' : 'Start tracking your cravings to see analytics'}
              </p>
              <Button 
                onClick={() => setActiveTab('log')} 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Log a Craving
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                        <Cigarette className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold">{analytics.totalCravings}</h3>
                      <p className="text-sm text-muted-foreground">Total Cravings</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                        <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {analytics.resistanceRate.toFixed(0)}%
                      </h3>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
                        <Activity className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {analytics.averageIntensity.toFixed(1)}/10
                      </h3>
                      <p className="text-sm text-muted-foreground">Avg. Intensity</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {analytics.commonTriggers[0]?.trigger || "N/A"}
                      </h3>
                      <p className="text-sm text-muted-foreground">Top Trigger</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Intensity Trend Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Craving Intensity Over Time</CardTitle>
                  <CardDescription>
                    Track how your craving intensity changes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics.intensityTrend}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return format(date, 'MMM d');
                          }}
                        />
                        <YAxis 
                          domain={[0, 10]} 
                          tick={{ fontSize: 12 }}
                          label={{ 
                            value: 'Intensity', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)} / 10`, 'Intensity']}
                          labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Triggers Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Common Triggers */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Common Triggers</CardTitle>
                    <CardDescription>
                      Most frequent causes of your cravings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.commonTriggers.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="trigger" 
                            type="category" 
                            tick={{ fontSize: 12 }}
                            width={100}
                          />
                          <Tooltip />
                          <Bar 
                            dataKey="count" 
                            fill="#8884d8" 
                            background={{ fill: '#eee' }}
                            label={{ position: 'right', fontSize: 12 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Time of Day Analysis */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Time of Day Analysis</CardTitle>
                    <CardDescription>
                      When you experience cravings most frequently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.triggersByTimeOfDay.map(group => ({
                              name: group.timeOfDay,
                              value: group.triggers.reduce((sum, t) => sum + t.count, 0)
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {analytics.triggersByTimeOfDay.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                index === 0 ? '#fde68a' : // morning: yellow
                                index === 1 ? '#a3e635' : // afternoon: lime
                                index === 2 ? '#7dd3fc' : // evening: sky
                                '#c4b5fd'                 // night: violet
                              } />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} cravings`]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Predictions & Recommendations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Craving Predictions & Recommendations</CardTitle>
                  <CardDescription>
                    Be prepared with personalized strategies to manage cravings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.predictions.map((prediction, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <h4 className="font-medium capitalize">{prediction.timeOfDay}</h4>
                          </div>
                          <Badge 
                            variant={
                              prediction.riskLevel > 0.7 ? "destructive" :
                              prediction.riskLevel > 0.4 ? "warning" : "outline"
                            }
                          >
                            {prediction.riskLevel > 0.7 ? "High Risk" :
                             prediction.riskLevel > 0.4 ? "Medium Risk" : "Low Risk"}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Primary Trigger</p>
                            <p className="font-medium capitalize">{prediction.primaryTrigger}</p>
                          </div>
                          
                          {prediction.secondaryTrigger && (
                            <div>
                              <p className="text-sm text-muted-foreground">Secondary Trigger</p>
                              <p className="font-medium capitalize">{prediction.secondaryTrigger}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-start gap-2 bg-primary/5 p-3 rounded-md">
                          <Zap className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Recommended Action</p>
                            <p className="text-sm">{prediction.recommendedAction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {analytics.predictions.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          Not enough data to generate predictions yet. 
                          Continue logging your cravings to receive personalized recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 