
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { Zap, Timer, BarChart } from "lucide-react"

export default function ReactionTime() {
  const [status, setStatus] = useState<'waiting' | 'ready' | 'started' | 'finished'>('waiting')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)

  const startTest = useCallback(() => {
    setStatus('ready')
    const timeout = setTimeout(() => {
      setStatus('started')
      setStartTime(Date.now())
    }, Math.random() * 3000 + 1000) // Random delay between 1-4 seconds
    setTimeoutId(timeout)
  }, [])

  const handleClick = () => {
    if (status === 'waiting') {
      startTest()
    } else if (status === 'ready') {
      // Clicked too early
      if (timeoutId) clearTimeout(timeoutId)
      setStatus('waiting')
      setReactionTime(null)
    } else if (status === 'started') {
      const endTime = Date.now()
      const time = endTime - startTime
      setReactionTime(time)
      if (!bestTime || time < bestTime) {
        setBestTime(time)
      }
      setStatus('finished')
    } else if (status === 'finished') {
      setStatus('waiting')
      setReactionTime(null)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <CardTitle>Reaction Time Test</CardTitle>
            </div>
            <CardDescription>
              Test your reaction speed! Click when the screen turns green.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              onClick={handleClick}
              className={`
                w-full h-64 rounded-lg flex items-center justify-center cursor-pointer transition-colors
                ${status === 'waiting' ? 'bg-blue-100 dark:bg-blue-900' : ''}
                ${status === 'ready' ? 'bg-red-100 dark:bg-red-900' : ''}
                ${status === 'started' ? 'bg-green-100 dark:bg-green-900' : ''}
                ${status === 'finished' ? 'bg-purple-100 dark:bg-purple-900' : ''}
              `}
            >
              <div className="text-center space-y-4">
                {status === 'waiting' && (
                  <div className="space-y-2">
                    <Button size="lg" className="px-8">
                      Click to Start
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Click anywhere when you're ready
                    </p>
                  </div>
                )}
                {status === 'ready' && (
                  <div className="space-y-2">
                    <Timer className="h-12 w-12 mx-auto animate-pulse text-red-500" />
                    <p className="text-lg font-semibold">Wait for green...</p>
                  </div>
                )}
                {status === 'started' && (
                  <div className="space-y-2">
                    <Zap className="h-12 w-12 mx-auto text-green-500" />
                    <p className="text-lg font-semibold">Click Now!</p>
                  </div>
                )}
                {status === 'finished' && reactionTime && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">{reactionTime}ms</p>
                      <p className="text-sm text-muted-foreground">Your reaction time</p>
                    </div>
                    {bestTime && (
                      <div>
                        <BarChart className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Best: {bestTime}ms</p>
                      </div>
                    )}
                    <Button onClick={() => setStatus('waiting')} size="sm">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
