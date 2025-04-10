import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Timer, Clock, ListTodo, Zap, Brain } from "lucide-react";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";

export const FocusEnhancementTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [whiteNoiseEnabled, setWhiteNoiseEnabled] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);

  const handleTimerComplete = () => {
    if (isPomodoro) {
      setIsBreak(!isBreak);
      setTimeRemaining(isBreak ? workDuration * 60 : breakDuration * 60);
      toast({
        title: isBreak ? "Work Time!" : "Break Time!",
        description: `Time to ${isBreak ? "focus" : "take a break"}`,
      });
    } else {
      setIsRunning(false);
      toast({
        title: "Timer Complete!",
        description: "Great job staying focused!",
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(workDuration * 60);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const saveFocusSession = async () => {
    if (!user?.id) {
      toast({
        title: "Not Logged In",
        description: "Log in to save your session.",
        variant: "destructive",
      });
      return;
    }

    const elapsedWorkSeconds = isPomodoro 
      ? (workDuration * 60)
      : (workDuration * 60 - timeRemaining);
    const durationMinutes = Math.max(0, Math.round(elapsedWorkSeconds / 60));
    
    if (durationMinutes <= 0) {
        toast({
            title: "No duration recorded",
            description: "Cannot save a session with zero duration.",
        });
        return;
    }

    try {
      const { error } = await supabasePost(
        "energy_focus_logs",
        [{
          user_id: user.id,
          activity_type: "focus_session",
          activity_name: isPomodoro ? "pomodoro" : "focus_timer",
          duration_minutes: durationMinutes,
          focus_rating: 85,
          notes: `Completed ${isPomodoro ? "Pomodoro" : "Focus"} session of ~${durationMinutes} min`,
        }]
      );

      if (error) throw error;

      toast({
        title: "Session saved!",
        description: "Your focus session has been recorded.",
      });
    } catch (error) {
      console.error("Error saving focus session:", error);
      toast({
        title: "Error saving session",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Focus Enhancement Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Pomodoro Mode</Label>
              <p className="text-sm text-muted-foreground">
                Alternate between focused work and breaks
              </p>
            </div>
            <Switch
              checked={isPomodoro}
              onCheckedChange={setIsPomodoro}
              disabled={isRunning}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>White Noise</Label>
              <p className="text-sm text-muted-foreground">
                Background noise to help you focus
              </p>
            </div>
            <Switch
              checked={whiteNoiseEnabled}
              onCheckedChange={setWhiteNoiseEnabled}
            />
          </div>

          <div className="text-center space-y-4">
            <div className="text-4xl font-bold font-mono">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground">
              {isBreak ? "Break Time" : "Focus Time"}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={toggleTimer} className="w-24">
              {isRunning ? (
                <>
                  <Timer className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={resetTimer} variant="outline" className="w-24">
              Reset
            </Button>
          </div>

          {!isRunning && timeRemaining !== workDuration * 60 && (
            <div className="flex justify-center">
              <Button onClick={saveFocusSession} variant="secondary">
                <ListTodo className="h-4 w-4 mr-2" />
                Save Session
              </Button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Focus Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Start with small, manageable tasks</li>
            <li>• Remove distractions from your environment</li>
            <li>• Take regular breaks to maintain energy</li>
            <li>• Stay hydrated and maintain good posture</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};