import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { GameComponentProps } from './types';
import { Session } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import { supabaseRestCall } from "../../api/apiCompatibility";

// Card icons/content for matching
const cardContents = [
  '🍎', '🍏', '🍊', '🍋', '🍓', '🍒', '🍉', '🍇',
  '🥝', '🍍', '🥥', '🍅', '🥑', '🥦', '🥕', '🌽'
];

// Card interface
interface MemoryCard {
  id: number;
  content: string;
  flipped: boolean;
  matched: boolean;
}

interface MemoryCardsProps extends GameComponentProps {
  session: Session | null;
  numberOfPairs?: number;
}

const MemoryCards: React.FC<MemoryCardsProps> = ({
  session,
  onComplete,
  difficulty = 'medium',
  onBack,
  numberOfPairs
}) => {
  // Game state
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Determine number of pairs based on difficulty
  const getPairsCount = () => {
    if (numberOfPairs) return numberOfPairs;
    
    switch (difficulty) {
      case 'easy': return 6;
      case 'medium': return 8;
      case 'hard': return 12;
      default: return 8;
    }
  };

  // Initialize the game
  const initializeGame = () => {
    const pairsCount = getPairsCount();
    const selectedContents = [...cardContents].slice(0, pairsCount);
    
    // Create pairs
    let cardPairs: MemoryCard[] = [];
    selectedContents.forEach((content, index) => {
      // Create two cards with the same content (a pair)
      cardPairs.push({ 
        id: index * 2, 
        content, 
        flipped: false, 
        matched: false 
      });
      cardPairs.push({ 
        id: index * 2 + 1, 
        content, 
        flipped: false, 
        matched: false 
      });
    });
    
    // Shuffle the cards
    cardPairs = shuffleCards(cardPairs);
    
    setCards(cardPairs);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameOver(false);
    setScore(0);
    setTimer(0);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };
  
  // Shuffle cards using Fisher-Yates algorithm
  const shuffleCards = (cards: MemoryCard[]): MemoryCard[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Handle card click
  const handleCardClick = (cardId: number) => {
    // Start game timer on first move
    if (!gameStarted) {
      setGameStarted(true);
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
    
    // Don't allow more than 2 cards flipped at once
    if (flippedCards.length === 2) return;
    
    // Find the clicked card
    const cardIndex = cards.findIndex(card => card.id === cardId);
    const clickedCard = cards[cardIndex];
    
    // Don't allow flipping already matched or flipped cards
    if (clickedCard.matched || clickedCard.flipped) return;
    
    // Create new cards array with this card flipped
    const newCards = [...cards];
    newCards[cardIndex] = { ...clickedCard, flipped: true };
    setCards(newCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const firstCardId = newFlippedCards[0];
      const secondCardId = newFlippedCards[1];
      
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      
      // Check if the cards match
      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // It's a match!
        setTimeout(() => {
          const matchedCards = cards.map(card => {
            if (card.id === firstCardId || card.id === secondCardId) {
              return { ...card, matched: true };
            }
            return card;
          });
          
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(matchedPairs + 1);
          
          // Small confetti burst on match
          confetti({
            particleCount: 30,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // Check if all pairs are matched
          if (matchedPairs + 1 === getPairsCount()) {
            endGame();
          }
        }, 500);
      } else {
        // Not a match, flip the cards back
        setTimeout(() => {
          const resetCards = cards.map(card => {
            if (card.id === firstCardId || card.id === secondCardId) {
              return { ...card, flipped: false };
            }
            return card;
          });
          
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // End the game
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Calculate score based on difficulty, moves and time
    const pairsCount = getPairsCount();
    const perfectMoves = pairsCount; // Minimum possible moves
    const moveScore = Math.max(0, 100 - ((moves - perfectMoves) * 5));
    const timeScore = Math.max(0, 100 - (timer / 2));
    
    const finalScore = Math.round((moveScore + timeScore) / 2);
    setScore(finalScore);
    
    // Full confetti celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Save game progress
    if (session?.user?.id) {
      saveGameProgress(session.user.id, finalScore);
    }
    
    // Trigger onComplete callback
    if (onComplete) {
      onComplete(finalScore);
    }
  };
  
  // Restart the game
  const restartGame = () => {
    initializeGame();
    setGameStarted(false);
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
            game_id: 'memory-cards',
            score: score,
            time_played: timer,
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
  
  // Format time as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="text-lg font-semibold">
            Time: {formatTime(timer)}
          </div>
          <div className="text-lg font-semibold">
            Moves: {moves}
          </div>
        </div>
        <div className="text-lg font-semibold">
          Score: {score}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className="aspect-square cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
          >
            <Card className={`h-full w-full flex items-center justify-center text-4xl transition-all duration-300 ${
              card.flipped || card.matched ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {(card.flipped || card.matched) && card.content}
            </Card>
          </motion.div>
        ))}
      </div>
      
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Game Over!</CardTitle>
              <CardDescription>
                Congratulations! You completed the game in {formatTime(timer)} with {moves} moves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-2xl font-bold mb-4">
                Final Score: {score}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={restartGame}>
                Play Again
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back to Games
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MemoryCards; 