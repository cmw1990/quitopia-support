
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Baby, Calendar, Activity, Brain, Heart, Moon, Sun, Droplet, Loader2, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/AuthProvider"
import { PregnancyMilestones } from "@/components/pregnancy/PregnancyMilestones"
import { PregnancyWellnessAnalysis } from "@/components/pregnancy/PregnancyWellnessAnalysis"
import type { PregnancyWellnessCorrelationsRow } from "@/types/supabase"

const PregnancyPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState("overview")
  const { session } = useAuth()

  const { data: pregnancyData, isLoading } = useQuery({
    queryKey: ['pregnancy-tracking'],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('pregnancy_tracking')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching pregnancy data:', error)
        toast({
          title: "Error loading pregnancy data",
          description: "Please try again later",
          variant: "destructive"
        })
        return null
      }

      return data
    },
    enabled: !!session?.user?.id
  })

  const { data: wellnessCorrelations, isLoading: isLoadingWellness } = useQuery<PregnancyWellnessCorrelationsRow>({
    queryKey: ['pregnancy-wellness-correlations'],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('pregnancy_wellness_correlations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) {
        toast({
          title: "Error loading wellness data",
          description: "Please try again later",
          variant: "destructive"
        })
        throw error
      }
      return data
    },
    enabled: !!session?.user?.id
  })

  const handleLogDaily = () => {
    navigate('/pregnancy-log')
    toast({
      title: "Starting daily log",
      description: "Track your pregnancy journey for today",
    })
  }

  const calculateProgress = () => {
    if (!pregnancyData?.due_date) return 0
    const dueDate = new Date(pregnancyData.due_date)
    const today = new Date()
    const totalDays = 280 // Average pregnancy duration in days
    const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)))
    return Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100))
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Please sign in to access pregnancy tracking features</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 container mx-auto p-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-pink-500" />
                Pregnancy Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pregnancyData ? (
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
                      </div>
                      <Progress value={calculateProgress()} className="h-2" />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        {pregnancyData.due_date && (
                          <p className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Due Date: {new Date(pregnancyData.due_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="capitalize flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          Stage: {pregnancyData.current_stage?.replace(/_/g, ' ')}
                        </p>
                        {pregnancyData.healthcare_provider && (
                          <p className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            Provider: {pregnancyData.healthcare_provider}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No pregnancy tracking data found. Would you like to start tracking?</p>
                  <Button onClick={() => navigate('/pregnancy-setup')}>
                    Set Up Tracking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness">
          {isLoadingWellness ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PregnancyWellnessAnalysis correlations={wellnessCorrelations} />
          )}
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-pink-500" />
                Daily Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogDaily}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Log Daily Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <PregnancyMilestones />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PregnancyPage
