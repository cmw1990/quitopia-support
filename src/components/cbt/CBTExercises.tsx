import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabaseGet, supabasePost } from "@/lib/supabaseApiService"

const EMOTION_OPTIONS = [
  "Angry",
  "Anxious",
  "Sad",
  "Happy",
  "Frustrated",
  "Scared",
  "Guilty",
  "Ashamed",
  "Hopeful",
  "Proud",
]

type ExerciseType = "thought_record" | "behavioral_activation" | "cognitive_restructuring" | "problem_solving" | "relaxation"

const CBTExercises = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [exerciseType, setExerciseType] = useState<ExerciseType>("thought_record")
  const [situation, setSituation] = useState("")
  const [thoughts, setThoughts] = useState("")
  const [emotions, setEmotions] = useState<string[]>([])
  const [behaviors, setBehaviors] = useState("")
  const [alternativeThoughts, setAlternativeThoughts] = useState("")
  const [outcome, setOutcome] = useState("")

  const { data: exercises, refetch } = useQuery({
    queryKey: ["cbt-exercises", user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabaseGet<any[]>(
        "cbt_exercises",
        `user_id=eq.${user.id}&select=*&order=created_at.desc`
      )

      if (error) {
        console.error("Error fetching exercises:", error)
        return []
      }
      return data || []
    },
    enabled: !!user?.id
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast({ title: "Not Logged In", description: "Log in to save exercises." })
      return
    }

    const { error } = await supabasePost(
      "cbt_exercises",
      [{
        user_id: user.id,
        exercise_type: exerciseType,
        situation,
        thoughts,
        emotions,
        behaviors,
        alternative_thoughts: alternativeThoughts,
        outcome,
      }]
    )

    if (error) {
      console.error("Error saving exercise:", error)
      toast({
        title: "Error",
        description: "Failed to save exercise. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Exercise saved successfully!",
    })

    // Reset form
    setSituation("")
    setThoughts("")
    setEmotions([])
    setBehaviors("")
    setAlternativeThoughts("")
    setOutcome("")
    refetch()
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">CBT Exercise Journal</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Exercise Type</Label>
              <Select
                value={exerciseType}
                onValueChange={(value: ExerciseType) => setExerciseType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thought_record">Thought Record</SelectItem>
                  <SelectItem value="behavioral_activation">
                    Behavioral Activation
                  </SelectItem>
                  <SelectItem value="cognitive_restructuring">
                    Cognitive Restructuring
                  </SelectItem>
                  <SelectItem value="problem_solving">Problem Solving</SelectItem>
                  <SelectItem value="relaxation">Relaxation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Situation</Label>
              <Textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Describe the situation..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Thoughts</Label>
              <Textarea
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="What thoughts went through your mind?"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Emotions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EMOTION_OPTIONS.map((emotion) => (
                  <Button
                    key={emotion}
                    type="button"
                    variant={emotions.includes(emotion) ? "default" : "outline"}
                    onClick={() => {
                      setEmotions((prev) =>
                        prev.includes(emotion)
                          ? prev.filter((e) => e !== emotion)
                          : [...prev, emotion]
                      )
                    }}
                    className="h-8"
                  >
                    {emotion}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Behaviors</Label>
              <Textarea
                value={behaviors}
                onChange={(e) => setBehaviors(e.target.value)}
                placeholder="What did you do in response?"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Alternative Thoughts</Label>
              <Textarea
                value={alternativeThoughts}
                onChange={(e) => setAlternativeThoughts(e.target.value)}
                placeholder="What are some alternative ways to think about this?"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Outcome</Label>
              <Textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What was the outcome or what did you learn?"
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full">
              Save Exercise
            </Button>
          </div>
        </Card>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold mb-4">Previous Exercises</h3>
        {exercises && exercises.length > 0 ? (
          exercises.map((exercise: any) => (
            <Card key={exercise.id} className="p-4">
              <div className="space-y-2">
                <p className="font-medium">
                  Type: {exercise.exercise_type?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
                <p>
                  <span className="font-medium">Situation:</span> {exercise.situation}
                </p>
                <p>
                  <span className="font-medium">Thoughts:</span> {exercise.thoughts}
                </p>
                <p>
                  <span className="font-medium">Emotions:</span>{" "}
                  {Array.isArray(exercise.emotions) ? exercise.emotions.join(", ") : '-'}
                </p>
                <p>
                  <span className="font-medium">Behaviors:</span>{" "}
                  {exercise.behaviors}
                </p>
                {exercise.alternative_thoughts && (
                  <p>
                    <span className="font-medium">Alternative Thoughts:</span>{" "}
                    {exercise.alternative_thoughts}
                  </p>
                )}
                {exercise.outcome && (
                  <p>
                    <span className="font-medium">Outcome:</span> {exercise.outcome}
                  </p>
                )}
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">
            No previous exercises found.
          </p>
        )}
      </div>
    </div>
  )
}

export default CBTExercises