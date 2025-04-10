
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Calendar } from "lucide-react"

type SleepEntry = {
  id: string
  date: string
  sleep_quality: number
  bedtime: string
  wake_time: string
  user_id: string
  created_at: string
  updated_at: string
}

type Database = {
  public: {
    Tables: {
      sleep_tracking: {
        Row: SleepEntry
      }
    }
  }
}

export default function SleepTracking() {
  const { data: sleepData, isLoading } = useQuery({
    queryKey: ['sleep_tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_tracking')
        .select('*')
        .order('date', { ascending: false })
        .limit(7)
      
      if (error) {
        console.error('Error fetching sleep data:', error)
        return []
      }
      
      return (data || []) as SleepEntry[]
    }
  })

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-tracking"
      toolType="tracking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-6 w-6" />
                Sleep Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Log Bedtime
                </Button>
                <Button className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Log Wake Time
                </Button>
                <Button className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sleep Quality</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading sleep data...</p>
                ) : (
                  <div className="space-y-4">
                    {sleepData?.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center">
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                        <span>{entry.sleep_quality}/5</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Target Sleep Duration</span>
                    <span>8 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Target Bedtime</span>
                    <span>10:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Target Wake Time</span>
                    <span>6:30 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
