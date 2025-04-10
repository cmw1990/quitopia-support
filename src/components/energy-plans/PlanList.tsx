
import { Plan, ProgressRecord } from "@/types/energyPlans"
import { PlanCard } from "./PlanCard"
import { Skeleton } from "@/components/ui/skeleton"

export interface PlanListProps {
  plans?: Plan[]
  progress?: ProgressRecord[]
  isLoading?: boolean
  onSavePlan?: (planId: string) => void
  onSharePlan?: (plan: Plan) => void
  savedPlans?: Plan[]
}

export const PlanList = ({ 
  plans,
  progress,
  isLoading,
  onSavePlan,
  onSharePlan,
  savedPlans
}: PlanListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!plans?.length) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="font-semibold mb-2">No Plans Found</h3>
        <p className="text-muted-foreground text-sm">
          {savedPlans ? 
            "You haven't saved any plans yet. Browse the discover section to find plans!" :
            "No plans match your current filters. Try adjusting them or create your own plan!"
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          progress={progress}
          onSave={onSavePlan}
          onShare={onSharePlan}
          isSaved={savedPlans?.some(saved => saved.id === plan.id)}
        />
      ))}
    </div>
  )
}
