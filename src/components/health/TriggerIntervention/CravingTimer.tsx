import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, Check, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface CravingTimerProps {
  initialDuration: number; // in seconds
  onComplete: (newIntensity: number) => void;
}

// Encouragement messages at different time points
const encouragementMessages = [
  {
    timeRemaining: 300, // 5 minutes
    message: "Cravings typically last 3-5 minutes. You've just started - stay strong!"
  },
  {
    timeRemaining: 240, // 4 minutes
    message: "Your brain is adjusting to not getting nicotine. This discomfort is temporary."
  },
  {
    timeRemaining: 180, // 3 minutes
    message: "You're halfway there! The intensity should start decreasing soon."
  },
  {
    timeRemaining: 120, // 2 minutes
    message: "Almost there - this craving is losing its power with each second."
  },
  {
    timeRemaining: 60, // 1 minute
    message: "Just one more minute! You've proven you can resist this craving."
  },
  {
    timeRemaining: 30, // 30 seconds
    message: "The finish line is in sight! A few more moments and you'll have beaten this craving."
  }
];

// Facts about cravings and benefits of resistance
const cravingFacts = [
  "Each craving you resist makes the next one easier to handle.",
  "The average craving lasts only 3-5 minutes.",
  "Your brain forms new neural pathways each time you resist a craving.",
  "Cravings peak within 2-3 days after quitting and gradually decrease afterward.",
  "Physical withdrawal symptoms begin to diminish after 1-3 weeks.",
  "The intensity of cravings decreases by about 10% each day after quitting.",
  "Resisting a craving releases dopamine, creating a natural sense of accomplishment.",
  "Within 20 minutes of your last cigarette, your heart rate begins to normalize.",
  "After 12 hours without smoking, carbon monoxide levels in your blood drop to normal.",
  "After 48 hours, your sense of taste and smell begin to improve."
];

export const CravingTimer: React.FC<CravingTimerProps> = ({ 
  initialDuration,
  onComplete 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState(5);
  const [currentFact, setCurrentFact] = useState('');
  const [encouragement, setEncouragement] = useState('');
  
  // Function to format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Start or pause the timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
    
    // If starting timer for the first time, set a random fact
    if (!isRunning && !timerCompleted) {
      setCurrentFact(cravingFacts[Math.floor(Math.random() * cravingFacts.length)]);
    }
  };
  
  // Reset the timer
  const resetTimer = () => {
    setTimeRemaining(initialDuration);
    setIsRunning(false);
    setTimerCompleted(false);
    setCurrentFact(cravingFacts[Math.floor(Math.random() * cravingFacts.length)]);
  };
  
  // Submit rating when timer is complete
  const handleCompleteTimer = () => {
    onComplete(currentIntensity);
  };
  
  // Get encouragement message based on time remaining
  useEffect(() => {
    if (isRunning) {
      // Find the appropriate encouragement message
      const currentEncouragement = encouragementMessages.find(
        item => item.timeRemaining >= timeRemaining && 
               item.timeRemaining - 30 <= timeRemaining
      );
      
      if (currentEncouragement) {
        setEncouragement(currentEncouragement.message);
      } else if (timeRemaining <= 10) {
        setEncouragement("Just a few more seconds! You've practically conquered this craving!");
      } else {
        setEncouragement("");
      }
    }
  }, [timeRemaining, isRunning]);
  
  // Timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        
        // Randomly change facts every 60 seconds
        if (timeRemaining % 60 === 0) {
          setCurrentFact(cravingFacts[Math.floor(Math.random() * cravingFacts.length)]);
        }
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      setIsRunning(false);
      setTimerCompleted(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, timeRemaining]);
  
  // Calculate progress percentage
  const progress = ((initialDuration - timeRemaining) / initialDuration) * 100;
  
  return (
    <div className="space-y-4">
      {!timerCompleted && !isRunning && timeRemaining === initialDuration && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cravings typically last 3-5 minutes. Using a timer helps you ride out the craving until it passes naturally.
          </AlertDescription>
        </Alert>
      )}
      
      {!timerCompleted && (
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/20 transition-all duration-1000" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="z-10 flex flex-col items-center">
                <span className="text-3xl font-bold">{formatTime(timeRemaining)}</span>
                <span className="text-xs text-muted-foreground">remaining</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                variant={isRunning ? "secondary" : "default"} 
                onClick={toggleTimer}
              >
                {isRunning ? "Pause" : timeRemaining < initialDuration ? "Resume" : "Start Timer"}
              </Button>
              
              {timeRemaining < initialDuration && !timerCompleted && (
                <Button variant="outline" onClick={resetTimer}>
                  Reset
                </Button>
              )}
            </div>
          </div>
          
          {(isRunning || timeRemaining < initialDuration) && (
            <div className="space-y-4 mt-4">
              <Progress value={progress} className="h-2" />
              
              {encouragement && (
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="text-sm font-medium">{encouragement}</p>
                </div>
              )}
              
              {currentFact && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Did you know?</h4>
                  <p className="text-sm text-muted-foreground">{currentFact}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {timerCompleted && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Time's up!</AlertTitle>
            <AlertDescription>
              Congratulations! You've successfully waited out this craving.
            </AlertDescription>
          </Alert>
          
          <h3 className="font-medium">How intense is your craving now?</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">1 (Very Mild)</span>
              <span className="text-sm">10 (Very Intense)</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[currentIntensity]}
              onValueChange={(val) => setCurrentIntensity(val[0])}
            />
          </div>
          
          <Button onClick={handleCompleteTimer} className="w-full">
            Complete & Continue
          </Button>
        </div>
      )}
    </div>
  );
}; 