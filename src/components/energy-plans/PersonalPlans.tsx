
import { Plan, ProgressRecord } from "@/types/energyPlans"
import { PlanList } from "./PlanList"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Card, CardContent } from "@/components/ui/card"

interface PersonalPlansProps {
  onSharePlan: (plan: Plan) => void
  progress?: ProgressRecord[]
}

export const PersonalPlans = ({ onSharePlan, progress }: PersonalPlansProps) => {
  const { session } = useAuth()

  const { data: myPlans, isLoading: isLoadingMyPlans } = useQuery<Plan[]>({
    queryKey: ['energy-plans', 'my-plans', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const { data, error } = await supabase
        .from('energy_plans')
        .select(`
          *,
          energy_plan_components (*)
        `)
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Plan[]
    },
    enabled: !!session?.user?.id
  })

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Please sign in to view your plans</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <PlanList
      plans={myPlans}
      progress={progress}
      isLoading={isLoadingMyPlans}
      onSharePlan={onSharePlan}
    />
  )
}
