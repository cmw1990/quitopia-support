
import { TopNav } from "@/components/layout/TopNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wind, Play, Pause, RotateCcw } from "lucide-react"

type BreathingPattern = {
  name: string
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  description: string
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: "Box Breathing",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    description: "Equal parts inhale, hold, exhale, and hold. Great for stress relief and focus."
  },
  {
    name: "4-7-8 Breathing",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    description: "Inhale for 4, hold for 7, exhale for 8. Helps with anxiety and sleep."
  },
  {
    name: "Relaxing Breath",
    inhale: 5,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    description: "Long exhale promotes relaxation and helps calm the nervous system."
  }
]

export default function BreathingExercises() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0])
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [timeLeft, setTimeLeft] = useState(0)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Move to next phase
            switch (phase) {
              case "inhale":
                setPhase("hold1")
                return selectedPattern.hold1
              case "hold1":
                setPhase("exhale")
                return selectedPattern.exhale
              case "exhale":
                if (selectedPattern.hold2 > 0) {
                  setPhase("hold2")
                  return selectedPattern.hold2
                }
                setPhase("inhale")
                setCycles(c => c + 1)
                return selectedPattern.inhale
              case "hold2":
                setPhase("inhale")
                setCycles(c => c + 1)
                return selectedPattern.inhale
            }
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, phase, selectedPattern])

  const startBreathing = () => {
    setIsActive(true)
    setPhase("inhale")
    setTimeLeft(selectedPattern.inhale)
    setCycles(0)
  }

  const resetBreathing = () => {
    setIsActive(false)
    setPhase("inhale")
    setTimeLeft(0)
    setCycles(0)
  }

  const getInstructions = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In"
      case "hold1":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      case "hold2":
        return "Hold"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wind className="h-6 w-6 text-primary" />
              <CardTitle>Breathing Exercises</CardTitle>
            </div>
            <CardDescription>
              Follow guided breathing patterns to reduce stress and increase focus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Breathing Pattern</label>
                <Select
                  value={selectedPattern.name}
                  onValueChange={(value) => {
                    const pattern = breathingPatterns.find(p => p.name === value)
                    if (pattern) {
                      setSelectedPattern(pattern)
                      resetBreathing()
                    }
                  }}
                  disabled={isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {breathingPatterns.map((pattern) => (
                      <SelectItem key={pattern.name} value={pattern.name}>
                        {pattern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {selectedPattern.description}
                </p>
              </div>

              <div className="relative flex flex-col items-center justify-center p-20">
                <div className={`absolute w-48 h-48 rounded-full border-4 transition-all duration-1000 ${
                  isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-50'
                } ${
                  phase === 'inhale' ? 'border-blue-500 scale-110' :
                  phase === 'exhale' ? 'border-green-500 scale-90' :
                  'border-purple-500'
                }`} />
                
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">
                    {isActive ? timeLeft : "0"}
                  </div>
                  <div className="text-xl font-medium">
                    {isActive ? getInstructions() : "Ready"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cycles completed: {cycles}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => isActive ? setIsActive(false) : startBreathing()}
                  className="w-32"
                >
                  {isActive ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" /> Start
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetBreathing}
                  variant="outline"
                  className="w-32"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
