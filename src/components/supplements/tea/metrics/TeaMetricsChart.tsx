
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface TeaMetric {
  consumed_at: string
  mood_before: number
  mood_after: number
  energy_before: number
  energy_after: number
  focus_before: number
  focus_after: number
}

export function TeaMetricsChart() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['tea-metrics-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_metrics')
        .select('*')
        .order('consumed_at', { ascending: true })
        .limit(14)
        .returns<TeaMetric[]>()
      
      if (error) throw error
      return data
    }
  })

  const chartData = metrics?.map(metric => ({
    date: format(new Date(metric.consumed_at), 'MMM d'),
    moodImprovement: metric.mood_after - metric.mood_before,
    energyImprovement: metric.energy_after - metric.energy_before,
    focusImprovement: metric.focus_after - metric.focus_before,
  }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading metrics...</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded w-full h-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tea Effects Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="moodImprovement" 
                stroke="#e11d48" 
                name="Mood"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="energyImprovement" 
                stroke="#eab308" 
                name="Energy"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="focusImprovement" 
                stroke="#0ea5e9" 
                name="Focus"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
