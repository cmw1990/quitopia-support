import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from '../../../components/ui/toast';
import { useAuth } from '../../../contexts/AuthContext';
import { GameService } from '../../../services/game-service';

// Define game elements
type ZenElement = {
  id: string;
  type: 'calm' | 'distraction';
  x: number;
  y: number;
  speed: number;
  size: number;
};

const ZenDriftPage: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<{
    elements: ZenElement[];
    score: number;
    lives: number;
    gameOver: boolean;
    timer: number;
  }>({
    elements: [],
    score: 0,
    lives: 3,
    gameOver: false,
    timer: 60
  });

  // Generate game elements
  const generateElements = useCallback(() => {
    const elementCount = difficulty === 'easy' ? 10 : 
                         difficulty === 'medium' ? 15 : 20;
    
    const newElements: ZenElement[] = [];
    
    for (let i = 0; i < elementCount; i++) {
      const isCalm = Math.random() > 0.3;  // 70% calm, 30% distraction
      newElements.push({
        id: `element-${i}`,
        type: isCalm ? 'calm' : 'distraction',
        x: Math.random() * window.innerWidth,
        y: -50,  // Start above the canvas
        speed: Math.random() * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 2),
        size: Math.random() * 30 + 10  // 10-40px
      });
    }

    return newElements;
  }, [difficulty]);

  // Game logic and rendering
  const updateGame = useCallback((ctx: CanvasRenderingContext2D) => {
    if (gameState.gameOver) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Update and draw elements
    const updatedElements = gameState.elements.map(element => {
      const newY = element.y + element.speed;
      
      // Draw element
      ctx.beginPath();
      ctx.fillStyle = element.type === 'calm' ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
      ctx.arc(element.x, newY, element.size, 0, Math.PI * 2);
      ctx.fill();

      return { ...element, y: newY };
    }).filter(element => element.y < ctx.canvas.height);

    // Check for missed elements
    const missedElements = gameState.elements.filter(
      element => element.y >= ctx.canvas.height
    );

    const missedDistractions = missedElements.filter(
      element => element.type === 'distraction'
    );

    const missedCalm = missedElements.filter(
      element => element.type === 'calm'
    );

    setGameState(prev => ({
      ...prev,
      elements: updatedElements,
      lives: prev.lives - missedDistractions.length,
      score: prev.score + missedCalm.length,
      gameOver: prev.lives - missedDistractions.length <= 0
    }));
  }, [gameState]);

  // Start or reset game
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 200;  // Leave space for UI

    const initialElements = generateElements();
    setGameState({
      elements: initialElements,
      score: 0,
      lives: 3,
      gameOver: false,
      timer: 60
    });

    // Game loop
    const gameLoop = () => {
      updateGame(ctx);
      
      // Add new elements periodically
      if (Math.random() < 0.1) {  // 10% chance each frame
        const newElement: ZenElement = {
          id: `element-${Date.now()}`,
          type: Math.random() > 0.3 ? 'calm' : 'distraction',
          x: Math.random() * canvas.width,
          y: -50,
          speed: Math.random() * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 2),
          size: Math.random() * 30 + 10
        };
        
        setGameState(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
        }));
      }
    };

    // Timer countdown
    const timerInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 0 || prev.gameOver) {
          clearInterval(timerInterval);
          
          // Log game session
          if (user) {
            GameService.logGameSession({
              userId: user.id,
              gameType: 'zen_drift',
              score: prev.score,
              duration: 60,
              difficulty,
              completed: !prev.gameOver
            });
          }

          return { ...prev, gameOver: true };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    // Animation frame
    let animationFrameId: number;
    const animate = () => {
      gameLoop();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      clearInterval(timerInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [generateElements, updateGame, user, difficulty]);

  // Lifecycle effects
  useEffect(() => {
    const cleanup = startGame();
    return cleanup;
  }, [startGame]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Game Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Zen Drift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <div className="flex space-x-2">
                  {(['easy', 'medium', 'hard'] as const).map(level => (
                    <Button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      variant={difficulty === level ? 'default' : 'outline'}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              <Button 
                onClick={startGame} 
                className="w-full"
                disabled={!gameState.gameOver}
              >
                Restart Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Board */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {gameState.gameOver 
                ? 'Game Over' 
                : 'Drift Through Zen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas 
              ref={canvasRef} 
              className="w-full h-64 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg"
            />
            <div className="mt-4 text-center grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Time Left</p>
                <p className="text-2xl font-bold">{gameState.timer}s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lives</p>
                <p className="text-2xl font-bold">{gameState.lives}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold">{gameState.score}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li>1. Green elements increase your score</li>
              <li>2. Red elements reduce your lives</li>
              <li>3. Avoid red elements</li>
              <li>4. Collect as many green elements as possible</li>
              <li>5. Game ends when lives reach zero</li>
              <li>6. Higher difficulty = faster elements</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZenDriftPage;