import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';

type GameType = 'chess' | 'go' | 'checkers' | 'reversi' | 'xiangqi' | 'shogi' | 'gomoku' | 'connect_four' | 'tic_tac_toe';
type GameStatus = 'in_progress' | 'completed';

interface GameState {
  fen: string;
  history: string[];
  status: GameStatus;
  winner: string | null;
}

interface BoardGame {
  game_type: GameType;
  difficulty_level: number;
  game_state: { fen: string };
  status: GameStatus;
  user_id: string | undefined;
}

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState>({
    fen: 'start',
    history: [],
    status: 'in_progress',
    winner: null,
  });
  const [difficulty, setDifficulty] = useState('1');
  const [isThinking, setIsThinking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrCreateGame();
  }, []);

  const loadOrCreateGame = async () => {
    try {
      const { data: existingGame, error } = await supabase
        .from('board_games')
        .select('*')
        .eq('game_type', 'chess')
        .eq('status', 'in_progress')
        .maybeSingle();

      if (existingGame) {
        const loadedGame = new Chess();
        const gameStateFen = existingGame.game_state as { fen: string };
        loadedGame.load(gameStateFen.fen);
        setGame(loadedGame);
        setGameState({
          fen: gameStateFen.fen,
          history: (existingGame.moves as string[]) || [],
          status: existingGame.status as GameStatus,
          winner: existingGame.winner,
        });
        setDifficulty(existingGame.difficulty_level.toString());
      } else {
        await createNewGame();
      }
    } catch (error) {
      console.error('Error loading game:', error);
      toast({
        title: 'Error',
        description: 'Failed to load the game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const createNewGame = async () => {
    const user = await supabase.auth.getUser();
    const newGame: BoardGame = {
      game_type: 'chess',
      difficulty_level: parseInt(difficulty),
      game_state: { fen: 'start' },
      status: 'in_progress',
      user_id: user.data.user?.id,
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([newGame]);
      
      if (error) throw error;
      
      setGame(new Chess());
      setGameState({
        fen: 'start',
        history: [],
        status: 'in_progress',
        winner: null,
      });
    } catch (error) {
      console.error('Error creating new game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create a new game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const makeMove = (move: any): boolean => {
    if (isThinking || gameState.status === 'completed') return false;

    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (result === null) return false;

      setGame(gameCopy);
      updateGameState(gameCopy);

      if (!gameCopy.isGameOver()) {
        setIsThinking(true);
        setTimeout(() => {
          makeComputerMove(gameCopy);
        }, 300);
      }

      return true;
    } catch (error) {
      console.error('Error making move:', error);
      return false;
    }
  };

  const makeComputerMove = async (currentGame: Chess) => {
    try {
      const moves = currentGame.moves();
      if (moves.length === 0 || currentGame.isGameOver()) {
        setIsThinking(false);
        return;
      }

      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      const gameCopy = new Chess(currentGame.fen());
      gameCopy.move(randomMove);

      setGame(gameCopy);
      await updateGameState(gameCopy);
      setIsThinking(false);
    } catch (error) {
      console.error('Error making computer move:', error);
      setIsThinking(false);
    }
  };

  const updateGameState = async (currentGame: Chess) => {
    const newGameState: GameState = {
      fen: currentGame.fen(),
      history: gameState.history.concat(currentGame.fen()),
      status: currentGame.isGameOver() ? 'completed' : 'in_progress',
      winner: currentGame.isCheckmate() 
        ? (currentGame.turn() === 'w' ? 'black' : 'white')
        : null,
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .update({
          game_state: { fen: newGameState.fen },
          moves: newGameState.history,
          status: newGameState.status,
          winner: newGameState.winner,
          last_move_at: new Date().toISOString(),
        })
        .eq('game_type', 'chess')
        .eq('status', 'in_progress');

      if (error) throw error;
      setGameState(newGameState);

      if (newGameState.status === 'completed') {
        toast({
          title: 'Game Over',
          description: newGameState.winner 
            ? `${newGameState.winner.charAt(0).toUpperCase() + newGameState.winner.slice(1)} wins!`
            : 'Game ended in a draw!',
        });
      }
    } catch (error) {
      console.error('Error updating game state:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the game state. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece): boolean => {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });
  };

  const customTheme = {
    boardStyle: {
      borderRadius: '4px',
      boxShadow: 'none',
    },
    lightSquareStyle: { backgroundColor: '#FFFFFF' },
    darkSquareStyle: { backgroundColor: '#E2E8F0' },
    dragOverlay: false,
  };

  return (
    <Card className="p-6 w-full max-w-3xl mx-auto bg-white/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <Select
          value={difficulty}
          onValueChange={(value) => setDifficulty(value)}
          disabled={isThinking}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Easy</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={createNewGame}
          disabled={isThinking}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50"
        >
          New Game
        </Button>
      </div>
      <div className="aspect-square w-full">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={Math.min(600, window.innerWidth - 40)}
          customBoardStyle={customTheme.boardStyle}
          customLightSquareStyle={customTheme.lightSquareStyle}
          customDarkSquareStyle={customTheme.darkSquareStyle}
          showBoardNotation={false}
          animationDuration={200}
        />
      </div>
      {gameState.status === 'completed' && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold">
            {gameState.winner 
              ? `${gameState.winner.charAt(0).toUpperCase() + gameState.winner.slice(1)} wins!`
              : 'Game ended in a draw!'}
          </h3>
        </div>
      )}
    </Card>
  );
};

export default ChessGame;
