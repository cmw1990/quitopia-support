
import { useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Form = {
  brand: string;
  dosage: string;
  form: "powder" | "capsule" | "liquid" | "tablet";
  timing: string;
  mixedWith: string;
  sideEffects: string;
  effectivenessRating: string;
  notes: string;
}

export function CreatineIntakeForm() {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Form>({
    brand: "",
    dosage: "",
    form: "powder",
    timing: "",
    mixedWith: "",
    sideEffects: "",
    effectivenessRating: "5",
    notes: ""
  })

  const logCreatineMutation = useMutation({
    mutationFn: async (values: Form) => {
      if (!session?.user?.id) throw new Error("User not authenticated")

      const { error } = await supabase
        .from('creatine_logs')
        .insert({
          user_id: session.user.id,
          brand: values.brand,
          dosage_grams: parseFloat(values.dosage),
          form: values.form,
          timing: values.timing,
          mixed_with: values.mixedWith,
          side_effects: values.sideEffects ? values.sideEffects.split(',').map(s => s.trim()) : [],
          effectiveness_rating: parseInt(values.effectivenessRating),
          notes: values.notes,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatine-logs'] })
      toast({
        title: "Success",
        description: "Creatine intake logged successfully",
      })
      setForm({
        brand: "",
        dosage: "",
        form: "powder",
        timing: "",
        mixedWith: "",
        sideEffects: "",
        effectivenessRating: "5",
        notes: ""
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log creatine intake",
        variant: "destructive",
      })
      console.error("Error logging creatine:", error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand || !form.dosage || !form.timing) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    logCreatineMutation.mutate(form)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Creatine Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Enter brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage (grams) *</Label>
              <Input
                id="dosage"
                type="number"
                step="0.1"
                value={form.dosage}
                onChange={e => setForm(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="Enter dosage in grams"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form">Form</Label>
              <Select 
                value={form.form}
                onValueChange={value => setForm(prev => ({ ...prev, form: value as Form["form"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="powder">Powder</SelectItem>
                  <SelectItem value="capsule">Capsule</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="liquid">Liquid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timing">Timing *</Label>
              <Input
                id="timing"
                value={form.timing}
                onChange={e => setForm(prev => ({ ...prev, timing: e.target.value }))}
                placeholder="e.g., pre-workout, with meal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mixedWith">Mixed With</Label>
              <Input
                id="mixedWith"
                value={form.mixedWith}
                onChange={e => setForm(prev => ({ ...prev, mixedWith: e.target.value }))}
                placeholder="e.g., water, juice"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectivenessRating">Effectiveness (1-5)</Label>
              <Select 
                value={form.effectivenessRating}
                onValueChange={value => setForm(prev => ({ ...prev, effectivenessRating: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate effectiveness" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sideEffects">Side Effects (comma-separated)</Label>
            <Input
              id="sideEffects"
              value={form.sideEffects}
              onChange={e => setForm(prev => ({ ...prev, sideEffects: e.target.value }))}
              placeholder="e.g., bloating, water retention"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes"
            />
          </div>

          <Button type="submit" className="w-full">
            Log Intake
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
