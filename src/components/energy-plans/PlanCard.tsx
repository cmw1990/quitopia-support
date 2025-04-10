
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plan, ProgressRecord } from "@/types/energyPlans"
import { Brain, Coffee, Flower, Heart, Moon, Share2, Star, Sun, Timer, Target, Wind, Zap, CircleUser } from "lucide-react"

const PlanTypeIcons: Record<string, any> = {
  energizing_boost: Zap,
  sustained_focus: Coffee,
  mental_clarity: Brain,
  physical_vitality: Target,
  deep_relaxation: Flower,
  stress_relief: Heart,
  evening_winddown: Wind,
  sleep_preparation: Moon,
  meditation: Sun,
}

const CategoryColors = {
  charged: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
  recharged: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
} as const

interface PlanCardProps {
  plan: Plan
  progress?: ProgressRecord[]
  onSave?: (planId: string) => void
  onShare?: (plan: Plan) => void
  isSaved?: boolean
  showActions?: boolean
}

export const PlanCard = ({ 
  plan, 
  progress, 
  onSave, 
  onShare, 
  isSaved, 
  showActions = true 
}: PlanCardProps) => {
  const Icon = PlanTypeIcons[plan.plan_type] || Brain
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const calculateProgress = () => {
    if (!progress || !plan.energy_plan_components?.length) return 0
    const completedSteps = progress.filter(p => p.plan_id === plan.id && p.completed_at).length
    return (completedSteps / plan.energy_plan_components.length) * 100
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">{plan.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" 
              className={`${CategoryColors[plan.category]} transition-colors`}
            >
              {plan.category === 'charged' ? 'Energy Boost' : 'Recovery & Rest'}
            </Badge>
            {plan.is_expert_plan && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                Expert Plan
              </Badge>
            )}
            {plan.celebrity_name && (
              <Badge variant="outline" className="gap-1 py-1 bg-primary/5">
                <CircleUser className="h-3 w-3" />
                {plan.celebrity_name}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="mt-2">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4 flex-shrink-0" />
              <span>{plan.estimated_duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 flex-shrink-0" />
              <span>Energy Level {plan.energy_level_required}/10</span>
            </div>
          </div>

          {(plan.recommended_time_of_day?.length || plan.suitable_contexts?.length) && (
            <div className="space-y-2">
              {plan.recommended_time_of_day?.length ? (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Best Times</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.recommended_time_of_day.map(time => (
                      <Badge key={time} variant="outline">{time}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {plan.suitable_contexts?.length ? (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Perfect For</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.suitable_contexts.map(context => (
                      <Badge key={context} variant="outline">{context}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          
          {plan.tags.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Tags</div>
              <div className="flex flex-wrap gap-2">
                {plan.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-primary/5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {progress && progress.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Progress</div>
              <Progress value={calculateProgress()} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {Math.round(calculateProgress())}% Complete
              </div>
            </div>
          )}
          
          {showActions && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {plan.likes_count} likes
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  {plan.saves_count} saves
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isSaved && onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSave(plan.id)}
                    className="gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Save Plan
                  </Button>
                )}
                
                {onShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare(plan)}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                )}
                
                <Button size="sm" className="gap-2">
                  View Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
