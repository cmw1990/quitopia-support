import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Brain } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type GameType = 'chess' | 'go' | 'checkers' | 'reversi' | 'xiangqi' | 'shogi' | 'gomoku' | 'connect_four' | 'tic_tac_toe';
type GameStatus = 'in_progress' | 'completed';

interface GameState {
  board: Array<Array<string>>;
  currentPlayer: 'black' | 'white';
  captures: {
    black: number;
    white: number;
  };
  status: GameStatus;
  winner: string | null;
}

const BOARD_SIZE = 19;

const GoGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('')),
    currentPlayer: 'black',
    captures: { black: 0, white: 0 },
    status: 'in_progress',
    winner: null
  });
  
  const [difficulty, setDifficulty] = useState('1');
  const { toast } = useToast();

  useEffect(() => {
    loadOrCreateGame();
  }, []);

  const loadOrCreateGame = async () => {
    try {
      const { data: existingGame, error } = await supabase
        .from('board_games')
        .select('*')
        .eq('game_type', 'go')
        .eq('status', 'in_progress')
        .maybeSingle();

      if (existingGame) {
        const loadedGameState = existingGame.game_state as unknown as GameState;
        setGameState(loadedGameState);
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
    const initialGameState: GameState = {
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('')),
      currentPlayer: 'black',
      captures: { black: 0, white: 0 },
      status: 'in_progress',
      winner: null
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'go' as GameType,
          difficulty_level: parseInt(difficulty),
          game_state: initialGameState as unknown as Json,
          status: 'in_progress' as GameStatus,
          user_id: user.data.user?.id,
        }]);
      
      if (error) throw error;
      
      setGameState(initialGameState);
    } catch (error) {
      console.error('Error creating new game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create a new game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getLiberties = (row: number, col: number, board: string[][]): number => {
    const color = board[row][col];
    if (!color) return 0;
    
    const visited = new Set<string>();
    const group = new Set<string>();
    const liberties = new Set<string>();
    
    const exploreGroup = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (visited.has(key)) return;
      visited.add(key);
      
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return;
      if (!board[r][c]) {
        liberties.add(key);
        return;
      }
      if (board[r][c] !== color) return;
      
      group.add(key);
      exploreGroup(r - 1, c);
      exploreGroup(r + 1, c);
      exploreGroup(r, c - 1);
      exploreGroup(r, c + 1);
    };
    
    exploreGroup(row, col);
    return liberties.size;
  };

  const captureStones = (row: number, col: number, board: string[][]): number => {
    const color = board[row][col];
    const oppositeColor = color === 'black' ? 'white' : 'black';
    let capturedCount = 0;
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) continue;
      if (board[newRow][newCol] !== oppositeColor) continue;
      
      if (getLiberties(newRow, newCol, board) === 0) {
        // Remove captured stones
        const removeGroup = (r: number, c: number) => {
          if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return;
          if (board[r][c] !== oppositeColor) return;
          
          board[r][c] = '';
          capturedCount++;
          
          removeGroup(r - 1, c);
          removeGroup(r + 1, c);
          removeGroup(r, c - 1);
          removeGroup(r, c + 1);
        };
        
        removeGroup(newRow, newCol);
      }
    }
    
    return capturedCount;
  };

  const makeMove = async (row: number, col: number) => {
    if (gameState.board[row][col] !== '' || gameState.status === 'completed') {
      return;
    }

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[row][col] = gameState.currentPlayer;
    
    // Check if the move is suicidal (no liberties after placement)
    if (getLiberties(row, col, newBoard) === 0) {
      const capturedStones = captureStones(row, col, newBoard);
      if (capturedStones === 0) {
        // Suicidal move not allowed
        return;
      }
    }

    const captures = { ...gameState.captures };
    const capturedStones = captureStones(row, col, newBoard);
    captures[gameState.currentPlayer] += capturedStones;

    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      captures,
    };

    setGameState(newGameState);

    try {
      const { error } = await supabase
        .from('board_games')
        .update({
          game_state: newGameState as unknown as Json,
          last_move_at: new Date().toISOString(),
        })
        .eq('game_type', 'go')
        .eq('status', 'in_progress');

      if (error) throw error;
    } catch (error) {
      console.error('Error updating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the game. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6 w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Select
          value={difficulty}
          onValueChange={(value) => setDifficulty(value)}
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
        <Button onClick={createNewGame}>
          New Game
        </Button>
      </div>
      <div className="aspect-square w-full bg-yellow-100 relative">
        <div className="grid grid-cols-19 grid-rows-19 absolute inset-0">
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "border border-black relative",
                  cell === 'black' && "bg-black rounded-full",
                  cell === 'white' && "bg-white rounded-full"
                )}
                onClick={() => makeMove(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <div>Black Captures: {gameState.captures.black}</div>
        <div>White Captures: {gameState.captures.white}</div>
      </div>
      {gameState.status === 'completed' && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold">
            {gameState.winner ? `${gameState.winner} wins!` : 'Game ended in a draw!'}
          </h3>
        </div>
      )}
    </Card>
  );
};

export default GoGame;