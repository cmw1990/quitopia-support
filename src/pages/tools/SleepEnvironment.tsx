import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Thermometer, Droplet, VolumeX, Sun, Wind, CloudFog } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"

type SleepEnvironmentLog = {
  id: string
  temperature: number
  humidity: number
  noise_level: number
  light_level: number
  ventilation_rating: number
  comfort_rating: number
  notes: string
  date: string
  created_at: string
  updated_at: string
}

export default function SleepEnvironment() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const [temperature, setTemperature] = useState("")
  const [humidity, setHumidity] = useState("")
  const [noiseLevel, setNoiseLevel] = useState("")
  const [lightLevel, setLightLevel] = useState("")
  const [ventilationRating, setVentilationRating] = useState("")
  const [comfortRating, setComfortRating] = useState("")
  const [notes, setNotes] = useState("")

  const { data: environmentLogs, isLoading } = useQuery({
    queryKey: ["sleep_environment_logs"],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sleep_environment_logs?order=date.desc&limit=7`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json() as SleepEnvironmentLog[];
    },
    enabled: !!session?.access_token
  })

  const addEnvironmentLog = useMutation({
    mutationFn: async (values: {
      temperature: number
      humidity: number
      noise_level: number
      light_level: number
      ventilation_rating: number
      comfort_rating: number
      notes: string
    }) => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sleep_environment_logs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: session.user.id,
            ...values,
            date: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleep_environment_logs"] })
      toast({
        title: "Environment log added",
        description: "Your sleep environment data has been recorded successfully.",
      })
      // Reset form
      setTemperature("")
      setHumidity("")
      setNoiseLevel("")
      setLightLevel("")
      setVentilationRating("")
      setComfortRating("")
      setNotes("")
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record environment data. Please try again.",
        variant: "destructive",
      })
      console.error("Error adding environment log:", error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to record environment data.",
        variant: "destructive",
      });
      return;
    }
    
    const values = {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      noise_level: parseFloat(noiseLevel),
      light_level: parseFloat(lightLevel),
      ventilation_rating: parseInt(ventilationRating),
      comfort_rating: parseInt(comfortRating),
      notes,
    }

    // Validation
    if (
      !temperature || !humidity || !noiseLevel || !lightLevel ||
      !ventilationRating || !comfortRating
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (values.ventilation_rating < 1 || values.ventilation_rating > 5 ||
        values.comfort_rating < 1 || values.comfort_rating > 5) {
      toast({
        title: "Invalid ratings",
        description: "Ratings must be between 1 and 5.",
        variant: "destructive",
      })
      return
    }

    addEnvironmentLog.mutate(values)
  }

  const chartData = environmentLogs?.map((log) => ({
    date: format(new Date(log.date), "MMM dd"),
    temperature: log.temperature,
    humidity: log.humidity,
    noise: log.noise_level,
    light: log.light_level,
  })).reverse()

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-environment"
      toolType="tracking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudFog className="h-6 w-6" />
                  Log Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="Enter room temperature"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="humidity"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={humidity}
                        onChange={(e) => setHumidity(e.target.value)}
                        placeholder="Enter humidity level"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noiseLevel">Noise Level (dB)</Label>
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="noiseLevel"
                        type="number"
                        step="1"
                        value={noiseLevel}
                        onChange={(e) => setNoiseLevel(e.target.value)}
                        placeholder="Enter noise level"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lightLevel">Light Level (lux)</Label>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lightLevel"
                        type="number"
                        step="1"
                        value={lightLevel}
                        onChange={(e) => setLightLevel(e.target.value)}
                        placeholder="Enter light level"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ventilationRating">Ventilation Rating (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ventilationRating"
                        type="number"
                        min="1"
                        max="5"
                        value={ventilationRating}
                        onChange={(e) => setVentilationRating(e.target.value)}
                        placeholder="Rate ventilation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comfortRating">Overall Comfort (1-5)</Label>
                    <Input
                      id="comfortRating"
                      type="number"
                      min="1"
                      max="5"
                      value={comfortRating}
                      onChange={(e) => setComfortRating(e.target.value)}
                      placeholder="Rate overall comfort"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={addEnvironmentLog.isPending}
                  >
                    {addEnvironmentLog.isPending ? "Saving..." : "Save Environment Log"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#8884d8"
                          name="Temperature"
                        />
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          stroke="#82ca9d"
                          name="Humidity"
                        />
                        <Line
                          type="monotone"
                          dataKey="noise"
                          stroke="#ffc658"
                          name="Noise"
                        />
                        <Line
                          type="monotone"
                          dataKey="light"
                          stroke="#ff7300"
                          name="Light"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No environment data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
