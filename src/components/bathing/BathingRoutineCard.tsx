
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bath } from "lucide-react"

interface BathingRoutine {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  water_temperature: string
  steps: string[]
  benefits: string[]
  mood_tags: string[]
  scientific_sources: string[] | null
}

interface BathingRoutineCardProps {
  routine: BathingRoutine
  onStartRoutine: (routine: BathingRoutine) => void
}

export const BathingRoutineCard = ({ routine, onStartRoutine }: BathingRoutineCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bath className="h-5 w-5 text-blue-500" />
          {routine.name}
        </CardTitle>
        <CardDescription>{routine.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Steps:</h4>
          <ul className="list-disc pl-4 space-y-1">
            {routine.steps.map((step, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          {routine.mood_tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={() => onStartRoutine(routine)}
        >
          Start Routine
        </Button>
      </CardContent>
    </Card>
  )
}
