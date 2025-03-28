import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Wind, Pause, Play, Timer, Trophy, ArrowLeft, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import confetti from 'canvas-confetti';
import { Session } from '@supabase/supabase-js';

// Game session interface
interface GameSession {
  id: string;
  score: number;
  distance: number;
  obstaclesAvoided: number;
  timeElapsed: number;
  date: string;
}

interface BalloonJourneyProps {
  session: Session | null;
  onBack?: () => void;
  onComplete?: (score: number) => void;
}

const BalloonJourney: React.FC<BalloonJourneyProps> = ({ session, onBack, onComplete }) => {
  // Game state
  const [activeTab, setActiveTab] = useState<string>('play');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [obstaclesAvoided, setObstaclesAvoided] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [balloonHeight, setBalloonHeight] = useState<number>(50); // 0-100 percentage
  const [breathInPhase, setBreathInPhase] = useState<boolean>(true);
  const [userBreathingRate, setUserBreathingRate] = useState<number>(6); // breaths per minute
  const [breathingDuration, setBreathingDuration] = useState<number>(10000); // milliseconds for a full breath cycle
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [volumeLevel, setVolumeLevel] = useState<string>('medium'); // 'off', 'low', 'medium'
  
  // Canvas references 
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const obstacles = useRef<Obstacle[]>([]);
  const clouds = useRef<Cloud[]>([]);
  
  // Audio elements
  const windAudio = useRef<HTMLAudioElement | null>(typeof window !== 'undefined' ? new Audio('/sounds/wind.mp3') : null);
  const successAudio = useRef<HTMLAudioElement | null>(typeof window !== 'undefined' ? new Audio('/sounds/success.mp3') : null);
  const clickAudio = useRef<HTMLAudioElement | null>(typeof window !== 'undefined' ? new Audio('/sounds/click.mp3') : null);
  
  // Configure breathing duration based on rate
  useEffect(() => {
    // Convert breaths per minute to milliseconds per full breath cycle
    setBreathingDuration(60000 / userBreathingRate);
  }, [userBreathingRate]);
  
  // Set volume based on level
  useEffect(() => {
    if (!windAudio.current || !successAudio.current || !clickAudio.current) return;
    
    const volume = volumeLevel === 'off' ? 0 : volumeLevel === 'low' ? 0.3 : 0.7;
    windAudio.current.volume = volume;
    successAudio.current.volume = volume;
    clickAudio.current.volume = volume;
    
    if (isPlaying && !isPaused && volumeLevel !== 'off') {
      windAudio.current.play().catch(e => console.error('Audio play error:', e));
    } else {
      windAudio.current.pause();
    }
  }, [volumeLevel, isPlaying, isPaused]);
  
  // Fetch game history
  const fetchGameHistory = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await authenticatedRestCall(
        `/rest/v1/game_sessions?select=*&user_id=eq.${session.user.id}&game_type=eq.balloon_journey&order=created_at.desc&limit=10`,
        { method: 'GET' },
        session
      );

      if (error) throw error;
      if (data) setGameHistory(data);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  }, [session]);
  
  // Load game history on component mount
  useEffect(() => {
    fetchGameHistory();
  }, [fetchGameHistory]);
  
  // Obstacle class for gameplay
  class Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    passed: boolean;
    
    constructor(canvasWidth: number, canvasHeight: number) {
      this.width = 30 + Math.random() * 20; // 30-50 pixels
      this.height = 100 + Math.random() * 100; // 100-200 pixels
      this.x = canvasWidth;
      
      // Position obstacle either at top or bottom
      const isTop = Math.random() > 0.5;
      this.y = isTop ? 0 : canvasHeight - this.height;
      
      this.speed = 2 + Math.random() * 1; // 2-3 pixels per frame
      this.passed = false;
    }
    
    update() {
      this.x -= this.speed;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // Check if balloon collides with this obstacle
    collidesWith(balloonX: number, balloonY: number, balloonSize: number) {
      const balloonLeft = balloonX;
      const balloonRight = balloonX + balloonSize;
      const balloonTop = balloonY;
      const balloonBottom = balloonY + balloonSize;
      
      const obstacleLeft = this.x;
      const obstacleRight = this.x + this.width;
      const obstacleTop = this.y;
      const obstacleBottom = this.y + this.height;
      
      return !(
        balloonRight < obstacleLeft ||
        balloonLeft > obstacleRight ||
        balloonBottom < obstacleTop ||
        balloonTop > obstacleBottom
      );
    }
  }
  
  // Cloud class for visual effect
  class Cloud {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    
    constructor(canvasWidth: number, canvasHeight: number) {
      this.width = 60 + Math.random() * 80; // 60-140 pixels
      this.height = 30 + Math.random() * 20; // 30-50 pixels
      this.x = canvasWidth;
      this.y = Math.random() * (canvasHeight - this.height);
      this.speed = 0.5 + Math.random() * 1; // 0.5-1.5 pixels per frame
    }
    
    update() {
      this.x -= this.speed;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.ellipse(
        this.x + this.width/2, 
        this.y + this.height/2, 
        this.width/2, 
        this.height/2, 
        0, 0, 2 * Math.PI
      );
      ctx.fill();
    }
  }
  
  // Start a new game
  const startGame = () => {
    if (volumeLevel !== 'off' && clickAudio.current) {
      clickAudio.current.play().catch(e => console.error('Audio play error:', e));
    }
    
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    setDistance(0);
    setTimeElapsed(0);
    setObstaclesAvoided(0);
    setBalloonHeight(50);
    setBreathInPhase(true);
    
    obstacles.current = [];
    clouds.current = [];
    lastTimestamp.current = performance.now();
    
    if (windAudio.current && volumeLevel !== 'off') {
      windAudio.current.currentTime = 0;
      windAudio.current.loop = true;
      windAudio.current.play().catch(e => console.error('Audio play error:', e));
    }
    
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Start animation loop
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    }
  };
  
  // Pause/resume game
  const togglePause = () => {
    if (volumeLevel !== 'off' && clickAudio.current) {
      clickAudio.current.play().catch(e => console.error('Audio play error:', e));
    }
    
    setIsPaused(prev => !prev);
    
    if (!isPaused) {
      // Pausing
      if (windAudio.current) windAudio.current.pause();
      cancelAnimationFrame(animationRef.current);
    } else {
      // Resuming
      if (windAudio.current && volumeLevel !== 'off') windAudio.current.play().catch(e => console.error('Audio play error:', e));
      lastTimestamp.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // End the game
  const endGame = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    
    if (windAudio.current) windAudio.current.pause();
    
    if (volumeLevel !== 'off' && successAudio.current) {
      successAudio.current.play().catch(e => console.error('Audio play error:', e));
    }
    
    // Show confetti for good scores
    if (score > 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // Calculate final score based on distance, time and obstacles avoided
    const finalScore = score;
    toast.success(`Journey complete! Score: ${finalScore}`);
    
    // Save game results
    saveGameResults();
    
    // Call onComplete callback if provided
    if (onComplete) onComplete(finalScore);
    
    cancelAnimationFrame(animationRef.current);
  }, [score, onComplete, volumeLevel]);
  
  // Save game results
  const saveGameResults = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      // Prepare game session data
      const gameSession = {
        user_id: session.user.id,
        game_type: 'balloon_journey',
        score,
        distance: Math.floor(distance),
        obstacles_avoided: obstaclesAvoided,
        time_elapsed: timeElapsed
      };
      
      // Save to database
      const { error } = await authenticatedRestCall(
        `/rest/v1/game_sessions`,
        { method: 'POST', body: JSON.stringify(gameSession) },
        session
      );
      
      if (error) throw error;
      
      // Refresh history
      fetchGameHistory();
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete(score);
      }
    } catch (err) {
      console.error('Error saving game results:', err);
      toast.error('Failed to save your game results');
    }
  }, [session, score, distance, obstaclesAvoided, timeElapsed, fetchGameHistory, onComplete]);
  
  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;
    
    const deltaTime = timestamp - lastTimestamp.current;
    lastTimestamp.current = timestamp;
    
    // Update game time
    setTimeElapsed(prev => prev + deltaTime / 1000);
    
    // Update balloon height based on breathing phase
    const breathCycleDuration = breathingDuration;
    const breathInDuration = breathCycleDuration * 0.4; // 40% of cycle is inhale
    const breathOutDuration = breathCycleDuration * 0.6; // 60% of cycle is exhale
    
    if (breathInPhase) {
      // Rising during breath in
      setBalloonHeight(prev => {
        const newHeight = prev - (deltaTime / breathInDuration) * 30; // Rise by 30% over full breath in
        if (newHeight <= 20) { // Cap at 20% height (higher in canvas)
          setBreathInPhase(false);
          return 20;
        }
        return newHeight;
      });
    } else {
      // Falling during breath out
      setBalloonHeight(prev => {
        const newHeight = prev + (deltaTime / breathOutDuration) * 30; // Fall by 30% over full breath out
        if (newHeight >= 80) { // Cap at 80% height (lower in canvas)
          setBreathInPhase(true);
          return 80;
        }
        return newHeight;
      });
    }
    
    // Update distance traveled
    setDistance(prev => prev + deltaTime * 0.01);
    
    // Update score (based on distance and obstacles avoided)
    setScore(Math.floor(distance * 10 + obstaclesAvoided * 5));
    
    // Handle canvas rendering
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky background gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB'); // Sky blue at top
    skyGradient.addColorStop(1, '#E0F7FF'); // Lighter blue at bottom
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Randomly add new clouds
    if (Math.random() < 0.01) {
      clouds.current.push(new Cloud(canvas.width, canvas.height));
    }
    
    // Update and draw clouds
    clouds.current.forEach((cloud, index) => {
      cloud.update();
      cloud.draw(ctx);
      
      // Remove clouds that have gone off screen
      if (cloud.x + cloud.width < 0) {
        clouds.current.splice(index, 1);
      }
    });
    
    // Randomly add new obstacles based on distance
    const obstacleFrequency = 0.005 + (Math.min(distance, 1000) / 10000); // Increase frequency with distance
    if (Math.random() < obstacleFrequency) {
      obstacles.current.push(new Obstacle(canvas.width, canvas.height));
    }
    
    // Draw ground
    ctx.fillStyle = '#8FBC8F'; // Green
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Calculate balloon position
    const balloonSize = 40;
    const balloonX = canvas.width * 0.2;
    const balloonY = (canvas.height - 20 - balloonSize) * (balloonHeight / 100);
    
    // Update and draw obstacles
    let collision = false;
    obstacles.current.forEach((obstacle, index) => {
      obstacle.update();
      obstacle.draw(ctx);
      
      // Check for collisions
      if (obstacle.collidesWith(balloonX, balloonY, balloonSize)) {
        collision = true;
      }
      
      // Count passed obstacles
      if (!obstacle.passed && obstacle.x + obstacle.width < balloonX) {
        obstacle.passed = true;
        setObstaclesAvoided(prev => prev + 1);
      }
      
      // Remove obstacles that have gone off screen
      if (obstacle.x + obstacle.width < 0) {
        obstacles.current.splice(index, 1);
      }
    });
    
    // Draw balloon
    ctx.fillStyle = '#FF6347'; // Red
    ctx.beginPath();
    ctx.ellipse(
      balloonX + balloonSize/2, 
      balloonY + balloonSize/2, 
      balloonSize/2, 
      balloonSize/2, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Draw basket
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(
      balloonX + balloonSize/2 - 5, 
      balloonY + balloonSize - 5, 
      10, 
      15
    );
    
    // Draw string connecting balloon to basket
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(balloonX + balloonSize/2 - 5, balloonY + balloonSize - 5);
    ctx.lineTo(balloonX + balloonSize/2 - 5, balloonY + balloonSize/2);
    ctx.moveTo(balloonX + balloonSize/2 + 5, balloonY + balloonSize - 5);
    ctx.lineTo(balloonX + balloonSize/2 + 5, balloonY + balloonSize/2);
    ctx.stroke();
    
    // Check for collision with ground
    if (balloonY + balloonSize > canvas.height - 20) {
      collision = true;
    }
    
    // Check for collision with top
    if (balloonY < 0) {
      collision = true;
    }
    
    // Game over condition
    if (collision) {
      endGame();
      return;
    }
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [breathingDuration, breathInPhase, distance, endGame, obstaclesAvoided]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (windAudio.current) windAudio.current.pause();
      if (successAudio.current) successAudio.current.pause();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Setup canvas size on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = Math.min(400, width * 0.6); // Maintain aspect ratio
          
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Render volume control
  const renderVolumeControl = () => {
    return (
      <div className="flex items-center space-x-2">
        {volumeLevel === 'off' ? (
          <VolumeX className="w-5 h-5 cursor-pointer" onClick={() => setVolumeLevel('low')} />
        ) : volumeLevel === 'low' ? (
          <Volume1 className="w-5 h-5 cursor-pointer" onClick={() => setVolumeLevel('medium')} />
        ) : (
          <Volume2 className="w-5 h-5 cursor-pointer" onClick={() => setVolumeLevel('off')} />
        )}
      </div>
    );
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-blue-950 shadow-xl rounded-xl">
      <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Wind className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">Balloon Journey</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {renderVolumeControl()}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="play" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="px-4 pb-6">
          <div className="space-y-4">
            {isPlaying && (
              <div className="flex justify-between items-center mb-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-amber-500" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>{score} pts</span>
                </div>
              </div>
            )}
            
            {/* Game canvas */}
            <div className="relative w-full">
              <canvas
                ref={canvasRef}
                className="border border-blue-200 dark:border-blue-800 rounded-lg shadow-inner bg-sky-100 dark:bg-sky-900/30 w-full"
              />
              
              {/* Breathing indicator */}
              {isPlaying && (
                <div className="absolute top-4 left-4 p-2 bg-white/80 dark:bg-slate-800/80 rounded shadow text-sm">
                  {breathInPhase ? (
                    <div className="text-blue-500">Breathe In</div>
                  ) : (
                    <div className="text-green-500">Breathe Out</div>
                  )}
                </div>
              )}
              
              {/* Pause/play overlay */}
              {isPlaying && isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
                    <h3 className="text-xl font-bold mb-4">Game Paused</h3>
                    <Button onClick={togglePause}>Resume</Button>
                  </div>
                </div>
              )}
              
              {/* Start overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center max-w-md">
                    <h3 className="text-xl font-bold mb-2">Balloon Journey</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Control your breathing to guide the balloon.
                      <br />Inhale to rise, exhale to descend. Avoid obstacles!
                    </p>
                    <Button onClick={startGame} size="lg" className="px-8">
                      Start Journey
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Game controls */}
            {isPlaying && !isPaused && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={togglePause}
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause Journey
                </Button>
              </div>
            )}
            
            {/* Game info */}
            {isPlaying && (
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-white/60 dark:bg-slate-800/60 p-2 rounded">
                  <div className="text-slate-500 dark:text-slate-400">Distance</div>
                  <div className="font-medium">{Math.floor(distance)} m</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 p-2 rounded">
                  <div className="text-slate-500 dark:text-slate-400">Obstacles</div>
                  <div className="font-medium">{obstaclesAvoided}</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 p-2 rounded">
                  <div className="text-slate-500 dark:text-slate-400">Score</div>
                  <div className="font-medium">{score}</div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="px-4 pb-6">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Breathing Rate</h3>
                <span className="text-sm font-medium">{userBreathingRate} breaths/min</span>
              </div>
              <Slider
                value={[userBreathingRate]}
                min={4}
                max={10}
                step={1}
                onValueChange={(value) => setUserBreathingRate(value[0])}
                className="py-4"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Slower breathing (4-6 breaths/min) is easier to control but moves more slowly.
                Faster breathing (7-10 breaths/min) increases speed but requires more precision.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">How To Play</h3>
              <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-lg space-y-2">
                <p>1. Breathe in sync with the on-screen indicator</p>
                <p>2. When you breathe in, the balloon rises</p>
                <p>3. When you breathe out, the balloon descends</p>
                <p>4. Navigate around obstacles to travel further</p>
                <p>5. Your score increases with distance and obstacles avoided</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sound Effects</h3>
              <div className="flex items-center gap-4">
                <Button 
                  variant={volumeLevel === 'off' ? 'outline' : 'default'}
                  size="sm" 
                  onClick={() => setVolumeLevel('off')}
                  className="flex items-center gap-2"
                >
                  <VolumeX className="w-4 h-4" />
                  Off
                </Button>
                <Button 
                  variant={volumeLevel === 'low' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setVolumeLevel('low')}
                  className="flex items-center gap-2"
                >
                  <Volume1 className="w-4 h-4" />
                  Low
                </Button>
                <Button 
                  variant={volumeLevel === 'medium' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setVolumeLevel('medium')}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Medium
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="px-4 pb-6">
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-medium">Journey History</h3>
            
            {gameHistory.length > 0 ? (
              <div className="space-y-3">
                {gameHistory.map((game) => (
                  <Card key={game.id} className="p-3 bg-white/70 dark:bg-slate-800/70">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">
                          {Math.floor(game.distance)} meters
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(game.date).toLocaleDateString()} • {game.obstaclesAvoided} obstacles avoided
                        </div>
                      </div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {game.score} pts
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No journey history yet. Start a journey to see your stats!
              </div>
            )}
            
            <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Benefits of Breathing Games</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">1</span>
                  </div>
                  <span>Reduces stress and anxiety through controlled breathing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">2</span>
                  </div>
                  <span>Lowers heart rate and blood pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">3</span>
                  </div>
                  <span>Builds awareness of breathing patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">4</span>
                  </div>
                  <span>Helps manage cravings by providing distraction and relaxation</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default BalloonJourney; 