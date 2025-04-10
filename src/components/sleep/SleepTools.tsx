import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Music,
  Bell,
  Wind,
  Moon,
  Sun,
  CloudRain,
  Waves,
  Volume2,
} from "lucide-react";

interface SoundOption {
  id: string;
  name: string;
  icon: React.ElementType;
}

const soundOptions: SoundOption[] = [
  { id: "white-noise", name: "White Noise", icon: Wind },
  { id: "rain", name: "Rain", icon: CloudRain },
  { id: "waves", name: "Ocean Waves", icon: Waves },
  { id: "nature", name: "Nature", icon: Music },
];

export function SleepTools() {
  const [volume, setVolume] = useState(50);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [smartAlarm, setSmartAlarm] = useState(true);
  const [fadeOut, setFadeOut] = useState(true);

  const toggleSound = (soundId: string) => {
    setActiveSound(activeSound === soundId ? null : soundId);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5" />
            Sleep Sounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <Label>Volume</Label>
              <span className="text-sm">{volume}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              max={100}
              step={1}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {soundOptions.map((sound) => {
              const Icon = sound.icon;
              return (
                <Button
                  key={sound.id}
                  variant={activeSound === sound.id ? "default" : "outline"}
                  className="flex items-center justify-start space-x-2"
                  onClick={() => toggleSound(sound.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{sound.name}</span>
                </Button>
              );
            })}
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Auto Fade Out</Label>
              <Switch
                checked={fadeOut}
                onCheckedChange={setFadeOut}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Smart Alarm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Smart Wake Up</Label>
              <Switch
                checked={smartAlarm}
                onCheckedChange={setSmartAlarm}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Wakes you up during your lightest sleep phase within a 30-minute window
              of your target wake time.
            </p>
            <div className="flex items-center space-x-4">
              <Moon className="h-5 w-5 text-indigo-500" />
              <div className="h-0.5 flex-1 bg-indigo-200" />
              <Sun className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Optimal wake window: 6:30 AM - 7:00 AM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
