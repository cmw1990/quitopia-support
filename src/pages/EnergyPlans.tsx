import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlanFilters } from "@/components/energy-plans/PlanFilters"
import { NewPlanDialog } from "@/components/energy-plans/NewPlanDialog"
import { CelebrityPlanGallery } from "@/components/energy-plans/CelebrityPlanGallery"
import { PlanDiscovery } from "@/components/energy-plans/PlanDiscovery"
import { PersonalPlans } from "@/components/energy-plans/PersonalPlans"
import { SavedPlans } from "@/components/energy-plans/SavedPlans"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Baby, Brain } from "lucide-react"
import type { Plan, PlanCategory, ProgressRecord } from "@/types/energyPlans"
import type { Database } from "@/types/supabase"

type UserLifeSituationRow = Database['public']['Tables']['user_life_situations']['Row']

const EnergyPlans = () => {
  const { session } = useAuth()
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState("discover")
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory | null>(null)
  const [showLifeSituationDialog, setShowLifeSituationDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: lifeSituation } = useQuery({
    queryKey: ['user-life-situation', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('user_life_situations')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()
      
      if (error) throw error
      return data as UserLifeSituationRow | null
    },
    enabled: !!session?.user?.id
  })

  const { data: planProgress } = useQuery<ProgressRecord[]>({
    queryKey: ['energy-plans', 'progress', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const { data, error } = await supabase
        .from('energy_plan_progress')
        .select('*')
        .eq('user_id', session.user.id)
      
      if (error) throw error
      return data as ProgressRecord[]
    },
    enabled: !!session?.user?.id
  })

  const { data: celebrityPlans, isLoading: isLoadingCelebrity } = useQuery<Plan[]>({
    queryKey: ['energy-plans', 'celebrity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_plans')
        .select(`
          *,
          energy_plan_components (*)
        `)
        .eq('is_expert_plan', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Plan[]
    }
  })

  const { data: savedPlans } = useQuery<Plan[]>({
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

  const savePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!session?.user) throw new Error("Not authenticated")
      
      const { error } = await supabase
        .from('user_saved_plans')
        .insert({
          user_id: session.user.id,
          plan_id: planId
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-plans', 'saved'] })
      toast({
        title: "Plan Saved",
        description: "The energy plan has been saved to your collection"
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the plan",
        variant: "destructive"
      })
    }
  })

  const sharePlanMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      if (!session?.user) throw new Error("Not authenticated")
      
      const { error } = await supabase
        .from('energy_plans')
        .update({ visibility: 'public' })
        .eq('id', plan.id)
        .eq('created_by', session.user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-plans'] })
      toast({
        title: "Plan Shared",
        description: "Your plan is now visible to others"
      })
    }
  })

  const updateLifeSituationMutation = useMutation({
    mutationFn: async (situation: UserLifeSituationRow['situation']) => {
      if (!session?.user) throw new Error("Not authenticated")
      
      const { error } = await supabase
        .from('user_life_situations')
        .upsert({
          user_id: session.user.id,
          situation,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-life-situation'] })
      queryClient.invalidateQueries({ queryKey: ['energy-plans'] })
      toast({
        title: "Preferences Updated",
        description: "Your energy plans will be tailored to your current situation"
      })
      setShowLifeSituationDialog(false)
    }
  })

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Energy Plans</h1>
          <p className="text-muted-foreground">
            Discover and share energy optimization plans
          </p>
        </div>
        <div className="flex gap-4">
          <Dialog open={showLifeSituationDialog} onOpenChange={setShowLifeSituationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {lifeSituation?.situation === 'pregnancy' ? <Baby className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                Update Life Situation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Your Current Life Situation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <RadioGroup 
                  onValueChange={(value) => updateLifeSituationMutation.mutate(value as UserLifeSituationRow['situation'])}
                  defaultValue={lifeSituation?.situation || "regular"}
                  className="gap-4"
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Regular Energy Management</div>
                      <div className="text-sm text-muted-foreground">Standard energy and focus optimization</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value="pregnancy" id="pregnancy" />
                    <Label htmlFor="pregnancy" className="flex-1 cursor-pointer">
                      <div className="font-semibold flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Pregnancy
                      </div>
                      <div className="text-sm text-muted-foreground">Tailored energy plans for pregnancy</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value="postpartum" id="postpartum" />
                    <Label htmlFor="postpartum" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Postpartum Recovery</div>
                      <div className="text-sm text-muted-foreground">Support for the postpartum period</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value="breastfeeding" id="breastfeeding" />
                    <Label htmlFor="breastfeeding" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Breastfeeding</div>
                      <div className="text-sm text-muted-foreground">Energy support during breastfeeding</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </DialogContent>
          </Dialog>
          <PlanFilters 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <NewPlanDialog onPlanCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['energy-plans'] })
          }} />
        </div>
      </div>

      <CelebrityPlanGallery
        plans={celebrityPlans}
        onSavePlan={(id) => savePlanMutation.mutate(id)}
        savedPlans={savedPlans}
      />

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="discover">Discover Plans</TabsTrigger>
          <TabsTrigger value="my-plans">My Plans</TabsTrigger>
          <TabsTrigger value="saved">Saved Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          <PlanDiscovery
            selectedCategory={selectedCategory}
            progress={planProgress}
            onSavePlan={(id) => savePlanMutation.mutate(id)}
            savedPlans={savedPlans}
            currentLifeSituation={lifeSituation?.situation}
          />
        </TabsContent>

        <TabsContent value="my-plans">
          <PersonalPlans
            progress={planProgress}
            onSharePlan={(plan) => sharePlanMutation.mutate(plan)}
          />
        </TabsContent>

        <TabsContent value="saved">
          <SavedPlans progress={planProgress} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnergyPlans
