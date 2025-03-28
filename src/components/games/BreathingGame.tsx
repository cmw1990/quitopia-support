import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { GameComponentProps } from './types';
import { motion } from 'framer-motion';
import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from "../../api/apiCompatibility";

interface BreathingGameProps extends GameComponentProps {
  session: Session | null;
}

const BreathingGame: React.FC<BreathingGameProps> = ({ 
  session, 
  onComplete, 
  difficulty = 'medium',
  onBack
}) => {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [breathingRate, setBreathingRate] = useState(8); // Breaths per minute
  const [animationProgress, setAnimationProgress] = useState(0);
  const [calmScore, setCalmScore] = useState(0);
  
  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Difficulty settings
  const difficultySettings = {
    easy: { minDuration: 60, maxBreathCount: 6 },
    medium: { minDuration: 120, maxBreathCount: 12 },
    hard: { minDuration: 180, maxBreathCount: 18 }
  };
  
  // Initialize or reset the game
  const initializeGame = () => {
    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    
    setBreathingPhase('rest');
    setTimeRemaining(0);
    setTotalSessionTime(0);
    setSessionCount(0);
    setCalmScore(0);
    setAnimationProgress(0);
  };
  
  // Start breathing session
  const startBreathing = () => {
    setIsPlaying(true);
    setSessionCount(prev => prev + 1);
    
    // Start the session timer
    const startTime = Date.now();
    sessionTimerRef.current = setInterval(() => {
      setTotalSessionTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // Start the breathing cycle
    startBreathingCycle();
  };
  
  // Stop breathing session
  const stopBreathing = () => {
    setIsPlaying(false);
    
    // Clear timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    
    // Calculate calm score (more breathing = higher score)
    const settings = difficultySettings[difficulty];
    const percentageCompleted = Math.min(100, (sessionCount / settings.maxBreathCount) * 100);
    const newCalmScore = Math.round(percentageCompleted);
    setCalmScore(newCalmScore);
    
    // Call onComplete if provided
    if (onComplete) onComplete(newCalmScore);
    
    // Save session data to supabase if session exists
    if (session?.user?.id) {
      saveGameProgress(session.user.id, newCalmScore);
    }
  };
  
  // Start a breathing cycle (inhale -> hold -> exhale -> rest)
  const startBreathingCycle = () => {
    // Set to inhale phase
    setBreathingPhase('inhale');
    
    // Calculate phase durations based on breathing rate
    const cycleDuration = 60 / breathingRate; // seconds per full breath
    const inhaleDuration = cycleDuration * 0.4;
    const holdDuration = cycleDuration * 0.1;
    const exhaleDuration = cycleDuration * 0.4;
    const restDuration = cycleDuration * 0.1;
    
    // Start with inhale
    setTimeRemaining(Math.round(inhaleDuration));
    startPhaseTimer(inhaleDuration, 'hold');
  };
  
  // Start a timer for a breathing phase
  const startPhaseTimer = (duration: number, nextPhase: 'inhale' | 'hold' | 'exhale' | 'rest') => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Start the timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setTimeRemaining(remaining);
      
      // Update animation progress
      if (breathingPhase === 'inhale') {
        const progress = 1 - (remaining / (duration));
        setAnimationProgress(progress);
      } else if (breathingPhase === 'exhale') {
        const progress = remaining / duration;
        setAnimationProgress(progress);
      }
      
      // Move to next phase if time is up
      if (remaining === 0) {
        setBreathingPhase(nextPhase);
        clearInterval(timerRef.current!);
        
        if (nextPhase === 'hold') {
          const holdDuration = (60 / breathingRate) * 0.1;
          setTimeRemaining(Math.round(holdDuration));
          startPhaseTimer(holdDuration, 'exhale');
        } else if (nextPhase === 'exhale') {
          const exhaleDuration = (60 / breathingRate) * 0.4;
          setTimeRemaining(Math.round(exhaleDuration));
          startPhaseTimer(exhaleDuration, 'rest');
        } else if (nextPhase === 'rest') {
          const restDuration = (60 / breathingRate) * 0.1;
          setTimeRemaining(Math.round(restDuration));
          startPhaseTimer(restDuration, 'inhale');
        } else if (nextPhase === 'inhale') {
          // Check if we've reached the max breath count for this difficulty
          const settings = difficultySettings[difficulty];
          if (sessionCount >= settings.maxBreathCount) {
            stopBreathing();
          } else {
            // Start a new breathing cycle
            startBreathingCycle();
            setSessionCount(prev => prev + 1);
          }
        }
      }
    }, 100);
  };
  
  // Save game progress to database
  const saveGameProgress = async (userId: string, score: number): Promise<void> => {
    try {
      await supabaseRestCall(
        '/rest/v1/game_progress',
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            game_id: 'breathing-exercise',
            score: score,
            time_played: totalSessionTime,
            difficulty: difficulty,
            completed_at: new Date().toISOString()
          })
        },
        session
      );
    } catch (error) {
      console.error('Error saving game progress:', error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // Animation properties for the breathing circle
  const mainCircleVariants = {
    inhale: {
      scale: 1.5,
      transition: { duration: (60 / breathingRate) * 0.4, ease: "easeInOut" }
    },
    hold: {
      scale: 1.5,
      transition: { duration: (60 / breathingRate) * 0.1, ease: "linear" }
    },
    exhale: {
      scale: 1,
      transition: { duration: (60 / breathingRate) * 0.4, ease: "easeInOut" }
    },
    rest: {
      scale: 1,
      transition: { duration: (60 / breathingRate) * 0.1, ease: "linear" }
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Breathing Exercise</CardTitle>
            <CardDescription>
              Focus on your breath to reduce stress and cravings
            </CardDescription>
          </div>
          <Badge variant={isPlaying ? "default" : "outline"}>
            {isPlaying ? 'In Progress' : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center">
        {/* Breathing Animation Circle */}
        <div className="relative w-64 h-64 my-8 flex items-center justify-center">
          <motion.div
            className="w-48 h-48 bg-primary/20 rounded-full flex items-center justify-center"
            variants={mainCircleVariants}
            animate={breathingPhase}
          >
            <div className="text-center">
              <div className="text-2xl font-semibold text-primary">
                {breathingPhase === 'inhale' && 'Breathe In'}
                {breathingPhase === 'hold' && 'Hold'}
                {breathingPhase === 'exhale' && 'Breathe Out'}
                {breathingPhase === 'rest' && 'Rest'}
              </div>
              {timeRemaining > 0 && (
                <div className="text-xl text-primary/70">
                  {timeRemaining}s
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Breathing Rate Control */}
        {!isPlaying && (
          <div className="w-full space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Breathing Rate: {breathingRate} breaths/min</span>
              <span>{Math.round(60 / breathingRate)} seconds/breath</span>
            </div>
            <Slider
              value={[breathingRate]}
              min={4}
              max={12}
              step={1}
              onValueChange={(val) => setBreathingRate(val[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
        )}
        
        {/* Game Stats */}
        {isPlaying && (
          <div className="w-full grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Session</div>
              <div className="text-xl font-semibold">{sessionCount} / {difficultySettings[difficulty].maxBreathCount}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="text-xl font-semibold">{totalSessionTime}s</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Rate</div>
              <div className="text-xl font-semibold">{breathingRate}/min</div>
            </div>
          </div>
        )}
        
        {/* Completion Stats */}
        {!isPlaying && calmScore > 0 && (
          <div className="w-full mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold text-center mb-2">Session Complete</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Calm Score</div>
                <div className="text-2xl font-bold text-primary">{calmScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Time</div>
                <div className="text-2xl font-bold">{totalSessionTime}s</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button 
          variant={isPlaying ? "destructive" : "default"}
          onClick={isPlaying ? stopBreathing : startBreathing}
        >
          {isPlaying ? 'Stop' : 'Start Breathing'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BreathingGame; 