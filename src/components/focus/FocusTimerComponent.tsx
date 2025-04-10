import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Timer, Play, Pause, RotateCcw, BellRing, Coffee, Brain, CheckCircle, History } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { FocusService, FocusSession8 } from "@/services/FocusService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

// Time presets in minutes
const FOCUS_PRESETS = [
  { value: 25, label: "25 min (Pomodoro)" },
  { value: 50, label: "50 min (Deep Work)" },
  { value: 90, label: "90 min (Flow State)" },
];

export const FocusTimerComponent = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default: 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60); // For progress calculation
  const [selectedPreset, setSelectedPreset] = useState("25");
  const [customMinutes, setCustomMinutes] = useState(25);
  const [isBreak, setIsBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState(5); // Default break: 5 minutes
  const [sessionHistory, setSessionHistory] = useState<FocusSession8[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const focusService = FocusService.getInstance();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [session, navigate, toast]);

  // If not authenticated, don't render the component
  if (!session?.user) {
    return null;
  }

  // Initialize tables when component mounts
  useEffect(() => {
    const initTables = async () => {
      try {
        await focusService.initializeTables();
      } catch (error) {
        console.error("Error initializing tables:", error);
        toast({
          title: "Error",
          description: "Failed to initialize database tables",
          variant: "destructive",
        });
      }
    };

    initTables();
  }, [toast]);

  // Load session history
  useEffect(() => {
    const loadSessionHistory = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const history = await focusService.getFocusSessionHistory(session.user.id);
        setSessionHistory(history);
      } catch (error) {
        console.error("Error loading session history:", error);
        toast({
          title: "Error",
          description: "Failed to load session history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionHistory();
  }, [session, toast]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer completed
      setIsRunning(false);
      
      if (!isBreak) {
        // Focus session completed, offer break
        if (currentSessionId && startTimeRef.current && session?.user?.id) {
          const endTime = new Date();
          const durationSeconds = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
          
          // Complete the focus session in the database
          focusService.completeFocusSession(
            currentSessionId,
            endTime.toISOString(),
            durationSeconds
          ).then(() => {
            // Refresh session history
            focusService.getFocusSessionHistory(session.user.id).then(history => {
              setSessionHistory(history);
            });
          }).catch(error => {
            console.error("Error completing focus session:", error);
          });
          
          setCurrentSessionId(null);
          startTimeRef.current = null;
        }
        
        toast({
          title: "Focus session completed!",
          description: `Well done! Time for a ${breakDuration} minute break.`,
        });
        // Switch to break mode
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
        setTotalTime(breakDuration * 60);
      } else {
        // Break completed
        toast({
          title: "Break completed!",
          description: "Ready to start another focus session?",
        });
        // Switch back to focus mode
        setIsBreak(false);
        const newTime = parseInt(selectedPreset) * 60;
        setTimeLeft(newTime);
        setTotalTime(newTime);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, breakDuration, selectedPreset, toast, currentSessionId, session]);

  // Handle start/pause
  const toggleTimer = async () => {
    if (!isRunning) {
      // Starting the timer
      if (!isBreak && session?.user?.id) {
        // Only record focus sessions, not breaks
        startTimeRef.current = new Date();
        
        try {
          const focusType = getFocusTypeFromDuration(parseInt(selectedPreset));
          const newSessionId = await focusService.startFocusSession(
            session.user.id,
            focusType,
            startTimeRef.current.toISOString()
          );
          
          setCurrentSessionId(newSessionId);
          
          toast({
            title: "Focus Session Started",
            description: `${focusType} session started. Stay focused!`,
          });
        } catch (error) {
          console.error("Error starting focus session:", error);
          toast({
            title: "Error",
            description: "Failed to start session",
            variant: "destructive",
          });
          // Continue with the timer but don't track in database
          startTimeRef.current = null;
        }
      }
    } else {
      // Pausing the timer - for now we'll just pause the UI timer
      // In a more advanced implementation, we might want to track pauses
    }
    
    setIsRunning(!isRunning);
  };

  // Get focus type based on duration
  const getFocusTypeFromDuration = (minutes: number): string => {
    if (minutes <= 25) return "pomodoro";
    if (minutes <= 50) return "deep_work";
    return "flow";
  };

  // Handle reset
  const resetTimer = () => {
    // If we're resetting an active session, consider it abandoned
    if (isRunning && currentSessionId && startTimeRef.current && session?.user?.id) {
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
      
      // Complete the focus session in the database, but mark as not completed
      focusService.completeFocusSession(
        currentSessionId,
        endTime.toISOString(),
        durationSeconds
      ).then(() => {
        // Refresh session history
        focusService.getFocusSessionHistory(session.user.id).then(history => {
          setSessionHistory(history);
        });
      }).catch(error => {
        console.error("Error completing focus session:", error);
      });
      
      setCurrentSessionId(null);
      startTimeRef.current = null;
    }
    
    setIsRunning(false);
    if (isBreak) {
      setTimeLeft(breakDuration * 60);
      setTotalTime(breakDuration * 60);
    } else {
      const newTime = parseInt(selectedPreset) * 60;
      setTimeLeft(newTime);
      setTotalTime(newTime);
    }
  };

  // Handle focus duration change
  const handlePresetChange = (value: string) => {
    if (isRunning) return; // Don't change while running
    
    setSelectedPreset(value);
    setCustomMinutes(parseInt(value));
    const newTime = parseInt(value) * 60;
    setTimeLeft(newTime);
    setTotalTime(newTime);
  };

  // Handle custom duration change
  const handleCustomChange = (values: number[]) => {
    if (isRunning) return; // Don't change while running
    
    const minutes = values[0];
    setCustomMinutes(minutes);
    setSelectedPreset(minutes.toString());
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Calculate progress percentage
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Focus Timer</h1>
      <p className="text-muted-foreground mb-8">
        Use the timer to implement the Pomodoro Technique and other focused work sessions.
      </p>

      <Tabs defaultValue="timer" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className={isBreak ? "border-green-200 bg-green-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isBreak ? (
                      <>
                        <Coffee className="h-5 w-5 text-green-600" />
                        <span className="text-green-700">Break Time</span>
                      </>
                    ) : (
                      <>
                        <Timer className="h-5 w-5" />
                        <span>Focus Session</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isBreak 
                      ? "Take a moment to rest, stretch, or grab some water" 
                      : "Block distractions and focus on your task"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer Display */}
                  <div className="flex flex-col items-center">
                    <div className="text-6xl font-bold font-mono my-6">
                      {formatTime(timeLeft)}
                    </div>
                    <Progress value={progress} className="w-full h-2" />
                    <div className="text-muted-foreground text-sm mt-2">
                      {isBreak ? "Break" : "Focus"}: {Math.floor(progress)}% completed
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      size="lg"
                      onClick={toggleTimer}
                      className="w-32"
                      variant={isRunning ? "outline" : "default"}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="mr-2 h-5 w-5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={resetTimer}
                      className="w-32"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Reset
                    </Button>
                  </div>

                  {/* Session settings (only shown during focus mode) */}
                  {!isBreak && !isRunning && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">Focus Duration</h3>
                      <RadioGroup 
                        value={selectedPreset} 
                        onValueChange={handlePresetChange}
                        className="flex flex-col space-y-2"
                      >
                        {FOCUS_PRESETS.map((preset) => (
                          <div key={preset.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={preset.value.toString()} id={`preset-${preset.value}`} />
                            <Label htmlFor={`preset-${preset.value}`}>{preset.label}</Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={customMinutes.toString()} id="preset-custom" />
                          <Label htmlFor="preset-custom">Custom: {customMinutes} min</Label>
                        </div>
                      </RadioGroup>

                      <div className="pt-2">
                        <Slider
                          value={[customMinutes]}
                          min={5}
                          max={120}
                          step={5}
                          onValueChange={handleCustomChange}
                          disabled={isRunning}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>5 min</span>
                          <span>120 min</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Break settings (only shown during break mode) */}
                  {isBreak && !isRunning && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">Break Duration</h3>
                      <div className="pt-2">
                        <Slider
                          value={[breakDuration]}
                          min={1}
                          max={30}
                          step={1}
                          onValueChange={(values) => {
                            setBreakDuration(values[0]);
                            setTimeLeft(values[0] * 60);
                            setTotalTime(values[0] * 60);
                          }}
                          disabled={isRunning}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 min</span>
                          <span>30 min</span>
                        </div>
                        <div className="text-center mt-2">
                          {breakDuration} minutes
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Focus Technique
                  </CardTitle>
                  <CardDescription>How to use the Pomodoro Technique</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</div>
                    <div>
                      <h3 className="font-medium">Choose a task</h3>
                      <p className="text-sm text-muted-foreground">Select one task to focus on</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</div>
                    <div>
                      <h3 className="font-medium">Set the timer</h3>
                      <p className="text-sm text-muted-foreground">Traditional Pomodoro is 25 minutes</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">3</div>
                    <div>
                      <h3 className="font-medium">Work until the timer rings</h3>
                      <p className="text-sm text-muted-foreground">Focus completely on your task</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">4</div>
                    <div>
                      <h3 className="font-medium">Take a short break</h3>
                      <p className="text-sm text-muted-foreground">5 minutes to rest and reset</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">5</div>
                    <div>
                      <h3 className="font-medium">Repeat</h3>
                      <p className="text-sm text-muted-foreground">After 4 cycles, take a longer break</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled={isRunning}>
                    <BellRing className="h-4 w-4 mr-2" />
                    Test Notification
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Focus Session History
              </CardTitle>
              <CardDescription>
                Your recent focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading session history...</p>
                </div>
              ) : sessionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No focus sessions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessionHistory.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">
                          {session.focus_type.charAt(0).toUpperCase() + session.focus_type.slice(1).replace('_', ' ')}
                          {session.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.start_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDuration(session.duration_seconds)}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.completed ? 'Completed' : 'Abandoned'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 