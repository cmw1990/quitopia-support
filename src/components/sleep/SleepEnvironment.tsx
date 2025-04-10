import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sleepDb } from "@/lib/sleep-db";
import { 
  Moon, 
  SunMedium, 
  Volume2, 
  Thermometer, 
  Wind, 
  BedDouble, 
  Droplets,
  Lightbulb,
  Waves,
  Save,
  Palmtree,
  Coffee
} from "lucide-react";

export function SleepEnvironment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default settings in case they're not loaded yet
  const defaultSettings = {
    temperature: 68,
    humidity: 40,
    noise_level: 20,
    light_level: 10,
    aromatherapy_enabled: false,
    white_noise_enabled: false,
    white_noise_type: "rain",
    light_color: "#FFA07A", // Soft amber
    bedtime_reminder_enabled: true,
    bedtime_reminder_time: "22:00",
    caffeine_cutoff_enabled: true,
    caffeine_cutoff_time: "14:00",
    bedtime_routine: "1. Brush teeth\n2. Read for 15 minutes\n3. Meditate for 5 minutes"
  };
  
  const [settings, setSettings] = useState(defaultSettings);
  const [edited, setEdited] = useState(false);

  // Fetch environment settings
  const { data: envSettings, isLoading } = useQuery({
    queryKey: ["sleep-environment"],
    queryFn: () => sleepDb.getSleepEnvironmentSettings()
  });

  // Update state when data is fetched
  useEffect(() => {
    if (envSettings) {
      setSettings(envSettings);
    }
  }, [envSettings]);

  // Update environment settings
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: any) => 
      sleepDb.updateSleepEnvironmentSettings(updatedSettings),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your sleep environment settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["sleep-environment"] });
      setEdited(false);
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setEdited(true);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-blue-400" />
            Sleep Environment
          </CardTitle>
          {edited && (
            <Button 
              size="sm" 
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading environment settings...
          </div>
        ) : (
          <Tabs defaultValue="physical">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="technology">Technology</TabsTrigger>
              <TabsTrigger value="routines">Routines</TabsTrigger>
            </TabsList>
            
            <TabsContent value="physical" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-red-400" />
                      Room Temperature
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.temperature}°F
                    </span>
                  </div>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={([value]) => updateSetting("temperature", value)}
                    min={60}
                    max={80}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cool (60°F)</span>
                    <span>Optimal (65-68°F)</span>
                    <span>Warm (80°F)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-400" />
                      Humidity Level
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.humidity}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.humidity]}
                    onValueChange={([value]) => updateSetting("humidity", value)}
                    min={20}
                    max={60}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Dry (20%)</span>
                    <span>Optimal (40-50%)</span>
                    <span>Humid (60%)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center">
                      <Palmtree className="h-4 w-4 mr-2 text-green-400" />
                      Aromatherapy
                    </Label>
                    <Switch
                      checked={settings.aromatherapy_enabled}
                      onCheckedChange={(value) => updateSetting("aromatherapy_enabled", value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended scents: Lavender, Chamomile, Eucalyptus
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="technology" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center">
                      <Volume2 className="h-4 w-4 mr-2 text-purple-400" />
                      Noise Level
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.noise_level}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.noise_level]}
                    onValueChange={([value]) => updateSetting("noise_level", value)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center">
                      <Waves className="h-4 w-4 mr-2 text-blue-400" />
                      White Noise
                    </Label>
                    <Switch
                      checked={settings.white_noise_enabled}
                      onCheckedChange={(value) => updateSetting("white_noise_enabled", value)}
                    />
                  </div>
                  {settings.white_noise_enabled && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["rain", "ocean", "fan"].map((type) => (
                        <Button
                          key={type}
                          variant={settings.white_noise_type === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("white_noise_type", type)}
                          className="capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                      Light Level
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.light_level}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.light_level]}
                    onValueChange={([value]) => updateSetting("light_level", value)}
                    min={0}
                    max={100}
                    step={5}
                  />
                  
                  <div className="mt-2">
                    <Label className="text-sm mb-1">Light Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={settings.light_color}
                        onChange={(e) => updateSetting("light_color", e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <div className="text-xs text-muted-foreground">
                        Recommendation: Use warm colors (amber/red) before bed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="routines" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center">
                    <Moon className="h-4 w-4 mr-2 text-indigo-400" />
                    Bedtime Reminder
                  </Label>
                  <Switch
                    checked={settings.bedtime_reminder_enabled}
                    onCheckedChange={(value) => updateSetting("bedtime_reminder_enabled", value)}
                  />
                </div>
                
                {settings.bedtime_reminder_enabled && (
                  <div className="ml-6 space-y-2">
                    <Label>Remind me at</Label>
                    <Input
                      type="time"
                      value={settings.bedtime_reminder_time}
                      onChange={(e) => updateSetting("bedtime_reminder_time", e.target.value)}
                      className="w-full max-w-xs"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <Label className="flex items-center">
                    <Coffee className="h-4 w-4 mr-2 text-amber-700" />
                    Caffeine Cutoff Reminder
                  </Label>
                  <Switch
                    checked={settings.caffeine_cutoff_enabled}
                    onCheckedChange={(value) => updateSetting("caffeine_cutoff_enabled", value)}
                  />
                </div>
                
                {settings.caffeine_cutoff_enabled && (
                  <div className="ml-6 space-y-2">
                    <Label>No caffeine after</Label>
                    <Input
                      type="time"
                      value={settings.caffeine_cutoff_time}
                      onChange={(e) => updateSetting("caffeine_cutoff_time", e.target.value)}
                      className="w-full max-w-xs"
                    />
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <Label className="flex items-center">
                    <SunMedium className="h-4 w-4 mr-2 text-yellow-500" />
                    Bedtime Routine
                  </Label>
                  <Textarea
                    value={settings.bedtime_routine}
                    onChange={(e) => updateSetting("bedtime_routine", e.target.value)}
                    placeholder="Enter your bedtime routine..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    A consistent bedtime routine signals to your body it's time to sleep.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 