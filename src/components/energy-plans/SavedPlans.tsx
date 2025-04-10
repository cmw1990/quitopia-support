
import { Plan, ProgressRecord } from "@/types/energyPlans"
import { PlanList } from "./PlanList"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Card, CardContent } from "@/components/ui/card"

interface SavedPlansProps {
  progress?: ProgressRecord[]
}

export const SavedPlans = ({ progress }: SavedPlansProps) => {
  const { session } = useAuth()

  const { data: savedPlans, isLoading: isLoadingSaved } = useQuery<Plan[]>({
    queryKey: ['energy-plans', 'saved', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const { data, error } = await supabase
        .from('user_saved_plans')
        .select(`
          plan_id,
          energy_plans (
            *,
            energy_plan_components (*)
          )
        `)
        .eq('user_id', session.user.id)
      
      if (error) throw error
      return data.map(item => item.energy_plans) as Plan[]
    },
    enabled: !!session?.user?.id
  })

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Please sign in to view saved plans</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <PlanList
      plans={savedPlans}
      progress={progress}
      isLoading={isLoadingSaved}
    />
  )
}
