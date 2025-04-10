import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { toast } from 'sonner';
import { Brain, Trophy, Clock, ZapIcon } from 'lucide-react';

// Card configuration
type MemoryCard = {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameStats = {
  score: number;
  moves: number;
  pairs: number;
  timeElapsed: number;
  level: number;
  totalPairs: number;
};

// Card content options (can be expanded)
const cardContents = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🐦', '🦆', '🦉', '🦇', '🐺', '🐗', '🐴'
];

export function MemoryCards() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    moves: 0,
    pairs: 0,
    timeElapsed: 0,
    level: 1,
    totalPairs: 6, // Start with 6 pairs on level 1
  });
  const [selectedCard, setSelectedCard] = useState<MemoryCard | null>(null);
  const [canFlip, setCanFlip] = useState(true);

  const { user, session } = useAuth();

  // Generate cards for the game
  const generateCards = useCallback(() => {
    // Number of pairs increases with level
    const numPairs = Math.min(6 + gameStats.level, 12);
    
    // Update total pairs in game stats
    setGameStats(prev => ({
      ...prev,
      totalPairs: numPairs
    }));
    
    // Create pairs of cards
    const newCards: MemoryCard[] = [];
    const shuffledContents = [...cardContents].sort(() => Math.random() - 0.5).slice(0, numPairs);
    
    // Create pairs
    shuffledContents.forEach((content, index) => {
      newCards.push(
        { id: index * 2, content, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, content, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle the cards
    newCards.sort(() => Math.random() - 0.5);
    
    setCards(newCards);
  }, [gameStats.level]);

  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameStats({
      score: 0,
      moves: 0,
      pairs: 0,
      timeElapsed: 0,
      level: 1,
      totalPairs: 6,
    });
    generateCards();
  };

  // Handle card click
  const handleCardClick = (card: MemoryCard) => {
    // Prevent clicking if:
    // - cannot flip cards during animation
    // - card is already flipped
    // - card is already matched
    // - same card is clicked twice
    if (!canFlip || card.isFlipped || card.isMatched || (selectedCard && selectedCard.id === card.id)) {
      return;
    }

    // Flip the card
    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    // If there's already a card selected
    if (selectedCard) {
      setCanFlip(false); // Prevent flipping more cards during check
      setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }));

      // Check if cards match
      const isMatch = selectedCard.content === card.content;
      
      setTimeout(() => {
        if (isMatch) {
          // Match found - mark both cards as matched
          setCards(cards.map(c => 
            (c.id === card.id || c.id === selectedCard.id)
              ? { ...c, isFlipped: true, isMatched: true }
              : c
          ));
          
          // Update game stats
          setGameStats(prev => {
            const newPairs = prev.pairs + 1;
            const matchBonus = Math.ceil(1000 / Math.max(1, prev.moves)) * prev.level;
            const newScore = prev.score + matchBonus;
            
            // Show toast with points
            toast.success(`Match! +${matchBonus} points`);
            
            // Check if level is complete
            if (newPairs === prev.totalPairs) {
              // Level up!
              toast.success(`Level ${prev.level} Complete! Moving to Level ${prev.level + 1}`);
              
              // Generate new cards for next level
              setTimeout(() => {
                const newLevel = prev.level + 1;
                setGameStats(s => ({ ...s, level: newLevel, pairs: 0 }));
                generateCards();
              }, 1500);
            }
            
            return {
              ...prev,
              score: newScore,
              pairs: newPairs
            };
          });
        } else {
          // No match - flip both cards back over
          setCards(cards.map(c => 
            (c.id === card.id || c.id === selectedCard.id)
              ? { ...c, isFlipped: false }
              : c
          ));
        }
        
        // Reset selection
        setSelectedCard(null);
        setCanFlip(true);
      }, 1000);
    } else {
      // First card selection
      setSelectedCard(card);
    }
  };

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setGameStats(prev => {
          const newTimeElapsed = prev.timeElapsed + 1;
          
          // End game after 5 minutes (300 seconds)
          if (newTimeElapsed >= 300) {
            setGameOver(true);
          }
          
          return {
            ...prev,
            timeElapsed: newTimeElapsed
          };
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver]);
  
  // Save game results when game ends
  useEffect(() => {
    if (gameOver && user && session) {
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
                game_id: 'memory-cards',
                score: gameStats.score,
                level_reached: gameStats.level,
                moves_made: gameStats.moves,
                pairs_matched: gameStats.pairs + ((gameStats.level - 1) * gameStats.totalPairs),
                time_played: gameStats.timeElapsed,
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
  }, [gameOver, user, session, gameStats]);

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
          <CardTitle className="text-2xl text-center">Memory Cards</CardTitle>
          <CardDescription className="text-center">Match pairs of cards to test your memory</CardDescription>
        </CardHeader>
        
        <CardContent>
          {!gameStarted ? (
            <div className="space-y-6 max-w-md mx-auto text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">How to Play</h3>
                <p className="text-muted-foreground">
                  Flip cards to find matching pairs. Remember the positions of the cards
                  to make matches in fewer moves. Level up by matching all pairs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Benefits</h3>
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="flex flex-col items-center">
                    <Brain className="h-8 w-8 text-blue-500 mb-1" />
                    <span>Working Memory</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ZapIcon className="h-8 w-8 text-yellow-500 mb-1" />
                    <span>Focus</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Trophy className="h-8 w-8 text-amber-500 mb-1" />
                    <span>Concentration</span>
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
                  <div className="text-2xl font-bold">{gameStats.pairs + ((gameStats.level - 1) * gameStats.totalPairs)}</div>
                  <div className="text-sm text-muted-foreground">Total Pairs Matched</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{formatTime(gameStats.timeElapsed)}</div>
                  <div className="text-sm text-muted-foreground">Time Played</div>
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
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
                  <span className="font-bold">Time: {formatTime(gameStats.timeElapsed)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm mb-2">
                <span>Moves: {gameStats.moves}</span>
                <span>Pairs: {gameStats.pairs}/{gameStats.totalPairs}</span>
              </div>
              
              <div className={`grid grid-cols-${Math.min(4, Math.ceil(Math.sqrt(gameStats.totalPairs * 2)))} md:grid-cols-${Math.min(6, gameStats.totalPairs)} gap-2 md:gap-4`}>
                {cards.map(card => (
                  <motion.div 
                    key={card.id}
                    className={`aspect-square bg-primary-foreground rounded-lg cursor-pointer overflow-hidden shadow-md
                      ${card.isMatched ? 'opacity-50' : ''}`}
                    onClick={() => handleCardClick(card)}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl"
                      initial={false}
                      animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                      transition={{ duration: 0 }}
                      style={{ 
                        backfaceVisibility: 'hidden',
                        background: card.isFlipped ? 'white' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      }}
                    >
                      {!card.isFlipped ? '?' : card.content}
                    </motion.div>
                  </motion.div>
                ))}
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
