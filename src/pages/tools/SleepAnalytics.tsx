
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { format } from "date-fns"
import { Brain, Moon, Sun, Activity, Percent, Clock } from "lucide-react"

type SleepAnalyticsSummary = {
  id: string
  date: string
  average_quality: number | null
  total_sleep_hours: number | null
  environment_score: number | null
  sleep_debt_hours: number | null
  sleep_efficiency: number | null
  consistency_score: number | null
}

type SleepCombinedData = {
  date: string
  sleep_quality: number | null
  bedtime: string | null
  wake_time: string | null
  temperature: number | null
  humidity: number | null
  noise_level: number | null
  light_level: number | null
  ventilation_rating: number | null
  comfort_rating: number | null
  target_sleep_duration: number | null
  target_bedtime: string | null
  target_wake_time: string | null
}

export default function SleepAnalytics() {
  const { data: sleepAnalytics, isLoading } = useQuery({
    queryKey: ["sleep_analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sleep_analytics_summaries")
        .select("*")
        .order("date", { ascending: true })
        .limit(30)
        .returns<SleepAnalyticsSummary[]>()

      if (error) throw error
      return data
    },
  })

  const { data: combinedData } = useQuery({
    queryKey: ["sleep_combined_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sleep_combined_data")
        .select("*")
        .order("date", { ascending: true })
        .limit(30)
        .returns<SleepCombinedData[]>()

      if (error) throw error
      return data
    },
  })

  const chartData = sleepAnalytics?.map(record => ({
    date: format(new Date(record.date), "MMM dd"),
    sleepHours: record.total_sleep_hours,
    quality: record.average_quality,
    efficiency: record.sleep_efficiency,
    consistency: record.consistency_score,
  }))

  const getLatestMetric = (metric: keyof SleepAnalyticsSummary): number | null => {
    if (!sleepAnalytics?.length) return null
    const value = sleepAnalytics[sleepAnalytics.length - 1][metric]
    return typeof value === 'number' ? value : null
  }

  const formatMetric = (value: number | null, decimals: number = 1): string => {
    return value !== null ? value.toFixed(decimals) : 'N/A'
  }

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-analytics"
      toolType="tracking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sleep Quality
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(getLatestMetric("average_quality"))}/10
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sleep Duration
                </CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(getLatestMetric("total_sleep_hours"))}h
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sleep Debt
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(getLatestMetric("sleep_debt_hours"))}h
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sleep Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sleepHours" 
                        stroke="#8884d8" 
                        name="Sleep Hours"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="quality" 
                        stroke="#82ca9d" 
                        name="Quality"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#ffc658" 
                        name="Efficiency %"
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

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Sleep Efficiency</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatMetric(getLatestMetric("sleep_efficiency"))}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Percentage of time in bed spent sleeping
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Sleep Consistency</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatMetric(getLatestMetric("consistency_score"))}/10
                </div>
                <p className="text-sm text-muted-foreground">
                  Measure of sleep/wake time consistency
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
