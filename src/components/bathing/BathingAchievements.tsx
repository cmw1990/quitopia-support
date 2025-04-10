
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useQuery } from "@tanstack/react-query"
import { Trophy, Award, Star } from "lucide-react"

interface BathingAchievement {
  id: string
  achievement_type: string
  achieved_at: string
  streak_count: number
  total_sessions: number
}

const achievementConfig = {
  first_session: {
    title: "First Splash",
    description: "Completed your first bathing session",
    icon: Award,
  },
  novice_bather: {
    title: "Novice Bather",
    description: "Completed 10 bathing sessions",
    icon: Star,
  },
  regular_bather: {
    title: "Regular Bather",
    description: "Completed 25 bathing sessions",
    icon: Star,
  },
  expert_bather: {
    title: "Expert Bather",
    description: "Completed 50 bathing sessions",
    icon: Trophy,
  },
  master_bather: {
    title: "Master Bather",
    description: "Completed 100 bathing sessions",
    icon: Trophy,
  },
}

export const BathingAchievements = () => {
  const { session } = useAuth()

  const { data: achievements } = useQuery({
    queryKey: ['bathingAchievements'],
    queryFn: async (): Promise<BathingAchievement[]> => {
      if (!session?.user?.id) return []

      const { data, error } = await supabase
        .from('bathing_achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('achieved_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!session?.user?.id
  })

  if (!achievements?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Start your bathing journey to earn achievements!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => {
            const config = achievementConfig[achievement.achievement_type as keyof typeof achievementConfig]
            if (!config) return null
            
            const Icon = config.icon
            
            return (
              <Card key={achievement.id} className="bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{config.title}</h4>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
