import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from '../../../components/ui/toast';
import { useAuth } from '../../../contexts/AuthContext';
import { GameService } from '../../../services/game-service';

// Define card types
type CardType = {
  id: string;
  symbol: string;
  matched: boolean;
  revealed: boolean;
};

const CARD_SYMBOLS = [
  '🍎', '🍌', '🍇', '🍉', 
  '🍓', '🍒', '🍍', '🥝', 
  '🍋', '🍊', '🍐', '🥭'
];

const MemoryCardsPage: React.FC = () => {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameState, setGameState] = useState<{
    cards: CardType[];
    selectedCards: CardType[];
    moves: number;
    score: number;
    gameOver: boolean;
    timer: number;
  }>({
    cards: [],
    selectedCards: [],
    moves: 0,
    score: 0,
    gameOver: false,
    timer: 0
  });

  // Generate cards based on difficulty
  const generateCards = useCallback(() => {
    const cardCount = difficulty === 'easy' ? 8 : 
                      difficulty === 'medium' ? 12 : 16;
    
    const symbols = CARD_SYMBOLS.slice(0, cardCount / 2);
    const cardPairs = [...symbols, ...symbols];
    
    // Shuffle cards
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: `card-${index}`,
        symbol,
        matched: false,
        revealed: false
      }));

    return shuffledCards;
  }, [difficulty]);

  // Start or reset game
  const startGame = useCallback(() => {
    const initialCards = generateCards();
    setGameState({
      cards: initialCards,
      selectedCards: [],
      moves: 0,
      score: 0,
      gameOver: false,
      timer: 60  // 1-minute game
    });

    // Start timer countdown
    const timerInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 0 || prev.gameOver) {
          clearInterval(timerInterval);
          
          // Log game session
          if (user) {
            GameService.logGameSession({
              userId: user.id,
              gameType: 'memory_cards',
              score: prev.score,
              duration: 60,
              difficulty,
              completed: prev.score === prev.cards.length / 2
            });
          }

          return { ...prev, gameOver: true };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [generateCards, user, difficulty]);

  // Handle card selection
  const handleCardSelect = useCallback((selectedCard: CardType) => {
    if (
      gameState.gameOver || 
      selectedCard.matched || 
      selectedCard.revealed || 
      gameState.selectedCards.length >= 2
    ) return;

    // Reveal selected card
    setGameState(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === selectedCard.id ? { ...card, revealed: true } : card
      ),
      selectedCards: [...prev.selectedCards, selectedCard],
      moves: prev.moves + 1
    }));

    // Check for match when two cards are selected
    if (gameState.selectedCards.length === 1) {
      const firstCard = gameState.selectedCards[0];
      
      // Timeout to show cards before checking match
      setTimeout(() => {
        setGameState(prev => {
          const isMatch = firstCard.symbol === selectedCard.symbol;
          
          return {
            ...prev,
            cards: prev.cards.map(card => {
              if (card.id === firstCard.id || card.id === selectedCard.id) {
                return { 
                  ...card, 
                  matched: isMatch,
                  revealed: isMatch
                };
              }
              return card;
            }),
            selectedCards: [],
            score: isMatch ? prev.score + 1 : prev.score,
            gameOver: prev.cards.filter(card => !card.matched).length === 2
          };
        });
      }, 1000);
    }
  }, [gameState]);

  // Lifecycle effects
  useEffect(() => {
    const cleanup = startGame();
    return cleanup;
  }, [startGame]);

  // Render cards
  const renderCards = useMemo(() => {
    return gameState.cards.map(card => (
      <Button
        key={card.id}
        onClick={() => handleCardSelect(card)}
        className={`w-20 h-20 m-1 text-4xl ${
          card.matched ? 'bg-green-100 opacity-50' : 
          card.revealed ? 'bg-blue-100' : 
          'bg-gray-100'
        }`}
        variant="outline"
        disabled={card.matched || gameState.gameOver}
      >
        {card.revealed || card.matched ? card.symbol : '?'}
      </Button>
    ));
  }, [gameState, handleCardSelect]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Game Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Cards</CardTitle>
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
                : 'Find Matching Pairs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center">
              {renderCards}
            </div>
            <div className="mt-4 text-center grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Time Left</p>
                <p className="text-2xl font-bold">{gameState.timer}s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Moves</p>
                <p className="text-2xl font-bold">{gameState.moves}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pairs Found</p>
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
              <li>1. Choose a difficulty level</li>
              <li>2. Click cards to reveal them</li>
              <li>3. Find matching pairs of cards</li>
              <li>4. Match all pairs before time runs out</li>
              <li>5. Fewer moves = higher score</li>
              <li>6. Timer adds extra challenge</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemoryCardsPage;