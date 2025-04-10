import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, Activity, Coffee, Wine, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { format, differenceInHours, parse } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { sleepDb } from '@/lib/sleep-db';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function SleepTracker() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [factors, setFactors] = useState({
    caffeine: false,
    exercise: false,
    alcohol: false,
    screen_time: false,
    stress: false
  });
  const [notes, setNotes] = useState('');

  // Fetch sleep entries
  const { data: sleepEntries = [], isLoading } = useQuery({
    queryKey: ['sleep-entries'],
    queryFn: () => sleepDb.getSleepEntries(30)
  });

  // Create sleep entry
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      const bedTimeParsed = parse(bedTime, 'HH:mm', new Date());
      const wakeTimeParsed = parse(wakeTime, 'HH:mm', new Date());
      
      // Handle case where wake time is on the next day
      let duration = differenceInHours(wakeTimeParsed, bedTimeParsed);
      if (duration < 0) {
        duration += 24; // Add 24 hours if wake time is on the next day
      }

      await sleepDb.createSleepEntry({
        bed_time: bedTime,
        wake_time: wakeTime,
        sleep_quality: sleepQuality,
        sleep_duration: duration,
        factors,
        notes: notes || undefined
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sleep Entry Added',
        description: 'Your sleep data has been recorded successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['sleep-entries'] });
      queryClient.invalidateQueries({ queryKey: ['sleep-stats'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error saving sleep entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sleep entry. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setBedTime('22:00');
    setWakeTime('07:00');
    setSleepQuality(7);
    setFactors({
      caffeine: false,
      exercise: false,
      alcohol: false,
      screen_time: false,
      stress: false
    });
    setNotes('');
  };

  // Format time strings
  const formatTimeString = (timeStr: string) => {
    try {
      const time = parse(timeStr, 'HH:mm', new Date());
      return format(time, 'h:mm a');
    } catch (e) {
      return timeStr;
    }
  };

  const handleCreateEntry = () => {
    createEntryMutation.mutate();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-500" />
          Sleep Tracker
        </CardTitle>
        <CardDescription>
          Track your sleep patterns for better rest and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="log" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Log Sleep</TabsTrigger>
            <TabsTrigger value="history">Sleep History</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bedtime</Label>
                  <Input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wake Time</Label>
                  <Input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Sleep Quality</Label>
                  <span className="text-sm text-muted-foreground">{sleepQuality}/10</span>
                </div>
                <Slider
                  value={[sleepQuality]}
                  onValueChange={([value]) => setSleepQuality(value)}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Factors (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={factors.caffeine ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFactors(f => ({ ...f, caffeine: !f.caffeine }))}
                    className="flex items-center gap-2"
                  >
                    <Coffee className="h-4 w-4" />
                    Caffeine
                  </Button>
                  <Button
                    type="button"
                    variant={factors.exercise ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFactors(f => ({ ...f, exercise: !f.exercise }))}
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Exercise
                  </Button>
                  <Button
                    type="button"
                    variant={factors.alcohol ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFactors(f => ({ ...f, alcohol: !f.alcohol }))}
                    className="flex items-center gap-2"
                  >
                    <Wine className="h-4 w-4" />
                    Alcohol
                  </Button>
                  <Button
                    type="button"
                    variant={factors.screen_time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFactors(f => ({ ...f, screen_time: !f.screen_time }))}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Screen Time
                  </Button>
                  <Button
                    type="button"
                    variant={factors.stress ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFactors(f => ({ ...f, stress: !f.stress }))}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Stress
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any observations about your sleep..."
                />
              </div>

              <Button 
                className="w-full"
                onClick={handleCreateEntry}
                disabled={createEntryMutation.isPending}
              >
                {createEntryMutation.isPending ? 'Saving...' : 'Log Sleep Entry'}
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your sleep history...
                </div>
              ) : sleepEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Moon className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                  <p className="text-muted-foreground">No sleep entries yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Log your first sleep entry to start tracking
                  </p>
                </div>
              ) : (
                <div>
                  {/* Sleep quality trend chart */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Sleep Quality Trend</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sleepEntries.slice(0, 10).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at"
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return format(date, 'M/d');
                            }}
                          />
                          <YAxis domain={[0, 10]} />
                          <Tooltip
                            labelFormatter={(value) => {
                              const date = new Date(value);
                              return format(date, 'MMM dd, yyyy');
                            }}
                            formatter={(value) => [`${value}`, 'Quality']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sleep_quality" 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                
                  {/* Recent entries list */}
                  <h3 className="text-sm font-medium mb-2">Recent Entries</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {sleepEntries.map((entry: any) => (
                      <Card key={entry.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatTimeString(entry.bed_time)} - {formatTimeString(entry.wake_time)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-right">
                              Quality: <span className="font-medium">{entry.sleep_quality}/10</span>
                            </div>
                            <div className="text-sm text-right">
                              <span className="text-muted-foreground">{entry.sleep_duration} hrs</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <Progress value={(entry.sleep_quality / 10) * 100} className="h-2" />
                        </div>
                        
                        {Object.entries(entry.factors || {}).some(([_, value]) => value) && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {Object.entries(entry.factors).map(([factor, value]) => 
                              value && (
                                <div key={factor} className="bg-muted text-xs px-2 py-1 rounded">
                                  {factor.charAt(0).toUpperCase() + factor.slice(1).replace('_', ' ')}
                                </div>
                              )
                            )}
                          </div>
                        )}
                        
                        {entry.notes && (
                          <div className="mt-2 text-sm italic text-muted-foreground">
                            {entry.notes}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
