import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Timer, Wind, Brain, ArrowBigLeft, ArrowBigRight, ArrowBigUp, ArrowBigDown } from 'lucide-react';

// Types for the game
type Particle = {
  id: number;
  x: number; 
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
};

type ZenState = {
  score: number;
  timeRemaining: number;
  breathCount: number;
  focusStreakSeconds: number;
  longestFocusStreak: number;
  distractions: number;
  lastInteractionTime: number;
};

// Colors for zen particles
const particleColors = [
  'rgba(189, 147, 249, 0.7)',  // Purple
  'rgba(80, 250, 123, 0.7)',   // Green
  'rgba(255, 184, 108, 0.7)',  // Orange
  'rgba(139, 233, 253, 0.7)',  // Cyan
  'rgba(255, 121, 198, 0.7)',  // Pink
];

export function ZenDrift() {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [zenState, setZenState] = useState<ZenState>({
    score: 0,
    timeRemaining: 180, // 3 minutes by default
    breathCount: 0,
    focusStreakSeconds: 0,
    longestFocusStreak: 0,
    distractions: 0,
    lastInteractionTime: Date.now(),
  });
  
  // User guidance settings
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(4); // Seconds in current phase
  
  // Canvas animation state
  const [particles, setParticles] = useState<Particle[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [intensityLevel, setIntensityLevel] = useState(50); // 0-100 scale
  
  // Session data
  const { user, session } = useAuth();
  
  // Generate initial particles
  const generateParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    
    const particleCount = Math.floor(intensityLevel / 10) + 10; // Adjust based on intensity
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 15 + 5;
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }
    
    setParticles(newParticles);
  }, [intensityLevel]);
  
  // Initialize canvas size
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      
      if (parent) {
        // Set canvas to parent element's size
        const newWidth = parent.clientWidth;
        const newHeight = parent.clientHeight;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };
    
    // Initial size setup
    updateCanvasSize();
    
    // Listen for window resize events
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Start the game
  const startGame = (duration: number = 180) => {
    setGameStarted(true);
    setGameOver(false);
    setZenState({
      score: 0,
      timeRemaining: duration,
      breathCount: 0,
      focusStreakSeconds: 0,
      longestFocusStreak: 0,
      distractions: 0,
      lastInteractionTime: Date.now(),
    });
    setBreathingPhase('inhale');
    setBreathingTimer(4);
    generateParticles();
    
    // Start animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
    
    toast.success(`Zen session started - ${Math.floor(duration / 60)} minutes`);
  };
  
  // Handle game over
  const endGame = useCallback(() => {
    setGameOver(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Save results if user is logged in
    if (user && session) {
      const saveResults = async () => {
        try {
          // Use supabaseRequest, handle error, remove session arg
          const { error: saveError } = await supabaseRequest(
            '/rest/v1/focus_game_results8',
            {
              method: 'POST',
              headers: { 'Prefer': 'return=minimal' }, // Don't need result back
              body: JSON.stringify({
                user_id: user.id,
                game_id: 'zen-drift',
                score: zenState.score,
                breath_count: zenState.breathCount,
                longest_focus_streak: zenState.longestFocusStreak,
                distractions: zenState.distractions,
                time_played: 180 - zenState.timeRemaining, // How long they played
                date_played: new Date().toISOString()
              })
            }
            // Removed session argument
          );
          if (saveError) throw saveError; // Propagate error
          
          toast.success('Session results saved successfully');
        } catch (error) {
          console.error('Error saving zen results:', error);
          toast.error('Failed to save session results');
        }
      };
      
      saveResults();
    }
  }, [user, session, zenState]);
  
  // Animation loop
  const animate = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update particles
    const updatedParticles = particles.map(particle => {
      // Update position
      const x = particle.x + particle.speedX;
      const y = particle.y + particle.speedY;
      
      // Handle edge wrapping
      const wrappedX = x < 0 ? canvas.width : x > canvas.width ? 0 : x;
      const wrappedY = y < 0 ? canvas.height : y > canvas.height ? 0 : y;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color.replace(/[\d.]+\)$/g, `${particle.opacity})`);
      ctx.fill();
      
      // Return updated particle
      return {
        ...particle,
        x: wrappedX,
        y: wrappedY,
      };
    });
    
    // Update particles state
    setParticles(updatedParticles);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  }, [particles]);
  
  // Handle key presses for breathing guidance
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;
    
    const now = Date.now();
    const timeSinceLastInteraction = (now - zenState.lastInteractionTime) / 1000;
    
    // Count as distraction if user presses keys too frequently (less than 1s apart)
    const isDistraction = timeSinceLastInteraction < 1;
    
    if (isDistraction) {
      setZenState(prev => ({
        ...prev,
        distractions: prev.distractions + 1,
        focusStreakSeconds: 0, // Reset focus streak
        lastInteractionTime: now,
      }));
      
      toast.error('Try to be more mindful with your interactions');
    } else {
      // Update score based on breathing phase
      let phaseBonus = 0;
      
      switch (breathingPhase) {
        case 'inhale':
          if (e.key === 'ArrowUp') phaseBonus = 10;
          break;
        case 'hold':
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') phaseBonus = 10;
          break;
        case 'exhale':
          if (e.key === 'ArrowDown') phaseBonus = 10;
          break;
        case 'rest':
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') phaseBonus = 5;
          break;
      }
      
      if (phaseBonus > 0) {
        setZenState(prev => ({
          ...prev,
          score: prev.score + phaseBonus,
          lastInteractionTime: now,
        }));
        
        toast.success(`+${phaseBonus} points - Good timing!`);
      }
    }
  }, [gameStarted, gameOver, breathingPhase, zenState.lastInteractionTime]);
  
  // Setup keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Timer effects for game mechanics
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const gameTimer = setInterval(() => {
      setZenState(prev => {
        // Update focus streak
        const now = Date.now();
        const timeSinceLastInteraction = (now - prev.lastInteractionTime) / 1000;
        const newFocusStreakSeconds = timeSinceLastInteraction > 5 
          ? prev.focusStreakSeconds + 1 
          : prev.focusStreakSeconds;
        
        // Update longest streak if current streak is longer
        const newLongestStreak = Math.max(prev.longestFocusStreak, newFocusStreakSeconds);
        
        // Add points for maintaining focus
        const focusBonus = newFocusStreakSeconds > 10 && newFocusStreakSeconds % 5 === 0 ? 5 : 0;
        if (focusBonus > 0) {
          toast.success(`Focus streak: ${newFocusStreakSeconds}s - +${focusBonus} points`);
        }
        
        // Update remaining time
        const newTimeRemaining = prev.timeRemaining - 1;
        
        // Check if game is over
        if (newTimeRemaining <= 0) {
          clearInterval(gameTimer);
          endGame();
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          focusStreakSeconds: newFocusStreakSeconds,
          longestFocusStreak: newLongestStreak,
          score: prev.score + focusBonus,
        };
      });
    }, 1000);
    
    return () => {
      clearInterval(gameTimer);
    };
  }, [gameStarted, gameOver, endGame]);
  
  // Breathing guidance timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const breathTimer = setInterval(() => {
      setBreathingTimer(prev => {
        const newTimer = prev - 1;
        
        if (newTimer <= 0) {
          // Transition to next breathing phase
          switch (breathingPhase) {
            case 'inhale':
              setBreathingPhase('hold');
              return 4; // Hold for 4 seconds
            case 'hold':
              setBreathingPhase('exhale');
              return 6; // Exhale for 6 seconds
            case 'exhale':
              setBreathingPhase('rest');
              return 2; // Rest for 2 seconds
            case 'rest':
              // Complete breath cycle
              setZenState(prev => ({
                ...prev,
                breathCount: prev.breathCount + 1,
                score: prev.score + 2, // Small bonus for each complete breath
              }));
              setBreathingPhase('inhale');
              return 4; // Inhale for 4 seconds
          }
        }
        
        return newTimer;
      });
    }, 1000);
    
    return () => {
      clearInterval(breathTimer);
    };
  }, [gameStarted, gameOver, breathingPhase]);
  
  // Format time from seconds to mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Zen Drift</CardTitle>
          <CardDescription className="text-center">
            A mindful breathing exercise to improve focus and reduce anxiety
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!gameStarted ? (
            <div className="space-y-6 max-w-md mx-auto text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">How to Play</h3>
                <p className="text-muted-foreground">
                  Follow the breathing guidance and press the arrow keys in sync with the prompts.
                  ↑ for inhale, → or ← for hold, and ↓ for exhale. Stay focused and maintain your
                  breathing rhythm to earn points.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Session Length</h3>
                <div className="space-y-4">
                  <Button 
                    onClick={() => startGame(180)} 
                    variant="outline"
                    className="w-full"
                  >
                    3 Minutes
                  </Button>
                  <Button 
                    onClick={() => startGame(300)} 
                    variant="outline"
                    className="w-full"
                  >
                    5 Minutes
                  </Button>
                  <Button 
                    onClick={() => startGame(600)} 
                    variant="outline"
                    className="w-full"
                  >
                    10 Minutes
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Visual Intensity</h3>
                <div className="space-y-2">
                  <Slider
                    value={[intensityLevel]}
                    min={10}
                    max={100}
                    step={10}
                    onValueChange={(values) => setIntensityLevel(values[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    {intensityLevel < 30 ? 'Subtle' : intensityLevel < 70 ? 'Moderate' : 'Vibrant'}
                  </p>
                </div>
              </div>
            </div>
          ) : gameOver ? (
            <div className="space-y-6 max-w-md mx-auto text-center">
              <h3 className="text-xl font-bold">Session Complete</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{zenState.score}</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{zenState.breathCount}</div>
                  <div className="text-sm text-muted-foreground">Breath Cycles</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{zenState.longestFocusStreak}s</div>
                  <div className="text-sm text-muted-foreground">Longest Focus Streak</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{zenState.distractions}</div>
                  <div className="text-sm text-muted-foreground">Distractions</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button onClick={() => startGame()} size="lg" className="w-full">
                  New Session
                </Button>
              </div>
              
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Sign in to save your session results and track progress!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  <span className="font-bold">Time: {formatTime(zenState.timeRemaining)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <span className="font-bold">Score: {zenState.score}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="h-5 w-5 text-green-500" />
                  <span className="font-bold">Breaths: {zenState.breathCount}</span>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Breathing Guidance</h3>
                
                <div className="flex justify-center items-center mb-4 h-24">
                  {breathingPhase === 'inhale' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0.3 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: 'reverse',
                        duration: 4
                      }}
                      className="flex flex-col items-center"
                    >
                      <ArrowBigUp className="h-14 w-14 text-blue-400" />
                      <span className="text-base font-medium mt-1">Inhale</span>
                    </motion.div>
                  )}
                  
                  {breathingPhase === 'hold' && (
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: 'reverse', 
                        duration: 2 
                      }}
                      className="flex flex-col items-center"
                    >
                      <div className="flex space-x-2">
                        <ArrowBigLeft className="h-10 w-10 text-purple-400" />
                        <ArrowBigRight className="h-10 w-10 text-purple-400" />
                      </div>
                      <span className="text-base font-medium mt-1">Hold</span>
                    </motion.div>
                  )}
                  
                  {breathingPhase === 'exhale' && (
                    <motion.div
                      initial={{ scale: 1.1, opacity: 0.3 }}
                      animate={{ scale: 0.9, opacity: 1 }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: 'reverse',
                        duration: 6
                      }}
                      className="flex flex-col items-center"
                    >
                      <ArrowBigDown className="h-14 w-14 text-green-400" />
                      <span className="text-base font-medium mt-1">Exhale</span>
                    </motion.div>
                  )}
                  
                  {breathingPhase === 'rest' && (
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0.8 }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: 'reverse', 
                        duration: 1
                      }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-xl font-medium mb-1">...</span>
                      <span className="text-base font-medium">Rest</span>
                    </motion.div>
                  )}
                  
                  <div className="absolute">
                    <span className="text-3xl text-muted-foreground font-light opacity-30">
                      {breathingTimer}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {zenState.focusStreakSeconds > 5 && (
                    <div className="text-green-500">
                      Focus streak: {zenState.focusStreakSeconds}s
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative h-[300px] rounded-lg overflow-hidden bg-black">
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Press the arrow keys in sync with the breathing prompts: ↑ (inhale), →/← (hold), ↓ (exhale)
                </p>
                <p className="mt-1">
                  Maintain your focus for longer streaks and more points
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        {gameStarted && !gameOver && (
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => endGame()}>
              End Session
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
