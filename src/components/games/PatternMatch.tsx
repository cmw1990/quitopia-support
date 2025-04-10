import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { toast } from 'sonner';
import { Brain, Trophy, Clock } from 'lucide-react';

// Pattern configuration
type PatternItem = {
  color: string;
  shape: string;
};

type GameStats = {
  score: number;
  level: number;
  timeRemaining: number;
  matches: number;
  totalAttempts: number;
  streakCount: number;
};

// Colors and shapes for the patterns
const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
const shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];

// Shape component to render different pattern shapes
const Shape = ({ shape, color, size = 'h-12 w-12', onClick, isTarget = false }: { 
  shape: string; 
  color: string; 
  size?: string; 
  onClick?: () => void;
  isTarget?: boolean;
}) => {
  const baseClasses = `inline-flex items-center justify-center ${size} ${color} transition-all`;
  
  // Add some animation when it's the target shape
  const targetClasses = isTarget ? 'ring-4 ring-white ring-opacity-50 shadow-lg' : '';
  
  // Clickable styles
  const clickClasses = onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : '';
  
  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return <div className={`${baseClasses} ${targetClasses} ${clickClasses} rounded-full`} onClick={onClick}></div>;
      case 'square':
        return <div className={`${baseClasses} ${targetClasses} ${clickClasses}`} onClick={onClick}></div>;
      case 'triangle':
        return (
          <div className={`${baseClasses} ${targetClasses} ${clickClasses} clip-triangle`} onClick={onClick}
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          ></div>
        );
      case 'diamond':
        return (
          <div className={`${baseClasses} ${targetClasses} ${clickClasses}`} onClick={onClick}
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          ></div>
        );
      case 'hexagon':
        return (
          <div className={`${baseClasses} ${targetClasses} ${clickClasses}`} onClick={onClick}
            style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
          ></div>
        );
      case 'star':
        return (
          <div className={`${baseClasses} ${targetClasses} ${clickClasses}`} onClick={onClick}
            style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
          ></div>
        );
      default:
        return <div className={`${baseClasses} ${targetClasses} ${clickClasses} rounded-full`} onClick={onClick}></div>;
    }
  };
  
  return renderShape();
};

export function PatternMatch() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gamePatterns, setGamePatterns] = useState<PatternItem[][]>([]);
  const [targetPattern, setTargetPattern] = useState<PatternItem[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    timeRemaining: 60,
    matches: 0,
    totalAttempts: 0,
    streakCount: 0
  });

  const { user, session } = useAuth();
  
  // Generate a random pattern
  const generatePattern = useCallback(() => {
    const patternSize = Math.min(2 + Math.floor(gameStats.level / 2), 5); // Gradually increase pattern size with level
    
    const newPattern: PatternItem[] = [];
    for (let i = 0; i < patternSize; i++) {
      newPattern.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    return newPattern;
  }, [gameStats.level]);
  
  // Generate game patterns including one matching the target
  const generateGamePatterns = useCallback(() => {
    const numPatterns = Math.min(4 + Math.floor(gameStats.level / 3), 9); // More patterns at higher levels
    const newTarget = generatePattern();
    
    const patterns: PatternItem[][] = [newTarget]; // Add the target pattern
    
    // Generate additional non-matching patterns
    for (let i = 1; i < numPatterns; i++) {
      let newPattern = generatePattern();
      
      // Ensure the pattern is different from the target
      while (JSON.stringify(newPattern) === JSON.stringify(newTarget)) {
        newPattern = generatePattern();
      }
      
      patterns.push(newPattern);
    }
    
    // Shuffle the patterns
    for (let i = patterns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
    }
    
    setTargetPattern(newTarget);
    setGamePatterns(patterns);
  }, [gameStats.level, generatePattern]);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameStats({
      score: 0,
      level: 1,
      timeRemaining: 60,
      matches: 0,
      totalAttempts: 0,
      streakCount: 0
    });
    generateGamePatterns();
  };
  
  // Handle pattern selection
  const handlePatternClick = (pattern: PatternItem[]) => {
    const isMatch = JSON.stringify(pattern) === JSON.stringify(targetPattern);
    
    setGameStats(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      matches: isMatch ? prev.matches + 1 : prev.matches,
      streakCount: isMatch ? prev.streakCount + 1 : 0,
      score: isMatch ? prev.score + (10 * prev.level) + (prev.streakCount * 5) : Math.max(0, prev.score - 5),
      level: isMatch && prev.matches % 3 === 2 ? prev.level + 1 : prev.level, // Level up every 3 matches
      timeRemaining: isMatch ? prev.timeRemaining + 3 : prev.timeRemaining // Bonus time for correct matches
    }));
    
    if (isMatch) {
      toast.success(gameStats.streakCount >= 2 ? `Combo x${gameStats.streakCount + 1}! +${(10 * gameStats.level) + (gameStats.streakCount * 5)} points` : 'Correct! +10 points');
      generateGamePatterns();
    } else {
      toast.error('Wrong match! -5 points');
    }
  };
  
  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver && gameStats.timeRemaining > 0) {
      timer = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver, gameStats.timeRemaining]);
  
  // Check for game over
  useEffect(() => {
    if (gameStarted && gameStats.timeRemaining <= 0) {
      setGameOver(true);
      
      // Save the game results if the user is logged in
      if (user && session) {
        const saveGameResult = async () => {
          try {
            // Use supabaseRequest, handle error, remove session arg
            const { error: saveError } = await supabaseRequest(
              '/rest/v1/focus_game_results8',
              {
                method: 'POST',
                headers: { 'Prefer': 'return=minimal' }, // Don't need result back
                body: JSON.stringify({
                  user_id: user.id,
                  game_id: 'pattern-match',
                  score: gameStats.score,
                  level_reached: gameStats.level,
                  correct_matches: gameStats.matches,
                  total_attempts: gameStats.totalAttempts,
                  accuracy: Math.round((gameStats.matches / Math.max(1, gameStats.totalAttempts)) * 100),
                  date_played: new Date().toISOString()
                })
              }
              // Removed session argument
            );
             if (saveError) throw saveError; // Propagate error
          } catch (error) {
            console.error('Error saving game results:', error);
          }
        };
        
        saveGameResult();
      }
    }
  }, [gameStarted, gameStats, user, session]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Pattern Match</CardTitle>
          <CardDescription className="text-center">Find the pattern that matches the target pattern</CardDescription>
        </CardHeader>
        
        <CardContent>
          {!gameStarted ? (
            <div className="space-y-6 max-w-md mx-auto text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">How to Play</h3>
                <p className="text-muted-foreground">
                  Look at the target pattern at the top, then find the matching pattern from the grid below.
                  The patterns will get more complex as you level up.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Benefits</h3>
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="flex flex-col items-center">
                    <Brain className="h-8 w-8 text-blue-500 mb-1" />
                    <span>Pattern Recognition</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="h-8 w-8 text-purple-500 mb-1" />
                    <span>Processing Speed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Trophy className="h-8 w-8 text-amber-500 mb-1" />
                    <span>Attention</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={startGame} size="lg" className="w-full">
                Start Game
              </Button>
            </div>
          ) : gameOver ? (
            <div className="space-y-6 max-w-md mx-auto text-center">
              <h3 className="text-xl font-bold">Game Over</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{gameStats.score}</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{gameStats.level}</div>
                  <div className="text-sm text-muted-foreground">Level Reached</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{gameStats.matches}</div>
                  <div className="text-sm text-muted-foreground">Correct Matches</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round((gameStats.matches / Math.max(1, gameStats.totalAttempts)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button onClick={startGame} size="lg" className="w-full">
                  Play Again
                </Button>
              </div>
              
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Sign in to save your scores and track your progress!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold">Score: {gameStats.score}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <span className="font-bold">Level: {gameStats.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="font-bold">Time: {gameStats.timeRemaining}s</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-center text-lg font-medium mb-2">Target Pattern</h3>
                  <motion.div 
                    className="flex justify-center items-center p-4 bg-slate-800 rounded-lg"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={JSON.stringify(targetPattern)}
                  >
                    <div className="flex gap-3">
                      {targetPattern.map((item, idx) => (
                        <Shape 
                          key={idx} 
                          shape={item.shape} 
                          color={item.color} 
                          isTarget={true}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                <div>
                  <h3 className="text-center text-lg font-medium mb-2">Find the Match</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gamePatterns.map((pattern, patternIdx) => (
                      <motion.div
                        key={patternIdx}
                        className="bg-muted p-4 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => handlePatternClick(pattern)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: patternIdx * 0.1 }}
                      >
                        <div className="flex justify-center items-center gap-2">
                          {pattern.map((item, itemIdx) => (
                            <Shape 
                              key={itemIdx} 
                              shape={item.shape} 
                              color={item.color} 
                              size="h-8 w-8"
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        {gameStarted && !gameOver && (
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => setGameOver(true)}>
              End Game
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
