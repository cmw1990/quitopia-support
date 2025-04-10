
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Clock } from "lucide-react"
import { addMinutes, format, parse, set } from "date-fns"

export default function SleepCalculator() {
  const [wakeUpTime, setWakeUpTime] = useState("07:00")
  const [bedTime, setBedTime] = useState("23:00")
  const [cycles, setCycles] = useState<string[]>([])

  const calculateSleepCycles = (time: string, isWakeUp: boolean) => {
    const baseDate = new Date()
    const timeDate = parse(time, "HH:mm", baseDate)
    const cycleLength = 90 // minutes per sleep cycle
    const cycles: string[] = []

    for (let i = 0; i < 6; i++) {
      const cycleTime = isWakeUp
        ? addMinutes(timeDate, -(i + 1) * cycleLength - 15) // 15 min to fall asleep
        : addMinutes(timeDate, i * cycleLength + 15)
      cycles.push(format(cycleTime, "HH:mm"))
    }

    setCycles(isWakeUp ? cycles.reverse() : cycles)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-6 w-6 text-blue-500" />
              <CardTitle>Sleep Cycle Calculator</CardTitle>
            </div>
            <CardDescription>
              Calculate optimal bedtime or wake-up time based on sleep cycles. Each cycle is approximately 90 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>I want to wake up at:</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value)}
                    />
                    <Button 
                      onClick={() => calculateSleepCycles(wakeUpTime, true)}
                      className="w-32"
                    >
                      Calculate
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>I want to go to bed at:</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                    />
                    <Button 
                      onClick={() => calculateSleepCycles(bedTime, false)}
                      className="w-32"
                    >
                      Calculate
                    </Button>
                  </div>
                </div>
              </div>

              {cycles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommended Times</CardTitle>
                    <CardDescription>
                      For optimal rest, try to wake up at the end of a sleep cycle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cycles.map((time, index) => (
                        <div 
                          key={time} 
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/10"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{time}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {index + 1} cycles
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
