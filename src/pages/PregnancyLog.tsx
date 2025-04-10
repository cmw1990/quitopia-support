
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Baby, Activity, Heart, Droplet } from "lucide-react"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

const PregnancyLog = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    weight_kg: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    water_intake_ml: "",
    exercise_minutes: "",
    sleep_quality: 5,
    energy_level: 5,
    mood_rating: 5,
    symptoms: "",
    wellness_notes: ""
  })

  const logMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('pregnancy_logs')
        .insert([{
          ...data,
          date: new Date().toISOString(),
          symptoms: data.symptoms.split(',').map((s: string) => s.trim()).filter(Boolean)
        }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy-logs'] })
      toast({
        title: "Success",
        description: "Your daily log has been recorded"
      })
      navigate('/pregnancy')
    },
    onError: (error) => {
      console.error('Error logging data:', error)
      toast({
        title: "Error",
        description: "Failed to save your log. Please try again.",
        variant: "destructive"
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    logMutation.mutate(formData)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-pink-500" />
            Daily Pregnancy Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  placeholder="Enter weight in kg"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Blood Pressure</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    placeholder="Systolic"
                    value={formData.blood_pressure_systolic}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_systolic: e.target.value }))}
                  />
                  <Input 
                    type="number"
                    placeholder="Diastolic"
                    value={formData.blood_pressure_diastolic}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Water Intake (ml)</Label>
                <Input 
                  type="number"
                  placeholder="Enter water intake in ml"
                  value={formData.water_intake_ml}
                  onChange={(e) => setFormData(prev => ({ ...prev, water_intake_ml: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Exercise Duration (minutes)</Label>
                <Input 
                  type="number"
                  placeholder="Enter exercise duration"
                  value={formData.exercise_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, exercise_minutes: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sleep Quality (1-10)</Label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.sleep_quality]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, sleep_quality: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Energy Level (1-10)</Label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.energy_level]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, energy_level: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Mood Rating (1-10)</Label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.mood_rating]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, mood_rating: value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Symptoms (comma-separated)</Label>
              <Input 
                placeholder="Enter any symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Wellness Notes</Label>
              <Input 
                placeholder="Any additional notes about your wellness today"
                value={formData.wellness_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, wellness_notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Save Log
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/pregnancy')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PregnancyLog
