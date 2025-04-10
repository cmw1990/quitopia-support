import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wind, Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface BreathPattern {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  totalTime: number;
}

const breathPatterns: BreathPattern[] = [
  {
    name: '4-7-8 Breathing',
    description: 'Promotes relaxation and helps reduce anxiety',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    totalTime: 19,
  },
  {
    name: 'Box Breathing',
    description: 'Reduces stress and improves focus',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    totalTime: 16,
  },
  {
    name: 'Resonant Breathing',
    description: 'Balances heart rate variability',
    inhale: 5.5,
    hold1: 0,
    exhale: 5.5,
    hold2: 0,
    totalTime: 11,
  },
];

export default function Breathwork() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(breathPatterns[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cycles, setCycles] = useState(10);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            // Move to next phase
            switch (currentPhase) {
              case 'inhale':
                setCurrentPhase('hold1');
                return selectedPattern.hold1;
              case 'hold1':
                setCurrentPhase('exhale');
                return selectedPattern.exhale;
              case 'exhale':
                setCurrentPhase('hold2');
                return selectedPattern.hold2;
              case 'hold2':
                setCurrentPhase('inhale');
                if (currentCycle >= cycles) {
                  setIsPlaying(false);
                  setCurrentCycle(1);
                  return 0;
                }
                setCurrentCycle((prev) => prev + 1);
                return selectedPattern.inhale;
            }
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => clearInterval(timer);
  }, [isPlaying, currentPhase, selectedPattern, cycles, currentCycle]);

  const resetSession = () => {
    setIsPlaying(false);
    setCurrentPhase('inhale');
    setTimeRemaining(0);
    setCurrentCycle(1);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Breathwork</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Breathing Pattern</CardTitle>
            <CardDescription>Select and customize your breathing exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pattern</label>
                <div className="grid grid-cols-1 gap-2">
                  {breathPatterns.map((pattern) => (
                    <Button
                      key={pattern.name}
                      variant={selectedPattern.name === pattern.name ? "default" : "outline"}
                      onClick={() => setSelectedPattern(pattern)}
                      className="justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">{pattern.name}</div>
                        <div className="text-xs text-muted-foreground">{pattern.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Cycles</label>
                <Slider
                  value={[cycles]}
                  onValueChange={(value) => setCycles(value[0])}
                  min={1}
                  max={20}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">{cycles} cycles</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Volume</label>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">{volume}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Practice</CardTitle>
            <CardDescription>Follow the breathing guide</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center h-48 bg-muted rounded-lg relative">
                <Wind
                  className={`h-24 w-24 transition-all duration-1000 ${
                    isPlaying
                      ? currentPhase === 'inhale'
                        ? 'scale-150 opacity-100'
                        : currentPhase === 'exhale'
                        ? 'scale-75 opacity-50'
                        : 'scale-100 opacity-75'
                      : 'scale-100 opacity-75'
                  }`}
                />
                <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium">
                  {isPlaying ? (
                    <>
                      {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}{' '}
                      ({Math.ceil(timeRemaining)}s)
                    </>
                  ) : (
                    'Ready'
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetSession}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Cycle {currentCycle} of {cycles}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Content */}
      <div className="mt-6">
        <Tabs defaultValue="guide">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>
          <TabsContent value="guide">
            <Card>
              <CardHeader>
                <CardTitle>How to Practice</CardTitle>
                <CardDescription>Step-by-step guide for effective breathwork</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">1. Find a Comfortable Position</h3>
                      <p className="text-sm text-muted-foreground">
                        Sit or lie in a comfortable position where your spine is straight and your body is relaxed.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">2. Focus on Your Breath</h3>
                      <p className="text-sm text-muted-foreground">
                        Close your eyes and bring your attention to your natural breathing pattern.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">3. Follow the Guide</h3>
                      <p className="text-sm text-muted-foreground">
                        When ready, press play and follow the breathing pattern. The animation will guide your breath.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">4. Stay Consistent</h3>
                      <p className="text-sm text-muted-foreground">
                        Try to practice at the same time each day for best results.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Benefits of Breathwork</CardTitle>
                <CardDescription>Scientific benefits of regular practice</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Stress Reduction</h3>
                      <p className="text-sm text-muted-foreground">
                        Regular breathwork practice activates the parasympathetic nervous system, reducing stress and anxiety.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Improved Focus</h3>
                      <p className="text-sm text-muted-foreground">
                        Controlled breathing increases oxygen flow to the brain, enhancing concentration and mental clarity.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Better Sleep</h3>
                      <p className="text-sm text-muted-foreground">
                        Evening breathwork practice can help calm the mind and prepare the body for restful sleep.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Emotional Regulation</h3>
                      <p className="text-sm text-muted-foreground">
                        Regular practice improves emotional awareness and helps manage strong emotions more effectively.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
