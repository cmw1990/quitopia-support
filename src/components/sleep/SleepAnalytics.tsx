import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { sleepDb } from "@/lib/sleep-db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ActivitySquare, BarChart3, Moon, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

export function SleepAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data: sleepStats, isLoading } = useQuery({
    queryKey: ["sleep-stats", timeRange],
    queryFn: () => sleepDb.getSleepStats(parseInt(timeRange)),
  });

  const { data: sleepEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["sleep-entries", timeRange],
    queryFn: () => sleepDb.getSleepEntries(parseInt(timeRange)),
  });

  // Format entries for chart display
  const chartData = sleepEntries.slice(0, 14).map((entry: any) => {
    const date = new Date(entry.created_at);
    return {
      date: format(date, "MM/dd"),
      quality: entry.sleep_quality,
      duration: entry.sleep_duration,
    };
  }).reverse();

  // Calculate color based on quality
  const getQualityColor = (quality: number) => {
    if (quality >= 8) return "#4ade80"; // green
    if (quality >= 6) return "#facc15"; // yellow
    return "#f87171"; // red
  };

  // Process factor impact data for pie chart
  const factorImpactData = sleepStats?.factorImpact?.map((factor: any) => ({
    name: factor.name.charAt(0).toUpperCase() + factor.name.slice(1),
    value: factor.impact,
  })) || [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Sleep Analytics
          </CardTitle>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading || entriesLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading sleep analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/30">
                <div className="flex flex-col items-center">
                  <Label className="text-muted-foreground mb-1">Avg Quality</Label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">
                      {sleepStats?.averageQuality.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs text-muted-foreground">
                      From {sleepStats?.totalEntries || 0} entries
                    </span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-muted/30">
                <div className="flex flex-col items-center">
                  <Label className="text-muted-foreground mb-1">Avg Duration</Label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">
                      {sleepStats?.averageDuration.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-muted-foreground">hrs</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs text-muted-foreground">
                      Last {timeRange} days
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sleep quality & duration chart */}
            {chartData.length > 0 ? (
              <div className="h-72">
                <h3 className="text-sm font-medium mb-2">Sleep Quality & Duration</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Quality', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Hours', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="quality" name="Sleep Quality" maxBarSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getQualityColor(entry.quality)} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="duration" name="Sleep Duration (hrs)" fill="#60a5fa" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg">
                <ActivitySquare className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">No sleep data recorded yet</p>
                <p className="text-xs text-muted-foreground">Track your sleep to see analytics</p>
              </div>
            )}

            {/* Sleep factors impact */}
            {factorImpactData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Factors Affecting Sleep Quality</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={factorImpactData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {factorImpactData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Impact: ${value.toFixed(1)}/10`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 