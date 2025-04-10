import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDuration } from "@/lib/utils";

type TimerMode = "work" | "short-break" | "long-break";

interface PomodoroTimerProps {
  onSessionComplete?: (sessionData: {
    duration: number;
    completedIntervals: number;
  }) => void;
  onDistraction?: () => void;
}

export function PomodoroTimer({
  onSessionComplete,
  onDistraction,
}: PomodoroTimerProps) {
  // Timer settings
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [intervalsBeforeLongBreak, setIntervalsBeforeLongBreak] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartWork, setAutoStartWork] = useState(false);
  
  // Timer state
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedIntervals, setCompletedIntervals] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/timer-complete.mp3");
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update timeLeft when settings change
  useEffect(() => {
    if (mode === "work") {
      setTimeLeft(workDuration * 60);
    } else if (mode === "short-break") {
      setTimeLeft(shortBreakDuration * 60);
    } else if (mode === "long-break") {
      setTimeLeft(longBreakDuration * 60);
    }
  }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            
            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
            
            // Handle timer completion
            if (mode === "work") {
              const newCompletedIntervals = completedIntervals + 1;
              setCompletedIntervals(newCompletedIntervals);
              
              // Determine if we need a short or long break
              if (newCompletedIntervals % intervalsBeforeLongBreak === 0) {
                setMode("long-break");
                setIsActive(autoStartBreaks);
                return longBreakDuration * 60;
              } else {
                setMode("short-break");
                setIsActive(autoStartBreaks);
                return shortBreakDuration * 60;
              }
            } else {
              // After break, go back to work
              setMode("work");
              setIsActive(autoStartWork);
              return workDuration * 60;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, mode, completedIntervals, autoStartBreaks, autoStartWork, workDuration, shortBreakDuration, longBreakDuration, intervalsBeforeLongBreak]);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get current duration based on mode
  const getCurrentDuration = (): number => {
    if (mode === "work") return workDuration * 60;
    if (mode === "short-break") return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    const currentDuration = getCurrentDuration();
    return ((currentDuration - timeLeft) / currentDuration) * 100;
  };

  // Timer controls
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "work") {
      setTimeLeft(workDuration * 60);
    } else if (mode === "short-break") {
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setTimeLeft(longBreakDuration * 60);
    }
  };

  const skipInterval = () => {
    setIsActive(false);
    if (mode === "work") {
      const newCompletedIntervals = completedIntervals + 1;
      setCompletedIntervals(newCompletedIntervals);
      
      if (newCompletedIntervals % intervalsBeforeLongBreak === 0) {
        setMode("long-break");
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode("short-break");
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      setMode("work");
      setTimeLeft(workDuration * 60);
    }
  };

  const logDistraction = () => {
    setDistractions(distractions + 1);
    if (onDistraction) {
      onDistraction();
    }
  };

  // Get the color for the current mode
  const getModeColor = () => {
    if (mode === "work") return "text-red-500";
    if (mode === "short-break") return "text-green-500";
    return "text-blue-500";
  };

  const getModeText = () => {
    if (mode === "work") return "Focus Time";
    if (mode === "short-break") return "Short Break";
    return "Long Break";
  };

  const getProgressColor = () => {
    if (mode === "work") return "bg-red-500";
    if (mode === "short-break") return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <Card className="border-2 overflow-hidden">
      <div className="p-6 flex flex-col items-center space-y-6">
        {/* Top controls */}
        <div className="flex justify-between w-full">
          <div>
            <span className={`font-semibold ${getModeColor()}`}>
              {getModeText()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {completedIntervals}/{intervalsBeforeLongBreak} intervals
            </span>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="work-duration">
                      Work Duration: {workDuration} minutes
                    </Label>
                    <Slider
                      id="work-duration"
                      min={1}
                      max={60}
                      step={1}
                      value={[workDuration]}
                      onValueChange={(value) => setWorkDuration(value[0])}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="short-break-duration">
                      Short Break: {shortBreakDuration} minutes
                    </Label>
                    <Slider
                      id="short-break-duration"
                      min={1}
                      max={30}
                      step={1}
                      value={[shortBreakDuration]}
                      onValueChange={(value) => setShortBreakDuration(value[0])}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="long-break-duration">
                      Long Break: {longBreakDuration} minutes
                    </Label>
                    <Slider
                      id="long-break-duration"
                      min={1}
                      max={60}
                      step={1}
                      value={[longBreakDuration]}
                      onValueChange={(value) => setLongBreakDuration(value[0])}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="intervals-count">
                      Intervals before long break
                    </Label>
                    <Select
                      value={intervalsBeforeLongBreak.toString()}
                      onValueChange={(value) => setIntervalsBeforeLongBreak(parseInt(value))}
                    >
                      <SelectTrigger id="intervals-count">
                        <SelectValue placeholder="Select intervals" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Timer display */}
        <div className="text-6xl font-bold tabular-nums">
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <Progress className="w-full h-2" value={calculateProgress()} />

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="lg"
            onClick={toggleTimer}
            className="rounded-full w-24"
          >
            {isActive ? <Pause /> : <Play />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={skipInterval}
            className="rounded-full"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Distraction logging (only show during work sessions) */}
        {mode === "work" && (
          <Button
            variant="ghost"
            className="text-red-500 border border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={logDistraction}
          >
            Log Distraction ({distractions})
          </Button>
        )}

        <div className="text-sm text-muted-foreground mt-2">
          {completedIntervals > 0 && (
            <span>
              Total work time: {formatDuration(completedIntervals * workDuration)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
} 