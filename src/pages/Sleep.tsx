import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Moon, Clock, Star, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { SmartAlarm } from "@/components/sleep/SmartAlarm";
import { SleepMetrics } from "@/components/sleep/SleepMetrics";
import { StressScanner } from "@/components/sleep/StressScanner";
import { MoodAnalysis } from "@/components/sleep/MoodAnalysis";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// ... keep existing code (imports and component setup)

const Sleep = () => {
  const { toast } = useToast();
  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch sleep logs
  const { data: sleepLogs, isLoading } = useQuery({
    queryKey: ['sleep-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_focus_logs')
        .select('*')
        .eq('activity_type', 'sleep')
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data;
    }
  });

  const logSleep = async () => {
    try {
      const { error } = await supabase
        .from('energy_focus_logs')
        .insert([
          {
            activity_type: 'sleep',
            activity_name: 'sleep_log',
            duration_minutes: parseFloat(hours) * 60,
            energy_rating: quality,
            notes: notes,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sleep logged",
        description: "Your sleep has been recorded successfully.",
      });

      // Reset form
      setHours("");
      setQuality(null);
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log sleep. Please try again.",
        variant: "destructive",
      });
    }
  };

  const chartData = sleepLogs?.map(log => ({
    date: new Date(log.created_at).toLocaleDateString(),
    hours: log.duration_minutes / 60,
    quality: log.energy_rating
  })).reverse();

  // Add stressData state
  const [stressData, setStressData] = useState<any>(null);

  // Handle stress data updates
  const handleStressDataUpdate = (data: any) => {
    setStressData(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Advanced Sleep Optimization</h1>
      
      <SmartAlarm />
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sleep Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepLogs?.[0] ? `${(sleepLogs[0].duration_minutes / 60).toFixed(1)}h` : 'No data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepLogs?.length ? 
                (sleepLogs.reduce((acc, log) => acc + (log.energy_rating || 0), 0) / sleepLogs.length).toFixed(1) 
                : 'No data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepLogs?.length ? 
                (sleepLogs.reduce((acc, log) => acc + (log.duration_minutes || 0), 0) / sleepLogs.length / 60).toFixed(1) + 'h'
                : 'No data'}
            </div>
          </CardContent>
        </Card>
      </div>

      <StressScanner onDataUpdate={handleStressDataUpdate} />

      <div className="grid gap-4 md:grid-cols-2">
        <MoodAnalysis sleepData={sleepLogs} stressData={stressData} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered Sleep Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SleepMetrics sleepData={sleepLogs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sleep History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#6b8cce" 
                    strokeWidth={2}
                    name="Hours"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#ee9ca7" 
                    strokeWidth={2}
                    name="Quality"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No sleep data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hours of Sleep</label>
              <Input
                type="number"
                step="0.5"
                placeholder="Enter hours of sleep"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sleep Quality (1-10)</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <Button
                    key={rating}
                    variant={quality === rating ? "default" : "outline"}
                    className="h-12 w-12"
                    onClick={() => setQuality(rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                placeholder="Any notes about your sleep..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button 
              className="w-full"
              onClick={logSleep}
              disabled={!hours || !quality}
            >
              Log Sleep
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sleep;
