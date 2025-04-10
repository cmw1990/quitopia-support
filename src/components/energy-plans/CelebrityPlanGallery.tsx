
import { Plan } from "@/types/energyPlans"
import { PlanCard } from "./PlanCard"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Star } from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"

interface CelebrityPlanGalleryProps {
  plans?: Plan[]
  onSavePlan?: (planId: string) => void
  onSharePlan?: (plan: Plan) => void
  savedPlans?: Plan[]
}

export const CelebrityPlanGallery = ({
  plans,
  onSavePlan,
  onSharePlan,
  savedPlans
}: CelebrityPlanGalleryProps) => {
  if (!plans?.length) return null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle>Celebrity Energy Recipes</CardTitle>
          </div>
          <CardDescription>
            Explore energy optimization routines inspired by notable figures. 
            Note: These recipes are based on publicly available information and may not be 100% accurate.
          </CardDescription>
        </CardHeader>
      </Card>

      <ScrollArea className="w-full whitespace-nowrap rounded-xl">
        <div className="flex w-full space-x-4 pb-4">
          {plans.map(plan => (
            <div key={plan.id} className="w-[600px] shrink-0 transition-transform hover:scale-[1.02]">
              <PlanCard
                plan={plan}
                onSave={onSavePlan}
                onShare={onSharePlan}
                isSaved={savedPlans?.some(saved => saved.id === plan.id)}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
