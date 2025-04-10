import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Battery, BatteryCharging, Clock, Activity, Zap, Heart, Brain, Coffee, Loader2, AlertCircle, LineChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/AuthProvider"
import { recordEnergyLevel, getEnergyHistory } from "@/lib/energy-db"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface EnergyLog {
  id: string | number
  timestamp: string
  energy_level: number
  activity: string
  notes?: string
  focus_duration?: number
  focus_quality?: number
}

const ACTIVITY_TYPES = [
  { value: "pomodoro", label: "Pomodoro Session" },
  { value: "deepwork", label: "Deep Work" },
  { value: "flowstate", label: "Flow State" },
  { value: "binaural", label: "Binaural Beats" },
  { value: "meditation", label: "Meditation" },
  { value: "rest", label: "Rest Break" },
  { value: "exercise", label: "Exercise" },
  { value: "other", label: "Other" }
]

export function EnergyFocusIntegration() {
  const [activeTab, setActiveTab] = useState("track")
  const [energyLevel, setEnergyLevel] = useState(5)
  const [activity, setActivity] = useState("")
  const [notes, setNotes] = useState("")
  const [focusDuration, setFocusDuration] = useState(25)
  const [focusQuality, setFocusQuality] = useState(7)
  const [logs, setLogs] = useState<EnergyLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Fetch logs from DB on mount
  const fetchLogs = useCallback(async () => {
    if (!user) {
      setIsLoadingLogs(false)
      setLogsError("Please log in to view and save energy logs.")
      return
    }
    setIsLoadingLogs(true)
    setLogsError(null)
    try {
      const { data, error } = await getEnergyHistory(user)
      if (error) {
        throw new Error(error.message || "Failed to fetch logs")
      }
      setLogs(Array.isArray(data) ? (data as EnergyLog[]) : [])
    } catch (err: any) {
      console.error("Failed to fetch logs", err)
      setLogsError(err.message || "An error occurred while loading history.")
      setLogs([]) // Clear logs on error
    } finally {
      setIsLoadingLogs(false)
    }
  }, [user])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to save your energy log.",
        variant: "destructive"
      })
      return
    }
    if (!activity) {
      toast({
        title: "Activity Required",
        description: "Please select an activity type",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    // Construct payload matching the expected type in energy-db
    const payload = {
      energy_level: energyLevel,
      activity: activity,
      notes: notes,
      focus_duration: focusDuration,
      focus_quality: focusQuality
    }
    
    try {
      // Call the refactored function (no session needed)
      await recordEnergyLevel(user, payload)
      
      // Optimistically update local state (or refetch)
      const newLogEntry: EnergyLog = {
        id: crypto.randomUUID(), // Temporary ID for local state
        timestamp: new Date().toISOString(),
        ...payload
      }
      setLogs(prev => [newLogEntry, ...prev])
      
      toast({
        title: "Energy Log Saved",
        description: "Your energy and focus data has been recorded"
      })
      
      // Reset form
      setNotes("")
      setActivity("")
      // Optionally reset sliders/duration too
      // setEnergyLevel(5)
      // setFocusQuality(7)
      // setFocusDuration(25)

    } catch (error) {
      console.error("Error saving log", error)
      toast({
        title: "Error",
        description: "Failed to save your energy log",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getLevelColor = (level: number) => {
    if (level <= 3) return "text-red-500"
    if (level <= 6) return "text-amber-500"
    return "text-green-500"
  }
  
  const getBatteryIcon = (level: number) => {
    return <Battery className={`h-5 w-5 ${getLevelColor(level)}`} />
  }
  
  const getFormattedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date)
    } catch (e) {
      return "Invalid Date"
    }
  }
  
  // Chart data now uses state logs (fetched from DB)
  const chartData = logs.slice(0, 14).reverse().map(log => ({
    name: getFormattedDate(log.timestamp),
    energy: log.energy_level,
    focus: log.focus_quality || 0
  }))
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Energy & Focus Integration
        </CardTitle>
        <CardDescription>
          Track your energy levels and their correlation with focus activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="track" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Current Energy Level: {energyLevel}/10</Label>
                  {getBatteryIcon(energyLevel)}
                </div>
                <Slider
                  value={[energyLevel]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(values) => setEnergyLevel(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Focus Session Quality: {focusQuality}/10</Label>
                <Slider
                  value={[focusQuality]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(values) => setFocusQuality(values[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Focus Duration (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusDuration(25)}
                  >
                    25
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusDuration(50)}
                  >
                    50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusDuration(90)}
                  >
                    90
                  </Button>
                  <Slider
                    value={[focusDuration]}
                    min={5}
                    max={120}
                    step={5}
                    onValueChange={(values) => setFocusDuration(values[0])}
                    className="flex-1"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {focusDuration} minutes
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="What affected your energy and focus?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={isSubmitting || !user || !activity}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Saving..." : "Log Energy & Focus"}
              </Button>
            </div>
            {!user && (
              <Alert variant="default" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Required</AlertTitle>
                <AlertDescription>Please log in to save your energy and focus data.</AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <h3 className="text-lg font-medium mb-3">Log History</h3>
            {isLoadingLogs && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            )}
            {logsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading History</AlertTitle>
                <AlertDescription>{logsError}</AlertDescription>
              </Alert>
            )}
            {!isLoadingLogs && !logsError && logs.length === 0 && (
              <p className="text-muted-foreground text-sm">No energy logs recorded yet. Start tracking!</p>
            )}
            {!isLoadingLogs && !logsError && logs.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {getBatteryIcon(log.energy_level)}
                        Energy: {log.energy_level}/10 - Activity: 
                        <Badge variant="secondary">{ACTIVITY_TYPES.find(a => a.value === log.activity)?.label || log.activity}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Focus Quality: {log.focus_quality || 'N/A'}/10 | Duration: {log.focus_duration || 'N/A'} min</p>
                      {log.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {log.notes}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">
                      {getFormattedDate(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="mt-4">
            <h3 className="text-lg font-medium mb-3">Energy & Focus Trends</h3>
            {isLoadingLogs && (
              <Skeleton className="h-[300px] w-full" />
            )}
            {logsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Chart</AlertTitle>
                <AlertDescription>{logsError}</AlertDescription>
              </Alert>
            )}
            {!isLoadingLogs && !logsError && chartData.length === 0 && (
              <div className="h-[300px] flex flex-col items-center justify-center text-center border rounded-md bg-muted/30">
                <LineChart className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Not enough data to show trends.</p>
                <p className="text-xs text-muted-foreground">Keep tracking your energy and focus.</p>
              </div>
            )}
            {!isLoadingLogs && !logsError && chartData.length > 0 && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: '12px', padding: '5px 10px', borderRadius: '4px'}} />
                    <Area yAxisId="left" type="monotone" dataKey="energy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Energy Level" />
                    <Area yAxisId="right" type="monotone" dataKey="focus" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Focus Quality" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <Alert variant="default" className="mt-4">
              <Brain className="h-4 w-4" />
              <AlertTitle>Personalized Insights Coming Soon!</AlertTitle>
              <AlertDescription>As you log more data, we'll provide insights here on your optimal energy levels for focus and suggest personalized strategies.</AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Regular tracking helps identify your optimal energy patterns for productivity
        </div>
      </CardFooter>
    </Card>
  )
} 