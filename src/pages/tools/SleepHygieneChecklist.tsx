
import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

interface SleepHygieneItem {
  id: string
  user_id: string
  date: string
  no_caffeine_after_2pm: boolean
  exercise_completed: boolean
  no_screens_before_bed: boolean
  bedroom_temperature_optimal: boolean
  dark_room: boolean
  quiet_environment: boolean
  relaxation_routine_completed: boolean
  created_at: string
  updated_at: string
}

type Database = {
  public: {
    Tables: {
      sleep_hygiene_checklist: {
        Row: SleepHygieneItem
      }
    }
  }
}

export default function SleepHygieneChecklist() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['sleep_hygiene_checklist'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('sleep_hygiene_checklist')
        .select('*')
        .eq('date', today)
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sleep hygiene checklist:', error)
        return null
      }
      
      return data as SleepHygieneItem
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: keyof SleepHygieneItem, value: boolean }) => {
      if (!checklist) return null

      const { error } = await supabase
        .from('sleep_hygiene_checklist')
        .update({ [key]: value })
        .eq('id', checklist.id)

      if (error) throw error
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep_hygiene_checklist'] })
      toast({
        title: "Updated",
        description: "Sleep hygiene checklist updated successfully."
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update checklist. Please try again.",
        variant: "destructive"
      })
    }
  })

  const updateChecklist = (key: keyof SleepHygieneItem, value: boolean) => {
    updateMutation.mutate({ key, value })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-hygiene"
      toolType="tracking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-6 w-6" />
                Sleep Hygiene Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caffeine"
                    checked={checklist?.no_caffeine_after_2pm}
                    onCheckedChange={(checked) => updateChecklist('no_caffeine_after_2pm', checked as boolean)}
                  />
                  <label
                    htmlFor="caffeine"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    No caffeine after 2 PM
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exercise"
                    checked={checklist?.exercise_completed}
                    onCheckedChange={(checked) => updateChecklist('exercise_completed', checked as boolean)}
                  />
                  <label
                    htmlFor="exercise"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Exercise completed (not too close to bedtime)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="screens"
                    checked={checklist?.no_screens_before_bed}
                    onCheckedChange={(checked) => updateChecklist('no_screens_before_bed', checked as boolean)}
                  />
                  <label
                    htmlFor="screens"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    No screens at least 1 hour before bed
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temperature"
                    checked={checklist?.bedroom_temperature_optimal}
                    onCheckedChange={(checked) => updateChecklist('bedroom_temperature_optimal', checked as boolean)}
                  />
                  <label
                    htmlFor="temperature"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Bedroom temperature is optimal (60-67°F / 15-19°C)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="darkness"
                    checked={checklist?.dark_room}
                    onCheckedChange={(checked) => updateChecklist('dark_room', checked as boolean)}
                  />
                  <label
                    htmlFor="darkness"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Room is completely dark
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quiet"
                    checked={checklist?.quiet_environment}
                    onCheckedChange={(checked) => updateChecklist('quiet_environment', checked as boolean)}
                  />
                  <label
                    htmlFor="quiet"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Environment is quiet
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="relaxation"
                    checked={checklist?.relaxation_routine_completed}
                    onCheckedChange={(checked) => updateChecklist('relaxation_routine_completed', checked as boolean)}
                  />
                  <label
                    htmlFor="relaxation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Completed relaxation routine
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
