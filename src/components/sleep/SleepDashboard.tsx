import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
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
  Legend,
} from 'recharts';
import { useUser } from '@/lib/auth';
import {
  createSleepEntry,
  getSleepHistory,
  getSleepStats,
  getSleepGoals,
  setSleepGoals,
  getSleepRecommendations,
} from '@/lib/wellness-db';
import type {
  SleepEntry,
  SleepGoal,
  SleepStats,
  SleepRecommendation,
} from '@/types/wellness';

export default function SleepDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('track');
  const [sleepHistory, setSleepHistory] = useState<SleepEntry[]>([]);
  const [sleepStats, setSleepStats] = useState<SleepStats | null>(null);
  const [sleepGoals, setSleepGoalsState] = useState<SleepGoal | null>(null);
  const [recommendations, setRecommendations] = useState<SleepRecommendation[]>([]);

  // New sleep entry form state
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [factors, setFactors] = useState({
    caffeine: false,
    exercise: false,
    alcohol: false,
    screenTime: false,
    stress: false,
  });
  const [notes, setNotes] = useState('');

  // Goals form state
  const [targetDuration, setTargetDuration] = useState(8);
  const [targetBedTime, setTargetBedTime] = useState('22:00');
  const [targetWakeTime, setTargetWakeTime] = useState('06:00');

  useEffect(() => {
    if (!user?.id) return;

    const loadSleepData = async () => {
      try {
        const [history, stats, goals, recs] = await Promise.all([
          getSleepHistory(user.id),
          getSleepStats(user.id),
          getSleepGoals(user.id),
          getSleepRecommendations(),
        ]);

        setSleepHistory(history);
        setSleepStats(stats);
        setSleepGoalsState(goals);
        setRecommendations(recs);
      } catch (error) {
        toast({
          title: 'Error loading sleep data',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    };

    loadSleepData();
  }, [user?.id, toast]);

  const handleSleepEntry = async () => {
    if (!user?.id) return;

    try {
      const duration = calculateDuration(bedTime, wakeTime);
      await createSleepEntry(user.id, {
        bedTime,
        wakeTime,
        sleepQuality,
        sleepDuration: duration,
        factors,
        notes,
      });

      // Refresh data
      const [history, stats] = await Promise.all([
        getSleepHistory(user.id),
        getSleepStats(user.id),
      ]);

      setSleepHistory(history);
      setSleepStats(stats);

      toast({
        title: 'Sleep entry recorded',
        description: 'Your sleep data has been saved successfully.',
      });

      // Reset form
      setSleepQuality(7);
      setFactors({
        caffeine: false,
        exercise: false,
        alcohol: false,
        screenTime: false,
        stress: false,
      });
      setNotes('');
    } catch (error) {
      toast({
        title: 'Error saving sleep entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleGoalsUpdate = async () => {
    if (!user?.id) return;

    try {
      await setSleepGoals(user.id, {
        targetDuration,
        targetBedTime,
        targetWakeTime,
      });

      const goals = await getSleepGoals(user.id);
      setSleepGoalsState(goals);

      toast({
        title: 'Sleep goals updated',
        description: 'Your sleep goals have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error saving sleep goals',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    let duration = (endHour - startHour) + (endMinute - startMinute) / 60;
    if (duration < 0) duration += 24;
    return Number(duration.toFixed(2));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Sleep</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Your Sleep</CardTitle>
              <CardDescription>Record your sleep details for better insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedTime">Bed Time</Label>
                  <Input
                    id="bedTime"
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wakeTime">Wake Time</Label>
                  <Input
                    id="wakeTime"
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sleep Quality (1-10)</Label>
                <Slider
                  value={[sleepQuality]}
                  onValueChange={([value]) => setSleepQuality(value)}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="text-center text-sm text-muted-foreground">
                  {sleepQuality}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Factors</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(factors).map(([key, value]) => (
                    <Button
                      key={key}
                      variant={value ? 'default' : 'outline'}
                      onClick={() => setFactors(prev => ({ ...prev, [key]: !value }))}
                      className="w-full"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleSleepEntry} className="w-full">
                Save Sleep Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sleep Quality Trend</CardTitle>
                <CardDescription>Your sleep quality over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep_quality"
                      stroke="#2563eb"
                      name="Quality"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Duration</CardTitle>
                <CardDescription>Hours of sleep per night</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis domain={[0, 12]} />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep_duration"
                      stroke="#16a34a"
                      name="Duration"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factor Impact Analysis</CardTitle>
                <CardDescription>How different factors affect your sleep</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sleepStats?.factorImpact}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="factor" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impact" fill="#2563eb" name="Impact Score" />
                    <Bar dataKey="occurrences" fill="#16a34a" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Statistics</CardTitle>
                <CardDescription>Your sleep performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Average Sleep Quality</Label>
                    <div className="text-2xl font-bold">
                      {sleepStats?.averageQuality.toFixed(1)}/10
                    </div>
                  </div>
                  <div>
                    <Label>Average Sleep Duration</Label>
                    <div className="text-2xl font-bold">
                      {sleepStats?.averageDuration.toFixed(1)} hours
                    </div>
                  </div>
                  <div>
                    <Label>Quality Trend</Label>
                    <div className="text-2xl font-bold capitalize">
                      {sleepStats?.qualityTrend}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Sleep Goals</CardTitle>
              <CardDescription>Define your target sleep schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Sleep Duration (hours)</Label>
                <Slider
                  value={[targetDuration]}
                  onValueChange={([value]) => setTargetDuration(value)}
                  min={5}
                  max={12}
                  step={0.5}
                />
                <div className="text-center text-sm text-muted-foreground">
                  {targetDuration} hours
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetBedTime">Target Bed Time</Label>
                  <Input
                    id="targetBedTime"
                    type="time"
                    value={targetBedTime}
                    onChange={(e) => setTargetBedTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWakeTime">Target Wake Time</Label>
                  <Input
                    id="targetWakeTime"
                    type="time"
                    value={targetWakeTime}
                    onChange={(e) => setTargetWakeTime(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleGoalsUpdate} className="w-full">
                Update Goals
              </Button>

              {sleepGoals && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Current Goals</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Duration</Label>
                      <div className="text-lg font-medium">
                        {sleepGoals.target_duration} hours
                      </div>
                    </div>
                    <div>
                      <Label>Bed Time</Label>
                      <div className="text-lg font-medium">
                        {sleepGoals.target_bed_time}
                      </div>
                    </div>
                    <div>
                      <Label>Wake Time</Label>
                      <div className="text-lg font-medium">
                        {sleepGoals.target_wake_time}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <CardTitle>{rec.title}</CardTitle>
                  <CardDescription>Impact Level: {rec.impact_level}/5</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rec.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
