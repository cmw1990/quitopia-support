
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface CustomRoutineFormProps {
  onSuccess?: () => void
}

export const CustomRoutineForm = ({ onSuccess }: CustomRoutineFormProps) => {
  const { session } = useAuth()
  const { toast } = useToast()
  const [isPublic, setIsPublic] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: "",
    water_temperature: "",
    steps: "",
    benefits: "",
    mood_tags: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) return

    try {
      const { error } = await supabase
        .from("bathing_routines")
        .insert({
          name: formData.name,
          description: formData.description,
          duration_minutes: parseInt(formData.duration_minutes),
          water_temperature: formData.water_temperature,
          steps: formData.steps.split('\n').filter(Boolean),
          benefits: formData.benefits.split('\n').filter(Boolean),
          mood_tags: formData.mood_tags.split(',').map(tag => tag.trim()),
          creator_id: session.user.id,
          is_public: isPublic
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your custom routine has been created",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error creating routine:", error)
      toast({
        title: "Error",
        description: "Failed to create custom routine",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Custom Routine</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="temperature">Water Temperature</Label>
            <Input
              id="temperature"
              value={formData.water_temperature}
              onChange={(e) => setFormData({ ...formData, water_temperature: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="steps">Steps (one per line)</Label>
            <Textarea
              id="steps"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="mood_tags">Mood Tags (comma-separated)</Label>
            <Input
              id="mood_tags"
              value={formData.mood_tags}
              onChange={(e) => setFormData({ ...formData, mood_tags: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make this routine public</Label>
          </div>

          <Button type="submit" className="w-full">
            Create Routine
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
