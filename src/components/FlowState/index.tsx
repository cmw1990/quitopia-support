import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useAuth } from '../AuthProvider';
import { toast } from 'sonner';
import { saveFlowSession, logDistraction as logDistractionAPI, saveFlowState, Distraction } from './api/flow-api';
import { 
  Activity, 
  Zap, 
  Brain, 
  AlertTriangle, 
  LineChart, 
  Clock,
  PieChart,
  BellOff,
  Sparkles,
  ArrowRight,
  Timer,
  Focus,
  Lightbulb,
  Award,
  Infinity,
  RadioTower,
  Play,
  Gauge,
  Maximize2,
  Minimize2,
  BrainCircuit,
  Waves
} from 'lucide-react';

// Flow state statuses
type FlowStatus = 'anxiety' | 'arousal' | 'flow' | 'control' | 'boredom' | 'relaxation' | 'apathy' | 'worry' | 'inactive';

// Flow data structure
interface FlowData {
  focusLevel: number;
  energyLevel: number;
  distractions: number;
  timeInFlow: number;
  timeInSession: number;
  status: FlowStatus;
  distractionCount: number;
}

// Flow tips type
interface FlowTip {
  title: string;
  content: string;
  context: FlowStatus[];
}

// Enhanced particle system types
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  canvasWidth: number;
  canvasHeight: number;
  pulseSpeed: number;
  pulseDirection: boolean;
  lifespan: number;
  age: number;
  wobble: number;
  wobbleSpeed: number;
  wobbleDirection: boolean;
  inFlowState: boolean;
  originalSize: number;
  update: (isInFlow: boolean) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  drawConnections: (ctx: CanvasRenderingContext2D) => void;
  isDead: () => boolean;
}

interface ParticleSystem {
  particles: Particle[];
  maxParticles: number;
  colorMode: 'default' | 'adhd';
  lastCreated: number;
  createInterval: number;
}

export function FlowState(): JSX.Element {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState('visualize');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [flowData, setFlowData] = useState<FlowData>({
    focusLevel: 5,
    energyLevel: 5,
    distractions: 0,
    timeInFlow: 0,
    timeInSession: 0,
    status: 'inactive',
    distractionCount: 0
  });
  const [sessionNotes, setSessionNotes] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [flowHistory, setFlowHistory] = useState<{timestamp: number, focusLevel: number, energyLevel: number, status: FlowStatus}[]>([]);
  const [colorMode, setColorMode] = useState<'default' | 'adhd'>('default');
  const [neurofeedbackEnabled, setNeurofeedbackEnabled] = useState(true);
  const [breathingGuide, setBreathingGuide] = useState(false);
  const [distracted, setDistracted] = useState(false);
  
  // References for timer intervals
  const sessionTimerRef = useRef<number | null>(null);
  const flowTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const breathingRef = useRef<NodeJS.Timeout | null>(null);
  
  // Canvas and visualization refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowZoneRef = useRef<HTMLDivElement>(null);
  
  // Breathing guide state
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  
  // Flow tips data
  const flowTips: FlowTip[] = [
    {
      title: "Balance Challenge and Skill",
      content: "If you're feeling anxious, try breaking your task into smaller steps to better match your current skill level. This can help you regain confidence and move back into flow.",
      context: ['anxiety']
    },
    {
      title: "Stimulate Interest",
      content: "Boredom indicates that your current task isn't challenging enough. Add complexity or set personal goals to make it more engaging for your ADHD brain.",
      context: ['boredom']
    },
    {
      title: "Reduce Distractions",
      content: "When in flow, protect this state by temporarily blocking notifications and creating a dedicated focus environment. Consider using the Anti-Googlitis or Distraction Blocker tools.",
      context: ['flow']
    },
    {
      title: "Manage Energy Levels",
      content: "If you're feeling fatigued or apathetic, take a short break with physical movement or try the energy management tools to restore your mental resources.",
      context: ['apathy', 'relaxation']
    },
    {
      title: "Implement Time Blocking",
      content: "When in control state, use this balanced energy to plan and organize. Create time blocks for your upcoming focus sessions when you're feeling this equilibrium.",
      context: ['control']
    },
    {
      title: "Utilize Hyperfocus",
      content: "You're in an arousal state with high energy. Channel this into your most demanding tasks, but set a timer to avoid burnout.",
      context: ['arousal']
    },
    {
      title: "Address Mental Fatigue",
      content: "Worry states often indicate mental fatigue. Try a 5-minute meditation or breathing exercise to reset your cognitive resources.",
      context: ['worry']
    },
    {
      title: "Create External Structure",
      content: "If you're struggling to start tasks or maintain focus, use body doubling or accountability systems to create external structure.",
      context: ['apathy', 'worry', 'anxiety']
    },
    {
      title: "Optimize Your Flow State Schedule",
      content: "Notice when you naturally enter flow states and schedule your most important work during these peak performance times.",
      context: ['flow', 'arousal']
    },
    {
      title: "Use Implementation Intentions",
      content: "Create if-then plans for when you get distracted: 'If I notice I'm checking social media, then I'll immediately close the tab and take three deep breaths.'",
      context: ['anxiety', 'worry', 'boredom']
    },
    {
      title: "Leverage Novelty for Motivation",
      content: "If struggling with motivation, introduce novelty through new environments, tools, or approaches to stimulate your brain's reward system.",
      context: ['apathy', 'boredom']
    },
    {
      title: "Practice Task Switching Mindfully",
      content: "If you need to switch tasks, create a brief ritual to help your brain transition cleanly between activities.",
      context: ['control', 'relaxation']
    }
  ];
  
  // Enhanced state for visualizations
  const [particleSystem, setParticleSystem] = useState<ParticleSystem>({
    particles: [],
    maxParticles: 80, // Increased from previous value
    colorMode: 'default',
    lastCreated: 0,
    createInterval: 200 // ms between particle creation
  });
  const [visualizationQuality, setVisualizationQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [showFlowZones, setShowFlowZones] = useState(true);
  const [particleInteractivity, setParticleInteractivity] = useState(true);
  const [visualizationMode, setVisualizationMode] = useState<'particles' | 'neural' | 'waves'>('particles');
  
  // Enhanced state for improved tracking
  const [fullscreen, setFullscreen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [flowStreak, setFlowStreak] = useState(0);
  const [personalRecord, setPersonalRecord] = useState(0);
  const [flowSuggestion, setFlowSuggestion] = useState<string>('');
  const [showFlowTips, setShowFlowTips] = useState(false);
  
  // Ref for fullscreen container
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  
  // Flow suggestions based on current state
  const flowSuggestions = {
    flow: [
      "You're in flow! Try to maintain your current focus level.",
      "Great job! Remember to take a short break after this flow session.",
      "You're in the zone! Consider documenting what helped you get here.",
    ],
    anxiety: [
      "You might feel anxious. Try breaking your task into smaller steps.",
      "Your energy is high but focus is scattered. Try deep breathing for 30 seconds.",
      "Consider simplifying your current task to match your skill level.",
    ],
    boredom: [
      "Try increasing the challenge to match your high skill level.",
      "You might benefit from a more complex problem to solve.",
      "Consider taking on a new challenge that stretches your abilities.",
    ],
    apathy: [
      "Both energy and focus are low. A short walk might help reset.",
      "Try a 5-minute meditation to clear your mind.",
      "A quick physical activity might boost your energy levels.",
    ],
    control: [
      "You're in a balanced state. Good time to tackle moderate tasks.",
      "This is a good state for learning new skills.",
      "You're in balance. Good time for planning or organizing tasks.",
    ]
  };
  
  // Add missing state variables
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [showSessionSummary, setShowSessionSummary] = useState<boolean>(false);
  const [breathingProgress, setBreathingProgress] = useState<number>(0);
  const [breathingPhase, setBreathingPhase] = useState<string | null>(null);
  const [breathingInterval, setBreathingInterval] = useState<number | null>(null);
  
  // Constants for timers
  const UPDATE_INTERVAL = 1000; // Update state every second
  const HISTORY_INTERVAL = 5000; // Save history point every 5 seconds
  const AUTOSAVE_INTERVAL = 60000; // Autosave every minute
  
  // Function to get flow status based on focus and energy levels
  const getFlowStatus = (focus: number, energy: number): FlowStatus => {
    if (focus > 7 && energy > 7) return 'flow';
    if (focus > 7 && energy <= 7 && energy >= 4) return 'control';
    if (focus > 7 && energy < 4) return 'boredom';
    if (focus >= 4 && focus <= 7 && energy > 7) return 'arousal';
    if (focus >= 4 && focus <= 7 && energy <= 7 && energy >= 4) return 'control';
    if (focus >= 4 && focus <= 7 && energy < 4) return 'relaxation';
    if (focus < 4 && energy > 7) return 'anxiety';
    if (focus < 4 && energy <= 7 && energy >= 4) return 'worry';
    if (focus < 4 && energy < 4) return 'apathy';
    return 'inactive';
  };
  
  // Get relevant tips for current flow state
  const getRelevantTips = () => {
    const currentStatus = flowData.status;
    return flowTips.filter(tip => tip.context.includes(currentStatus));
  };
  
  // Start flow session
  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setLastUpdateTime(Date.now());
    setDistracted(false);
    setFlowData({
      status: 'control',
      focusLevel: 5,
      energyLevel: 5,
      timeInSession: 0,
      timeInFlow: 0,
      distractionCount: 0,
      distractions: 0
    });
    setFlowHistory([]);
    setFlowStreak(0);
    
    // Show initial suggestion
    const relevantTips = getRelevantTips();
    setFlowSuggestion(relevantTips.length > 0 ? `${relevantTips[0].title}: ${relevantTips[0].content}` : 'Focus on your task and monitor your energy levels.');
    
    // Auto-save session start
    saveSessionStart();
  };
  
  // Calculate focus score based on session data
  const calculateFocusScore = (): number => {
    // Simple calculation based on time in flow and distractions
    const flowPercentage = flowData.timeInFlow / Math.max(flowData.timeInSession, 1);
    const distractionPenalty = Math.min(flowData.distractionCount * 0.5, 5);
    
    // Score from 0-100
    const rawScore = (flowPercentage * 100) - distractionPenalty;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  };
  
  // End flow session
  const endSession = async () => {
    if (!isSessionActive) return;
    
    setIsSessionActive(false);
    
    // Calculate final stats
    const finalFocusScore = calculateFocusScore();
    const sessionEndTime = Date.now();
    const totalTimeInSession = Math.floor((sessionEndTime - sessionStartTime) / 1000);
    
    // Update display
    setFlowData(prev => ({
      ...prev,
      timeInSession: totalTimeInSession
    }));
    
    // Final save of session data
    saveSessionEnd();
    
    // Optional: Show summary dialog
    setShowSessionSummary(true);
  };
  
  // Start breathing guide
  const startBreathingGuide = () => {
    setBreathingGuide(true);
    
    let secondsRemaining = 60;
    const intervalId = setInterval(() => {
      secondsRemaining -= 1;
      
      if (secondsRemaining <= 0) {
        clearInterval(intervalId);
        setBreathingGuide(false);
        setBreathPhase('inhale');
        // Add a congratulatory message after completing breathing exercise
        toast("Breathing Exercise Completed", {
          description: "Great job! Your brain is now primed for better focus."
        });
        return;
      }
      
      // 4-7-8 breathing technique: 4s inhale, 7s hold, 8s exhale
      const cycle = 19; // 4 + 7 + 8
      const currentSecondInCycle = secondsRemaining % cycle;
      
      if (currentSecondInCycle >= 15) { // 0-3 is inhale (4 seconds)
        setBreathPhase('inhale');
        setBreathingProgress((19 - currentSecondInCycle) * 25); // 0-100 for inhale phase
      } else if (currentSecondInCycle >= 8) { // 4-10 is hold (7 seconds)
        setBreathPhase('hold1');
        setBreathingProgress((15 - currentSecondInCycle) * (100/7)); // 0-100 for hold phase
      } else { // 11-18 is exhale (8 seconds)
        setBreathPhase('exhale');
        setBreathingProgress((8 - currentSecondInCycle) * (100/8)); // 0-100 for exhale phase
      }
    }, 1000);
    
    breathingRef.current = intervalId;
  };
  
  // Update log distraction to show visual cue
  const logDistraction = async () => {
    setFlowData(prev => ({
      ...prev,
      distractions: prev.distractions + 1
    }));
    
    // Visual cue for distraction
    setDistracted(true);
    setTimeout(() => setDistracted(false), 2000);
    
    // Log distraction if user is logged in
    if (user && session) {
      try {
        await logDistractionAPI({
          user_id: user.id,
          timestamp: new Date().toISOString(),
          session_id: null,
          type: 'manual',
          notes: 'Manually logged distraction'
        }, session);
      } catch (error) {
        console.error('Failed to log distraction', error);
      }
    }
    
    toast('Distraction logged', {
      description: 'Take a deep breath and refocus'
    });
  };
  
  // Handle focus level change
  const handleFocusChange = (value: number[]) => {
    const newFocus = value[0];
    setFlowData(prev => ({
      ...prev,
      focusLevel: newFocus,
      status: getFlowStatus(newFocus, prev.energyLevel)
    }));
  };
  
  // Handle energy level change
  const handleEnergyChange = (value: number[]) => {
    const newEnergy = value[0];
    setFlowData(prev => ({
      ...prev,
      energyLevel: newEnergy,
      status: getFlowStatus(prev.focusLevel, newEnergy)
    }));
  };
  
  // Enhanced startAnimation function
  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const isInFlow = flowData.status === 'flow';
    
    // Clear the canvas with a slight fade effect for smooth transitions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Optimize by only processing particles in view
    for (let i = 0; i < particleSystem.particles.length; i++) {
      const particle = particleSystem.particles[i];
      if (
        particle.x > -100 && 
        particle.x < canvas.width + 100 && 
        particle.y > -100 && 
        particle.y < canvas.height + 100
      ) {
        particle.update(isInFlow);
        particle.draw(ctx);
      } else {
        // Only update position for offscreen particles, skip rendering
        particle.x += particle.speedX;
        particle.y += particle.speedY;
      }
    }
    
    // Batch connection drawing to improve performance
    if (isInFlow) {
      ctx.beginPath();
      for (let i = 0; i < particleSystem.particles.length; i++) {
        particleSystem.particles[i].drawConnections(ctx);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.stroke();
    }
    
    // Define createParticle function
    const createParticle = () => {
      if (!canvas) return;
      const particle = new Particle(canvas.width, canvas.height);
      setParticleSystem(prev => ({
        ...prev,
        particles: [...prev.particles, particle]
      }));
    };
    
    // Define drawFlowZones function
    const drawFlowZones = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Implementation for drawing flow zones
      const gridSize = Math.min(width, height) * 0.8;
      const startX = (width - gridSize) / 2;
      const startY = (height - gridSize) / 2;
      
      // Draw flow zones with different colors
      // Flow zone (high skill, high challenge)
      ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
      ctx.fillRect(startX + gridSize * 0.7, startY, gridSize * 0.3, gridSize * 0.3);
      
      // Anxiety zone (low skill, high challenge)
      ctx.fillStyle = 'rgba(255, 76, 76, 0.2)';
      ctx.fillRect(startX, startY, gridSize * 0.3, gridSize * 0.3);
      
      // Boredom zone (high skill, low challenge)
      ctx.fillStyle = 'rgba(255, 204, 76, 0.2)';
      ctx.fillRect(startX + gridSize * 0.7, startY + gridSize * 0.7, gridSize * 0.3, gridSize * 0.3);
      
      // Apathy zone (low skill, low challenge)
      ctx.fillStyle = 'rgba(162, 76, 255, 0.2)';
      ctx.fillRect(startX, startY + gridSize * 0.7, gridSize * 0.3, gridSize * 0.3);
    };
    
    // Optimized flow zone visualization
    drawFlowZones(ctx, canvas.width, canvas.height);
    
    // Use the appropriate visualization method based on focus state
    if (isInFlow) {
      drawNeuralNetworkVisualization(ctx, canvas.width, canvas.height, true);
    } else {
      drawWavePatternVisualization(ctx, canvas.width, canvas.height, false);
    }
    
    // Reduce particle creation frequency at high particle counts
    const now = Date.now();
    if (now - particleSystem.lastCreated > particleSystem.createInterval && 
        particleSystem.particles.length < particleSystem.maxParticles) {
      createParticle();
      particleSystem.lastCreated = now;
      
      // Dynamically adjust creation interval based on particle count
      if (particleSystem.particles.length > particleSystem.maxParticles * 0.8) {
        setParticleSystem(prev => ({...prev, createInterval: 500})); // Slow down creation
      } else {
        setParticleSystem(prev => ({...prev, createInterval: 200})); // Normal creation rate
      }
    }
    
    // Remove dead particles
    const updatedParticles = particleSystem.particles.filter(p => !p.isDead());
    if (updatedParticles.length !== particleSystem.particles.length) {
      setParticleSystem(prev => ({...prev, particles: updatedParticles}));
    }
    
    animationFrameRef.current = requestAnimationFrame(startAnimation);
  };

  // Add Particle class definition if missing
  class Particle implements Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;
    canvasWidth: number;
    canvasHeight: number;
    pulseSpeed: number;
    pulseDirection: boolean;
    lifespan: number;
    age: number;
    wobble: number;
    wobbleSpeed: number;
    wobbleDirection: boolean;
    inFlowState: boolean;
    originalSize: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.originalSize = Math.random() * 4 + 1;
      this.size = this.originalSize;
      this.speedX = (Math.random() - 0.5) * 0.7;
      this.speedY = (Math.random() - 0.5) * 0.7;
      
      // Enhanced color calculation based on position
      const hue = (this.x / canvasWidth) * 60 + 200; // Blue to purple gradient
      this.color = `hsl(${hue}, 80%, 50%)`;
      
      this.alpha = Math.random() * 0.5 + 0.1;
      this.pulseSpeed = Math.random() * 0.1 + 0.01;
      this.pulseDirection = Math.random() > 0.5;
      this.lifespan = Math.random() * 400 + 100;
      this.age = 0;
      this.wobble = 0;
      this.wobbleSpeed = Math.random() * 0.1;
      this.wobbleDirection = Math.random() > 0.5;
      this.inFlowState = false;
    }

    update(isInFlow: boolean = false) {
      // Age the particle
      this.age++;
      
      // Fade in/out based on age
      if (this.age < 20) {
        this.alpha = Math.min(0.6, this.alpha + 0.03);
      } else if (this.age > this.lifespan - 20) {
        this.alpha = Math.max(0, this.alpha - 0.03);
      }
      
      // Move the particle
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Boundary checks with smooth wrapping
      if (this.x < 0) this.x = this.canvasWidth;
      if (this.x > this.canvasWidth) this.x = 0;
      if (this.y < 0) this.y = this.canvasHeight;
      if (this.y > this.canvasHeight) this.y = 0;
      
      // Pulse size
      if (this.pulseDirection) {
        this.size += this.pulseSpeed;
        if (this.size > this.originalSize + 2) this.pulseDirection = false;
      } else {
        this.size -= this.pulseSpeed;
        if (this.size < this.originalSize - 1) this.pulseDirection = true;
      }
      
      // Wobble effect
      if (this.wobbleDirection) {
        this.wobble += this.wobbleSpeed;
        if (this.wobble > 2) this.wobbleDirection = false;
      } else {
        this.wobble -= this.wobbleSpeed;
        if (this.wobble < -2) this.wobbleDirection = true;
      }
      
      // Flow state changes
      this.inFlowState = isInFlow;
      if (isInFlow) {
        // Particles move more purposefully in flow state
        this.speedX = this.speedX * 0.98 + (Math.random() - 0.5) * 0.1;
        this.speedY = this.speedY * 0.98 + (Math.random() - 0.5) * 0.1;
        
        // Particles glow brighter in flow state
        const hue = (this.x / this.canvasWidth) * 40 + 180; // More blue when in flow
        this.color = `hsl(${hue}, 90%, 60%)`;
        this.alpha = Math.min(0.8, this.alpha + 0.01);
      } else {
        // More random movement when not in flow
        this.speedX += (Math.random() - 0.5) * 0.05;
        this.speedY += (Math.random() - 0.5) * 0.05;
        
        // Speed limits
        this.speedX = Math.max(-0.8, Math.min(0.8, this.speedX));
        this.speedY = Math.max(-0.8, Math.min(0.8, this.speedY));
        
        // Default color calculation
        const hue = (this.x / this.canvasWidth) * 60 + 200;
        this.color = `hsl(${hue}, 70%, 50%)`;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      
      // Draw glow effect
      if (this.inFlowState) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
      } else {
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'transparent';
      }
      
      // Draw with transparency
      ctx.globalAlpha = this.alpha;
      
      // Draw the particle with wobble effect
      ctx.arc(
        this.x + Math.sin(this.wobble) * 2, 
        this.y + Math.cos(this.wobble) * 2, 
        this.size, 0, Math.PI * 2
      );
      
      ctx.fillStyle = this.color;
      ctx.fill();
      
      // Reset shadow and opacity
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    
    drawConnections(ctx: CanvasRenderingContext2D) {
      // This will be called in batch mode
      if (!this.inFlowState) return;
    }
    
    isDead(): boolean {
      return this.age > this.lifespan;
    }
  }
  
  // Neural network visualization
  const drawNeuralNetworkVisualization = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    isInFlow: boolean
  ) => {
    // Create grid of nodes
    const nodeSpacingX = width / 10;
    const nodeSpacingY = height / 6;
    const nodes: {x: number, y: number, connections: number[]}[] = [];
    
    // Generate nodes grid
    for (let y = 1; y <= 5; y++) {
      const nodesInRow = y === 1 || y === 5 ? 3 : y === 2 || y === 4 ? 5 : 7;
      const rowWidth = (nodesInRow - 1) * nodeSpacingX;
      const startX = (width - rowWidth) / 2;
      
      for (let i = 0; i < nodesInRow; i++) {
        nodes.push({
          x: startX + i * nodeSpacingX,
          y: y * nodeSpacingY,
          connections: []
        });
      }
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodes.length; i++) {
      // Connect to next layer
      const currentLayer = Math.floor(nodes[i].y / nodeSpacingY);
      
      for (let j = 0; j < nodes.length; j++) {
        const targetLayer = Math.floor(nodes[j].y / nodeSpacingY);
        
        // Only connect to nodes in the next layer
        if (targetLayer === currentLayer + 1) {
          const distance = Math.sqrt(
            Math.pow(nodes[i].x - nodes[j].x, 2) + 
            Math.pow(nodes[i].y - nodes[j].y, 2)
          );
          
          // Only connect if nodes are not too far apart
          if (distance < nodeSpacingX * 2.5) {
            nodes[i].connections.push(j);
          }
        }
      }
    }
    
    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      for (const connIndex of node.connections) {
        const targetNode = nodes[connIndex];
        
        // Calculate pulse effect
        const pulse = Math.sin(Date.now() / 1000 + i * 0.1) * 0.5 + 0.5;
        const focusInfluence = flowData.focusLevel / 10;
        const energyInfluence = flowData.energyLevel / 10;
        
        // Calculate connection strength based on flow state
        let connectionStrength = 0.2;
        if (isInFlow) {
          connectionStrength = 0.5 + pulse * 0.3;
        } else {
          connectionStrength = 0.2 + pulse * 0.1;
        }
        
        // Connection color based on state
        let connectionColor;
        if (isInFlow) {
          // Blue for flow state
          connectionColor = `rgba(50, 100, 255, ${connectionStrength})`;
        } else if (flowData.status === 'anxiety') {
          // Red for anxiety
          connectionColor = `rgba(255, 70, 70, ${connectionStrength})`;
        } else if (flowData.status === 'boredom') {
          // Yellow for boredom
          connectionColor = `rgba(255, 200, 50, ${connectionStrength})`;
        } else {
          // Purple for other states
          connectionColor = `rgba(150, 100, 255, ${connectionStrength})`;
        }
        
        // Draw connection
        ctx.beginPath();
        ctx.strokeStyle = connectionColor;
        ctx.lineWidth = 1 + pulse * (isInFlow ? 2 : 1);
        ctx.moveTo(node.x, node.y);
        
        // Calculate control points for curved lines
        const midX = (node.x + targetNode.x) / 2;
        const midY = (node.y + targetNode.y) / 2;
        const cpOffset = isInFlow ? 30 : 15;
        const cpX = midX + Math.sin(Date.now() / 2000 + i) * cpOffset;
        const cpY = midY + Math.cos(Date.now() / 2000 + i) * cpOffset;
        
        // Draw curved path
        ctx.quadraticCurveTo(cpX, cpY, targetNode.x, targetNode.y);
        ctx.stroke();
        
        // Add pulse effect along the connection when in flow
        if (isInFlow && Math.random() < 0.1) {
          const t = Math.random();
          const pulseX = node.x + (targetNode.x - node.x) * t;
          const pulseY = node.y + (targetNode.y - node.y) * t;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2 + pulse * 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        }
      }
    }
    
    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }
  };
  
  // Draw wave pattern visualization
  const drawWavePatternVisualization = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    isInFlow: boolean
  ) => {
    // Implementation for wave pattern visualization
    ctx.clearRect(0, 0, width, height);
    
    const waveCount = 3;
    const amplitude = isInFlow ? 40 : 20;
    const frequency = 0.02;
    const phaseShift = Date.now() * 0.001;
    
    ctx.lineWidth = 2;
    
    for (let w = 0; w < waveCount; w++) {
      const waveY = height * (0.3 + w * 0.2);
      const waveColor = isInFlow ? 
        `hsla(${210 + w * 40}, 80%, 60%, ${0.7 - w * 0.2})` : 
        `hsla(${180 + w * 30}, 60%, 50%, ${0.5 - w * 0.15})`;
      
      ctx.beginPath();
      ctx.strokeStyle = waveColor;
      
      for (let x = 0; x < width; x += 2) {
        const y = waveY + 
          Math.sin((x * frequency) + phaseShift + w) * amplitude + 
          Math.sin((x * frequency * 0.5) + phaseShift * 1.3 + w) * (amplitude * 0.5);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
  };
  
  // Save session data
  const saveSessionStart = async () => {
    try {
      if (user) {
        // Implementation for saving session start data
        console.log('Session started');
        // Further implementation would go here
      }
    } catch (error) {
      console.error('Error saving session start:', error);
    }
  };

  // Save session end data
  const saveSessionEnd = async () => {
    try {
      if (user) {
        // Implementation for saving session end data
        console.log('Session ended');
        // Further implementation would go here
      }
    } catch (error) {
      console.error('Error saving session end:', error);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) window.clearInterval(sessionTimerRef.current);
      if (flowTimerRef.current) window.clearInterval(flowTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (breathingRef.current) window.clearInterval(breathingRef.current);
    };
  }, []);
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Generate stats summaries for display
  const flowStats = useMemo(() => {
    return {
      efficiency: flowData.timeInSession > 0 
        ? Math.round((flowData.timeInFlow / flowData.timeInSession) * 100) 
        : 0,
      distractionRate: flowData.timeInSession > 0 
        ? (flowData.distractions / (flowData.timeInSession / 60)).toFixed(2)
        : '0',
      avgFocus: flowHistory.length > 0 
        ? (flowHistory.reduce((sum, item) => sum + item.focusLevel, 0) / flowHistory.length).toFixed(1)
        : flowData.focusLevel.toFixed(1),
      avgEnergy: flowHistory.length > 0 
        ? (flowHistory.reduce((sum, item) => sum + item.energyLevel, 0) / flowHistory.length).toFixed(1)
        : flowData.energyLevel.toFixed(1)
    };
  }, [flowData, flowHistory]);
  
  // Generate state percentages
  const statePercentages = useMemo(() => {
    const states = ['flow', 'anxiety', 'boredom', 'apathy', 'control'];
    const result: Record<string, number> = {};
    
    states.forEach(state => {
      const count = flowHistory.filter(item => item.status === state).length;
      result[state] = flowHistory.length > 0 
        ? Math.round((count / flowHistory.length) * 100)
        : 0;
    });
    
    return result;
  }, [flowHistory]);
  
  // Get color for specific flow state
  const getStateColor = (state: string) => {
    switch (state) {
      case 'flow': return 'bg-green-500';
      case 'anxiety': return 'bg-red-500';
      case 'boredom': return 'bg-amber-500';
      case 'control': return 'bg-blue-500';
      case 'apathy': return 'bg-slate-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Add visualization settings to the settings panel
  const renderVisualizationSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Visualization Settings</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Quality</span>
            <select 
              value={visualizationQuality}
              onChange={(e) => setVisualizationQuality(e.target.value as 'low' | 'medium' | 'high')}
              className="text-sm rounded-md border border-input bg-background px-3 py-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <p className="text-xs text-muted-foreground">Higher quality uses more system resources</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Flow Zones</span>
            <Switch 
              checked={showFlowZones}
              onCheckedChange={setShowFlowZones}
            />
          </label>
          <p className="text-xs text-muted-foreground">Show flow state zones on the visualization</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Particle Interactivity</span>
            <Switch 
              checked={particleInteractivity}
              onCheckedChange={setParticleInteractivity}
            />
          </label>
          <p className="text-xs text-muted-foreground">Allow particles to interact with each other</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Visualization Mode</span>
            <select
              value={visualizationMode}
              onChange={(e) => setVisualizationMode(e.target.value as 'particles' | 'neural' | 'waves')}
              className="text-sm rounded-md border border-input bg-background px-3 py-1"
            >
              <option value="particles">Particles</option>
              <option value="neural">Neural Network</option>
              <option value="waves">Wave Patterns</option>
            </select>
          </label>
          <p className="text-xs text-muted-foreground">Change the visualization style</p>
        </div>
      </div>
    </div>
  );
  
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Flow State Tracker
        </CardTitle>
        <CardDescription>
          Visualize, track, and optimize your flow state for maximum productivity
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="visualize">
              <LineChart className="h-4 w-4 mr-2" />
              Visualize
            </TabsTrigger>
            <TabsTrigger value="track">
              <Activity className="h-4 w-4 mr-2" />
              Track
            </TabsTrigger>
            <TabsTrigger value="learn">
              <Brain className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualize" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Current Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {isSessionActive ? 'Session active' : 'Start a session to track your flow'}
                    </p>
                  </div>
                  
                  {isSessionActive ? (
                    <Button variant="destructive" onClick={endSession}>
                      End Session
                    </Button>
                  ) : (
                    <Button onClick={startSession}>
                      Start Session
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Focus Level</span>
                    <span className="text-sm">{flowData.focusLevel}/10</span>
                  </div>
                  <Slider 
                    value={[flowData.focusLevel]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={handleFocusChange}
                    disabled={!manualMode && isSessionActive}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Energy Level</span>
                    <span className="text-sm">{flowData.energyLevel}/10</span>
                  </div>
                  <Slider 
                    value={[flowData.energyLevel]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={handleEnergyChange}
                    disabled={!manualMode && isSessionActive}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium">Manual Tracking</h3>
                    <p className="text-xs text-muted-foreground">Set focus and energy levels manually</p>
                  </div>
                  <Switch checked={manualMode} onCheckedChange={setManualMode} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium">Neurofeedback</h3>
                    <p className="text-xs text-muted-foreground">Enhanced visual effects for ADHD</p>
                  </div>
                  <Switch checked={neurofeedbackEnabled} onCheckedChange={setNeurofeedbackEnabled} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium">Color Mode</h3>
                    <p className="text-xs text-muted-foreground">ADHD-friendly color palette</p>
                  </div>
                  <Switch 
                    checked={colorMode === 'adhd'} 
                    onCheckedChange={(checked) => setColorMode(checked ? 'adhd' : 'default')} 
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <p className="text-xs text-muted-foreground">Get alerted when you enter flow state</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={logDistraction}
                    disabled={!isSessionActive}
                    className="flex-1"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Log Distraction
                  </Button>
                  
                  <Button
                    variant={breathingGuide ? "default" : "outline"}
                    onClick={startBreathingGuide}
                    className="flex-1"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Breathing Guide
                  </Button>
                </div>
                
                {breathingGuide && (
                  <div className="relative h-20 border rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-lg font-medium">
                        {breathPhase === 'inhale' && 'Inhale'}
                        {breathPhase === 'hold1' && 'Hold'}
                        {breathPhase === 'exhale' && 'Exhale'}
                        {breathPhase === 'hold2' && 'Hold'}
                      </div>
                    </div>
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-primary/30"
                      animate={{ 
                        height: breathPhase === 'inhale' 
                          ? '100%' 
                          : breathPhase === 'exhale' 
                            ? '10%' 
                            : undefined
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="relative h-[220px] bg-muted/30 rounded-md overflow-hidden">
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!isSessionActive && (
                      <p className="text-sm text-muted-foreground">Start a session to visualize your flow state</p>
                    )}
                  </div>
                  <div ref={flowZoneRef} className="absolute top-0 right-0 w-[30%] h-[30%] border border-dashed border-primary/30 rounded-sm">
                    <div className="absolute bottom-1 right-1 text-xs text-primary/70">Flow Zone</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm font-medium">Time in session</div>
                    <div className="text-2xl font-bold flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatTime(flowData.timeInSession)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm font-medium">Time in flow</div>
                    <div className="text-2xl font-bold flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                      {formatTime(flowData.timeInFlow)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm font-medium">Flow status</div>
                    <div className="flex items-center mt-1">
                      <Badge 
                        variant={flowData.status === 'flow' ? 'default' : 'outline'}
                        className={flowData.status === 'flow' ? 'animate-pulse' : ''}
                      >
                        {flowData.status === 'inactive' ? 'Not started' : flowData.status.charAt(0).toUpperCase() + flowData.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm font-medium">Distractions</div>
                    <div className="text-2xl font-bold flex items-center">
                      <BellOff className="h-4 w-4 mr-2 text-muted-foreground" />
                      {flowData.distractions}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {getRelevantTips().length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-muted/30 p-3 rounded-md"
                    >
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Tips for current state
                      </div>
                      {getRelevantTips().map((tip, index) => (
                        <div key={index} className="text-sm flex items-start space-x-2 mb-1">
                          <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <p>{tip.content}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="track" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Session Notes</h3>
                <div className="text-sm text-muted-foreground">
                  {isSessionActive ? `Session time: ${formatTime(flowData.timeInSession)}` : 'Session not active'}
                </div>
              </div>
              
              <Textarea
                placeholder="What are you working on? What helps you get into flow? Any distractions?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <PieChart className="h-4 w-4 text-primary" />
                    Flow Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Flow efficiency</span>
                      <span className="font-medium">{flowStats.efficiency}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Distraction rate</span>
                      <span className="font-medium">{flowStats.distractionRate} per hour</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Average focus level</span>
                      <span className="font-medium">{flowStats.avgFocus}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Average energy level</span>
                      <span className="font-medium">{flowStats.avgEnergy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-primary" />
                    Flow States
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(statePercentages).map(([state, percentage]) => (
                      <div key={state} className="flex justify-between text-sm items-center">
                        <span className="capitalize">{state}</span>
                        <div className="flex items-center">
                          <div className="w-[120px] h-2 rounded-full bg-muted overflow-hidden mr-2">
                            <motion.div 
                              className={`h-full rounded-full ${getStateColor(state)}`}
                              initial={{ width: '0%' }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <span>{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="learn" className="space-y-4">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Infinity className="h-5 w-5 text-primary" />
                  What is Flow State?
                </h3>
                <p className="text-muted-foreground mt-2">
                  Flow state is a mental state in which a person is fully immersed in an activity,
                  characterized by energized focus, complete involvement, and enjoyment in the process.
                  It was first described by psychologist Mihaly Csikszentmihalyi.
                </p>
                
                <h4 className="font-medium mt-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Characteristics of Flow
                </h4>
                <ul className="text-muted-foreground mt-2 space-y-2">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>Complete concentration on the task</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>Clarity of goals and immediate feedback</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>Balance between challenge and skill</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>Sense of control and reduced self-consciousness</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>Altered sense of time (hours may feel like minutes)</span>
                  </motion.li>
                </ul>
                
                <h4 className="font-medium mt-4 flex items-center gap-2">
                  <Focus className="h-4 w-4 text-primary" />
                  Flow for ADHD
                </h4>
                <p className="text-muted-foreground mt-2">
                  People with ADHD can benefit significantly from finding flow states. When in flow, 
                  the hyperfocus tendencies of ADHD can transform from a challenge to a superpower.
                </p>
                
                <h4 className="font-medium mt-4 flex items-center gap-2">
                  <RadioTower className="h-4 w-4 text-primary" />
                  Neuroscience of Flow
                </h4>
                <p className="text-muted-foreground mt-2">
                  During flow, brain activity changes dramatically - the prefrontal cortex shows decreased activity 
                  (transient hypofrontality) while the brain releases neurochemicals like dopamine, serotonin, 
                  norepinephrine, and endorphins, creating a natural state of euphoria and enhanced performance.
                </p>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
// Export the component explicitly
export default FlowState;
