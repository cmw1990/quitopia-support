
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Activity, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { MetricForm } from "./metrics/MetricForm"
import { MetricChart } from "./metrics/MetricChart"
import { CategorySelect } from "./metrics/CategorySelect"
import type { PregnancyMetric, MetricCategory } from "./metrics/types"

export function PregnancyMetrics() {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>('weight')

  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['pregnancy-metrics', selectedCategory],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('pregnancy_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('metric_category', selectedCategory)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching metrics:', error)
        toast({
          title: "Error loading metrics",
          description: "Failed to load your pregnancy metrics",
          variant: "destructive"
        })
        return null
      }

      return data.map(metric => ({
        id: metric.id,
        user_id: metric.user_id,
        date: metric.created_at,
        value: metric.value,
        notes: metric.notes || '',
        category: metric.category,
        metric_category: metric.metric_category,
        metric_type: metric.metric_category, // Map metric_category to metric_type for consistency
        created_at: metric.created_at
      })) as PregnancyMetric[]
    },
    enabled: !!session?.user?.id,
    retry: 2,
    staleTime: 30000,
  })

  const addMetricMutation = useMutation({
    mutationFn: async (metricData: { value: number, notes: string }) => {
      if (!session?.user?.id) throw new Error("Not authenticated")
      
      const { data, error } = await supabase
        .from('pregnancy_metrics')
        .insert([{
          user_id: session.user.id,
          value: metricData.value,
          notes: metricData.notes,
          metric_category: selectedCategory,
          metric_type: selectedCategory, // Use selectedCategory as metric_type
          category: selectedCategory,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy-metrics'] })
      toast({
        title: "Success",
        description: "Metric added successfully",
      })
    },
    onError: (error) => {
      console.error('Error adding metric:', error)
      toast({
        title: "Error",
        description: "Failed to add metric. Please try again.",
        variant: "destructive"
      })
    }
  })

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load metrics. Please try again later.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-pink-500" />
          Pregnancy Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <CategorySelect 
              value={selectedCategory} 
              onChange={(value) => setSelectedCategory(value)} 
            />
            <MetricForm
              selectedCategory={selectedCategory}
              isSubmitting={addMetricMutation.isPending}
              onSubmit={(values) => addMetricMutation.mutate(values)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : metrics && metrics.length > 0 ? (
            <MetricChart data={metrics} selectedCategory={selectedCategory} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {selectedCategory} data recorded yet. Start tracking your progress!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
