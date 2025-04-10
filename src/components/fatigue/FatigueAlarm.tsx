import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, Bell, Clock, Pause, Play, RefreshCw, Trash, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Timer {
  id: string;
  name: string;
  duration: number; // in minutes
  sound: string;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  timeRemaining: number; // in seconds
  intervalId?: number;
}

const SOUNDS = [
  { id: 'gentle', name: 'Gentle Chime', url: '/sounds/gentle-chime.mp3' },
  { id: 'bell', name: 'Meditation Bell', url: '/sounds/meditation-bell.mp3' },
  { id: 'nature', name: 'Nature Sounds', url: '/sounds/nature.mp3' },
  { id: 'water', name: 'Water Drop', url: '/sounds/water-drop.mp3' },
  { id: 'alert', name: 'Alert Tone', url: '/sounds/alert.mp3' }
];

export function FatigueAlarm() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [presetName, setPresetName] = useState('');
  const [presetDuration, setPresetDuration] = useState(5); // Default 5 minutes
  const [presetSound, setPresetSound] = useState(SOUNDS[0].id);
  const [isMuted, setIsMuted] = useState(false);
  const [showCompletedTimers, setShowCompletedTimers] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;
    
    // Clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load timers from localStorage
  useEffect(() => {
    const savedTimers = localStorage.getItem('fatigueAlarmTimers');
    if (savedTimers) {
      try {
        const parsedTimers = JSON.parse(savedTimers);
        
        // Reset any active or paused timers (in case of page refresh)
        const resetTimers = parsedTimers.map((timer: Timer) => ({
          ...timer,
          isActive: false,
          isPaused: false,
          timeRemaining: timer.duration * 60
        }));
        
        setTimers(resetTimers);
      } catch (error) {
        console.error('Failed to parse timers from localStorage', error);
      }
    } else {
      // Add default timer if none exist
      createTimer('Quick Break', 5, SOUNDS[0].id);
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    if (timers.length > 0) {
      localStorage.setItem('fatigueAlarmTimers', JSON.stringify(timers));
    }
  }, [timers]);

  // Helper function to format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Create a new timer
  const createTimer = (name: string, duration: number, sound: string) => {
    const newTimer: Timer = {
      id: generateId(),
      name: name || `Break Timer (${duration}m)`,
      duration,
      sound,
      isActive: false,
      isPaused: false,
      isCompleted: false,
      timeRemaining: duration * 60,
    };

    setTimers(prev => [...prev, newTimer]);
    return newTimer.id;
  };

  // Handle create button click
  const handleCreateTimer = () => {
    if (!presetName) {
      toast({
        title: 'Timer name required',
        description: 'Please provide a name for your timer',
        variant: 'destructive',
      });
      return;
    }
    
    const newTimerId = createTimer(presetName, presetDuration, presetSound);
    setPresetName('');
    
    toast({
      title: 'Timer created',
      description: 'Your new timer has been created successfully'
    });
  };

  // Start a timer
  const startTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => {
        if (timer.id === id) {
          // Clear any existing interval
          if (timer.intervalId) {
            window.clearInterval(timer.intervalId);
          }
          
          // Set up new interval
          const intervalId = window.setInterval(() => {
            setTimers(current => 
              current.map(t => {
                if (t.id === id && t.isActive && !t.isPaused) {
                  const newTimeRemaining = t.timeRemaining - 1;
                  
                  // Check if timer completed
                  if (newTimeRemaining <= 0) {
                    window.clearInterval(t.intervalId);
                    
                    // Play sound if not muted
                    if (!isMuted && audioRef.current) {
                      const soundUrl = SOUNDS.find(s => s.id === t.sound)?.url || SOUNDS[0].url;
                      audioRef.current.src = soundUrl;
                      audioRef.current.play().catch(e => console.error('Failed to play sound', e));
                    }
                    
                    // Show toast notification
                    toast({
                      title: 'Break time!',
                      description: `${t.name} timer has completed`,
                    });
                    
                    return {
                      ...t,
                      isActive: false,
                      isPaused: false,
                      isCompleted: true,
                      timeRemaining: 0,
                      intervalId: undefined
                    };
                  }
                  
                  return { ...t, timeRemaining: newTimeRemaining };
                }
                return t;
              })
            );
          }, 1000);
          
          return { 
            ...timer, 
            isActive: true, 
            isPaused: false, 
            isCompleted: false,
            intervalId 
          };
        }
        return timer;
      })
    );
  };

  // Pause a timer
  const pauseTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => {
        if (timer.id === id) {
          // Clear interval
          if (timer.intervalId) {
            window.clearInterval(timer.intervalId);
          }
          
          return { 
            ...timer, 
            isActive: true, 
            isPaused: true,
            intervalId: undefined 
          };
        }
        return timer;
      })
    );
  };

  // Resume a timer
  const resumeTimer = (id: string) => {
    startTimer(id);
  };

  // Reset a timer
  const resetTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => {
        if (timer.id === id) {
          // Clear interval
          if (timer.intervalId) {
            window.clearInterval(timer.intervalId);
          }
          
          return { 
            ...timer, 
            isActive: false, 
            isPaused: false, 
            isCompleted: false,
            timeRemaining: timer.duration * 60,
            intervalId: undefined 
          };
        }
        return timer;
      })
    );
  };

  // Delete a timer
  const deleteTimer = (id: string) => {
    setTimers(prev => {
      const timerToDelete = prev.find(t => t.id === id);
      
      // Clear interval if active
      if (timerToDelete?.intervalId) {
        window.clearInterval(timerToDelete.intervalId);
      }
      
      return prev.filter(timer => timer.id !== id);
    });
  };

  // Filter timers based on completed status
  const filteredTimers = timers.filter(timer => 
    showCompletedTimers ? true : !timer.isCompleted
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Fatigue Break Timers
        </CardTitle>
        <CardDescription>
          Set reminders to take breaks and manage fatigue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="timers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timers">My Timers</TabsTrigger>
            <TabsTrigger value="create">Create Timer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timers" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 px-2"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isMuted ? 'Sound off' : 'Sound on'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-completed" className="text-sm">
                  Show completed
                </Label>
                <Switch
                  id="show-completed"
                  checked={showCompletedTimers}
                  onCheckedChange={setShowCompletedTimers}
                />
              </div>
            </div>
            
            {filteredTimers.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No timers found</h3>
                <p className="text-muted-foreground mb-4">
                  {showCompletedTimers
                    ? 'You have no timers yet'
                    : 'No active timers. Create a new timer or check completed timers'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const createTab = document.querySelector('[data-value="create"]') as HTMLElement;
                    if (createTab) createTab.click();
                  }}
                >
                  Create Timer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTimers.map(timer => (
                  <Card key={timer.id} className={`border ${
                    timer.isActive && !timer.isPaused ? 'border-primary' : 
                    timer.isCompleted ? 'border-success bg-success/5' : 'border-muted'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{timer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {timer.duration} minute{timer.duration !== 1 ? 's' : ''}
                            {timer.isCompleted ? ' (Completed)' : ''}
                          </p>
                        </div>
                        <div className="text-2xl font-mono">
                          {formatTime(timer.timeRemaining)}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 justify-end mt-3">
                        {!timer.isActive && !timer.isCompleted && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => startTimer(timer.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {timer.isActive && !timer.isPaused && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseTimer(timer.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        
                        {timer.isActive && timer.isPaused && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => resumeTimer(timer.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        
                        {(timer.isActive || timer.isCompleted) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetTimer(timer.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTimer(timer.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timer-name">Timer Name</Label>
                <Input
                  id="timer-name"
                  placeholder="e.g., Quick Break, Eye Rest, Stretch Break"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="timer-duration">Duration (minutes)</Label>
                  <span className="text-sm font-medium">{presetDuration} min</span>
                </div>
                <Slider
                  id="timer-duration"
                  min={1}
                  max={60}
                  step={1}
                  value={[presetDuration]}
                  onValueChange={(value) => setPresetDuration(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 min</span>
                  <span>30 min</span>
                  <span>60 min</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timer-sound">Alert Sound</Label>
                <Select
                  value={presetSound}
                  onValueChange={setPresetSound}
                >
                  <SelectTrigger id="timer-sound">
                    <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUNDS.map(sound => (
                      <SelectItem key={sound.id} value={sound.id}>
                        {sound.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Alert className="bg-muted/60">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fatigue Management Tip</AlertTitle>
                <AlertDescription>
                  Taking regular breaks can significantly reduce mental fatigue. 
                  Consider using the Pomodoro technique: 25 minutes of focus followed by a 5-minute break.
                </AlertDescription>
              </Alert>
            </div>
            
            <Button className="w-full" onClick={handleCreateTimer}>
              Create Fatigue Timer
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Active timers: {timers.filter(t => t.isActive && !t.isCompleted).length}
        </div>
        <div className="text-sm text-muted-foreground">
          Completed: {timers.filter(t => t.isCompleted).length}
        </div>
      </CardFooter>
    </Card>
  );
} 