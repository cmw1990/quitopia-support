import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { GameStatus, GameType, Player } from '@/types/boardGames';
import type { Json } from '@/integrations/supabase/types';

interface ConnectFourState {
  board: number[][];
  currentPlayer: Player;
  status: GameStatus;
  winner: string | null;
}

const ROWS = 6;
const COLS = 7;

export const ConnectFourGame = () => {
  const { session } = useAuth();
  const [gameState, setGameState] = useState<ConnectFourState | null>(null);
  const [difficulty, setDifficulty] = useState('1');

  const initializeBoard = (): number[][] => {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  };

  const checkWin = (board: number[][], row: number, col: number, player: number): boolean => {
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal right
      [1, -1], // diagonal left
    ];

    return directions.some(([dx, dy]) => {
      let count = 1;
      // Check forward
      for (let i = 1; i < 4; i++) {
        const newRow = row + (dx * i);
        const newCol = col + (dy * i);
        if (
          newRow < 0 || newRow >= ROWS || 
          newCol < 0 || newCol >= COLS || 
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      // Check backward
      for (let i = 1; i < 4; i++) {
        const newRow = row - (dx * i);
        const newCol = col - (dy * i);
        if (
          newRow < 0 || newRow >= ROWS || 
          newCol < 0 || newCol >= COLS || 
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      return count >= 4;
    });
  };

  const getLowestEmptyRow = (board: number[][], col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === 0) return row;
    }
    return -1;
  };

  const startNewGame = async () => {
    const board = initializeBoard();
    const initialGameState: ConnectFourState = {
      board,
      currentPlayer: 'black',
      status: 'in_progress',
      winner: null
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'connect_four' as GameType,
          difficulty_level: parseInt(difficulty),
          game_state: initialGameState as unknown as Json,
          status: 'in_progress' as GameStatus,
          user_id: session?.user?.id,
        }]);
      
      if (error) throw error;
      
      setGameState(initialGameState);
      toast({
        title: "New game started",
        description: "Good luck!",
      });
    } catch (error) {
      console.error('Error starting new game:', error);
      toast({
        title: "Error",
        description: "Failed to start new game",
        variant: "destructive",
      });
    }
  };

  const makeMove = async (col: number) => {
    if (!gameState || gameState.status !== 'in_progress') return;

    const row = getLowestEmptyRow(gameState.board, col);
    if (row === -1) return; // Column is full

    const newBoard = gameState.board.map(row => [...row]);
    const playerNum = gameState.currentPlayer === 'black' ? 1 : 2;
    newBoard[row][col] = playerNum;

    let status: GameStatus = 'in_progress';
    let winner = null;

    if (checkWin(newBoard, row, col, playerNum)) {
      status = 'completed';
      winner = gameState.currentPlayer;
    } else if (newBoard.every(row => row.every(cell => cell !== 0))) {
      status = 'completed';
      winner = 'draw';
    }

    const newGameState: ConnectFourState = {
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      status,
      winner
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .update({
          game_state: newGameState as unknown as Json,
          last_move_at: new Date().toISOString(),
          status,
          winner: winner === 'draw' ? null : winner,
        })
        .eq('user_id', session?.user?.id)
        .eq('status', 'in_progress')
        .eq('game_type', 'connect_four');

      if (error) throw error;
      
      setGameState(newGameState);

      if (status === 'completed') {
        toast({
          title: "Game Over!",
          description: winner === 'draw' ? "It's a draw!" : `${winner} wins!`,
        });
      }
    } catch (error) {
      console.error('Error updating game:', error);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Easy</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">Hard</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={startNewGame}>New Game</Button>
        </div>

        {gameState ? (
          <div className="space-y-4">
            <div className="text-sm">
              Current Player: {gameState.currentPlayer}
              {gameState.status === 'completed' && (
                <span className="ml-4">
                  Winner: {gameState.winner === 'draw' ? "Draw" : gameState.winner}
                </span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-0.5 bg-gray-700 p-0.5">
              {gameState.board.map((row, i) => 
                row.map((cell, j) => (
                  <div 
                    key={`${i}-${j}`}
                    className="w-12 h-12 bg-blue-900 flex items-center justify-center cursor-pointer hover:bg-blue-800"
                    onClick={() => makeMove(j)}
                  >
                    {cell > 0 && (
                      <div 
                        className={`w-8 h-8 rounded-full transition-all
                          ${cell === 1 ? 'bg-black' : 'bg-white'}`}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Start a new game to begin playing
          </div>
        )}
      </div>
    </Card>
  );
};