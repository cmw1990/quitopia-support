
import { useAuth } from "@/components/AuthProvider"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Leaf } from "lucide-react"
import { TeaHistoryCard } from "../TeaHistoryCard"

export function TeaHistoryTab() {
  const { session } = useAuth()

  const { data: logs, isLoading } = useQuery({
    queryKey: ['tea-logs'],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from('herbal_tea_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('consumed_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const getEffectivityBadgeColor = (rating: number) => {
    if (rating >= 4) return "default"
    if (rating >= 3) return "secondary"
    return "outline"
  }

  if (!logs?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Leaf className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No tea intake logged yet</p>
            <p className="text-sm text-muted-foreground">Start tracking your tea consumption to see your history here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {logs.map((log) => (
          <TeaHistoryCard 
            key={log.id} 
            log={log} 
            getEffectivityBadgeColor={getEffectivityBadgeColor}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
