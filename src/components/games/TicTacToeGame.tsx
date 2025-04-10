import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { GameStatus, GameType, Player } from '@/types/boardGames';
import type { Json } from '@/integrations/supabase/types';

interface TicTacToeState {
  board: string[][];
  currentPlayer: Player;
  status: GameStatus;
  winner: string | null;
}

export const TicTacToeGame = () => {
  const { session } = useAuth();
  const [gameState, setGameState] = useState<TicTacToeState | null>(null);
  const [difficulty, setDifficulty] = useState('1');

  const initializeBoard = (): string[][] => {
    return Array(3).fill(null).map(() => Array(3).fill(''));
  };

  const checkWin = (board: string[][], player: string): boolean => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i].every(cell => cell === player)) return true;
    }
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board.every(row => row[i] === player)) return true;
    }
    // Check diagonals
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
  };

  const startNewGame = async () => {
    const board = initializeBoard();
    const initialGameState: TicTacToeState = {
      board,
      currentPlayer: 'black',
      status: 'in_progress',
      winner: null
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'tic_tac_toe' as GameType,
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

  const makeMove = async (row: number, col: number) => {
    if (!gameState || gameState.status !== 'in_progress' || gameState.board[row][col] !== '') return;

    const newBoard = gameState.board.map(row => [...row]);
    const symbol = gameState.currentPlayer === 'black' ? 'X' : 'O';
    newBoard[row][col] = symbol;

    let status: GameStatus = 'in_progress';
    let winner = null;

    if (checkWin(newBoard, symbol)) {
      status = 'completed';
      winner = gameState.currentPlayer;
    } else if (newBoard.every(row => row.every(cell => cell !== ''))) {
      status = 'completed';
      winner = 'draw';
    }

    const newGameState: TicTacToeState = {
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
        .eq('game_type', 'tic_tac_toe');

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
              Current Player: {gameState.currentPlayer === 'black' ? 'X' : 'O'}
              {gameState.status === 'completed' && (
                <span className="ml-4">
                  Winner: {gameState.winner === 'draw' ? "Draw" : gameState.winner}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
              {gameState.board.map((row, i) => 
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    className="w-24 h-24 bg-secondary hover:bg-secondary/80 flex items-center justify-center text-4xl font-bold rounded"
                    onClick={() => makeMove(i, j)}
                    disabled={gameState.status === 'completed' || cell !== ''}
                  >
                    {cell}
                  </button>
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