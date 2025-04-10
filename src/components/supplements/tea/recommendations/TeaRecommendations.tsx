
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Battery, Heart, Moon } from "lucide-react"

interface TeaRecommendation {
  id: string
  tea_id: string
  goal_type: 'mood' | 'focus' | 'energy' | 'sleep'
  effectiveness_score: number
  scientific_evidence: string[]
  contraindications: string[]
  optimal_time_of_day: string[]
  herbal_tea: {
    name: string
    description: string
    category: string
  }
}

export function TeaRecommendations() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['tea-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_recommendations')
        .select(`
          *,
          herbal_tea:herbal_teas(
            name,
            description,
            category
          )
        `)
        .order('effectiveness_score', { ascending: false })
      
      if (error) throw error
      return data as TeaRecommendation[]
    }
  })

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case 'mood':
        return <Heart className="h-4 w-4" />
      case 'focus':
        return <Brain className="h-4 w-4" />
      case 'energy':
        return <Battery className="h-4 w-4" />
      case 'sleep':
        return <Moon className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Teas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div 
              key={rec.id} 
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{rec.herbal_tea?.name}</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getGoalIcon(rec.goal_type)}
                    {rec.goal_type.charAt(0).toUpperCase() + rec.goal_type.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {rec.herbal_tea?.description}
                </p>
                {rec.optimal_time_of_day && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.optimal_time_of_day.map((time) => (
                      <Badge key={time} variant="outline">
                        Best time: {time}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {rec.effectiveness_score}/10
                </div>
                <div className="text-sm text-muted-foreground">
                  Effectiveness
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
