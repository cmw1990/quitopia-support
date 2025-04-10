import React, { useState, useEffect, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { format, differenceInSeconds } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Slider,
} from "../ui/index";
import {
  Flame,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Wind,
  Activity,
  Leaf,
  ArrowRight,
  ThumbsUp,
  Loader2,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import {
  CravingLog,
  logCraving,
} from "../../api/nicotineTracking";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const supportStrategies = [
  {
    id: "deep-breathing",
    name: "Deep Breathing",
    description: "Slow, deep breaths to calm your mind and reduce craving intensity.",
    type: "breathing",
    duration: 2,
    instructions: [
      "Find a comfortable position sitting or standing",
      "Breathe in slowly through your nose for 4 seconds",
      "Hold your breath for 2 seconds",
      "Exhale slowly through your mouth for 6 seconds",
      "Repeat for 2 minutes",
    ],
  },
  {
    id: "focus-shift",
    name: "Focus Shifting",
    description: "Shift your attention to a specific task to distract from the craving.",
    type: "cognitive",
    duration: 5,
    instructions: [
      "Choose a small, engaging task that requires focus",
      "Set a timer for 5 minutes",
      "Immerse yourself completely in the task",
      "When the craving intrudes, gently redirect your attention",
      "Complete the task before reassessing the craving",
    ],
  },
  {
    id: "water-technique",
    name: "Water Technique",
    description: "Using water to reset your system and reduce craving intensity.",
    type: "physical",
    duration: 1,
    instructions: [
      "Get a glass of cold water",
      "Take small sips, focusing on the sensation",
      "Hold the water in your mouth briefly before swallowing",
      "Notice how it feels as it travels through your body",
      "Finish the entire glass slowly and mindfully",
    ],
  },
  {
    id: "visualize-success",
    name: "Success Visualization",
    description: "Visualize yourself successfully overcoming the craving.",
    type: "cognitive",
    duration: 3,
    instructions: [
      "Close your eyes and take a deep breath",
      "Imagine the craving as a wave that rises and falls",
      "Visualize yourself riding the wave without giving in",
      "Picture the pride and satisfaction of overcoming the craving",
      "Open your eyes and affirm your commitment to stay focused",
    ],
  },
];

interface CravingManagerProps {
  onClose: () => void;
  isOpen?: boolean;
  onCravingHandled?: (data: { resisted: boolean; duration: number; intensity: number }) => void;
}

export const CravingManager: React.FC<CravingManagerProps> = ({ 
  onClose,
  isOpen = true,
  onCravingHandled
}) => {
  const session = useSession();
  const [phase, setPhase] = useState<'tracking' | 'responding' | 'completed'>('tracking');
  const [intensity, setIntensity] = useState(7);
  const [trigger, setTrigger] = useState<string>("stress");
  const [cravingStartTime] = useState(new Date());
  const [cravingEndTime, setCravingEndTime] = useState<Date | null>(null);
  const [cravingDuration, setCravingDuration] = useState(0);
  const [resisted, setResisted] = useState<boolean | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outcome, setOutcome] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Timer for updating duration
  const timerRef = useRef<number | null>(null);
  
  // Track the duration of the craving
  useEffect(() => {
    if (phase === 'tracking' || phase === 'responding') {
      timerRef.current = window.setInterval(() => {
        const duration = differenceInSeconds(new Date(), cravingStartTime);
        setCravingDuration(duration);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase, cravingStartTime]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Format the duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleIntensityChange = (value: number[]) => {
    setIntensity(value[0]);
  };
  
  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    
    // Show success message
    toast.success(`Strategy selected: ${supportStrategies.find(s => s.id === strategyId)?.name}`);
  };
  
  const handleCravingResisted = async () => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      setCravingEndTime(now);
      setResisted(true);
      setPhase('completed');
      
      // Calculate final duration
      const duration = differenceInSeconds(now, cravingStartTime);
      
      // Log the craving
      if (session) {
        await logCraving(session, {
          timestamp: cravingStartTime.toISOString(),
          intensity: intensity,
          duration_seconds: duration,
          trigger_type: trigger,
          resisted: true,
          strategies_used: selectedStrategy ? [selectedStrategy] : [],
          notes: notes,
        });
      }
      
      // Notify parent component
      if (onCravingHandled) {
        onCravingHandled({
          resisted: true,
          duration: duration,
          intensity: intensity,
        });
      }
      
      toast.success("Great job! You resisted the craving!");
    } catch (error) {
      console.error("Error logging craving:", error);
      toast.error("Failed to log craving data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCravingGaveIn = async () => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      setCravingEndTime(now);
      setResisted(false);
      setPhase('completed');
      
      // Calculate final duration
      const duration = differenceInSeconds(now, cravingStartTime);
      
      // Log the craving
      if (session) {
        await logCraving(session, {
          timestamp: cravingStartTime.toISOString(),
          intensity: intensity,
          duration_seconds: duration,
          trigger_type: trigger,
          resisted: false,
          strategies_used: selectedStrategy ? [selectedStrategy] : [],
          notes: notes,
        });
      }
      
      // Notify parent component
      if (onCravingHandled) {
        onCravingHandled({
          resisted: false,
          duration: duration,
          intensity: intensity,
        });
      }
      
      toast.info("It's okay. You'll do better next time!");
    } catch (error) {
      console.error("Error logging craving:", error);
      toast.error("Failed to log craving data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const moveToResponding = () => {
    setPhase('responding');
  };
  
  const handleClose = () => {
    // If we haven't completed the craving process, ask for confirmation
    if (phase !== 'completed') {
      if (confirm("Are you sure you want to close without recording the outcome?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  // Start a timer when the craving dialog opens
  useEffect(() => {
    let interval: number | null = null;
    
    if (isOpen && !timerRunning) {
      setTimerRunning(true);
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, timerRunning]);

  const handleSubmit = () => {
    setTimerRunning(false);
    setShowResults(true);
    
    if (onCravingHandled) {
      onCravingHandled({
        resisted: outcome === 'resisted',
        duration: timer,
        intensity: intensity
      });
    }
  };

  const renderContent = () => {
    if (showResults) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Craving Tracked</DialogTitle>
            <DialogDescription>
              Great job tracking your craving! This data helps you understand your patterns.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Duration:</span>
              <span>{formatDuration(timer)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Intensity:</span>
              <span>{intensity}/10</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Outcome:</span>
              <span className={outcome === 'resisted' ? 'text-green-600' : 'text-red-600'}>
                {outcome === 'resisted' ? 'Successfully resisted' : 'Gave in to craving'}
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </>
      );
    }
    
    return (
      <>
        <DialogHeader>
          <DialogTitle>Managing Your Craving</DialogTitle>
          <DialogDescription>
            Take a moment to assess your craving and track the outcome.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              Time elapsed:
            </span>
            <span className="font-mono text-lg">{formatDuration(timer)}</span>
          </div>
          
          <div className="space-y-2">
            <Label>How intense is your craving? ({intensity}/10)</Label>
            <Slider
              value={[intensity]}
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => setIntensity(values[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>What strategies are you trying?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">Deep breathing</Button>
              <Button variant="outline" size="sm">Drink water</Button>
              <Button variant="outline" size="sm">Take a walk</Button>
              <Button variant="outline" size="sm">Distraction</Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>What was the outcome?</Label>
            <RadioGroup value={outcome} onValueChange={setOutcome}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="resisted" id="resisted" />
                <Label htmlFor="resisted" className="text-green-600">I resisted the craving</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gave-in" id="gave-in" />
                <Label htmlFor="gave-in" className="text-red-600">I gave in to the craving</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!outcome}>Submit</Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}; 