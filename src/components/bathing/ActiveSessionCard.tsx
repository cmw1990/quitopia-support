
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplet } from "lucide-react"
import { MoodDisplay } from "@/components/meditation/MoodDisplay"

interface ActiveSessionProps {
  moodBefore: number
  energyBefore: number
  onEndSession: (moodAfter: number, energyAfter: number) => void
}

export const ActiveSessionCard = ({ moodBefore, energyBefore, onEndSession }: ActiveSessionProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Active Session
        </CardTitle>
        <CardDescription>
          Track your mood and energy levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MoodDisplay 
          mood={{
            mood_score: moodBefore,
            energy_level: energyBefore / 10,
          }}
        />
        <Button 
          className="w-full"
          onClick={() => onEndSession(7, 8)}
        >
          End Session
        </Button>
      </CardContent>
    </Card>
  )
}
