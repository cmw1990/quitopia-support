import React, { useState, useEffect } from 'react';
import type { ContextSwitchSession } from '@/services/context-switching/contextSwitchingService';
import type { ContextSwitchTemplate, ContextSwitchStep } from '@/types/contextSwitching';
import { contextSwitchingService } from '@/services/context-switching/contextSwitchingService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowRight, CheckCircle, XCircle, SkipForward, Flag, Play, Pause } from 'lucide-react'; // Added Play, Pause

interface ContextSwitchingActiveSessionProps {
  session: ContextSwitchSession;
  template: ContextSwitchTemplate; // Pass the template for step details
  onSessionEnd: (success: boolean) => void; // Callback when session is completed or cancelled
}

// Helper to format seconds
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const ContextSwitchingActiveSession: React.FC<ContextSwitchingActiveSessionProps> = ({
  session,
  template,
  onSessionEnd,
}) => {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimer, setStepTimer] = useState(0); // Timer for the current step
  const [totalElapsed, setTotalElapsed] = useState(0); // Total time elapsed for the session
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = template.steps.sort((a, b) => a.order - b.order); // Ensure steps are sorted
  const currentStep = steps[currentStepIndex];
  const totalEstimatedTime = template.estimated_time_seconds;

  // Initialize step timer when step changes
  useEffect(() => {
    if (currentStep) {
      // Ensure estimated_time_seconds is a positive number
      const initialTime = Math.max(0, currentStep.estimated_time_seconds || 0);
      setStepTimer(initialTime);
    }
  }, [currentStepIndex, currentStep]);

  // Main timer logic
  useEffect(() => {
    if (isPaused || !currentStep || stepTimer <= 0) return; // Stop interval if timer is 0 or paused

    const interval = setInterval(() => {
      setStepTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [stepTimer, isPaused, currentStep]);

  // Effect to automatically move to the next step when step timer reaches 0
  useEffect(() => {
    if (stepTimer === 0 && currentStep && !isPaused) {
        // Adding a small delay to prevent potential race conditions or double triggers
        const timeoutId = setTimeout(() => {
             handleNextStep();
        }, 100); // 100ms delay

        return () => clearTimeout(timeoutId);
    }
  }, [stepTimer, currentStep, isPaused, currentStepIndex]); // Added currentStepIndex


  const handleNextStep = () => {
    // Prevent moving next if already completing/ending
    if (isCompleting) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      // Timer reset is handled by the other useEffect hook
    } else {
      // Automatically mark as successful when the last step's timer runs out
      handleEndSession(true);
    }
  };

  const handleEndSession = async (success: boolean, notes?: string) => {
    // Prevent double submissions
    if (isCompleting) return;
    setIsCompleting(true);
    setIsPaused(true); // Pause timer while submitting

    try {
      const endData = {
        end_time: new Date().toISOString(),
        duration_seconds: totalElapsed,
        success_rating: success ? 5 : 1, // Simple success/fail rating for now
        notes: notes || (success ? "Completed successfully." : "Ended early."),
      };
      const { error } = await contextSwitchingService.endSwitchingSession(session.id, endData);
      if (error) throw error;

      toast({
        title: `Session ${success ? 'Completed' : 'Ended'}`,
        description: `Context switch session ${session.id} has finished.`,
      });
      onSessionEnd(success); // Call the callback provided by the parent page

    } catch (error: any) {
      console.error("Failed to end session:", error);
      toast({
        title: "Error Ending Session",
        description: error.message || "Could not update the session.",
        variant: "destructive",
      });
      setIsPaused(false); // Unpause if ending failed
    } finally {
      // No need to setIsCompleting(false) here as the component will unmount
      // via the onSessionEnd callback
    }
  };

  // Function to handle skipping the current step
  const handleSkipStep = () => {
     if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // If skipping the last step, end the session as incomplete
      handleEndSession(false, "Skipped final step.");
    }
  };

  // Handle case where template or steps might be missing
  if (!currentStep || !steps || steps.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Could not load session details or template steps.</p>
          <Button variant="outline" onClick={() => onSessionEnd(false)} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress, ensuring no division by zero
  const stepProgress = currentStep.estimated_time_seconds > 0
    ? Math.max(0, 100 - (stepTimer / currentStep.estimated_time_seconds) * 100)
    : 100; // If estimate is 0, show step as complete
  const totalProgress = totalEstimatedTime > 0
    ? Math.min(100, (totalElapsed / totalEstimatedTime) * 100)
    : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Context Switch in Progress</CardTitle>
        <CardDescription className="text-center flex items-center justify-center gap-2">
          <span>{session.from_context}</span>
          <ArrowRight className="h-4 w-4" />
          <span>{session.to_context}</span>
        </CardDescription>
        <div className="text-center mt-2 text-sm text-muted-foreground">
          Using Template: {template.name}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Step Info */}
        <div className="text-center p-6 border rounded-lg bg-background shadow-inner">
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            Step {currentStepIndex + 1} of {steps.length}: <span className="capitalize">{currentStep.type}</span>
          </p>
          <p className="text-xl font-bold mb-3">{currentStep.description}</p>
          <div className="text-5xl font-mono font-bold mb-3 tabular-nums">
            {formatTime(stepTimer)}
          </div>
          <Progress value={stepProgress} className="h-2 w-3/4 mx-auto" />
           <p className="text-xs text-muted-foreground mt-2">
            Estimate: {formatTime(currentStep.estimated_time_seconds)}
          </p>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
           <div className="flex justify-between text-sm text-muted-foreground">
             <span>Overall Progress</span>
             <span>{formatTime(totalElapsed)} / {formatTime(totalEstimatedTime)} (est.)</span>
           </div>
           <Progress value={totalProgress} className="h-2" />
         </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
         <Button variant="outline" onClick={() => setIsPaused(!isPaused)} disabled={isCompleting} className="w-full sm:w-auto">
           {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
           {isPaused ? 'Resume' : 'Pause'}
         </Button>
        <Button
          variant="destructive"
          onClick={() => handleEndSession(false, "User ended switch early.")} // End early = not successful
          disabled={isCompleting}
          className="w-full sm:w-auto"
        >
          <XCircle className="mr-2 h-4 w-4" /> End Switch Early
        </Button>
         <div className="flex gap-2 w-full sm:w-auto">
           <Button
             variant="secondary"
             onClick={handleSkipStep} // Skip current step
             disabled={isCompleting || currentStepIndex >= steps.length - 1} // Disable on last step
             className="flex-1 sm:flex-none"
            >
             <SkipForward className="mr-2 h-4 w-4" /> Skip Step
           </Button>
           {currentStepIndex === steps.length - 1 ? (
             <Button
               onClick={() => handleEndSession(true)} // Manual finish on last step
               disabled={isCompleting}
               className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
             >
               <CheckCircle className="mr-2 h-4 w-4" /> Finish Switch
             </Button>
           ) : (
             <Button
               onClick={handleNextStep} // Manually move to next step
               disabled={isCompleting}
               className="flex-1 sm:flex-none"
             >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContextSwitchingActiveSession; 