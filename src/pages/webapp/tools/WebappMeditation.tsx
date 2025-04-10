import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Waves, Play, Pause, Volume1, VolumeX, Timer, Heart, Brain } from 'lucide-react';

interface MeditationSession {
  name: string;
  description: string;
  duration: number;
  category: 'mindfulness' | 'focus' | 'sleep' | 'stress';
  level: 'beginner' | 'intermediate' | 'advanced';
}

const meditationSessions: MeditationSession[] = [
  {
    name: 'Mindful Breathing',
    description: 'Basic breath awareness meditation',
    duration: 5,
    category: 'mindfulness',
    level: 'beginner'
  },
  {
    name: 'Deep Focus',
    description: 'Enhance concentration and mental clarity',
    duration: 10,
    category: 'focus',
    level: 'intermediate'
  },
  {
    name: 'Sleep Preparation',
    description: 'Gentle meditation for better sleep',
    duration: 15,
    category: 'sleep',
    level: 'beginner'
  },
  {
    name: 'Stress Relief',
    description: 'Release tension and find calm',
    duration: 10,
    category: 'stress',
    level: 'beginner'
  }
];

export const WebappMeditation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [selectedSession, setSelectedSession] = useState<MeditationSession>(meditationSessions[0]);
  const [timeRemaining, setTimeRemaining] = useState(selectedSession.duration * 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness':
        return <Heart className="h-4 w-4" />;
      case 'focus':
        return <Brain className="h-4 w-4" />;
      case 'sleep':
        return <Timer className="h-4 w-4" />;
      case 'stress':
        return <Heart className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Meditation</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Session Selection */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Select Session</CardTitle>
            <CardDescription>Choose a meditation session that suits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {meditationSessions.map((session) => (
                  <Card
                    key={session.name}
                    className={`cursor-pointer transition-colors ${
                      selectedSession.name === session.name ? 'border-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedSession(session);
                      setTimeRemaining(session.duration * 60);
                      setIsPlaying(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{session.name}</h3>
                          <p className="text-sm text-muted-foreground">{session.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{session.duration} min</div>
                          <div className="text-xs text-muted-foreground capitalize">{session.level}</div>
                          <div className="mt-2">{getCategoryIcon(session.category)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Timer and Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Timer</CardTitle>
            <CardDescription>Control your meditation session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-4">{formatTime(timeRemaining)}</div>
              <div className="space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setIsPlaying(false);
                    setTimeRemaining(selectedSession.duration * 60);
                  }}
                >
                  <Timer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <VolumeX className="h-4 w-4" />
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="w-[60%]"
                />
                <Volume1 className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meditation Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Meditation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Brain className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Focus on Breath</h3>
                <p className="text-sm text-muted-foreground">Use your breath as an anchor for attention</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Heart className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Stay Comfortable</h3>
                <p className="text-sm text-muted-foreground">Find a position that you can maintain</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Waves className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Let Thoughts Flow</h3>
                <p className="text-sm text-muted-foreground">Don't fight thoughts, observe them passing</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
