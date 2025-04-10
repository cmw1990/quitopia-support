
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { Clock, Calendar } from "lucide-react"

interface BathingReminder {
  id: string
  routine_id: string | null
  reminder_time: string
  days_of_week: string[]
  is_active: boolean
  routine?: {
    name: string
  } | null
}

export const BathingReminders = () => {
  const { session } = useAuth()
  const { toast } = useToast()

  const { data: reminders, refetch } = useQuery({
    queryKey: ['bathingReminders'],
    queryFn: async (): Promise<BathingReminder[]> => {
      if (!session?.user?.id) return []

      const { data, error } = await supabase
        .from('bathing_reminders')
        .select(`
          *,
          routine:routine_id (
            name
          )
        `)
        .eq('user_id', session.user.id)

      if (error) throw error
      return data || []
    },
    enabled: !!session?.user?.id
  })

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('bathing_reminders')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error

      refetch()
      toast({
        title: isActive ? "Reminder activated" : "Reminder deactivated",
        description: `The reminder has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      })
    } catch (error) {
      console.error("Error toggling reminder:", error)
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      })
    }
  }

  if (!reminders?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Bathing Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No reminders set yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Bathing Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {reminder.routine?.name || "Custom Reminder"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{reminder.reminder_time}</span>
                  <Calendar className="h-4 w-4 ml-2" />
                  <span>{reminder.days_of_week.join(", ")}</span>
                </div>
              </div>
              <Switch
                checked={reminder.is_active}
                onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
