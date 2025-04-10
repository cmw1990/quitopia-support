
import { useEffect, useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { 
  Leaf, Clock, Thermometer, Scale, Star, Droplets, 
  CloudSun, Wind, AlignJustify, PlusCircle
} from "lucide-react"

type TeaIntakeFormValues = {
  teaName: string;
  brewingMethod: "hot_steep" | "cold_brew" | "gongfu" | "western";
  steepTimeSeconds: number;
  waterTemperature: number;
  amountGrams: number;
  rating: number;
  effects: string[];
  notes: string;
  brewingVessel: string;
  waterSource: string;
  environmentFactors: {
    temperature: number | null;
    humidity: number | null;
    lightLevel: number | null;
    noiseLevel: number | null;
  };
  weatherData: {
    condition: string | null;
    temperature: number | null;
    humidity: number | null;
    pressure: number | null;
  };
};

const defaultValues: TeaIntakeFormValues = {
  teaName: "",
  brewingMethod: "hot_steep",
  steepTimeSeconds: 180,
  waterTemperature: 85,
  amountGrams: 2.5,
  rating: 5,
  effects: [],
  notes: "",
  brewingVessel: "",
  waterSource: "",
  environmentFactors: {
    temperature: null,
    humidity: null,
    lightLevel: null,
    noiseLevel: null
  },
  weatherData: {
    condition: null,
    temperature: null,
    humidity: null,
    pressure: null
  }
};

export function TeaIntakeForm() {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<TeaIntakeFormValues>(defaultValues)
  const [steepSessions, setSteepSessions] = useState<Array<{
    steepNumber: number;
    steepTimeSeconds: number;
    waterTemperature: number;
    rating: number;
    notes: string;
  }>>([])

  // Fetch weather data on component mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // In a real app, you would fetch actual weather data here
        const mockWeather = {
          condition: "sunny",
          temperature: 22,
          humidity: 45,
          pressure: 1013
        }
        setForm(prev => ({
          ...prev,
          weatherData: mockWeather
        }))
      } catch (error) {
        console.error("Error fetching weather:", error)
      }
    }
    fetchWeather()
  }, [])

  const logTeaMutation = useMutation({
    mutationFn: async (values: TeaIntakeFormValues) => {
      if (!session?.user?.id) throw new Error("User not authenticated")

      // First, create the main tea log entry
      const { data: logData, error: logError } = await supabase
        .from('herbal_tea_logs')
        .insert({
          user_id: session.user.id,
          tea_name: values.teaName,
          brewing_method: values.brewingMethod,
          steep_time_seconds: values.steepTimeSeconds,
          water_temperature: values.waterTemperature,
          amount_grams: values.amountGrams,
          rating: values.rating,
          effects: values.effects,
          notes: values.notes,
          brewing_vessel: values.brewingVessel,
          water_source: values.waterSource,
          environment_factors: values.environmentFactors,
          weather_data: values.weatherData,
          steep_count: steepSessions.length || 1
        })
        .select()
        .single()

      if (logError) throw logError

      // Then, if there are multiple steeps, create the brewing sessions
      if (steepSessions.length > 0 && logData) {
        const { error: sessionsError } = await supabase
          .from('herbal_tea_logs_sessions')
          .insert(
            steepSessions.map(session => ({
              log_id: logData.id,
              steep_number: session.steepNumber,
              steep_time_seconds: session.steepTimeSeconds,
              water_temperature: session.waterTemperature,
              rating: session.rating,
              notes: session.notes
            }))
          )

        if (sessionsError) throw sessionsError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tea-logs'] })
      toast({
        title: "Success",
        description: "Tea intake logged successfully",
      })
      setForm(defaultValues)
      setSteepSessions([])
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log tea intake",
        variant: "destructive",
      })
      console.error("Error logging tea:", error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.teaName) {
      toast({
        title: "Error",
        description: "Please enter the tea name",
        variant: "destructive",
      })
      return
    }
    logTeaMutation.mutate(form)
  }

  const addSteepSession = () => {
    setSteepSessions(prev => [...prev, {
      steepNumber: prev.length + 1,
      steepTimeSeconds: Math.round(form.steepTimeSeconds * 1.5), // Increase steep time for subsequent steeps
      waterTemperature: form.waterTemperature,
      rating: 5,
      notes: ""
    }])
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Log Tea Session
        </CardTitle>
        <CardDescription>Track your tea brewing experience</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Tea Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teaName">Tea Name *</Label>
                <Input
                  id="teaName"
                  value={form.teaName}
                  onChange={e => setForm(prev => ({ ...prev, teaName: e.target.value }))}
                  placeholder="Enter tea name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brewingMethod">Brewing Method</Label>
                <Select
                  value={form.brewingMethod}
                  onValueChange={value => setForm(prev => ({ 
                    ...prev, 
                    brewingMethod: value as TeaIntakeFormValues["brewingMethod"]
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot_steep">Hot Steep</SelectItem>
                    <SelectItem value="cold_brew">Cold Brew</SelectItem>
                    <SelectItem value="gongfu">Gongfu</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="steepTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Steep Time (seconds)
                </Label>
                <Input
                  id="steepTime"
                  type="number"
                  value={form.steepTimeSeconds}
                  onChange={e => setForm(prev => ({ ...prev, steepTimeSeconds: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterTemperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Water Temperature (°C)
                </Label>
                <Input
                  id="waterTemperature"
                  type="number"
                  value={form.waterTemperature}
                  onChange={e => setForm(prev => ({ ...prev, waterTemperature: parseInt(e.target.value) }))}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Amount (grams)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.1"
                  value={form.amountGrams}
                  onChange={e => setForm(prev => ({ ...prev, amountGrams: parseFloat(e.target.value) }))}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brewingVessel" className="flex items-center gap-2">
                  <AlignJustify className="h-4 w-4" />
                  Brewing Vessel
                </Label>
                <Input
                  id="brewingVessel"
                  value={form.brewingVessel}
                  onChange={e => setForm(prev => ({ ...prev, brewingVessel: e.target.value }))}
                  placeholder="e.g., Ceramic teapot, Glass gaiwan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterSource" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Water Source
                </Label>
                <Input
                  id="waterSource"
                  value={form.waterSource}
                  onChange={e => setForm(prev => ({ ...prev, waterSource: e.target.value }))}
                  placeholder="e.g., Filtered, Spring water"
                />
              </div>
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Environmental Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomTemp" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Room Temperature (°C)
                </Label>
                <Input
                  id="roomTemp"
                  type="number"
                  value={form.environmentFactors.temperature || ""}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    environmentFactors: {
                      ...prev.environmentFactors,
                      temperature: e.target.value ? parseInt(e.target.value) : null
                    }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity" className="flex items-center gap-2">
                  <CloudSun className="h-4 w-4" />
                  Humidity (%)
                </Label>
                <Input
                  id="humidity"
                  type="number"
                  value={form.environmentFactors.humidity || ""}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    environmentFactors: {
                      ...prev.environmentFactors,
                      humidity: e.target.value ? parseInt(e.target.value) : null
                    }
                  }))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Multiple Steeps */}
          {steepSessions.map((session, index) => (
            <div key={session.steepNumber} className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Steep #{session.steepNumber}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Steep Time (seconds)</Label>
                  <Input
                    type="number"
                    value={session.steepTimeSeconds}
                    onChange={e => {
                      const newSessions = [...steepSessions]
                      newSessions[index].steepTimeSeconds = parseInt(e.target.value)
                      setSteepSessions(newSessions)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Water Temperature (°C)</Label>
                  <Input
                    type="number"
                    value={session.waterTemperature}
                    onChange={e => {
                      const newSessions = [...steepSessions]
                      newSessions[index].waterTemperature = parseInt(e.target.value)
                      setSteepSessions(newSessions)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="pt-2">
                    <Slider
                      value={[session.rating]}
                      onValueChange={([value]) => {
                        const newSessions = [...steepSessions]
                        newSessions[index].rating = value
                        setSteepSessions(newSessions)
                      }}
                      max={5}
                      min={1}
                      step={1}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={session.notes}
                  onChange={e => {
                    const newSessions = [...steepSessions]
                    newSessions[index].notes = e.target.value
                    setSteepSessions(newSessions)
                  }}
                  placeholder="Enter notes for this steep"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addSteepSession}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Another Steep
          </Button>

          {/* Rating and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Overall Rating (1-5)
              </Label>
              <div className="pt-2">
                <Slider
                  value={[form.rating]}
                  onValueChange={([value]) => setForm(prev => ({ ...prev, rating: value }))}
                  max={5}
                  min={1}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes about your tea session"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Log Tea Session
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
