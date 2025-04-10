
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Bath, Droplet } from "lucide-react"

interface BathingLog {
  id: string
  created_at: string
  routine_id: string | null
  mood_before: number
  mood_after: number
  energy_level_before: number
  energy_level_after: number
  duration_minutes: number
  water_temperature: string
  notes: string | null
  routine: {
    name: string
  } | null
}

export const BathingHistory = () => {
  const { session } = useAuth()

  const { data: logs } = useQuery({
    queryKey: ['bathingLogs'],
    queryFn: async (): Promise<BathingLog[]> => {
      if (!session?.user?.id) return []

      const { data, error } = await supabase
        .from('user_bathing_logs')
        .select(`
          *,
          routine:routine_id (
            name
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    },
    enabled: !!session?.user?.id
  })

  if (!logs?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No bathing sessions recorded yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bath className="h-5 w-5" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {log.routine?.name || "Custom Session"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(log.created_at), 'PPP')}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {log.duration_minutes}min
                  </span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">Mood:</span>
                  <span className="font-medium">
                    +{log.mood_after - log.mood_before}
                  </span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">Energy:</span>
                  <span className="font-medium">
                    +{log.energy_level_after - log.energy_level_before}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
