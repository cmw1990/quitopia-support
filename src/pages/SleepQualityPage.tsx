import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Clock, Sun, Calendar, ArrowRight, Zap, Plus } from 'lucide-react';
import SleepQualityRecommendations from '@/components/health/SleepQualityRecommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HorizontalMenu from '@/components/health/HorizontalMenu';
import { supabaseRestCall, authenticatedRestCall } from '@/lib/supabase/rest-client';

interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  quality: number;
  sleep_time: string;
  wake_time: string;
  disturbances: string[];
  notes: string;
  created_at: string;
}

export default function SleepQualityPage() {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [hours, setHours] = useState<string>('');
  const [quality, setQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [sleepTime, setSleepTime] = useState<string>('22:00');
  const [wakeTime, setWakeTime] = useState<string>('06:00');
  const [disturbances, setDisturbances] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Fetch user's quit date
  const { data: quitDateData } = useQuery({
    queryKey: ['userQuitDate'],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await authenticatedRestCall<{ quit_date: string }>(
        '/rest/v1/user_profiles?select=quit_date&user_id=eq.' + session.user.id,
        { method: 'GET' },
        session
      );
      
      if (error) throw error;
      return data?.quit_date ? parseISO(data.quit_date) : null;
    }
  });
  
  const quitDate = quitDateData;
  const daysSinceQuit = quitDate 
    ? Math.floor((new Date().getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  // Fetch sleep logs
  const { data: sleepLogs, refetch: refetchSleepLogs } = useQuery({
    queryKey: ['sleepLogs'],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await authenticatedRestCall<SleepLog[]>(
        '/rest/v1/sleep_logs?select=*&user_id=eq.' + session.user.id + '&order=date.desc',
        { method: 'GET' },
        session
      );
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Calculate average sleep quality
  const averageSleepQuality = sleepLogs?.length 
    ? sleepLogs.reduce((sum, log) => sum + (log.quality || 0), 0) / sleepLogs.length 
    : 0;
  
  // Create sleep log
  const createSleepLog = useMutation({
    mutationFn: async (values: any) => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await authenticatedRestCall<SleepLog>(
        '/rest/v1/sleep_logs',
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: session.user.id,
            date: selectedDate,
            hours: parseFloat(values.hours),
            quality: values.quality,
            sleep_time: values.sleepTime,
            wake_time: values.wakeTime,
            disturbances: values.disturbances,
            notes: values.notes
          })
        },
        session
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-logs'] });
      toast({
        title: "Sleep logged successfully",
        description: "Your sleep data has been recorded."
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error saving sleep data",
        description: "There was a problem recording your sleep data.",
        variant: "destructive"
      });
      console.error("Error logging sleep:", error);
    }
  });
  
  const resetForm = () => {
    setHours('');
    setQuality(null);
    setNotes('');
    setSleepTime('22:00');
    setWakeTime('06:00');
    setDisturbances([]);
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hours || !quality) {
      toast({
        title: "Missing information",
        description: "Please enter both sleep duration and quality.",
        variant: "destructive"
      });
      return;
    }
    
    createSleepLog.mutate({
      hours,
      quality,
      sleepTime,
      wakeTime,
      disturbances,
      notes
    });
  };
  
  const toggleDisturbance = (disturbance: string) => {
    if (disturbances.includes(disturbance)) {
      setDisturbances(disturbances.filter(d => d !== disturbance));
    } else {
      setDisturbances([...disturbances, disturbance]);
    }
  };
  
  // Prepare chart data
  const chartData = sleepLogs?.map(log => ({
    date: format(new Date(log.date), 'MM/dd'),
    hours: log.hours,
    quality: log.quality || 0
  })).reverse();
  
  // Get sleep quality trend
  const getSleepQualityTrend = () => {
    if (!sleepLogs || sleepLogs.length < 2) return 'stable';
    
    const recent = sleepLogs.slice(0, 3).reduce((sum, log) => sum + (log.quality || 0), 0) / Math.min(3, sleepLogs.length);
    const earlier = sleepLogs.slice(3, 6).reduce((sum, log) => sum + (log.quality || 0), 0) / Math.min(3, sleepLogs.slice(3, 6).length);
    
    if (recent - earlier > 1) return 'improving';
    if (earlier - recent > 1) return 'declining';
    return 'stable';
  };
  
  const sleepQualityTrend = getSleepQualityTrend();
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sleep Quality Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track and improve your sleep during your quit journey
          </p>
        </div>
        
        {daysSinceQuit > 0 && (
          <div className="bg-primary/10 px-4 py-2 rounded-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            <span>
              <span className="font-medium">{daysSinceQuit}</span> days smoke-free
            </span>
          </div>
        )}
      </div>
      
      <HorizontalMenu />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sleep Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Sleep Overview</CardTitle>
              <CardDescription>
                Your recent sleep patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sleepLogs && sleepLogs.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" domain={[0, 12]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                      <Tooltip />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3b82f6" 
                        name="Hours" 
                        strokeWidth={2} 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="quality" 
                        stroke="#10b981" 
                        name="Quality (1-10)" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Moon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sleep data yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your sleep to see patterns and improvements
                  </p>
                  <Button onClick={() => document.getElementById('log-form')?.scrollIntoView({ behavior: 'smooth' })}>
                    Log Your Sleep
                  </Button>
                </div>
              )}
              
              {sleepLogs && sleepLogs.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Duration</h3>
                    <p className="text-2xl font-bold">
                      {(sleepLogs.reduce((sum, log) => sum + (log.hours || 0), 0) / sleepLogs.length).toFixed(1)}h
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Quality</h3>
                    <p className="text-2xl font-bold">
                      {averageSleepQuality.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Trend</h3>
                    <p className="text-2xl font-bold flex justify-center items-center">
                      {sleepQualityTrend === 'improving' ? (
                        <span className="text-green-500 flex items-center">Improving <ArrowRight className="h-4 w-4 ml-1 rotate-45" /></span>
                      ) : sleepQualityTrend === 'declining' ? (
                        <span className="text-red-500 flex items-center">Declining <ArrowRight className="h-4 w-4 ml-1 rotate-135" /></span>
                      ) : (
                        <span className="text-blue-500 flex items-center">Stable <ArrowRight className="h-4 w-4 ml-1" /></span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Log Sleep Form */}
          <Card id="log-form">
            <CardHeader>
              <CardTitle>Log Your Sleep</CardTitle>
              <CardDescription>
                Record your sleep data to track improvements during your quit journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours of Sleep</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="e.g., 7.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sleep-time">Bedtime</Label>
                    <Input
                      id="sleep-time"
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wake-time">Wake Time</Label>
                    <Input
                      id="wake-time"
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sleep Quality (1-10)</Label>
                  <div className="pt-2">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={quality ? [quality] : [5]}
                      onValueChange={(value) => setQuality(value[0])}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sleep Disturbances</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Cravings', 'Nightmares', 'Sweating', 'Frequent Waking', 'Insomnia', 'None'].map(disturbance => (
                      <Button
                        key={disturbance}
                        type="button"
                        variant={disturbances.includes(disturbance) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDisturbance(disturbance)}
                      >
                        {disturbance}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes about your sleep quality?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Save Sleep Log
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Recommendations */}
          <SleepQualityRecommendations 
            sleepData={sleepLogs}
            quitDays={daysSinceQuit}
            recentSleepQuality={sleepLogs && sleepLogs.length > 0 ? sleepLogs[0]?.quality : 5}
          />
          
          {/* Nicotine & Sleep Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" /> Nicotine & Sleep
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Did you know?</AlertTitle>
                <AlertDescription>
                  Smokers take longer to fall asleep, wake up more frequently, and have less restful sleep compared to non-smokers.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">How Quitting Improves Sleep</h3>
                  <p className="text-sm text-muted-foreground">
                    After quitting smoking, your sleep architecture begins to normalize. REM sleep increases, leading to better cognitive function and mood regulation.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Sleep & Withdrawal</h3>
                  <p className="text-sm text-muted-foreground">
                    Sleep disturbances are common during nicotine withdrawal, but typically improve after 2-4 weeks as your body adjusts to being nicotine-free.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Signs of Improving Sleep</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Falling asleep more quickly</li>
                    <li>Fewer nighttime awakenings</li>
                    <li>Feeling more rested upon waking</li>
                    <li>Reduced snoring and sleep apnea symptoms</li>
                    <li>Improved dream recall</li>
                  </ul>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => navigate('/guides/sleep-optimization')}>
                View Sleep Optimization Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 