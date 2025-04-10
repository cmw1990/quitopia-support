import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SmartPanels } from './smart-panels/SmartRecommendations';
import { FocusAnalytics } from './metrics/FocusAnalytics';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { 
  Brain, 
  Bell, 
  BarChart2, 
  Settings, 
  Volume2,
  Calendar,
  Clock,
  Zap,
  Target,
  AlertCircle,
  Flame,
  BrainCircuit,
  Sparkles,
  Timer,
  Activity,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ChevronDown,
  Check
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import { useToast } from '@/components/hooks/use-toast';

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  type: 'focus' | 'break' | 'micro-break';
  task?: string;
  distractions: number;
  intensity: 'low' | 'medium' | 'high';
  flowState: 'building' | 'flowing' | 'declining' | 'unknown';
  energyLevel: number;
  focusQuality: number;
  environment: {
    noise: 'quiet' | 'moderate' | 'loud';
    lighting: 'dark' | 'dim' | 'bright';
    temperature: 'cold' | 'comfortable' | 'warm';
  };
}

interface FocusSession {
  duration: number;
  distractions: number;
  task?: string;
  completed: boolean;
  intensity: string;
  timestamp: string;
}

interface SmartRecommendation {
  duration: number;
  type: 'focus' | 'break' | 'micro-break';
  confidence: number;
  reason: string;
  adaptiveSuggestions: {
    environment: string[];
    technique: string;
    breakActivity?: string;
  };
  flowStateAnalysis: {
    currentState: 'building' | 'flowing' | 'declining' | 'unknown';
    sustainabilityScore: number;
    recommendations: string[];
  };
  energyOptimization: {
    currentLevel: number;
    peakTimeStart: string;
    peakTimeEnd: string;
    suggestions: string[];
  };
}

// New type for more detailed flow state
type FlowPhase = 'preparation' | 'struggle' | 'incubation' | 'illumination' | 'verification' | 'unknown';

// Enhanced timer state
interface EnhancedTimerState extends TimerState {
  flowPhase: FlowPhase;
  neuralActivity: {
    prefrontal: number; // 0-100%
    default: number;    // 0-100%
    attentional: number; // 0-100%
  };
  brainwaveState: {
    alpha: number; // 0-100%
    beta: number;  // 0-100%
    theta: number; // 0-100%
    gamma: number; // 0-100%
  };
  flowScore: number; // 0-100
  visualPattern: 'pulse' | 'wave' | 'expand' | 'sparkle';
}

export const FocusTimerTools = (): JSX.Element => {
  const { session } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timerOuterCircleControls = useAnimationControls();
  const timerInnerCircleControls = useAnimationControls();
  
  // Initialize with a custom event for cross-component communication
  const focusEventBus = new EventTarget();

  const [timer, setTimer] = useState<EnhancedTimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    type: 'focus',
    distractions: 0,
    intensity: 'medium',
    flowState: 'unknown',
    flowPhase: 'preparation',
    energyLevel: 7,
    focusQuality: 8,
    environment: {
      noise: 'quiet',
      lighting: 'bright',
      temperature: 'comfortable'
    },
    neuralActivity: {
      prefrontal: 65,
      default: 30,
      attentional: 75
    },
    brainwaveState: {
      alpha: 30,
      beta: 60,
      theta: 20,
      gamma: 40
    },
    flowScore: 68,
    visualPattern: 'pulse'
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [showSmartRecommendations, setShowSmartRecommendations] = useState(true);
  const [smartRecommendation, setSmartRecommendation] = useState<SmartRecommendation | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // Neural network visualization
  useEffect(() => {
    if (!timer.isRunning || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to fit its container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create neural network-like visualization
    const nodes: { x: number; y: number; size: number; connections: number[]; activity: number }[] = [];
    const numNodes = 80;
    
    // Initialize nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        connections: [],
        activity: Math.random()
      });
    }
    
    // Create connections between nearby nodes
    nodes.forEach((node, i) => {
      for (let j = 0; j < numNodes; j++) {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(nodes[j].x - node.x, 2) + Math.pow(nodes[j].y - node.y, 2)
          );
          if (distance < 100) {
            node.connections.push(j);
          }
        }
      }
    });
    
    const flowColor = timer.flowState === 'flowing' 
      ? 'rgba(98, 0, 238, 0.8)' 
      : timer.flowState === 'building' 
        ? 'rgba(3, 218, 198, 0.8)' 
        : 'rgba(245, 158, 11, 0.8)';
    
    const drawNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update node activity based on flow state
      nodes.forEach(node => {
        if (Math.random() > 0.99) {
          node.activity = Math.random();
        }
      });
      
      // Draw connections first (behind nodes)
      ctx.lineWidth = 0.5;
      nodes.forEach((node, i) => {
        node.connections.forEach(j => {
          const targetNode = nodes[j];
          const averageActivity = (node.activity + targetNode.activity) / 2;
          
          const gradient = ctx.createLinearGradient(node.x, node.y, targetNode.x, targetNode.y);
          gradient.addColorStop(0, `rgba(98, 0, 238, ${averageActivity * 0.3})`);
          gradient.addColorStop(1, `rgba(3, 218, 198, ${averageActivity * 0.3})`);
          
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        });
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const opacity = node.activity * 0.7 + 0.1;
        
        // Glow effect
        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.size * 10
        );
        glow.addColorStop(0, `rgba(98, 0, 238, ${opacity})`);
        glow.addColorStop(1, 'rgba(98, 0, 238, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Node center
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Animate nodes based on timer pattern
      nodes.forEach(node => {
        if (timer.visualPattern === 'pulse') {
          node.size = node.size * 0.95 + Math.random() * 0.2;
        } else if (timer.visualPattern === 'wave') {
          node.y += Math.sin(Date.now() * 0.001 + node.x * 0.1) * 0.3;
        } else if (timer.visualPattern === 'expand') {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const dx = node.x - centerX;
          const dy = node.y - centerY;
          const factor = Math.sin(Date.now() * 0.001) * 0.01 + 1;
          node.x = centerX + dx * factor;
          node.y = centerY + dy * factor;
        }
        
        // Keep nodes within bounds
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;
      });
      
      animationRef.current = requestAnimationFrame(drawNetwork);
    };
    
    drawNetwork();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [timer.isRunning, timer.flowState, timer.visualPattern]);
  
  // Animation for timer rings
  useEffect(() => {
    if (timer.isRunning) {
      // Animate outer ring
      timerOuterCircleControls.start({
        rotate: 360,
        transition: { 
          repeat: Infinity, 
          duration: timer.flowState === 'flowing' ? 10 : 20,
          ease: "linear"
        }
      });
      
      // Animate inner ring (counter rotation)
      timerInnerCircleControls.start({
        rotate: -360,
        transition: { 
          repeat: Infinity, 
          duration: timer.flowState === 'flowing' ? 15 : 30,
          ease: "linear"
        }
      });
    } else {
      timerOuterCircleControls.stop();
      timerInnerCircleControls.stop();
    }
  }, [timer.isRunning, timer.flowState, timerOuterCircleControls, timerInnerCircleControls]);

  // Listen for environment and energy updates from other components
  useEffect(() => {
    const handleEnvironmentUpdate = (e: CustomEvent) => {
      setTimer(prev => ({
        ...prev,
        environment: {
          ...prev.environment,
          ...e.detail.environment
        }
      }));
    };

    const handleEnergyUpdate = (e: CustomEvent) => {
      setTimer(prev => ({
        ...prev,
        energyLevel: e.detail.energyLevel
      }));
    };

    focusEventBus.addEventListener('environmentUpdate', handleEnvironmentUpdate as EventListener);
    focusEventBus.addEventListener('energyUpdate', handleEnergyUpdate as EventListener);

    return () => {
      focusEventBus.removeEventListener('environmentUpdate', handleEnvironmentUpdate as EventListener);
      focusEventBus.removeEventListener('energyUpdate', handleEnergyUpdate as EventListener);
    };
  }, []);

  // Emit events when timer state changes
  useEffect(() => {
    if (timer.isRunning) {
      const event = new CustomEvent('timerStateUpdate', {
        detail: {
          type: timer.type,
          intensity: timer.intensity,
          flowState: timer.flowState,
          energyLevel: timer.energyLevel
        }
      });
      focusEventBus.dispatchEvent(event);
    }
  }, [timer.isRunning, timer.type, timer.intensity, timer.flowState, timer.energyLevel]);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('beep');
  const [volume, setVolume] = useState(0.7);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [currentTask, setCurrentTask] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const sounds = {
    beep: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    bell: 'https://actions.google.com/sounds/v1/alarms/small_bell_ringing.ogg',
    chime: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ringing.ogg',
    nature: 'https://actions.google.com/sounds/v1/nature/forest_bird_songs.ogg'
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer.isRunning) {
      interval = setInterval(() => {
        if (timer.seconds === 0) {
          if (timer.minutes === 0) {
            handleTimerComplete();
          } else {
            setTimer((prev) => ({
              ...prev,
              minutes: prev.minutes - 1,
              seconds: 59,
            }));
          }
        } else {
          setTimer((prev) => ({
            ...prev,
            seconds: prev.seconds - 1,
          }));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.minutes, timer.seconds]);

  // Load past sessions and generate smart recommendations
  useEffect(() => {
    if (session?.user) {
      loadSessions();
      generateSmartRecommendation(sessions);
    }
  }, [session?.user]);

const loadSessions = async () => {
  if (!session?.user) return;

  const token = localStorage.getItem('supabase.auth.token');
  if (!token) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_sessions8?user_id=eq.${session.user.id}&order=timestamp.desc&limit=50`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${JSON.parse(token).access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      toast({
        title: "Error loading sessions",
        description: "Failed to load your focus sessions. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    const data = await response.json();
    setSessions(data);
    setTotalFocusMinutes(data.reduce((acc: number, session: FocusSession) => 
      acc + (session.completed ? session.duration : 0), 0
    ));
    setSessionCount(data.filter((session: FocusSession) => session.completed).length);
  } catch (error) {
    toast({
      title: "Error",
      description: "An unexpected error occurred while loading sessions",
      variant: "destructive"
    });
  }
};

  const generateSmartRecommendation = useCallback(async (sessions: FocusSession[]) => {
    if (!session?.user || sessions.length === 0) return;

    try {
      // Analyze past sessions to make smart recommendations
      const timeOfDay = new Date().getHours();
      const recentSessions = sessions.slice(0, 10);
      const averageDuration = recentSessions.reduce((acc, s) => acc + s.duration, 0) / recentSessions.length;
      const successRate = recentSessions.filter(s => s.completed).length / recentSessions.length;
      
      let recDuration = averageDuration;
      let confLevel = 0.7;
      let reasonText = '';

      // Adjust based on time of day
      if (timeOfDay >= 9 && timeOfDay <= 11) {
        recDuration *= 1.2; // Peak morning hours
        confLevel += 0.1;
        reasonText = 'Morning hours are your most productive';
      } else if (timeOfDay >= 14 && timeOfDay <= 16) {
        recDuration *= 0.8;
        confLevel -= 0.1;
        reasonText = 'Shorter sessions recommended during afternoon hours';
      }

      // Adjust based on success rate
      if (successRate < 0.5) {
        recDuration *= 0.8;
        reasonText = 'Shorter sessions recommended based on completion rate';
      }

      // Analyze flow state and energy patterns
      const flowStateData = analyzeFlowState(recentSessions);
      const energyData = analyzeEnergyPatterns(recentSessions, timeOfDay);

      setSmartRecommendation({
        duration: Math.round(recDuration),
        type: 'focus',
        confidence: confLevel,
        reason: reasonText,
        adaptiveSuggestions: {
          environment: [
            'Ensure good lighting for better focus',
            'Minimize background noise',
            'Keep room temperature comfortable'
          ],
          technique: successRate < 0.5 ? 'Try body doubling technique' : 'Use time blocking method',
          breakActivity: timeOfDay >= 14 ? 'Take a short walk' : 'Do quick stretches'
        },
        flowStateAnalysis: {
          currentState: flowStateData.currentState,
          sustainabilityScore: flowStateData.score,
          recommendations: flowStateData.recommendations
        },
        energyOptimization: {
          currentLevel: energyData.currentLevel,
          peakTimeStart: energyData.peakStart,
          peakTimeEnd: energyData.peakEnd,
          suggestions: energyData.suggestions
        }
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate focus recommendations",
        variant: "destructive"
      });
    }
  }, [session?.user, setSmartRecommendation, toast]);

  const handleTimerComplete = async () => {
    const nextType = timer.type === 'focus' ? 'break' : 'focus';
    const nextDuration = nextType === 'focus' ? selectedDuration : 5;
    
    if (timer.type === 'focus' && session?.user) {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/focus_sessions8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${JSON.parse(token).access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session.user.id,
          duration: selectedDuration,
          distractions: timer.distractions,
          task: currentTask,
          completed: true,
          intensity: timer.intensity,
          flow_state: timer.flowState,
          energy_level: timer.energyLevel,
          focus_quality: timer.focusQuality,
          environment: timer.environment,
          neural_metrics: {
            prefrontal: timer.neuralActivity.prefrontal,
            default_mode: timer.neuralActivity.default,
            attentional: timer.neuralActivity.attentional,
            brainwaves: timer.brainwaveState
          },
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        toast({
          title: "Error saving session",
          description: "Failed to save your focus session. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Session Completed!",
        description: `Great work! You completed a ${selectedDuration}-minute focus session.`,
      });

      await loadSessions(); // Refresh sessions
      generateSmartRecommendation(sessions); // Update recommendations with latest sessions
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the session",
        variant: "destructive"
      });
    }
  }

    // Play completion sound
    if (soundEnabled) {
      const audio = new Audio(sounds[selectedSound as keyof typeof sounds]);
      audio.volume = volume;
      audio.play();
    }

    setTimer((prev) => ({
      ...prev,
      minutes: nextDuration,
      seconds: 0,
      isRunning: false,
      type: nextType,
      distractions: 0,
      intensity: 'medium',
      flowState: 'building',
      energyLevel: prev.energyLevel,
      focusQuality: prev.focusQuality,
      environment: prev.environment
    }));
  };

  const toggleTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetTimer = () => {
    setTimer(prev => ({
      ...prev,
      minutes: selectedDuration,
      seconds: 0,
      isRunning: false,
      type: 'focus',
      distractions: 0,
      intensity: 'medium',
      flowState: 'unknown',
      energyLevel: prev.energyLevel,
      focusQuality: prev.focusQuality,
      environment: prev.environment
    }));

    // Notify other components about reset
    const event = new CustomEvent('timerReset', {
      detail: {
        duration: selectedDuration,
        type: 'focus'
      }
    });
    focusEventBus.dispatchEvent(event);
  };

  // Expose event bus for other components
  (window as any).focusEventBus = focusEventBus;

  // Helper functions for smart recommendations
  const analyzeFlowState = (sessions: FocusSession[]) => {
    const completionRates = sessions.map(s => s.completed);
    const recentCompletions = completionRates.slice(0, 3);
    const isImproving = recentCompletions.filter(Boolean).length >= 2;

    let currentState: 'building' | 'flowing' | 'declining' | 'unknown' = 'unknown';
    if (recentCompletions.every(Boolean)) currentState = 'flowing';
    else if (isImproving) currentState = 'building';
    else if (recentCompletions.every(v => !v)) currentState = 'declining';

    return {
      currentState,
      score: Math.min(recentCompletions.filter(Boolean).length / recentCompletions.length * 100, 100),
      recommendations: getFlowStateRecommendations(currentState)
    };
  };

  const analyzeEnergyPatterns = (sessions: FocusSession[], currentHour: number) => {
    const morningSuccess = sessions.filter(s => 
      new Date(s.timestamp).getHours() < 12 && s.completed
    ).length;
    const afternoonSuccess = sessions.filter(s => 
      new Date(s.timestamp).getHours() >= 12 && s.completed
    ).length;

    const isMorningPerson = morningSuccess > afternoonSuccess;
    const peakStart = isMorningPerson ? '09:00' : '15:00';
    const peakEnd = isMorningPerson ? '12:00' : '18:00';

    return {
      currentLevel: getCurrentEnergyLevel(currentHour, isMorningPerson),
      peakStart,
      peakEnd,
      suggestions: getEnergyOptimizationSuggestions(currentHour, isMorningPerson)
    };
  };

  const getCurrentEnergyLevel = (hour: number, isMorningPerson: boolean) => {
    if (isMorningPerson) {
      if (hour >= 9 && hour <= 12) return 9;
      if (hour >= 13 && hour <= 15) return 6;
      return 7;
    } else {
      if (hour >= 15 && hour <= 18) return 9;
      if (hour >= 9 && hour <= 11) return 7;
      return 6;
    }
  };

  const getFlowStateRecommendations = (state: 'building' | 'flowing' | 'declining' | 'unknown'): string[] => {
    switch (state) {
      case 'building':
        return [
          'Maintain current momentum',
          'Gradually increase session duration',
          'Keep environment consistent'
        ];
      case 'flowing':
        return [
          'Protect your focus streak',
          'Consider longer sessions',
          'Minimize transitions between tasks'
        ];
      case 'declining':
        return [
          'Take a longer break',
          'Try a different environment',
          'Switch to easier tasks temporarily'
        ];
      default:
        return [
          'Start with shorter sessions',
          'Track your energy levels',
          'Experiment with different techniques'
        ];
    }
  };

  const getEnergyOptimizationSuggestions = (hour: number, isMorningPerson: boolean): string[] => {
    if (isMorningPerson) {
      if (hour >= 9 && hour <= 12) {
        return [
          'Tackle your most challenging tasks',
          'Use longer focus sessions',
          'Minimize interruptions'
        ];
      }
      return [
        'Focus on lighter tasks',
        'Take more frequent breaks',
        'Consider movement breaks'
      ];
    } else {
      if (hour >= 15 && hour <= 18) {
        return [
          'Make the most of your peak energy',
          'Batch similar tasks together',
          'Maintain steady work pace'
        ];
      }
      return [
        'Start with easier tasks',
        'Use shorter focus periods',
        'Include energizing activities'
      ];
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const presetDurations = [15, 25, 45, 60];

  // Calculate the total timer duration in seconds
  const totalDuration = timer.minutes * 60 + timer.seconds;
  
  // Calculate the initial total duration (what user set)
  const initialDuration = timer.type === 'focus' ? 25 * 60 : timer.type === 'break' ? 5 * 60 : 60;
  
  // Calculate progress percentage
  const progress = timer.isRunning ? ((initialDuration - totalDuration) / initialDuration) * 100 : 0;

  // Get flow state color
  const getFlowStateColor = () => {
    switch (timer.flowState) {
      case 'flowing': return 'text-purple-500';
      case 'building': return 'text-cyan-500';
      case 'declining': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };
  
  // Get flow phase information
  const getFlowPhaseInfo = (phase: FlowPhase) => {
    switch (phase) {
      case 'preparation':
        return { 
          icon: <Target className="h-5 w-5" />,
          description: 'Setting clear goals and preparing your mind for focus'
        };
      case 'struggle':
        return { 
          icon: <Activity className="h-5 w-5" />,
          description: 'Working through initial resistance and distractions'
        };
      case 'incubation':
        return { 
          icon: <Brain className="h-5 w-5" />,
          description: 'Your brain is processing information at a deeper level'
        };
      case 'illumination':
        return { 
          icon: <Sparkles className="h-5 w-5" />,
          description: 'Experiencing insights and optimal performance'
        };
      case 'verification':
        return { 
          icon: <Check className="h-5 w-5" />,
          description: 'Validating your work and refining your approach'
        };
      default:
        return { 
          icon: <Brain className="h-5 w-5" />,
          description: 'Focus state not yet determined'
        };
    }
  };

  // Format time with additional styling
  const formatTimeDisplay = (minutes: number, seconds: number) => {
    return (
      <div className="text-4xl md:text-5xl font-bold font-mono">
        {String(minutes).padStart(2, '0')}
        <span className="text-primary animate-pulse">:</span>
        {String(seconds).padStart(2, '0')}
      </div>
    );
  };

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Timer Card */}
        <motion.div 
          className="md:w-2/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Timer className="h-6 w-6 text-primary" />
                  NeuroFocus Timer
                </CardTitle>
                <Badge 
                  variant={timer.type === 'focus' ? 'default' : timer.type === 'break' ? 'secondary' : 'outline'}
                  className="text-sm"
                >
                  {timer.type === 'focus' ? 'Focus Session' : timer.type === 'break' ? 'Break Time' : 'Micro-Break'}
                </Badge>
              </div>
              <CardDescription>
                Enhanced timer with neuroscience-based flow state tracking
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Timer Visualization */}
                <div className="relative w-48 h-48 flex-shrink-0 mx-auto md:mx-0">
                  {/* Neural network canvas */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <canvas ref={canvasRef} className="w-full h-full" />
                  </div>
                  
                  {/* Outer ring */}
                  <motion.div 
                    animate={timerOuterCircleControls}
                    className="absolute inset-0 rounded-full border-4 border-primary/30"
                  />
                  
                  {/* Middle ring with progress */}
                  <div className="absolute inset-4 rounded-full overflow-hidden bg-muted">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 origin-left"
                      style={{ 
                        transform: `translateX(${progress - 100}%)`,
                        transition: 'transform 1s linear'
                      }}
                    />
                  </div>
                  
                  {/* Inner ring */}
                  <motion.div 
                    animate={timerInnerCircleControls}
                    className="absolute inset-8 rounded-full border-4 border-primary/50"
                  />
                  
                  {/* Timer display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {formatTimeDisplay(timer.minutes, timer.seconds)}
                  </div>
                </div>
                
                {/* Control Panel */}
                <div className="flex-1 space-y-4 w-full">
                  {/* Timer Controls */}
                  <div className="flex space-x-2 justify-center md:justify-start">
                    <Button 
                      onClick={toggleTimer}
                      size="lg"
                      className="w-16 h-16 rounded-full"
                      variant={timer.isRunning ? "outline" : "default"}
                    >
                      {timer.isRunning ? 
                        <PauseCircle className="h-8 w-8" /> : 
                        <PlayCircle className="h-8 w-8" />
                      }
                    </Button>
                    
                    <Button 
                      onClick={resetTimer}
                      size="lg"
                      className="w-16 h-16 rounded-full"
                      variant="outline"
                    >
                      <RotateCcw className="h-8 w-8" />
                    </Button>
                  </div>
                  
                  {/* Flow State Information */}
                  <Card className="bg-muted/50 border-none">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className={`h-5 w-5 ${getFlowStateColor()}`} />
                          <h3 className="font-medium">Flow State: <span className={getFlowStateColor()}>
                            {timer.flowState.charAt(0).toUpperCase() + timer.flowState.slice(1)}
                          </span></h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{timer.flowScore}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getFlowPhaseInfo(timer.flowPhase).icon}
                        <span className="text-sm text-muted-foreground">
                          {getFlowPhaseInfo(timer.flowPhase).description}
                        </span>
                      </div>
                      
                      <Progress value={timer.flowScore} className="h-1.5" />
                    </CardContent>
                  </Card>
                  
                  {/* Timer Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={timer.minutes === 25 ? "default" : "outline"} 
                      onClick={() => setTimer(prev => ({ ...prev, minutes: 25, seconds: 0 }))}
                      className="text-xs"
                    >
                      25 min
                    </Button>
                    <Button 
                      variant={timer.minutes === 45 ? "default" : "outline"} 
                      onClick={() => setTimer(prev => ({ ...prev, minutes: 45, seconds: 0 }))}
                      className="text-xs"
                    >
                      45 min
                    </Button>
                    <Button 
                      variant={timer.minutes === 90 ? "default" : "outline"} 
                      onClick={() => setTimer(prev => ({ ...prev, minutes: 90, seconds: 0 }))}
                      className="text-xs"
                    >
                      90 min
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Tabs defaultValue="flow">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="flow">Flow Metrics</TabsTrigger>
                    <TabsTrigger value="brain">Neural Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="flow" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <Activity className="h-4 w-4 text-cyan-500" />
                          Focus Quality
                        </div>
                        <Slider 
                          value={[timer.focusQuality]} 
                          max={10} 
                          step={1}
                          onValueChange={values => setTimer(prev => ({ ...prev, focusQuality: values[0] }))}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Scattered</span>
                          <span>Laser-focused</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Energy Level
                        </div>
                        <Slider 
                          value={[timer.energyLevel]} 
                          max={10} 
                          step={1}
                          onValueChange={values => setTimer(prev => ({ ...prev, energyLevel: values[0] }))}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium flex items-center gap-1">
                        <Brain className="h-4 w-4 text-purple-500" />
                        Task Intensity
                      </div>
                      <Select 
                        value={timer.intensity}
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          setTimer(prev => ({ ...prev, intensity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Complexity</SelectItem>
                          <SelectItem value="medium">Medium Complexity</SelectItem>
                          <SelectItem value="high">High Complexity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Target className="h-4 w-4 text-green-500" />
                        Current Task
                      </label>
                      <input 
                        type="text" 
                        className="w-full p-2 rounded-md border bg-background" 
                        placeholder="What are you working on?" 
                        value={timer.task || ''}
                        onChange={e => setTimer(prev => ({ ...prev, task: e.target.value }))}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="brain" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="bg-muted/50 border-none">
                        <CardHeader className="p-3 pb-0">
                          <div className="text-sm font-medium">Neural Networks</div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Prefrontal Cortex</span>
                              <span className="font-medium">{timer.neuralActivity.prefrontal}%</span>
                            </div>
                            <Progress value={timer.neuralActivity.prefrontal} className="h-1.5" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Default Mode Network</span>
                              <span className="font-medium">{timer.neuralActivity.default}%</span>
                            </div>
                            <Progress value={timer.neuralActivity.default} className="h-1.5" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Attentional Control</span>
                              <span className="font-medium">{timer.neuralActivity.attentional}%</span>
                            </div>
                            <Progress value={timer.neuralActivity.attentional} className="h-1.5" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/50 border-none">
                        <CardHeader className="p-3 pb-0">
                          <div className="text-sm font-medium">Brainwave Activity</div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Alpha (Relaxed Focus)</span>
                              <span className="font-medium">{timer.brainwaveState.alpha}%</span>
                            </div>
                            <Progress value={timer.brainwaveState.alpha} className="h-1.5" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Beta (Active Thinking)</span>
                              <span className="font-medium">{timer.brainwaveState.beta}%</span>
                            </div>
                            <Progress value={timer.brainwaveState.beta} className="h-1.5" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Theta (Deep Focus)</span>
                              <span className="font-medium">{timer.brainwaveState.theta}%</span>
                            </div>
                            <Progress value={timer.brainwaveState.theta} className="h-1.5" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Gamma (Peak Performance)</span>
                              <span className="font-medium">{timer.brainwaveState.gamma}%</span>
                            </div>
                            <Progress value={timer.brainwaveState.gamma} className="h-1.5" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Visualization Pattern</h3>
                      <div className="grid grid-cols-4 gap-2">
                        <Button 
                          variant={timer.visualPattern === 'pulse' ? "default" : "outline"} 
                          onClick={() => setTimer(prev => ({ ...prev, visualPattern: 'pulse' }))}
                          className="text-xs"
                          size="sm"
                        >
                          Pulse
                        </Button>
                        <Button 
                          variant={timer.visualPattern === 'wave' ? "default" : "outline"} 
                          onClick={() => setTimer(prev => ({ ...prev, visualPattern: 'wave' }))}
                          className="text-xs"
                          size="sm"
                        >
                          Wave
                        </Button>
                        <Button 
                          variant={timer.visualPattern === 'expand' ? "default" : "outline"} 
                          onClick={() => setTimer(prev => ({ ...prev, visualPattern: 'expand' }))}
                          className="text-xs"
                          size="sm"
                        >
                          Expand
                        </Button>
                        <Button 
                          variant={timer.visualPattern === 'sparkle' ? "default" : "outline"} 
                          onClick={() => setTimer(prev => ({ ...prev, visualPattern: 'sparkle' }))}
                          className="text-xs"
                          size="sm"
                        >
                          Sparkle
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Sound Notification
                        </label>
                        <Switch checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <BarChart2 className="h-4 w-4" />
                          Smart Recommendations
                        </label>
                        <Switch 
                          checked={showSmartRecommendations} 
                          onCheckedChange={setShowSmartRecommendations}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          Notification Volume
                        </label>
                        <Slider defaultValue={[70]} max={100} step={1} />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Time Format
                        </label>
                        <Select defaultValue="24h">
                          <SelectTrigger>
                            <SelectValue placeholder="Time format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24h">24-hour format</SelectItem>
                            <SelectItem value="12h">12-hour format</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Smart Recommendations and Analytics */}
        <SmartPanels
          showSmartRecommendations={showSmartRecommendations}
          smartRecommendation={smartRecommendation}
          sessions={sessions}
          sessionCount={sessionCount}
          totalFocusMinutes={totalFocusMinutes}
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
        />

        {/* Analytics Modal */}
        {showAnalytics && (
          <FocusAnalytics
            sessions={sessions}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </div>
    </div>
  );
};
