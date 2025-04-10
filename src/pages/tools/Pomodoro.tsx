import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Play, Pause, RotateCcw, Coffee } from 'lucide-react';

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  rounds: number;
}

const defaultSettings: TimerSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  rounds: 4,
};

export default function Pomodoro() {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeRemaining, setTimeRemaining] = useState(settings.work * 60);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            // Move to next phase
            if (currentPhase === 'work') {
              if (currentRound >= settings.rounds) {
                setCurrentPhase('longBreak');
                setCurrentRound(1);
                return settings.longBreak * 60;
              } else {
                setCurrentPhase('shortBreak');
                return settings.shortBreak * 60;
              }
            } else {
              setCurrentPhase('work');
              if (currentPhase === 'shortBreak') {
                setCurrentRound((prev) => prev + 1);
              }
              return settings.work * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, currentPhase, settings, currentRound]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentPhase('work');
    setTimeRemaining(settings.work * 60);
    setCurrentRound(1);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pomodoro Timer</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timer Display */}
        <Card>
          <CardHeader>
            <CardTitle>Timer</CardTitle>
            <CardDescription>Focus timer with break intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center h-48 bg-muted rounded-lg relative">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentPhase === 'work' ? 'Focus Time' : currentPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Round {currentRound} of {settings.rounds}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your timer intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Duration (minutes)</label>
                <Slider
                  value={[settings.work]}
                  onValueChange={(value) => setSettings({ ...settings, work: value[0] })}
                  min={1}
                  max={60}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">{settings.work} minutes</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Break Duration (minutes)</label>
                <Slider
                  value={[settings.shortBreak]}
                  onValueChange={(value) => setSettings({ ...settings, shortBreak: value[0] })}
                  min={1}
                  max={15}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">{settings.shortBreak} minutes</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Long Break Duration (minutes)</label>
                <Slider
                  value={[settings.longBreak]}
                  onValueChange={(value) => setSettings({ ...settings, longBreak: value[0] })}
                  min={5}
                  max={30}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">{settings.longBreak} minutes</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rounds Before Long Break</label>
                <Slider
                  value={[settings.rounds]}
                  onValueChange={(value) => setSettings({ ...settings, rounds: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">{settings.rounds} rounds</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pomodoro Technique Tips</CardTitle>
            <CardDescription>Get the most out of your focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">During Work Sessions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Focus on a single task</li>
                  <li>• Avoid distractions</li>
                  <li>• Take notes of interruptions</li>
                  <li>• Stay committed to the time block</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">During Breaks</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Step away from your desk</li>
                  <li>• Do light stretches</li>
                  <li>• Rest your eyes</li>
                  <li>• Stay hydrated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
