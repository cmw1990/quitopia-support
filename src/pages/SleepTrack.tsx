import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { AIAssistant } from "@/components/AIAssistant";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SleepTrack = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState("");

  // Fetch sleep logs
  const { data: sleepLogs } = useQuery({
    queryKey: ["sleepLogs"],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/energy_focus_logs?user_id=eq.${session?.user.id}&activity_type=eq.sleep&order=created_at.desc&limit=7`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
  });

  // Mutation to add sleep log
  const addSleepLog = useMutation({
    mutationFn: async (values: { hours: number; quality: number }) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/energy_focus_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session?.user.id,
          activity_type: "sleep",
          activity_name: "Sleep Session",
          duration_minutes: values.hours * 60,
          energy_rating: values.quality,
          focus_rating: values.quality,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleepLogs"] });
      toast({
        title: "Sleep log added",
        description: "Your sleep data has been recorded successfully.",
      });
      setHours("");
      setQuality("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record sleep data. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding sleep log:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !quality) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const hoursNum = parseFloat(hours);
    const qualityNum = parseInt(quality);

    if (hoursNum < 0 || hoursNum > 24) {
      toast({
        title: "Invalid hours",
        description: "Hours must be between 0 and 24.",
        variant: "destructive",
      });
      return;
    }

    if (qualityNum < 1 || qualityNum > 10) {
      toast({
        title: "Invalid quality rating",
        description: "Quality must be between 1 and 10.",
        variant: "destructive",
      });
      return;
    }

    addSleepLog.mutate({ hours: hoursNum, quality: qualityNum });
  };

  const chartData = sleepLogs?.map((log) => ({
    date: new Date(log.created_at).toLocaleDateString(),
    hours: log.duration_minutes / 60,
    quality: log.energy_rating,
  })).reverse();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Sleep Tracking</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours of Sleep</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Enter hours slept"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Sleep Quality (1-10)</Label>
                <Input
                  id="quality"
                  type="number"
                  min="1"
                  max="10"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  placeholder="Rate your sleep quality"
                />
              </div>
              <Button type="submit" className="w-full">
                Log Sleep
              </Button>
            </form>
          </CardContent>
        </Card>

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
                      stroke="#8884d8"
                      name="Hours"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quality"
                      stroke="#82ca9d"
                      name="Quality"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No sleep data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AIAssistant 
          type="sleep_pattern_analysis"
          data={sleepLogs}
        />

        <AIAssistant 
          type="sleep_recommendations"
          data={{
            sleepLogs,
            recentQuality: quality,
            recentHours: hours
          }}
        />

        <AIAssistant 
          type="sleep_quality_prediction"
          data={{
            sleepLogs,
            currentTime: new Date().toISOString(),
            recentActivity: "sleep"
          }}
        />

        <AIAssistant 
          type="analyze_sleep"
          data={{
            sleepLogs,
            averageQuality: sleepLogs?.reduce((acc, log) => acc + log.energy_rating, 0) / (sleepLogs?.length || 1),
            averageHours: sleepLogs?.reduce((acc, log) => acc + (log.duration_minutes || 0), 0) / (sleepLogs?.length || 1) / 60
          }}
        />

        <AIAssistant 
          type="sleep_habit_comparison"
          data={{
            sleepLogs,
            userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }}
        />

        <AIAssistant 
          type="sleep_environment_analysis"
          data={{
            sleepLogs,
            timeOfDay: new Date().getHours()
          }}
        />

        <AIAssistant 
          type="sleep_cycle_optimization"
          data={{
            sleepLogs,
            targetWakeTime: new Date().setHours(7, 0, 0, 0)
          }}
        />

        <AIAssistant 
          type="cognitive_impact_analysis"
          data={{
            sleepLogs,
            recentPerformance: sleepLogs?.[0]?.focus_rating
          }}
        />

        <AIAssistant 
          type="lifestyle_correlation"
          data={{
            sleepLogs,
            recentActivities: sleepLogs?.map(log => log.notes)
          }}
        />

        <AIAssistant 
          type="recovery_suggestions"
          data={{
            sleepLogs,
            sleepDebt: sleepLogs?.reduce((acc, log) => acc + (8 - (log.duration_minutes / 60)), 0)
          }}
        />

        <AIAssistant 
          type="next_day_preparation"
          data={{
            sleepLogs,
            tomorrowSchedule: "typical workday"
          }}
        />

        <AIAssistant 
          type="circadian_rhythm_analysis"
          data={{
            sleepLogs,
            naturalLightExposure: true
          }}
        />
      </div>
    </div>
  );
};

export default SleepTrack;