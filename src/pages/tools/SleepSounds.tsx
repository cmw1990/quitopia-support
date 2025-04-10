import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Moon, Play, Pause, Volume1, VolumeX, Timer } from 'lucide-react';

interface SoundOption {
  name: string;
  description: string;
  category: 'nature' | 'ambient' | 'music';
}

const soundOptions: SoundOption[] = [
  { name: 'Rain', description: 'Gentle rainfall on a window', category: 'nature' },
  { name: 'Ocean', description: 'Calming ocean waves', category: 'nature' },
  { name: 'Forest Night', description: 'Nighttime forest ambiance', category: 'nature' },
  { name: 'Wind', description: 'Soft wind through trees', category: 'nature' },
  { name: 'Stream', description: 'Flowing water sounds', category: 'nature' },
  { name: 'White Noise', description: 'Consistent background noise', category: 'ambient' },
  { name: 'Fan Sound', description: 'Gentle fan white noise', category: 'ambient' },
  { name: 'Deep Hum', description: 'Low frequency ambient noise', category: 'ambient' },
  { name: 'Sleep Music', description: 'Calming sleep melody', category: 'music' },
  { name: 'Delta Waves', description: 'Sleep-inducing frequencies', category: 'music' },
  { name: 'Lullaby', description: 'Soft piano lullaby', category: 'music' },
];

export default function SleepSounds() {
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundOption>(soundOptions[0]);
  const [timer, setTimer] = useState(30); // minutes

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Sleep Sounds</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sound Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sound Selection</CardTitle>
            <CardDescription>Choose your sleep sound</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="nature">Nature</TabsTrigger>
                <TabsTrigger value="ambient">Ambient</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {soundOptions.map((sound) => (
                      <Button
                        key={sound.name}
                        variant={selectedSound.name === sound.name ? "default" : "outline"}
                        onClick={() => setSelectedSound(sound)}
                        className="w-full justify-start"
                      >
                        <div className="text-left">
                          <div className="font-medium">{sound.name}</div>
                          <div className="text-xs text-muted-foreground">{sound.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="nature" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {soundOptions
                      .filter((sound) => sound.category === 'nature')
                      .map((sound) => (
                        <Button
                          key={sound.name}
                          variant={selectedSound.name === sound.name ? "default" : "outline"}
                          onClick={() => setSelectedSound(sound)}
                          className="w-full justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{sound.name}</div>
                            <div className="text-xs text-muted-foreground">{sound.description}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="ambient" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {soundOptions
                      .filter((sound) => sound.category === 'ambient')
                      .map((sound) => (
                        <Button
                          key={sound.name}
                          variant={selectedSound.name === sound.name ? "default" : "outline"}
                          onClick={() => setSelectedSound(sound)}
                          className="w-full justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{sound.name}</div>
                            <div className="text-xs text-muted-foreground">{sound.description}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Sound Controls</CardTitle>
            <CardDescription>Adjust playback settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center justify-center h-48 bg-muted rounded-lg relative">
                <Moon
                  className={`h-24 w-24 transition-all duration-500 ${
                    isPlaying ? 'opacity-100' : 'opacity-50'
                  }`}
                />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="font-medium">{selectedSound.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <span className="text-sm text-muted-foreground">{volume}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <VolumeX className="h-4 w-4" />
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume1 className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Timer</label>
                    <span className="text-sm text-muted-foreground">{timer} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4" />
                    <Slider
                      value={[timer]}
                      onValueChange={(value) => setTimer(value[0])}
                      min={5}
                      max={120}
                      step={5}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Sleep Tips</CardTitle>
            <CardDescription>Get the most out of your sleep sounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium">Volume Setting</h3>
                <p className="text-sm text-muted-foreground">
                  Keep the volume at a comfortable level that masks disturbances without being distracting.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Timer Usage</h3>
                <p className="text-sm text-muted-foreground">
                  Set the timer to gradually fade out after you're likely to be asleep to conserve energy.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Sound Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Experiment with different sounds to find what works best for your sleep environment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
