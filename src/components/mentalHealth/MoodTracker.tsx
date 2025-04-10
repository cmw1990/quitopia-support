import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mentalHealthDb } from "@/lib/mental-health-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MultiSelect } from "@/components/ui/multi-select";

const ACTIVITIES = [
  'Exercise',
  'Work',
  'Social',
  'Relaxation',
  'Hobbies',
  'Family',
  'Entertainment',
  'Learning',
  'Outdoors',
  'Creative'
];

const TRIGGERS = [
  'Work Stress',
  'Social Anxiety',
  'Health Concerns',
  'Financial Stress',
  'Relationship Issues',
  'Sleep Problems',
  'Physical Discomfort',
  'Future Uncertainty',
  'Past Events',
  'Environmental'
];

export function MoodTracker() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Get last 7 days of mood entries
  const { data: moodHistory, refetch } = useQuery({
    queryKey: ['mood-history'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const { data, error } = await mentalHealthDb.getMoodEntries(startDate);
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Get mood analytics for visualization
  const { data: moodAnalytics } = useQuery({
    queryKey: ['mood-analytics'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const { data, error } = await mentalHealthDb.getMoodAnalytics(startDate, new Date());
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const saveMoodEntry = async () => {
    if (!session?.user?.id) return;

    try {
      await mentalHealthDb.createMoodEntry({
        timestamp: new Date(),
        mood_score: moodScore,
        energy_level: energyLevel,
        activities: selectedActivities,
        triggers: selectedTriggers,
        notes: notes || undefined
      });

      toast({
        title: "Success",
        description: "Mood entry saved successfully",
      });

      // Reset form
      setMoodScore(5);
      setEnergyLevel(5);
      setSelectedActivities([]);
      setSelectedTriggers([]);
      setNotes('');

      // Refresh data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mood entry",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mood Score (1-10)</label>
            <Slider
              value={[moodScore]}
              onValueChange={([value]) => setMoodScore(value)}
              max={10}
              min={1}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Energy Level (1-10)</label>
            <Slider
              value={[energyLevel]}
              onValueChange={([value]) => setEnergyLevel(value)}
              max={10}
              min={1}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Activities</label>
            <MultiSelect
              options={ACTIVITIES.map(a => ({ label: a, value: a }))}
              value={selectedActivities}
              onChange={setSelectedActivities}
              placeholder="Select activities..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Triggers</label>
            <MultiSelect
              options={TRIGGERS.map(t => ({ label: t, value: t }))}
              value={selectedTriggers}
              onChange={setSelectedTriggers}
              placeholder="Select triggers..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
            />
          </div>

          <Button onClick={saveMoodEntry} className="w-full">
            Save Mood Entry
          </Button>
        </CardContent>
      </Card>

      {moodAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Mood & Energy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgMood" stroke="#8884d8" name="Mood" />
                  <Line type="monotone" dataKey="avgEnergy" stroke="#82ca9d" name="Energy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
