
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Cloud, ThermometerSun, Loader2, Wind, Droplets, Gauge } from "lucide-react";
import type { CycleWeatherImpact as CycleWeatherImpactType } from "@/types/cycle";
import { format } from "date-fns";

export const CycleWeatherImpact = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: weatherImpacts, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['cycle_weather_impacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_weather_impacts')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data as CycleWeatherImpactType[];
    },
    enabled: !!session?.user?.id,
  });

  const addWeatherImpact = useMutation({
    mutationFn: async (impact: Omit<CycleWeatherImpactType, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('cycle_weather_impacts')
        .insert(impact)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle_weather_impacts'] });
      toast({
        title: "Weather impact logged",
        description: "Your weather impact data has been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving weather impact",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Get and validate string values
    const symptomTypeValue = formData.get('symptom_type');
    const phaseTypeValue = formData.get('phase_type');
    const notesValue = formData.get('notes');
    const conditionValue = formData.get('condition');

    if (!symptomTypeValue || !phaseTypeValue || 
        typeof symptomTypeValue !== 'string' || 
        typeof phaseTypeValue !== 'string') {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Handle optional string values
    const notes = notesValue ? String(notesValue) : undefined;
    const condition = conditionValue ? String(conditionValue) : null;

    // Get and validate numeric values
    const temperatureValue = formData.get('temperature');
    const humidityValue = formData.get('humidity');
    const pressureValue = formData.get('pressure');
    const symptomIntensityValue = formData.get('symptom_intensity');

    if (!temperatureValue || !humidityValue || !pressureValue || !symptomIntensityValue) {
      toast({
        title: "Missing measurements",
        description: "Please provide all weather measurements",
        variant: "destructive",
      });
      return;
    }

    const temperature = parseFloat(String(temperatureValue));
    const humidity = parseFloat(String(humidityValue));
    const pressure = parseFloat(String(pressureValue));
    const symptomIntensity = parseInt(String(symptomIntensityValue));

    if (isNaN(temperature) || isNaN(humidity) || isNaN(pressure) || isNaN(symptomIntensity)) {
      toast({
        title: "Invalid measurements",
        description: "Please enter valid numbers for all measurements",
        variant: "destructive",
      });
      return;
    }

    addWeatherImpact.mutate({
      user_id: session.user.id,
      date: new Date().toISOString().split('T')[0],
      symptom_type: symptomTypeValue,
      symptom_intensity: symptomIntensity,
      phase_type: phaseTypeValue,
      weather_data: {
        temperature,
        humidity,
        pressure,
        condition
      },
      notes
    });

    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          Weather Impact Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="symptom_type">Symptom Type*</Label>
              <Select name="symptom_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select symptom type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headache">Headache</SelectItem>
                  <SelectItem value="fatigue">Fatigue</SelectItem>
                  <SelectItem value="mood">Mood Changes</SelectItem>
                  <SelectItem value="pain">Pain</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase_type">Cycle Phase*</Label>
              <Select name="phase_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menstrual">Menstrual</SelectItem>
                  <SelectItem value="follicular">Follicular</SelectItem>
                  <SelectItem value="ovulatory">Ovulatory</SelectItem>
                  <SelectItem value="luteal">Luteal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Symptom Intensity (1-10)*</Label>
            <Slider 
              name="symptom_intensity"
              defaultValue={[5]}
              max={10}
              min={1}
              step={1}
              className="py-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <ThermometerSun className="h-4 w-4" />
                Temperature (°C)*
              </Label>
              <input 
                type="number" 
                id="temperature"
                name="temperature"
                className="w-full p-2 border rounded"
                step="0.1"
                required
                placeholder="Enter temperature"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Humidity (%)*
              </Label>
              <input 
                type="number" 
                id="humidity"
                name="humidity"
                className="w-full p-2 border rounded"
                min="0"
                max="100"
                required
                placeholder="Enter humidity"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pressure" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Air Pressure (hPa)*
              </Label>
              <input 
                type="number" 
                id="pressure"
                name="pressure"
                className="w-full p-2 border rounded"
                required
                placeholder="Enter air pressure"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition" className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Weather Condition
              </Label>
              <Select name="condition">
                <SelectTrigger>
                  <SelectValue placeholder="Select weather condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">Sunny</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="stormy">Stormy</SelectItem>
                  <SelectItem value="windy">Windy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea 
              id="notes"
              name="notes"
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Enter any additional observations..."
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={addWeatherImpact.isPending}
          >
            {addWeatherImpact.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Log Weather Impact'
            )}
          </Button>
        </form>

        {isLoadingHistory ? (
          <div className="mt-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
          </div>
        ) : weatherImpacts?.length > 0 ? (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Recent Weather Impacts</h3>
            <div className="space-y-3">
              {weatherImpacts.map((impact) => (
                <div 
                  key={impact.id} 
                  className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium capitalize">{impact.symptom_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(impact.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-4 w-4 text-orange-500" />
                        <span>{impact.weather_data.temperature}°C</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Intensity: {impact.symptom_intensity}/10
                      </p>
                    </div>
                  </div>
                  {impact.notes && (
                    <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                      {impact.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No weather impact data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
