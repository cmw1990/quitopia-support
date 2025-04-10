import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AreaChart, 
  Battery, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  LineChart, 
  MoreHorizontal, 
  RefreshCcw, 
  Search, 
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface EnergyRecord {
  id: string;
  date: string;
  time: string;
  level: number;
  activity: string;
  factors: string[];
  notes: string;
}

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom';
type ChartType = 'line' | 'area' | 'bar';
type DateRange = {
  start: Date;
  end: Date;
};

export function EnergyHistory() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EnergyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [showFactors, setShowFactors] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  const [energyThreshold, setEnergyThreshold] = useState([0, 10]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEnergyData();
  }, [user, session]);

  useEffect(() => {
    if (energyRecords.length > 0) {
      filterRecords();
    }
  }, [timeRange, searchQuery, dateRange, selectedActivities, energyThreshold, energyRecords]);

  const fetchEnergyData = async () => {
    if (!user?.id || !session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data: records, error: recordsError } = await supabaseRequest<any[]>( // Use a more specific type if available
        `/rest/v1/energy_levels8?user_id=eq.${user.id}&order=recorded_at.desc&limit=100`,
        { method: 'GET' }
        // Removed session argument
      );
      if (recordsError) throw recordsError; // Propagate error

      if (records && records.length > 0) {
        const formattedRecords = records.map((record: any) => ({
          id: record.id,
          date: new Date(record.recorded_at).toISOString().split('T')[0],
          time: new Date(record.recorded_at).toTimeString().split(' ')[0].substring(0, 5),
          level: record.energy_level,
          activity: record.activity || 'Not specified',
          factors: record.factors || [],
          notes: record.notes || ''
        }));

        setEnergyRecords(formattedRecords);
        
        // Extract unique activities
        const activities = [...new Set(formattedRecords.map(r => r.activity))].filter(a => a !== 'Not specified');
        setAvailableActivities(activities);
        
      } else {
        // Use sample data for demo purposes if no data exists
        const sampleData = generateSampleData();
        setEnergyRecords(sampleData);
        
        const activities = [...new Set(sampleData.map(r => r.activity))].filter(a => a !== 'Not specified');
        setAvailableActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching energy history data:', error);
      toast({
        title: 'Failed to load energy history',
        description: 'There was a problem loading your energy data. Please try again.',
        variant: 'destructive'
      });
      
      // Load sample data
      const sampleData = generateSampleData();
      setEnergyRecords(sampleData);
      
      const activities = [...new Set(sampleData.map(r => r.activity))].filter(a => a !== 'Not specified');
      setAvailableActivities(activities);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...energyRecords];
    
    // Filter by date range
    if (timeRange === 'day') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getTime() >= today.getTime() && 
               recordDate.getTime() < today.getTime() + 24 * 60 * 60 * 1000;
      });
    } else if (timeRange === 'week') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      filtered = filtered.filter(record => new Date(record.date) >= weekStart);
    } else if (timeRange === 'month') {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - 1);
      filtered = filtered.filter(record => new Date(record.date) >= monthStart);
    } else if (timeRange === 'year') {
      const yearStart = new Date();
      yearStart.setFullYear(yearStart.getFullYear() - 1);
      filtered = filtered.filter(record => new Date(record.date) >= yearStart);
    } else if (timeRange === 'custom') {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= dateRange.start && recordDate <= dateRange.end;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.activity.toLowerCase().includes(query) || 
        record.notes.toLowerCase().includes(query) ||
        (record.factors && record.factors.some(factor => factor.toLowerCase().includes(query)))
      );
    }
    
    // Filter by selected activities
    if (selectedActivities.length > 0) {
      filtered = filtered.filter(record => selectedActivities.includes(record.activity));
    }
    
    // Filter by energy level range
    filtered = filtered.filter(record => 
      record.level >= energyThreshold[0] && record.level <= energyThreshold[1]
    );
    
    setFilteredRecords(filtered);
  };

  const generateSampleData = (): EnergyRecord[] => {
    const activities = ['Work', 'Exercise', 'Meeting', 'Study', 'Relaxation', 'Social', 'Creative Work'];
    const factors = ['Sleep', 'Nutrition', 'Stress', 'Exercise', 'Caffeine', 'Screen time', 'Hydration'];
    
    const records: EnergyRecord[] = [];
    const now = new Date();
    
    // Generate 50 sample records for the past 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);
      
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      // Generate 1-3 random factors
      const factorCount = Math.floor(Math.random() * 3) + 1;
      const randomFactors: string[] = [];
      for (let j = 0; j < factorCount; j++) {
        const factor = factors[Math.floor(Math.random() * factors.length)];
        if (!randomFactors.includes(factor)) {
          randomFactors.push(factor);
        }
      }
      
      // Generate random energy level that makes sense for the activity
      let level = 0;
      if (randomActivity === 'Exercise') {
        level = Math.floor(Math.random() * 3) + 7; // 7-9
      } else if (randomActivity === 'Meeting') {
        level = Math.floor(Math.random() * 4) + 4; // 4-7
      } else if (randomActivity === 'Relaxation') {
        level = Math.floor(Math.random() * 3) + 6; // 6-8
      } else {
        level = Math.floor(Math.random() * 10) + 1; // 1-10
      }
      
      records.push({
        id: `sample-${i}`,
        date: dateStr,
        time: timeStr,
        level,
        activity: randomActivity,
        factors: randomFactors,
        notes: `Sample ${randomActivity.toLowerCase()} activity with energy level ${level}/10.`
      });
    }
    
    // Sort by date/time descending
    records.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    return records;
  };

  const getEnergyLevelColor = (level: number) => {
    if (level <= 3) return "text-red-500";
    if (level <= 6) return "text-amber-500";
    return "text-green-500";
  };

  const getEnergyLevelBg = (level: number) => {
    if (level <= 3) return "bg-red-100 dark:bg-red-900/20";
    if (level <= 6) return "bg-amber-100 dark:bg-amber-900/20";
    return "bg-green-100 dark:bg-green-900/20";
  };

  const getAverageEnergyLevel = () => {
    if (filteredRecords.length === 0) return 0;
    const sum = filteredRecords.reduce((acc, record) => acc + record.level, 0);
    return Math.round((sum / filteredRecords.length) * 10) / 10;
  };

  const getEnergyByDayOfWeek = () => {
    const dayAverages: { [key: string]: { sum: number, count: number } } = {
      'Sunday': { sum: 0, count: 0 },
      'Monday': { sum: 0, count: 0 },
      'Tuesday': { sum: 0, count: 0 },
      'Wednesday': { sum: 0, count: 0 },
      'Thursday': { sum: 0, count: 0 },
      'Friday': { sum: 0, count: 0 },
      'Saturday': { sum: 0, count: 0 }
    };
    
    filteredRecords.forEach(record => {
      const date = new Date(record.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayAverages[day].sum += record.level;
      dayAverages[day].count += 1;
    });
    
    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    
    return days.map(day => ({
      day,
      average: dayAverages[day].count > 0 
        ? Math.round((dayAverages[day].sum / dayAverages[day].count) * 10) / 10 
        : 0
    }));
  };

  const getEnergyByTimeOfDay = () => {
    const hourAverages: { [key: string]: { sum: number, count: number } } = {};
    
    // Initialize hours
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00';
      hourAverages[hour] = { sum: 0, count: 0 };
    }
    
    filteredRecords.forEach(record => {
      const hour = record.time.substring(0, 2) + ':00';
      hourAverages[hour].sum += record.level;
      hourAverages[hour].count += 1;
    });
    
    return Object.entries(hourAverages).map(([hour, data]) => ({
      hour,
      average: data.count > 0 ? Math.round((data.sum / data.count) * 10) / 10 : null
    })).filter(item => item.average !== null);
  };

  const getActivityAverages = () => {
    const activityAverages: { [key: string]: { sum: number, count: number } } = {};
    
    filteredRecords.forEach(record => {
      if (!activityAverages[record.activity]) {
        activityAverages[record.activity] = { sum: 0, count: 0 };
      }
      activityAverages[record.activity].sum += record.level;
      activityAverages[record.activity].count += 1;
    });
    
    return Object.entries(activityAverages)
      .map(([activity, data]) => ({
        activity,
        average: Math.round((data.sum / data.count) * 10) / 10,
        count: data.count
      }))
      .sort((a, b) => b.average - a.average);
  };

  const formatDateRange = () => {
    if (timeRange === 'day') {
      return currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (timeRange === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (timeRange === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (timeRange === 'year') {
      return currentDate.getFullYear().toString();
    } else {
      return `${dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (timeRange === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (timeRange === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (timeRange === 'year') {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
    
    if (timeRange === 'day') {
      setDateRange({
        start: newDate,
        end: new Date(newDate.getTime() + 24 * 60 * 60 * 1000 - 1)
      });
    } else if (timeRange === 'week') {
      const weekStart = new Date(newDate);
      weekStart.setDate(newDate.getDate() - 6);
      setDateRange({
        start: weekStart,
        end: newDate
      });
    } else if (timeRange === 'month') {
      const monthStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const monthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
      setDateRange({
        start: monthStart,
        end: monthEnd
      });
    } else if (timeRange === 'year') {
      const yearStart = new Date(newDate.getFullYear(), 0, 1);
      const yearEnd = new Date(newDate.getFullYear(), 11, 31);
      setDateRange({
        start: yearStart,
        end: yearEnd
      });
    }
  };

  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
            onClick={() => navigateDate('prev')}
            disabled={isLoading}
                >
            <ChevronLeft className="h-4 w-4" />
                </Button>
          
          <div className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateRange()}</span>
          </div>
          
                <Button 
                  variant="outline" 
                  size="icon"
            onClick={() => navigateDate('next')}
            disabled={isLoading || (timeRange === 'day' && currentDate.toDateString() === new Date().toDateString())}
                >
            <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
              
              <Button 
                variant="outline" 
                size="icon"
            onClick={fetchEnergyData}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuLabel>Chart Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-factors">Show Factors</Label>
                  <Switch
                    id="show-factors"
                    checked={showFactors}
                    onCheckedChange={setShowFactors}
                  />
                </div>
                
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Energy Level Range ({energyThreshold[0]} - {energyThreshold[1]})
                  </Label>
                  <Slider
                    value={energyThreshold}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={setEnergyThreshold}
                    className="my-4"
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
            </div>
          </div>
          
      {/* Search bar and activities filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities, factors or notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
            </div>
            
        <div className="flex flex-wrap gap-2">
          {availableActivities.slice(0, 5).map(activity => (
            <Badge
              key={activity}
              variant={selectedActivities.includes(activity) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleActivity(activity)}
            >
              {activity}
            </Badge>
          ))}
          
          {availableActivities.length > 5 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge variant="outline" className="cursor-pointer">
                  +{availableActivities.length - 5} more
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableActivities.slice(5).map(activity => (
                  <DropdownMenuItem
                    key={activity}
                    className={selectedActivities.includes(activity) ? "bg-primary/10" : ""}
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Energy</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="text-2xl font-bold">{getAverageEnergyLevel()}/10</div>
                <p className="text-xs text-muted-foreground">
                  Based on {filteredRecords.length} entries
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getEnergyByDayOfWeek().sort((a, b) => b.average - a.average)[0]?.day || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average: {getEnergyByDayOfWeek().sort((a, b) => b.average - a.average)[0]?.average || 0}/10
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getEnergyByTimeOfDay().sort((a, b) => b.average - a.average)[0]?.hour || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average: {getEnergyByTimeOfDay().sort((a, b) => b.average - a.average)[0]?.average || 0}/10
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate" title={getActivityAverages()[0]?.activity || 'N/A'}>
                  {getActivityAverages()[0]?.activity || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average: {getActivityAverages()[0]?.average || 0}/10
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart Display */}
          <Card className="border-primary/5">
            <CardHeader>
              <CardTitle>Energy Level History</CardTitle>
              <CardDescription>
                Visualize your energy patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground mb-2">No energy data available for this time period</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTimeRange('week');
                      setDateRange({
                        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        end: new Date()
                      });
                      setSearchQuery('');
                      setSelectedActivities([]);
                      setEnergyThreshold([0, 10]);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="h-full w-full">
                  {/* Placeholder for actual chart integration */}
                  <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {chartType === 'line' && <LineChart className="h-10 w-10 text-primary/60" />}
                        {chartType === 'area' && <AreaChart className="h-10 w-10 text-primary/60" />}
                        {chartType === 'bar' && <BarChart className="h-10 w-10 text-primary/60" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Energy data visualization would appear here.<br />
                        ({filteredRecords.length} data points in the selected range)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {filteredRecords.length > 0 && (
              <CardFooter className="justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredRecords.length} entries • {formatDateRange()}
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Energy Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Energy Log Entries</CardTitle>
              <CardDescription>
                Recent energy entries with details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No entries match your current filters</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedActivities([]);
                      setEnergyThreshold([0, 10]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Date & Time</th>
                        <th className="text-left py-3 px-2 font-medium">Energy</th>
                        <th className="text-left py-3 px-2 font-medium">Activity</th>
                        {showFactors && (
                          <th className="text-left py-3 px-2 font-medium">Factors</th>
                        )}
                        <th className="text-left py-3 px-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.slice(0, 10).map((record) => (
                        <tr key={record.id} className="border-b last:border-0">
                          <td className="py-3 px-2">
                            <div className="font-medium">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            <div className="text-sm text-muted-foreground">{record.time}</div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge className={`${getEnergyLevelBg(record.level)} ${getEnergyLevelColor(record.level)}`}>
                              <Battery className="h-3 w-3 mr-1" /> {record.level}/10
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {record.activity}
                          </td>
                          {showFactors && (
                            <td className="py-3 px-2">
                              <div className="flex flex-wrap gap-1">
                                {record.factors && record.factors.length > 0 ? (
                                  record.factors.map((factor, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {factor}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">None</span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="py-3 px-2 max-w-[200px] truncate" title={record.notes}>
                            {record.notes || <span className="text-xs text-muted-foreground">No notes</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredRecords.length > 10 && (
                    <div className="text-center py-4">
                      <Button variant="ghost" size="sm">
                        View all {filteredRecords.length} entries
                      </Button>
                    </div>
                  )}
                </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
} 