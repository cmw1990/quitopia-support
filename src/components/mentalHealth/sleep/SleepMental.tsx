import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mentalHealthDb } from "@/lib/mental-health-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Moon, Brain, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BEDTIME_ROUTINES = [
  'Reading',
  'Meditation',
  'Light Stretching',
  'Journaling',
  'Breathing Exercises',
  'Relaxing Music',
  'Warm Bath/Shower',
  'Herbal Tea',
  'Digital Detox',
  'Progressive Relaxation'
];

export function SleepMental() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [sleepAnxiety, setSleepAnxiety] = useState<number | null>(null);
  const [dreamJournal, setDreamJournal] = useState('');
  const [nightThoughts, setNightThoughts] = useState('');

  // Get sleep mental health data
  const { data: sleepMentalData, refetch } = useQuery({
    queryKey: ['sleep-mental'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const { data, error } = await mentalHealthDb.getSleepMental(startDate);
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const handleSubmit = async () => {
    if (!session?.user?.id || !sleepQuality) return;

    try {
      await mentalHealthDb.createSleepMental({
        date,
        sleep_quality: sleepQuality,
        bedtime_routine: selectedRoutines,
        sleep_anxiety_level: sleepAnxiety || undefined,
        dream_journal: dreamJournal || undefined,
        night_thoughts: nightThoughts || undefined
      });

      toast({
        title: "Success",
        description: "Sleep mental health data saved successfully",
      });

      // Reset form
      setSleepQuality(null);
      setSelectedRoutines([]);
      setSleepAnxiety(null);
      setDreamJournal('');
      setNightThoughts('');

      // Refresh data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sleep mental health data",
        variant: "destructive"
      });
    }
  };

  // Transform data for visualization
  const chartData = sleepMentalData?.map(entry => ({
    date: format(new Date(entry.date), 'MMM dd'),
    quality: entry.sleep_quality,
    anxiety: entry.sleep_anxiety_level
  }));

  const toggleRoutine = (routine: string) => {
    if (selectedRoutines.includes(routine)) {
      setSelectedRoutines(selectedRoutines.filter(r => r !== routine));
    } else {
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sleep & Mental Health Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Sleep Quality (1-10)</label>
            <Select
              value={sleepQuality?.toString() || ''}
              onValueChange={(value) => setSleepQuality(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rate your sleep quality" />
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
            <label className="text-sm font-medium">Bedtime Routine</label>
            <div className="grid grid-cols-2 gap-2">
              {BEDTIME_ROUTINES.map(routine => (
                <Button
                  key={routine}
                  variant={selectedRoutines.includes(routine) ? "default" : "outline"}
                  onClick={() => toggleRoutine(routine)}
                  className="justify-start"
                >
                  {routine}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sleep Anxiety Level (1-10)</label>
            <Select
              value={sleepAnxiety?.toString() || ''}
              onValueChange={(value) => setSleepAnxiety(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rate your sleep anxiety" />
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
            <label className="text-sm font-medium">Dream Journal</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={dreamJournal}
              onChange={(e) => setDreamJournal(e.target.value)}
              placeholder="Record any significant dreams or sleep experiences..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Night-time Thoughts</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={nightThoughts}
              onChange={(e) => setNightThoughts(e.target.value)}
              placeholder="Record any thoughts or worries that kept you up..."
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Save Sleep Log
          </Button>
        </CardContent>
      </Card>

      {chartData && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sleep Quality & Anxiety Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    stroke="#8884d8"
                    name="Sleep Quality"
                  />
                  <Line
                    type="monotone"
                    dataKey="anxiety"
                    stroke="#82ca9d"
                    name="Sleep Anxiety"
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
