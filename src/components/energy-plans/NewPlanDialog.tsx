
import React, { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import type { Plan, PlanType } from "@/types/energyPlans"
import type { Database } from "@/types/supabase"

type EnergyPlan = Database['public']['Tables']['energy_plans']['Insert']

interface NewPlanDialogProps {
  onPlanCreated: () => void
}

export const NewPlanDialog = ({ onPlanCreated }: NewPlanDialogProps) => {
  const { session } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>({
    created_by: session?.user?.id || '',
    title: "",
    description: "",
    plan_type: "mental_clarity",
    category: "charged",
    tags: [],
    visibility: "private",
    recommended_time_of_day: [],
    suitable_contexts: [],
    energy_level_required: 5,
    is_expert_plan: false,
    likes_count: 0,
    saves_count: 0
  })

  const createPlanMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!session?.user) throw new Error("Not authenticated")
      
      const { error } = await supabase
        .from('energy_plans')
        .insert({
          ...data,
          created_by: session.user.id,
        })

      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: "Plan Created",
        description: "Your new energy plan has been created"
      })
      onPlanCreated()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive"
      })
    }
  })

  const timesOfDay = [
    "Early Morning",
    "Morning", 
    "Afternoon",
    "Evening",
    "Night"
  ]

  const contexts = [
    "Work",
    "Study",
    "Exercise", 
    "Social",
    "Home",
    "Travel"
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Energy Plan</DialogTitle>
          <DialogDescription>
            Create a new energy plan to share with others or keep for yourself
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={formData.title}
              onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select 
                value={formData.category}
                onValueChange={val => setFormData(d => ({ ...d, category: val as "charged" | "recharged" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="charged">Charged</SelectItem>
                  <SelectItem value="recharged">Recharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={formData.plan_type}
                onValueChange={val => setFormData(d => ({ ...d, plan_type: val as PlanType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.category === "charged" ? (
                    <>
                      <SelectItem value="quick_boost">Quick Energy Boost</SelectItem>
                      <SelectItem value="sustained_energy">Sustained Focus</SelectItem>
                      <SelectItem value="mental_clarity">Mental Clarity</SelectItem>
                      <SelectItem value="physical_energy">Physical Energy</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="deep_relaxation">Deep Relaxation</SelectItem>
                      <SelectItem value="stress_relief">Stress Relief</SelectItem>
                      <SelectItem value="wind_down">Evening Wind Down</SelectItem>
                      <SelectItem value="sleep_prep">Sleep Preparation</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Energy Level Required (1-10)</Label>
            <Input
              type="number"
              min={1}
              max={10} 
              value={formData.energy_level_required}
              onChange={e => setFormData(d => ({ ...d, energy_level_required: parseInt(e.target.value) }))}
            />
          </div>

          <div>
            <Label>Recommended Times of Day</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {timesOfDay.map(time => (
                <Badge
                  key={time}
                  variant={formData.recommended_time_of_day.includes(time) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setFormData(d => ({
                      ...d,
                      recommended_time_of_day: d.recommended_time_of_day.includes(time)
                        ? d.recommended_time_of_day.filter(t => t !== time)
                        : [...d.recommended_time_of_day, time]
                    }))
                  }}
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Suitable Contexts</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {contexts.map(context => (
                <Badge
                  key={context}
                  variant={formData.suitable_contexts.includes(context) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setFormData(d => ({
                      ...d,
                      suitable_contexts: d.suitable_contexts.includes(context)
                        ? d.suitable_contexts.filter(c => c !== context)
                        : [...d.suitable_contexts, context]
                    }))
                  }}
                >
                  {context}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={val => setFormData(d => ({ ...d, visibility: val as "private" | "public" | "shared" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full"
            onClick={() => createPlanMutation.mutate(formData)}
          >
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
