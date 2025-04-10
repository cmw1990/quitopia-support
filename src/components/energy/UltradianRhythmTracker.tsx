import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { motion } from "framer-motion";
import { 
  Clock, 
  Plus, 
  ChevronDown, 
  Edit, 
  Save, 
  Play, 
  Pause,
  AlertTriangle,
  ArrowRight,
  Calendar,
  BarChart4,
  Info,
  Lightbulb
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { rhythmsApi } from '@/api/supabase-rest'; // Corrected import
import { format, addDays, subDays, differenceInMinutes, startOfDay, addMinutes } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface UltradianRhythm {
  id: string;
  user_id: string;
  date: string;
  peak_start_times: string[];
  trough_start_times: string[];
  peak_durations: number[];
  trough_durations: number[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function UltradianRhythmTracker() {
  const { toast } = useToast();
  const { user, session } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [rhythmData, setRhythmData] = useState<UltradianRhythm | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);
  const [isPeak, setIsPeak] = useState(true);
  const [currentCycleStartTime, setCurrentCycleStartTime] = useState<Date | null>(null);
  const [peaks, setPeaks] = useState<{ startTime: Date; endTime?: Date; duration?: number }[]>([]);
  const [troughs, setTroughs] = useState<{ startTime: Date; endTime?: Date; duration?: number }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("today");
  const [showTips, setShowTips] = useState(true);
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchRhythmData();
    } else {
      setIsLoading(false);
    }
  }, [session, selectedDate]);
  
  const fetchRhythmData = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      // Use rhythmsApi, handle response, remove session arg
      const { data, error } = await rhythmsApi.getUserRhythms(session.user.id, dateStr);
      if (error) throw error; // Propagate error
      
      if (data && Array.isArray(data) && data.length > 0) {
        setRhythmData(data[0]);
        
        // Convert stored data to state
        const peakTimes = data[0].peak_start_times.map((timeStr: string, index: number) => ({
          startTime: new Date(timeStr),
          duration: data[0].peak_durations[index],
          endTime: addMinutes(new Date(timeStr), data[0].peak_durations[index])
        }));
        
        const troughTimes = data[0].trough_start_times.map((timeStr: string, index: number) => ({
          startTime: new Date(timeStr),
          duration: data[0].trough_durations[index],
          endTime: addMinutes(new Date(timeStr), data[0].trough_durations[index])
        }));
        
        setPeaks(peakTimes);
        setTroughs(troughTimes);
      } else {
        setRhythmData(null);
        setPeaks([]);
        setTroughs([]);
      }
    } catch (error) {
      console.error('Error fetching rhythm data:', error);
      toast({
        title: "Error",
        description: "Failed to load ultradian rhythm data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveRhythmData = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your rhythm data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const rhythmData = {
        user_id: session.user.id,
        date: dateStr,
        peak_start_times: peaks.map(peak => peak.startTime.toISOString()),
        trough_start_times: troughs.map(trough => trough.startTime.toISOString()),
        peak_durations: peaks.map(peak => peak.duration || 0),
        trough_durations: troughs.map(trough => trough.duration || 0),
        notes: '',
      };
      
      if (rhythmData && (rhythmData as any).id) {
        // Use rhythmsApi, handle response, remove session arg
        // Assuming updateUserRhythm exists and takes (id, data) - needs verification
        // Let's assume saveUserRhythm handles upsert based on the table's primary key
        const { error } = await rhythmsApi.saveUserRhythm(rhythmData); // Use save for upsert
        if (error) throw error;
      } else {
        // Use rhythmsApi, handle response, remove session arg
        const { error } = await rhythmsApi.saveUserRhythm(rhythmData);
        if (error) throw error;
      }
      
      toast({
        title: "Data Saved",
        description: "Your ultradian rhythm data has been saved.",
      });
      
      await fetchRhythmData();
    } catch (error) {
      console.error('Error saving rhythm data:', error);
      toast({
        title: "Error",
        description: "Failed to save rhythm data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startTracking = () => {
    const now = new Date();
    setIsTracking(true);
    setTrackingStartTime(now);
    setCurrentCycleStartTime(now);
    setIsPeak(true);
    
    toast({
      title: "Tracking Started",
      description: "Now tracking your peak energy cycle.",
    });
  };
  
  const stopTracking = () => {
    setIsTracking(false);
    setTrackingStartTime(null);
    
    toast({
      title: "Tracking Stopped",
      description: "Rhythm tracking has been stopped.",
    });
  };
  
  const toggleCycle = () => {
    const now = new Date();
    
    if (isPeak && currentCycleStartTime) {
      // End current peak cycle
      const duration = differenceInMinutes(now, currentCycleStartTime);
      const newPeak = {
        startTime: currentCycleStartTime,
        endTime: now,
        duration
      };
      
      setPeaks([...peaks, newPeak]);
      
      // Start trough cycle
      setIsPeak(false);
      setCurrentCycleStartTime(now);
      
      toast({
        title: "Cycle Switched",
        description: `Peak cycle ended (${duration} mins). Now tracking trough cycle.`,
      });
    } else if (!isPeak && currentCycleStartTime) {
      // End current trough cycle
      const duration = differenceInMinutes(now, currentCycleStartTime);
      const newTrough = {
        startTime: currentCycleStartTime,
        endTime: now,
        duration
      };
      
      setTroughs([...troughs, newTrough]);
      
      // Start peak cycle
      setIsPeak(true);
      setCurrentCycleStartTime(now);
      
      toast({
        title: "Cycle Switched",
        description: `Trough cycle ended (${duration} mins). Now tracking peak cycle.`,
      });
    }
  };
  
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins}m`;
  };
  
  const selectDate = (daysToAdd: number) => {
    const newDate = daysToAdd === 0 
      ? new Date() 
      : daysToAdd > 0 
        ? addDays(selectedDate, 1) 
        : subDays(selectedDate, 1);
    
    setSelectedDate(newDate);
  };
  
  const getChartData = () => {
    const data = [];
    const day = startOfDay(selectedDate);
    
    // Create data points for every 15 minutes
    for (let i = 0; i < 96; i++) {
      const timePoint = addMinutes(day, i * 15);
      const hour = timePoint.getHours();
      
      // Default energy level
      let energyLevel = 50;
      
      // Check if this time falls within a peak
      for (const peak of peaks) {
        if (peak.startTime <= timePoint && peak.endTime && peak.endTime >= timePoint) {
          // Higher energy during peaks
          energyLevel = 80;
          break;
        }
      }
      
      // Check if this time falls within a trough
      for (const trough of troughs) {
        if (trough.startTime <= timePoint && trough.endTime && trough.endTime >= timePoint) {
          // Lower energy during troughs
          energyLevel = 30;
          break;
        }
      }
      
      data.push({
        time: format(timePoint, 'HH:mm'),
        energy: energyLevel,
        hour
      });
    }
    
    return data;
  };
  
  const calculateAvgCycleDurations = () => {
    if (peaks.length === 0 && troughs.length === 0) return null;
    
    const avgPeakDuration = peaks.length > 0
      ? peaks.reduce((sum, peak) => sum + (peak.duration || 0), 0) / peaks.length
      : 0;
    
    const avgTroughDuration = troughs.length > 0
      ? troughs.reduce((sum, trough) => sum + (trough.duration || 0), 0) / troughs.length
      : 0;
    
    return {
      avgPeakDuration,
      avgTroughDuration,
      totalCycles: Math.min(peaks.length, troughs.length),
      avgFullCycleDuration: avgPeakDuration + avgTroughDuration
    };
  };
  
  const cycleStats = calculateAvgCycleDurations();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Ultradian Rhythm Tracker
            </CardTitle>
            <CardDescription>
              Track and optimize your natural energy cycles throughout the day
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectDate(-1)}
            >
              Previous
            </Button>
            <Button
              variant={activeTab === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                setActiveTab("today");
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm" 
              onClick={() => selectDate(1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Today's Rhythm</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <BarChart4 className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4 mt-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                
                {isTracking ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleCycle}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Switch to {isPeak ? "Trough" : "Peak"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={stopTracking}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={startTracking}
                    disabled={format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Tracking
                  </Button>
                )}
              </div>
              
              {isTracking && (
                <Alert className="bg-primary/10 border-primary/40">
                  <Info className="h-4 w-4" />
                  <AlertTitle>
                    {isPeak ? "Peak Energy Cycle" : "Trough Energy Cycle"}
                  </AlertTitle>
                  <AlertDescription>
                    {isPeak 
                      ? "Currently tracking your high energy period. Click 'Switch to Trough' when you feel your energy starting to decline."
                      : "Currently tracking your recovery period. Click 'Switch to Peak' when you feel your energy increasing again."
                    }
                    <div className="mt-2">
                      Started at {currentCycleStartTime ? formatTime(currentCycleStartTime) : 'N/A'}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="rounded-lg border p-4">
                <div className="font-medium mb-2">Energy Cycle Visualization</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        interval={4} 
                        tickFormatter={(time) => time.split(':')[0]} 
                      />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        formatter={(value: number) => [`Energy Level: ${value}%`, '']}
                        labelFormatter={(time) => `Time: ${time}`}
                      />
                      <defs>
                        <linearGradient id="energyColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#0EA5E9" 
                        fillOpacity={1} 
                        fill="url(#energyColor)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-2">Peak Cycles</div>
                  {peaks.length > 0 ? (
                    <ul className="space-y-2">
                      {peaks.map((peak, index) => (
                        <li key={index} className="text-sm flex justify-between items-center">
                          <span>
                            {formatTime(peak.startTime)} 
                            {peak.endTime && ` - ${formatTime(peak.endTime)}`}
                          </span>
                          {peak.duration && <Badge>{formatDuration(peak.duration)}</Badge>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground text-sm">No peak cycles recorded yet</div>
                  )}
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-2">Trough Cycles</div>
                  {troughs.length > 0 ? (
                    <ul className="space-y-2">
                      {troughs.map((trough, index) => (
                        <li key={index} className="text-sm flex justify-between items-center">
                          <span>
                            {formatTime(trough.startTime)} 
                            {trough.endTime && ` - ${formatTime(trough.endTime)}`}
                          </span>
                          {trough.duration && <Badge>{formatDuration(trough.duration)}</Badge>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground text-sm">No trough cycles recorded yet</div>
                  )}
                </div>
              </div>
              
              {showTips && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Ultradian Rhythm Tips</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                      <li>Most people follow 90-120 minute cycles of peak energy followed by 20-30 minute troughs</li>
                      <li>Schedule demanding tasks during peak energy cycles</li>
                      <li>Use trough cycles for rest, light work, or creative thinking</li>
                      <li>Track consistently to identify your personal pattern</li>
                    </ul>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => setShowTips(false)}
                    >
                      Hide Tips
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="text-center text-muted-foreground py-12">
              Rhythm history visualization will be available in the next update.
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4 mt-4">
            {cycleStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Cycle Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Peak Duration:</span>
                        <span className="font-medium">{formatDuration(Math.round(cycleStats.avgPeakDuration))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Trough Duration:</span>
                        <span className="font-medium">{formatDuration(Math.round(cycleStats.avgTroughDuration))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Complete Cycles:</span>
                        <span className="font-medium">{cycleStats.totalCycles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Full Cycle:</span>
                        <span className="font-medium">{formatDuration(Math.round(cycleStats.avgFullCycleDuration))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Your Rhythm Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cycleStats.totalCycles >= 2 ? (
                      <div className="space-y-3">
                        <div>
                          Your typical pattern appears to be:
                        </div>
                        <div className="font-medium">
                          {formatDuration(Math.round(cycleStats.avgPeakDuration))} of high energy, followed by {' '}
                          {formatDuration(Math.round(cycleStats.avgTroughDuration))} of recovery
                        </div>
                        <div className="text-sm text-muted-foreground">
                          This is {cycleStats.avgFullCycleDuration < 100 ? 'shorter' : cycleStats.avgFullCycleDuration > 140 ? 'longer' : 'typical'} compared to the average 90-120 minute ultradian rhythm cycle.
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Track at least 2 complete cycles to see your rhythm pattern.
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cycleStats.totalCycles >= 2 ? (
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium mb-1">Schedule your work based on your rhythm:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Schedule demanding tasks in ~{formatDuration(Math.round(cycleStats.avgPeakDuration))} blocks</li>
                            <li>Take ~{formatDuration(Math.round(cycleStats.avgTroughDuration))} breaks between intense work sessions</li>
                            <li>Plan your day in ~{formatDuration(Math.round(cycleStats.avgFullCycleDuration))} cycles</li>
                          </ul>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-1">Optimize for your pattern:</div>
                          {cycleStats.avgPeakDuration < 60 ? (
                            <div>Your peak cycles are relatively short. Consider energy-boosting techniques like better hydration, regular movement, or breathing exercises.</div>
                          ) : cycleStats.avgPeakDuration > 100 ? (
                            <div>You maintain focus for extended periods. Be careful not to overwork - schedule mandatory breaks to sustain this pattern.</div>
                          ) : (
                            <div>Your rhythm follows a healthy pattern. Continue tracking to maintain consistency.</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Track at least 2 complete cycles to receive personalized recommendations.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  Start tracking your ultradian rhythms to see insights and recommendations.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setShowTips(!showTips)}>
          {showTips ? 'Hide Tips' : 'Show Tips'}
        </Button>
        
        <Button onClick={saveRhythmData} disabled={isLoading || (peaks.length === 0 && troughs.length === 0)}>
          <Save className="h-4 w-4 mr-1" />
          Save Rhythm Data
        </Button>
      </CardFooter>
    </Card>
  );
} 