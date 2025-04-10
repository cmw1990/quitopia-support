import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from '../../../components/ui/toast';
import { useAuth } from '../../../contexts/AuthContext';
import { GameService } from '../../../services/game-service';

// Define pattern types
type PatternColor = 'red' | 'blue' | 'green' | 'yellow';
type PatternShape = 'circle' | 'square' | 'triangle' | 'star';

interface PatternItem {
  color: PatternColor;
  shape: PatternShape;
}

const COLORS: PatternColor[] = ['red', 'blue', 'green', 'yellow'];
const SHAPES: PatternShape[] = ['circle', 'square', 'triangle', 'star'];

const PatternMatchPage: React.FC = () => {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<{
    pattern: PatternItem[];
    playerSequence: PatternItem[];
    score: number;
    round: number;
    isShowingPattern: boolean;
    gameOver: boolean;
  }>({
    pattern: [],
    playerSequence: [],
    score: 0,
    round: 1,
    isShowingPattern: false,
    gameOver: false
  });

  // Generate pattern based on difficulty
  const generatePattern = useCallback((round: number) => {
    const patternLength = difficulty === 'easy' ? 3 + round : 
                          difficulty === 'medium' ? 4 + round : 
                          5 + round;
    
    return Array.from({ length: patternLength }, () => ({
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]
    }));
  }, [difficulty]);

  // Start or reset game
  const startGame = useCallback(() => {
    const initialPattern = generatePattern(1);
    setGameState({
      pattern: initialPattern,
      playerSequence: [],
      score: 0,
      round: 1,
      isShowingPattern: true,
      gameOver: false
    });

    // Automatically hide pattern after display time
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isShowingPattern: false }));
    }, initialPattern.length * 1000);
  }, [generatePattern]);

  // Handle player input
  const handlePlayerInput = useCallback((item: PatternItem) => {
    if (gameState.isShowingPattern || gameState.gameOver) return;

    const updatedSequence = [...gameState.playerSequence, item];
    const isCorrectSoFar = updatedSequence.every((playerItem, index) => 
      playerItem.color === gameState.pattern[index].color &&
      playerItem.shape === gameState.pattern[index].shape
    );

    if (!isCorrectSoFar) {
      // Game over logic
      setGameState(prevState => {
        // Log game session
        if (user) {
          GameService.logGameSession({
            userId: user.id,
            gameType: 'pattern_match',
            score: prevState.score,
            duration: prevState.round * 10,
            difficulty,
            completed: false
          });

          toast({
            title: 'Game Over',
            description: `Your score: ${prevState.score}`,
            variant: 'destructive'
          });
        }

        return { ...prevState, gameOver: true };
      });
      return;
    }

    // Check if player completed the pattern
    if (updatedSequence.length === gameState.pattern.length) {
      const newPattern = generatePattern(gameState.round + 1);
      
      setGameState(prevState => ({
        pattern: newPattern,
        playerSequence: [],
        score: prevState.score + gameState.pattern.length,
        round: prevState.round + 1,
        isShowingPattern: true,
        gameOver: false
      }));

      // Automatically hide pattern after display time
      setTimeout(() => {
        setGameState(prev => ({ ...prev, isShowingPattern: false }));
      }, newPattern.length * 1000);
    } else {
      setGameState(prev => ({ ...prev, playerSequence: updatedSequence }));
    }
  }, [gameState, generatePattern, user, difficulty]);

  // Render pattern items
  const renderPatternItem = useCallback((item: PatternItem, index: number) => {
    const baseStyle = "w-16 h-16 m-2 rounded-lg transition-all duration-300";
    const colorClasses = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    };
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-none',
      triangle: 'clip-path-triangle',
      star: 'clip-path-star'
    };

    return (
      <div 
        key={index} 
        className={`${baseStyle} ${colorClasses[item.color]} ${shapeClasses[item.shape]}`}
      />
    );
  }, []);

  // Render player input buttons
  const renderInputButtons = useMemo(() => {
    return COLORS.flatMap(color => 
      SHAPES.map(shape => (
        <Button
          key={`${color}-${shape}`}
          onClick={() => handlePlayerInput({ color, shape })}
          className={`w-16 h-16 m-1 ${
            gameState.isShowingPattern || gameState.gameOver 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105'
          }`}
          variant="outline"
          disabled={gameState.isShowingPattern || gameState.gameOver}
        >
          <div 
            className={`w-12 h-12 ${
              {
                red: 'bg-red-500',
                blue: 'bg-blue-500', 
                green: 'bg-green-500', 
                yellow: 'bg-yellow-500'
              }[color]
            } ${
              {
                circle: 'rounded-full',
                square: 'rounded-none',
                triangle: 'clip-path-triangle',
                star: 'clip-path-star'
              }[shape]
            }`}
          />
        </Button>
      ))
    );
  }, [handlePlayerInput, gameState]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Game Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Match</CardTitle>
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
                disabled={gameState.pattern.length > 0 && !gameState.gameOver}
              >
                {gameState.gameOver ? 'Restart' : 'Start Game'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Display */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {gameState.gameOver 
                ? 'Game Over' 
                : gameState.isShowingPattern 
                  ? 'Memorize the Pattern' 
                  : 'Repeat the Pattern'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center">
              {gameState.isShowingPattern 
                ? gameState.pattern.map(renderPatternItem)
                : renderInputButtons}
            </div>
            <div className="mt-4 text-center">
              <p>Score: {gameState.score}</p>
              <p>Round: {gameState.round}</p>
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
              <li>1. Choose a difficulty level</li>
              <li>2. Click 'Start Game'</li>
              <li>3. Memorize the pattern shown</li>
              <li>4. Repeat the pattern by clicking matching buttons</li>
              <li>5. Each correct round increases your score</li>
              <li>6. One wrong move ends the game</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatternMatchPage;