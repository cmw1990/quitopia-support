
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useQuery } from "@tanstack/react-query"
import { Activity, Droplets, Timer } from "lucide-react"

interface BathingStats {
  totalSessions: number
  averageDuration: number
  averageMoodImprovement: number
  averageEnergyImprovement: number
}

export const BathingStats = () => {
  const { session } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['bathingStats'],
    queryFn: async (): Promise<BathingStats> => {
      if (!session?.user?.id) return {
        totalSessions: 0,
        averageDuration: 0,
        averageMoodImprovement: 0,
        averageEnergyImprovement: 0
      }

      const { data, error } = await supabase
        .from('user_bathing_logs')
        .select('duration_minutes, mood_before, mood_after, energy_level_before, energy_level_after')
        .eq('user_id', session.user.id)

      if (error) throw error

      if (!data?.length) return {
        totalSessions: 0,
        averageDuration: 0,
        averageMoodImprovement: 0,
        averageEnergyImprovement: 0
      }

      const totalSessions = data.length
      const averageDuration = data.reduce((acc, log) => acc + (log.duration_minutes || 0), 0) / totalSessions
      const averageMoodImprovement = data.reduce((acc, log) => 
        acc + ((log.mood_after || 0) - (log.mood_before || 0)), 0) / totalSessions
      const averageEnergyImprovement = data.reduce((acc, log) => 
        acc + ((log.energy_level_after || 0) - (log.energy_level_before || 0)), 0) / totalSessions

      return {
        totalSessions,
        averageDuration,
        averageMoodImprovement,
        averageEnergyImprovement
      }
    },
    enabled: !!session?.user?.id
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats?.averageDuration || 0)} min
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mood Improvement</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            +{stats?.averageMoodImprovement.toFixed(1) || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Energy Improvement</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            +{stats?.averageEnergyImprovement.toFixed(1) || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
