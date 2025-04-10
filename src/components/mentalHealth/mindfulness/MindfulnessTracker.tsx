import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { mentalHealthDb } from "@/lib/mental-health-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Timer } from "lucide-react";

const SESSION_TYPES = [
  'Breathing Meditation',
  'Body Scan',
  'Loving-Kindness',
  'Walking Meditation',
  'Mindful Movement',
  'Open Awareness',
  'Visualization',
  'Sound Meditation',
  'Gratitude Practice',
  'Mindful Eating'
];

export function MindfulnessTracker() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<string>(SESSION_TYPES[0]);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [focusRating, setFocusRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // Get mindfulness sessions
  const { data: mindfulnessSessions, refetch } = useQuery({
    queryKey: ['mindfulness-sessions'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const { data, error } = await mentalHealthDb.getMindfulnessSessions(startDate);
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        setDuration(Math.floor((now.getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, startTime]);

  const startSession = () => {
    setIsSessionActive(true);
    setStartTime(new Date());
    setDuration(0);
  };

  const endSession = async () => {
    if (!session?.user?.id || !startTime) return;

    try {
      await mentalHealthDb.createMindfulnessSession({
        start_time: startTime,
        duration_minutes: Math.floor(duration / 60),
        session_type: sessionType,
        focus_rating: focusRating,
        notes: notes || undefined
      });

      toast({
        title: "Success",
        description: "Mindfulness session saved successfully",
      });

      // Reset state
      setIsSessionActive(false);
      setStartTime(null);
      setDuration(0);
      setFocusRating(null);
      setNotes('');

      // Refresh data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mindfulness session",
        variant: "destructive"
      });
    }
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Transform sessions data for visualization
  const chartData = mindfulnessSessions?.map(session => ({
    date: new Date(session.start_time).toLocaleDateString(),
    duration: session.duration_minutes,
    focus: session.focus_rating
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mindfulness Practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Type</label>
            <Select
              value={sessionType}
              onValueChange={setSessionType}
              disabled={isSessionActive}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a meditation type" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="text-6xl font-mono">
              {formatDuration(duration)}
            </div>
            {!isSessionActive ? (
              <Button onClick={startSession} size="lg">
                Start Session
              </Button>
            ) : (
              <Button onClick={endSession} variant="destructive" size="lg">
                End Session
              </Button>
            )}
          </div>

          {!isSessionActive && duration > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Rating (1-10)</label>
                <Select
                  value={focusRating?.toString() || ''}
                  onValueChange={(value) => setFocusRating(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rate your focus" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Session Notes</label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your practice? Any insights or challenges?"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {chartData && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Practice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="duration"
                    stroke="#8884d8"
                    name="Duration (mins)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="focus"
                    stroke="#82ca9d"
                    name="Focus Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
